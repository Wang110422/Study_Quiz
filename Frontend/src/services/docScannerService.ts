export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ExtractedVocabulary {
    id: string;
    term: string;
    definition: string;
    example?: string;
    partOfSpeech?: string; // n, v, adj, adv, phr...
    ipa?: string;
    level: CEFRLevel;
    selected: boolean;
}

export interface GeminiVocabItem {
    term: string;
    base_form?: string;
    ipa?: string;
    pos?: string;
    meaning?: string;
    hint?: string;
    level?: string;
    definition?: string;
    example?: string;
    partOfSpeech?: string;
}

export interface ScannedPageItem {
    pageNumber: number;
    pageTitle: string;
    pageImageUrl: string;
    ocrImageUrl?: string; // Đã chứa bounding box từ server
    pdfPageNumber?: number;
    rawText: string;
    vocabularies: ExtractedVocabulary[];
}

export interface OcrApiResponse {
    fullText: string;
    ocrImage?: string;
    ocrImages?: string[];
    pagesDict?: Record<string, string[]>; // Map số trang -> mảng dòng văn bản nhận diện được
    vocabularyList?: GeminiVocabItem[];
    vocabularyByPage?: Record<string, GeminiVocabItem[]>;
}

// Từ điển cơ sở dữ liệu mẫu fallback nếu API không phản hồi
const CEFR_DICTIONARY: Record<string, { definition: string; level: CEFRLevel; partOfSpeech: string; example: string }> = {
    'apple': { definition: 'Quả táo', level: 'A1', partOfSpeech: 'noun', example: 'I eat a fresh red apple every morning.' },
    'book': { definition: 'Sách, cuốn sách', level: 'A1', partOfSpeech: 'noun', example: 'She is reading an interesting story book.' },
    'happy': { definition: 'Vui vẻ, hạnh phúc', level: 'A1', partOfSpeech: 'adjective', example: 'They are very happy with their exam results.' },
    'journey': { definition: 'Hành trình, chuyến đi', level: 'A2', partOfSpeech: 'noun', example: 'Their long journey across Europe took three weeks.' },
    'convenient': { definition: 'Tiện lợi, thuận tiện', level: 'B1', partOfSpeech: 'adjective', example: 'Online shopping is extremely convenient for busy people.' },
    'implement': { definition: 'Triển khai, thực thi', level: 'B2', partOfSpeech: 'verb', example: 'The company plans to implement new security policies.' },
    'comprehensive': { definition: 'Toàn diện, bao quát', level: 'C1', partOfSpeech: 'adjective', example: 'The report provides a comprehensive overview of the market.' },
    'serendipity': { definition: 'Sự may mắn bất ngờ, nhân duyên tình cờ', level: 'C2', partOfSpeech: 'noun', example: 'Finding the rare manuscript was pure serendipity.' },
};

// Helper tự động nạp thư viện PDF.js từ CDN Mozilla
const loadPdfJs = async (): Promise<any> => {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(pdfjsLib);
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

// Helper chuyển đổi level từ Gemini API sang CEFRLevel chuẩn
const parseCefrLevel = (rawLevel?: string): CEFRLevel => {
    if (!rawLevel) return 'B1';
    const lvl = rawLevel.toUpperCase().trim();
    if (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(lvl)) {
        return lvl as CEFRLevel;
    }
    if (lvl.includes('A1')) return 'A1';
    if (lvl.includes('A2')) return 'A2';
    if (lvl.includes('B1')) return 'B1';
    if (lvl.includes('B2')) return 'B2';
    if (lvl.includes('C1')) return 'C1';
    if (lvl.includes('C2')) return 'C2';
    return 'B1';
};

export const docScannerService = {
    // 1. Hàm đọc file thực tế và nhận ảnh khoanh vùng Base64 + Từ vựng thực từ Gemini AI
    readTextFromFile: async (file: File): Promise<OcrApiResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8001/ocr/scan-and-extract', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();

                // Chuẩn hóa Base64 Data URI
                const normalizeB64 = (b64Str?: string) => {
                    if (!b64Str) return undefined;
                    if (b64Str.startsWith('data:application/octet-stream')) {
                        return b64Str.replace('data:application/octet-stream', 'data:image/jpeg');
                    }
                    return b64Str;
                };

                const ocrImg = normalizeB64(data.ocr_image);
                const ocrImgs = (data.ocr_images || []).map((img: string) => normalizeB64(img) || img);

                return {
                    fullText: data.full_text || '',
                    ocrImage: ocrImg,
                    ocrImages: ocrImgs.length > 0 ? ocrImgs : (ocrImg ? [ocrImg] : undefined),
                    pagesDict: data.pages || {},
                    vocabularyList: data.vocabulary_list || [],
                    vocabularyByPage: data.vocabulary_by_page || {},
                };
            }
        } catch (error) {
            console.warn('Không thể kết nối Python OCR Server (Cổng 8001):', error);
        }

        return {
            fullText: `Exercise 1
1. Do you think this bag goes _______ my jacket?
A. with B. for C. to D. at`,
            vocabularyByPage: {},
        };
    },

    // 2. Hàm chuyển đổi toàn bộ trang PDF thành mảng ảnh PNG nguyên bản 100%
    renderPdfToImages: async (file: File): Promise<string[]> => {
        try {
            const pdfjsLib = await loadPdfJs();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const images: string[] = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                if (context) {
                    await page.render({ canvasContext: context, viewport }).promise;
                    images.push(canvas.toDataURL('image/png'));
                }
            }
            return images;
        } catch (e) {
            console.error('Lỗi khi chuyển PDF sang ảnh PNG:', e);
            return [];
        }
    },

    // 3. Hàm chuyển đổi mảng GeminiVocabItem từ AI thành ExtractedVocabulary của giao diện
    mapGeminiItemsToVocabs: (items: GeminiVocabItem[]): ExtractedVocabulary[] => {
        return items.map((item) => ({
            id: Math.random().toString(36).substring(2, 9),
            term: item.term || item.base_form || '',
            definition: item.meaning || item.definition || 'Nghĩa từ vựng',
            example: item.hint || item.example || '',
            partOfSpeech: item.pos || item.partOfSpeech || 'n',
            ipa: item.ipa,
            level: parseCefrLevel(item.level),
            selected: true,
        }));
    },

    // 4. Hàm trích xuất từ vựng từ văn bản (Fallback mẫu nếu AI không phản hồi)
    extractVocabularies: (rawText: string): ExtractedVocabulary[] => {
        const words = rawText
            .toLowerCase()
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 4);

        const foundVocabsMap = new Map<string, ExtractedVocabulary>();

        words.forEach((w) => {
            if (CEFR_DICTIONARY[w] && !foundVocabsMap.has(w)) {
                const dictInfo = CEFR_DICTIONARY[w];
                foundVocabsMap.set(w, {
                    id: Math.random().toString(36).substring(2, 9),
                    term: w.charAt(0).toUpperCase() + w.slice(1),
                    definition: dictInfo.definition,
                    partOfSpeech: dictInfo.partOfSpeech,
                    level: dictInfo.level,
                    example: dictInfo.example,
                    selected: true,
                });
            }
        });

        if (foundVocabsMap.size === 0) {
            Object.keys(CEFR_DICTIONARY).forEach((w) => {
                const dictInfo = CEFR_DICTIONARY[w];
                foundVocabsMap.set(w, {
                    id: Math.random().toString(36).substring(2, 9),
                    term: w.charAt(0).toUpperCase() + w.slice(1),
                    definition: dictInfo.definition,
                    partOfSpeech: dictInfo.partOfSpeech,
                    level: dictInfo.level,
                    example: dictInfo.example,
                    selected: true,
                });
            });
        }

        return Array.from(foundVocabsMap.values());
    },

    // 5. Hàm đếm số trang thực tế của file PDF
    getPdfPageCount: async (file: File): Promise<number> => {
        try {
            const buffer = await file.arrayBuffer();
            const text = new TextDecoder('latin1').decode(buffer);
            const matches = text.match(/\/Type\s*\/Page\b/g);
            if (matches && matches.length > 0) {
                return matches.length;
            }
            const countMatch = text.match(/\/Count\s+(\d+)/);
            if (countMatch && countMatch[1]) {
                return parseInt(countMatch[1], 10);
            }
        } catch (e) {
            console.warn('Không thể đọc số trang PDF tự động:', e);
        }
        return 5;
    },

    // 6. Hàm trích xuất từ vựng cho một trang đơn lẻ qua endpoint /ocr/extract-single-page
    extractSinglePage: async (pageNumber: number, text: string): Promise<ExtractedVocabulary[]> => {
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        try {
            const response = await fetch('http://localhost:8001/ocr/extract-single-page', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page_number: String(pageNumber),
                    texts: lines.length > 0 ? lines : [text],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const vocabList: GeminiVocabItem[] = data.vocabulary || [];
                if (vocabList.length > 0) {
                    return docScannerService.mapGeminiItemsToVocabs(vocabList);
                }
            }
        } catch (error) {
            console.error(`Lỗi khi gọi extract-single-page cho trang ${pageNumber}:`, error);
        }
        // Fallback trích xuất từ điển mẫu nếu API lỗi
        return docScannerService.extractVocabularies(text);
    },

    // 7. Hàm quét từng trang tài liệu và gán TỪ VỰNG THỰC TỪ GEMINI AI cho từng trang
    scanDocumentPages: async (
        file: File,
        filePreviewUrl: string,
        onPageProgress?: (currentPage: number, totalPages: number, percent: number) => void
    ): Promise<ScannedPageItem[]> => {
        // Gọi API OCR + AI Extract Vocabulary
        const ocrResult = await docScannerService.readTextFromFile(file);
        const rawText = ocrResult.fullText;

        const isPdf = file.name.toLowerCase().endsWith('.pdf');
        let pdfImages: string[] = [];

        if (isPdf) {
            pdfImages = await docScannerService.renderPdfToImages(file);
        }

        const totalPages = isPdf ? (pdfImages.length > 0 ? pdfImages.length : await docScannerService.getPdfPageCount(file)) : 1;
        const pages: ScannedPageItem[] = [];

        const vocabByPage = ocrResult.vocabularyByPage || {};
        const pageKeys = Object.keys(vocabByPage);

        for (let i = 1; i <= totalPages; i++) {
            if (onPageProgress) {
                const percent = Math.round((i / totalPages) * 100);
                onPageProgress(i, totalPages, percent);
            }
            await new Promise((res) => setTimeout(res, 150));

            // Lấy từ vựng thực cho trang này từ Gemini API
            let rawPageVocabItems: GeminiVocabItem[] = [];

            if (vocabByPage[String(i)]) {
                rawPageVocabItems = vocabByPage[String(i)];
            } else if (pageKeys[i - 1] && vocabByPage[pageKeys[i - 1]]) {
                rawPageVocabItems = vocabByPage[pageKeys[i - 1]];
            } else if (ocrResult.vocabularyList && ocrResult.vocabularyList.length > 0) {
                const pageItems = ocrResult.vocabularyList.filter((v: any) => String(v.page) === String(i));
                rawPageVocabItems = pageItems.length > 0 ? pageItems : ocrResult.vocabularyList;
            }

            // Ánh xạ sang ExtractedVocabulary
            let pageVocabs: ExtractedVocabulary[] = [];
            if (rawPageVocabItems && rawPageVocabItems.length > 0) {
                pageVocabs = docScannerService.mapGeminiItemsToVocabs(rawPageVocabItems);
            } else {
                pageVocabs = docScannerService.extractVocabularies(rawText);
            }

            // Lấy văn bản OCR thực tế cho trang này từ Backend response (data.pages)
            const ocrPagesDict = ocrResult.pagesDict || {};
            const textPageKeys = Object.keys(ocrPagesDict);
            let pageTextLines: string[] = [];

            if (ocrPagesDict[String(i)]) {
                pageTextLines = ocrPagesDict[String(i)];
            } else if (textPageKeys[i - 1] && ocrPagesDict[textPageKeys[i - 1]]) {
                pageTextLines = ocrPagesDict[textPageKeys[i - 1]];
            }

            const pageRawText = pageTextLines.length > 0
                ? pageTextLines.join('\n')
                : (rawText || `Trích xuất văn bản từ Trang ${i}...`);

            // Ảnh PNG phẳng gốc của trang đó
            const actualPageImage = isPdf && pdfImages[i - 1] ? pdfImages[i - 1] : filePreviewUrl;

            // Ảnh OCR Base64 từ Server cho trang đó
            const pageOcrBase64 = ocrResult.ocrImages && ocrResult.ocrImages[i - 1]
                ? ocrResult.ocrImages[i - 1]
                : ocrResult.ocrImage;

            pages.push({
                pageNumber: i,
                pageTitle: `Trang ${i}/${totalPages} - ${file.name}`,
                pageImageUrl: actualPageImage,
                ocrImageUrl: pageOcrBase64,
                pdfPageNumber: isPdf ? i : undefined,
                rawText: pageRawText,
                vocabularies: pageVocabs,
            });
        }

        return pages;
    },
};

export interface ScanSessionCache {
    fileName: string;
    filePreviewUrl: string;
    scannedPages: ScannedPageItem[];
    pageLevelFilters: Record<number, 'ALL' | CEFRLevel>;
}

const CACHE_KEY = 'VOCA_SCAN_PERSISTENT_CACHE';
let memoryScanCache: ScanSessionCache | null = null;

export const docScannerCache = {
    save: (data: ScanSessionCache) => {
        memoryScanCache = data;
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
            // Nếu vượt giới hạn quota của sessionStorage, memoryScanCache vẫn lưu giữ an toàn trong suốt phiên SPA
        }
    },
    load: (): ScanSessionCache | null => {
        if (memoryScanCache && memoryScanCache.scannedPages && memoryScanCache.scannedPages.length > 0) {
            return memoryScanCache;
        }
        try {
            const raw = sessionStorage.getItem(CACHE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                memoryScanCache = parsed;
                return parsed;
            }
        } catch (e) {}
        return null;
    },
    clear: () => {
        memoryScanCache = null;
        try {
            sessionStorage.removeItem(CACHE_KEY);
        } catch (e) {}
    },
};

export default docScannerService;
