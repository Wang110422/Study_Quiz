import { useState, useEffect, useRef } from 'react';
import {
  ScanLine,
  UploadCloud,
  FileText,
  Loader2,
  Images,
  BookOpen,
  Copy,
  Search,
  Check,
  RefreshCw,
  Image as ImageIcon,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { PageHeader, SectionTitle } from '@/components/app/PageHeader';
import { Pill } from '@/components/app/ui-bits';
import docScannerService, { docScannerCache, type ExtractedVocabulary, type CEFRLevel, type ScannedPageItem } from '@/services/docScannerService';
import AddToSetModal from '@/components/vocalearn/modals/AddToSetModal';

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const VocaScanDocumentPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');

  // Trạng thái quét & Tiến trình từng trang
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentPageScanning, setCurrentPageScanning] = useState<number>(1);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>('');

  // Danh sách trang tài liệu quét được (Hàng dọc)
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);

  // Bộ lọc CEFR RIÊNG CHO TỪNG TRANG (Per-page Local Filter Map)
  const [pageLevelFilters, setPageLevelFilters] = useState<Record<number, 'ALL' | CEFRLevel>>({});

  // State quản lý trạng thái đang tra cứu lại cho từng trang và trạng thái Copy chữ
  const [reExtractingPages, setReExtractingPages] = useState<Record<number, boolean>>({});
  const [copiedStatus, setCopiedStatus] = useState<Record<number, boolean>>({});

  // Modal lưu từ vựng vào bộ thẻ
  const [isAddToSetOpen, setIsAddToSetOpen] = useState<boolean>(false);

  // 🔄 KHÔI PHỤC TRẠNG THÁI KHI MOUNT
  useEffect(() => {
    const cached = docScannerCache.load();
    if (cached && cached.scannedPages && cached.scannedPages.length > 0) {
      setScannedPages(cached.scannedPages);
      setPageLevelFilters(cached.pageLevelFilters || {});
      setFilePreviewUrl(cached.filePreviewUrl || '');
      setSelectedFile(new File([], cached.fileName || 'Tài liệu đã quét'));
    }
  }, []);

  // 💾 TỰ ĐỘNG LƯU TRẠNG THÁI MỖI KHI THAY ĐỔI
  useEffect(() => {
    if (scannedPages.length > 0 && !isScanning) {
      docScannerCache.save({
        fileName: selectedFile?.name || 'Tài liệu đã quét',
        filePreviewUrl,
        scannedPages,
        pageLevelFilters,
      });
    }
  }, [scannedPages, pageLevelFilters, isScanning, filePreviewUrl, selectedFile]);

  // Timer đếm thời gian
  useEffect(() => {
    let timer: any;
    if (isScanning) {
      timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(timer);
  }, [isScanning]);

  // Bắt đầu quá trình quét file từng trang theo hàng dọc
  const handleStartScan = async (file: File) => {
    setSelectedFile(file);
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);

    setIsScanning(true);
    setProgressPercent(0);
    setScannedPages([]);
    setCurrentStepText('📄 Đang đọc và phân tích các trang tài liệu...');

    try {
      const pages = await docScannerService.scanDocumentPages(
        file,
        previewUrl,
        (page, total, percent) => {
          setCurrentPageScanning(page);
          setTotalPagesCount(total);
          setProgressPercent(percent);
          setCurrentStepText(`🔍 Đang quét và OCR nhận diện Trang ${page}/${total}...`);
        }
      );

      setScannedPages(pages);

      const initFilters: Record<number, 'ALL' | CEFRLevel> = {};
      pages.forEach((p) => {
        initFilters[p.pageNumber] = 'ALL';
      });
      setPageLevelFilters(initFilters);

      setCurrentStepText('✅ Nhận diện OCR Khoanh vùng & Trích xuất từ vựng A1-C2 hoàn tất!');
    } catch (err) {
      console.error('Lỗi khi quét tài liệu:', err);
      setCurrentStepText('❌ Có lỗi xảy ra trong quá trình quét. Vui lòng thử lại!');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleStartScan(e.target.files[0]);
    }
  };

  const handleChooseOtherFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleStartScan(e.dataTransfer.files[0]);
    }
  };

  const handleUpdatePageText = (pageNumber: number, newText: string) => {
    setScannedPages((prevPages) =>
      prevPages.map((page) =>
        page.pageNumber === pageNumber ? { ...page, rawText: newText } : page
      )
    );
  };

  const handleSetPageFilter = (pageNumber: number, level: 'ALL' | CEFRLevel) => {
    setPageLevelFilters((prev) => ({
      ...prev,
      [pageNumber]: level,
    }));
  };

  const handleCopyPageText = (pageNumber: number, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedStatus((prev) => ({ ...prev, [pageNumber]: true }));
    setTimeout(() => {
      setCopiedStatus((prev) => ({ ...prev, [pageNumber]: false }));
    }, 2000);
  };

  const handleReSearchVocab = async (pageNumber: number) => {
    const targetPage = scannedPages.find((p) => p.pageNumber === pageNumber);
    if (!targetPage || !targetPage.rawText?.trim()) return;

    setReExtractingPages((prev) => ({ ...prev, [pageNumber]: true }));

    try {
      const newVocabList = await docScannerService.extractSinglePage(pageNumber, targetPage.rawText);
      setScannedPages((prevPages) =>
        prevPages.map((page) =>
          page.pageNumber === pageNumber
            ? { ...page, vocabularies: newVocabList }
            : page
        )
      );
    } catch (error) {
      console.error(`Lỗi khi tra cứu lại cho trang ${pageNumber}:`, error);
    } finally {
      setReExtractingPages((prev) => ({ ...prev, [pageNumber]: false }));
    }
  };

  const handleToggleVocabulary = (pageNumber: number, vocabId: string) => {
    setScannedPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber === pageNumber) {
          return {
            ...page,
            vocabularies: (page.vocabularies || []).map((v) =>
              v.id === vocabId ? { ...v, selected: !v.selected } : v
            ),
          };
        }
        return page;
      })
    );
  };

  const handleToggleSelectPageVocabs = (pageNumber: number, targetLevel?: 'ALL' | CEFRLevel) => {
    setScannedPages((prevPages) =>
      prevPages.map((page) => {
        if (page.pageNumber !== pageNumber) return page;
        const currentFilter = targetLevel || pageLevelFilters[pageNumber] || 'ALL';
        const pageVocabs = page.vocabularies || [];
        const targetVocabs = pageVocabs.filter(
          (v) => currentFilter === 'ALL' || v.level === currentFilter
        );
        const allTargetSelected = targetVocabs.length > 0 && targetVocabs.every((v) => v.selected);

        return {
          ...page,
          vocabularies: pageVocabs.map((v) => {
            if (currentFilter === 'ALL' || v.level === currentFilter) {
              return { ...v, selected: !allTargetSelected };
            }
            return v;
          }),
        };
      })
    );
  };

  const allVocabs: ExtractedVocabulary[] = scannedPages.flatMap((page) => page.vocabularies || []);
  const allSelectedVocabs: ExtractedVocabulary[] = allVocabs.filter((v) => v.selected);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-28">
      {/* Fixed Left Sidebar */}
      <VocaSidebar />

      {/* Main Container Offset */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ScanLine className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Quét tài liệu</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Nhận diện chữ từ ảnh tài liệu và tự động tạo bộ thẻ từ vựng.
                </p>
              </div>
            </div>

            {selectedFile && !isScanning && (
              <button
                type="button"
                onClick={handleChooseOtherFile}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-5 text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs active:scale-95 shrink-0"
              >
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <span>Chọn tài liệu khác</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 2. Khung Tải File Drag & Drop (Nếu chưa chọn file) */}
          {!selectedFile && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="surface-card border-2 border-dashed border-border hover:border-primary p-12 text-center transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1">
                Kéo & thả tài liệu vào đây, hoặc <span className="text-primary underline">Chọn từ máy tính</span>
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Hỗ trợ file ảnh (JPG, PNG, WebP) và tài liệu PDF nhiều trang. Dung lượng tối đa 25MB.
              </p>
            </div>
          )}

          {/* 3. Tiến Trình Quét Từng Trang */}
          {isScanning && (
            <section className="surface-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-bold text-foreground">
                    Đang quét Trang {currentPageScanning} / {totalPagesCount}...
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold text-primary">
                  <span>Thời gian: {elapsedTime}s</span>
                  <span className="px-2.5 py-1 bg-primary-soft rounded-lg">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-300 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground font-medium text-center">{currentStepText}</p>
            </section>
          )}

          {/* 4. Danh Sách Các Trang Đã Quét */}
          {scannedPages.length > 0 && (
            <div className="space-y-8">
              <SectionTitle
                icon={FileText}
                title="Danh sách trang tài liệu đã quét"
                badge={`${scannedPages.length} trang`}
              />

              {scannedPages.map((page) => {
                const pageVocabs = page.vocabularies || [];
                const currentFilter = pageLevelFilters[page.pageNumber] || 'ALL';
                const filteredPageVocabs = pageVocabs.filter(
                  (v) => currentFilter === 'ALL' || v.level === currentFilter
                );
                const isAllFilteredSelected = filteredPageVocabs.length > 0 && filteredPageVocabs.every((v) => v.selected);

                return (
                  <div key={page.pageNumber} className="space-y-6">
                    {/* Section 1: So sánh ảnh gốc vs OCR */}
                    <section className="surface-card p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <Pill tone="muted">P{page.pageNumber}</Pill>
                        <h3 className="font-bold text-foreground">{page.pageTitle}</h3>
                        <Pill className="ml-auto">{pageVocabs.length} từ vựng trích xuất</Pill>
                      </div>

                      <h4 className="mt-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Images className="h-4 w-4 text-primary" /> So sánh Ảnh Gốc vs Ảnh Sau Khi Nhận Diện OCR
                      </h4>

                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 text-xs font-semibold text-muted-foreground">Ảnh Trang Gốc</p>
                          <div className="flex h-56 lg:h-96 items-center justify-center rounded-2xl border border-border bg-muted/50 text-muted-foreground overflow-hidden">
                            {page.pageImageUrl ? (
                              <img
                                src={page.pageImageUrl}
                                alt={`Ảnh gốc Trang ${page.pageNumber}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ImageIcon className="h-8 w-8" />
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-semibold text-primary">Ảnh Kết Quả OCR</p>
                          <div className="relative flex h-56 lg:h-96 items-center justify-center overflow-hidden rounded-2xl border-2 border-primary bg-muted/40">
                            {page.ocrImageUrl ? (
                              <img
                                src={page.ocrImageUrl}
                                alt={`Ảnh OCR Trang ${page.pageNumber}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                                <span className="text-xs font-bold text-foreground">Không thể tải ảnh OCR khoanh vùng</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Section 2: Chữ đã được nhận diện */}
                    <section className="surface-card p-6">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="flex items-center gap-2 font-bold text-foreground">
                          <FileText className="h-[18px] w-[18px] text-primary" /> Chữ đã được nhận diện
                        </h3>
                        <span className="text-xs text-muted-foreground">(có thể chỉnh sửa trước khi tra cứu)</span>
                        <div className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyPageText(page.pageNumber, page.rawText)}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
                          >
                            {copiedStatus[page.pageNumber] ? (
                              <>
                                <Check className="h-4 w-4 text-success" /> Đã chép!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" /> Copy chữ
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleReSearchVocab(page.pageNumber)}
                            disabled={reExtractingPages[page.pageNumber]}
                            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-pop transition hover:opacity-90 cursor-pointer disabled:opacity-50"
                          >
                            {reExtractingPages[page.pageNumber] ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Đang tra cứu...
                              </>
                            ) : (
                              <>
                                <Search className="h-4 w-4" /> Tra cứu lại
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={page.rawText || ''}
                        onChange={(e) => handleUpdatePageText(page.pageNumber, e.target.value)}
                        className="mt-4 h-40 w-full resize-y rounded-2xl border border-input bg-muted/40 p-4 text-sm leading-relaxed outline-none focus:border-ring font-mono text-foreground select-text"
                        placeholder="Nội dung văn bản nhận diện được..."
                      />
                    </section>

                    {/* Section 3: Bộ từ vựng trích xuất */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="flex items-center gap-2 font-bold text-foreground">
                          <BookOpen className="h-[18px] w-[18px] text-primary" /> Bộ từ vựng trích xuất bên dưới Trang {page.pageNumber} ({filteredPageVocabs.length} từ)
                        </h3>

                        <div className="ml-auto flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetPageFilter(page.pageNumber, 'ALL')}
                            className={`h-9 rounded-full px-3 text-xs font-semibold transition cursor-pointer ${
                              currentFilter === 'ALL'
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            Tất cả
                          </button>

                          {CEFR_LEVELS.map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => handleSetPageFilter(page.pageNumber, lvl)}
                              className={`h-9 rounded-full px-3 text-xs font-semibold transition cursor-pointer ${
                                currentFilter === lvl
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleToggleSelectPageVocabs(page.pageNumber, currentFilter)}
                            className="h-9 rounded-full px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 cursor-pointer transition"
                          >
                            {isAllFilteredSelected ? "Bỏ chọn hết" : "Chọn tất cả"}
                          </button>
                        </div>
                      </div>

                      {filteredPageVocabs.length === 0 ? (
                        <div className="surface-card p-8 text-center text-xs text-muted-foreground">
                          Không có từ vựng nào thuộc cấp độ {currentFilter} ở Trang {page.pageNumber}.
                        </div>
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {filteredPageVocabs.map((v) => (
                            <article
                              key={v.id}
                              onClick={() => handleToggleVocabulary(page.pageNumber, v.id)}
                              className={`surface-card p-4 transition-all cursor-pointer ${
                                v.selected ? "border-primary ring-1 ring-primary/25 bg-card" : "opacity-75 hover:opacity-100"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={v.selected}
                                  onChange={() => {}}
                                  aria-label={`Chọn ${v.term}`}
                                  className="mt-1 h-4 w-4 accent-[var(--primary)] cursor-pointer"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start gap-2">
                                    <p className="font-display font-bold text-foreground text-base">{v.term}</p>
                                    <Pill className="ml-auto" tone="info">
                                      {v.level}
                                    </Pill>
                                  </div>
                                  {v.ipa ? <p className="mt-0.5 text-xs text-muted-foreground font-mono">{v.ipa}</p> : null}
                                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground">
                                    {v.partOfSpeech && (
                                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                                        {v.partOfSpeech}
                                      </span>
                                    )}
                                    {v.definition}
                                  </p>
                                  {v.example ? (
                                    <p className="mt-2 text-xs italic text-muted-foreground">{v.example}</p>
                                  ) : null}
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 5. FLOATING BAR: LƯU TỪ VỰNG ĐÃ CHỌN VÀO BỘ THẺ */}
          {allSelectedVocabs.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 surface-card border-2 border-primary/30 shadow-pop px-6 py-4 rounded-full flex items-center gap-4 bg-card/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-foreground">
                  Đã chọn {allSelectedVocabs.length} từ vựng
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddToSetOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-xs font-bold text-primary-foreground shadow-pop transition hover:opacity-90 cursor-pointer"
              >
                <Layers className="w-4 h-4" /> Lưu vào Bộ thẻ mới / Thư mục
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Modal Lưu vào bộ thẻ */}
      <AddToSetModal
        isOpen={isAddToSetOpen}
        onClose={() => setIsAddToSetOpen(false)}
        selectedVocabs={allSelectedVocabs}
        selectedVocabularies={allSelectedVocabs}
        onSuccess={() => {
          setIsAddToSetOpen(false);
        }}
      />
    </div>
  );
};

export default VocaScanDocumentPage;
