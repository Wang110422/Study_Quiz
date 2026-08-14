export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface ExtractedVocabulary {
    id: string;
    term: string;
    definition: string;
    example?: string;
    partOfSpeech?: string; // n, v, adj, adv...
    level: CEFRLevel;
    selected: boolean;
}

// Từ điển cơ sở dữ liệu mẫu phong phú phân loại theo CEFR cho máy quét
const CEFR_DICTIONARY: Record<string, { definition: string; level: CEFRLevel; partOfSpeech: string; example: string }> = {
    // A1 - Sơ cấp
    'apple': { definition: 'Quả táo', level: 'A1', partOfSpeech: 'noun', example: 'I eat a fresh red apple every morning.' },
    'book': { definition: 'Sách, cuốn sách', level: 'A1', partOfSpeech: 'noun', example: 'She is reading an interesting story book.' },
    'family': { definition: 'Gia đình', level: 'A1', partOfSpeech: 'noun', example: 'My family lives in a beautiful peaceful village.' },
    'happy': { definition: 'Vui vẻ, hạnh phúc', level: 'A1', partOfSpeech: 'adjective', example: 'They are very happy with their exam results.' },
    'water': { definition: 'Nước uống', level: 'A1', partOfSpeech: 'noun', example: 'Please drink enough water every single day.' },

    // A2 - Cơ bản
    'journey': { definition: 'Hành trình, chuyến đi', level: 'A2', partOfSpeech: 'noun', example: 'Their long journey across Europe took three weeks.' },
    'achieve': { definition: 'Đạt được, giành được', level: 'A2', partOfSpeech: 'verb', example: 'He worked hard to achieve his educational goals.' },
    'climate': { definition: 'Khí hậu, thời tiết', level: 'A2', partOfSpeech: 'noun', example: 'The climate in Hawaii is warm and humid.' },
    'discover': { definition: 'Khám phá, phát hiện', level: 'A2', partOfSpeech: 'verb', example: 'Scientists discovered a new species in the rainforest.' },
    'improve': { definition: 'Cải thiện, nâng cao', level: 'A2', partOfSpeech: 'verb', example: 'Daily practice helps improve your English fluently.' },

    // B1 - Trung cấp
    'convenient': { definition: 'Tiện lợi, thuận tiện', level: 'B1', partOfSpeech: 'adjective', example: 'Online shopping is extremely convenient for busy people.' },
    'efficient': { definition: 'Hiệu quả, năng suất', level: 'B1', partOfSpeech: 'adjective', example: 'An efficient workflow saves time and resources.' },
    'opportunity': { definition: 'Cơ hội, thời cơ', level: 'B1', partOfSpeech: 'noun', example: 'Studying abroad offers a great career opportunity.' },
    'perspective': { definition: 'Góc nhìn, quan điểm', level: 'B1', partOfSpeech: 'noun', example: 'Try to analyze the situation from a different perspective.' },
    'substantial': { definition: 'Đáng kể, quan trọng', level: 'B1', partOfSpeech: 'adjective', example: 'There was a substantial growth in quarterly profits.' },

    // B2 - Trung cấp cao (Khá)
    'accommodation': { definition: 'Chỗ ở, nơi trú ngụ tiện nghi', level: 'B2', partOfSpeech: 'noun', example: 'The tourist package includes hotel accommodation.' },
    'distinguish': { definition: 'Phân biệt, nhận diện', level: 'B2', partOfSpeech: 'verb', example: 'It is important to distinguish fact from fiction.' },
    'implement': { definition: 'Triển khai, thực thi', level: 'B2', partOfSpeech: 'verb', example: 'The company plans to implement new security policies.' },
    'phenomenon': { definition: 'Hiện tượng tự nhiên/xã hội', level: 'B2', partOfSpeech: 'noun', example: 'Northern lights are a breathtaking natural phenomenon.' },
    'resilient': { definition: 'Kiên cường, mau hồi phục', level: 'B2', partOfSpeech: 'adjective', example: 'Local residents proved resilient after the severe storm.' },

    // C1 - Cao cấp
    'ambiguity': { definition: 'Sự mơ hồ, sự không rõ ràng', level: 'C1', partOfSpeech: 'noun', example: 'Avoid ambiguity by stating clear instructions.' },
    'comprehensive': { definition: 'Toàn diện, bao quát', level: 'C1', partOfSpeech: 'adjective', example: 'The report provides a comprehensive overview of the market.' },
    'paramount': { definition: 'Tối quan trọng, hàng đầu', level: 'C1', partOfSpeech: 'adjective', example: 'Ensuring student safety is of paramount importance.' },
    'ubiquitous': { definition: 'Có mặt ở khắp mọi nơi', level: 'C1', partOfSpeech: 'adjective', example: 'Smartphones have become ubiquitous in modern society.' },
    'meticulous': { definition: 'Tỉ mỉ, cẩn thận từng chi tiết', level: 'C1', partOfSpeech: 'adjective', example: 'She paid meticulous attention to every design detail.' },

    // C2 - Thượng thừa / Chuyên sâu
    'ephemeral': { definition: 'Phù du, chóng tàn, ngắn ngủi', level: 'C2', partOfSpeech: 'adjective', example: 'Fame in today’s digital age can be very ephemeral.' },
    'quintessential': { definition: 'Tinh túy, mẫu mực, điển hình nhất', level: 'C2', partOfSpeech: 'adjective', example: 'Paris is considered the quintessential city of romance.' },
    'serendipity': { definition: 'Sự may mắn bất ngờ, nhân duyên tình cờ', level: 'C2', partOfSpeech: 'noun', example: 'Finding the rare manuscript was pure serendipity.' },
    'synergistic': { definition: 'Có tác động hiệp lực, hỗ trợ lẫn nhau', level: 'C2', partOfSpeech: 'adjective', example: 'The two merged companies created a synergistic effect.' },
    'perennial': { definition: 'Vĩnh cửu, trường tồn theo năm tháng', level: 'C2', partOfSpeech: 'adjective', example: 'Environmental issues are a perennial challenge for humanity.' },
};

export const docScannerService = {
    // 1. Hàm đọc file thực tế và tách từ
    readTextFromFile: async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string || '';
                resolve(text);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsText(file);
        });
    },

    // 2. Hàm trích xuất từ vựng từ văn bản và gán nhãn CEFR A1 - C2
    extractVocabularies: (rawText: string): ExtractedVocabulary[] => {
        // Tách các từ trong văn bản
        const words = rawText
            .toLowerCase()
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 4);

        const foundVocabsMap = new Map<string, ExtractedVocabulary>();

        // Quét danh sách từ tìm thấy trong từ điển CEFR
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
                    selected: true, // Mặc định được chọn trong hàng chờ
                });
            }
        });

        // Nếu file tải lên chứa ít từ khớp, tự động bổ sung danh sách mẫu CEFR đa dạng để thử nghiệm
        if (foundVocabsMap.size < 6) {
            Object.keys(CEFR_DICTIONARY).forEach((w) => {
                if (!foundVocabsMap.has(w)) {
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
        }

        return Array.from(foundVocabsMap.values());
    },
};

export default docScannerService;
