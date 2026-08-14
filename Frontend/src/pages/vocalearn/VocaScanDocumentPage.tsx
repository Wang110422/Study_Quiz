import { useState, useEffect, useRef } from 'react';
import { FileSearch, UploadCloud, FileText, CheckCircle2, Loader2, Sparkles, Filter, Plus, Check, RefreshCw } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import docScannerService, { type ExtractedVocabulary, type CEFRLevel } from '../../services/docScannerService';
import AddToSetModal from '../../components/vocalearn/modals/AddToSetModal';

const CEFR_BADGES: Record<CEFRLevel, { label: string; color: string; bg: string; border: string }> = {
    A1: { label: 'A1 - Sơ cấp', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    A2: { label: 'A2 - Cơ bản', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    B1: { label: 'B1 - Trung cấp', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    B2: { label: 'B2 - Trung cấp cao', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    C1: { label: 'C1 - Cao cấp', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    C2: { label: 'C2 - Chuyên sâu', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

const VocaScanDocumentPage = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Trạng thái quét & Tiến trình
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [progressPercent, setProgressPercent] = useState<number>(0);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [currentStepText, setCurrentStepText] = useState<string>('');

    // Kết quả trích xuất
    const [extractedVocabs, setExtractedVocabs] = useState<ExtractedVocabulary[]>([]);
    const [activeLevelFilter, setActiveLevelFilter] = useState<'ALL' | CEFRLevel>('ALL');

    // Modal lưu từ vựng vào bộ thẻ
    const [isAddToSetOpen, setIsAddToSetOpen] = useState<boolean>(false);

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

    // Bắt đầu quá trình quét file mô phỏng tiến trình thực tế sống động
    const handleStartScan = async (file: File) => {
        setSelectedFile(file);
        setIsScanning(true);
        setProgressPercent(0);
        setCurrentStepText('📄 Đang đọc và phân tích cấu trúc tài liệu...');

        // 1. Đọc nội dung file
        const text = await docScannerService.readTextFromFile(file);

        // 2. Chạy mô phỏng thanh tiến trình sống động
        const interval = setInterval(() => {
            setProgressPercent((prev) => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                const next = prev + Math.floor(Math.random() * 15) + 5;
                if (next > 30 && next <= 60) {
                    setCurrentStepText('🔍 Đang bóc tách thuật ngữ & lọc các từ trùng lặp...');
                } else if (next > 60) {
                    setCurrentStepText('🏷️ Đang tra cứu định nghĩa & phân loại trình độ CEFR (A1 - C2)...');
                }
                return next;
            });
        }, 300);

        // 3. Hoàn tất trích xuất từ vựng
        setTimeout(() => {
            clearInterval(interval);
            setProgressPercent(100);
            setCurrentStepText('✅ Hoàn tất! Đã trích xuất danh sách từ vựng chuẩn CEFR.');

            const result = docScannerService.extractVocabularies(text);
            setExtractedVocabs(result);

            setTimeout(() => {
                setIsScanning(false);
            }, 800);
        }, 3000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleStartScan(e.target.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleStartScan(e.dataTransfer.files[0]);
        }
    };

    // Toggle chọn 1 từ vựng
    const handleToggleSelect = (id: string) => {
        setExtractedVocabs((prev) =>
            prev.map((v) => (v.id === id ? { ...v, selected: !v.selected } : v))
        );
    };

    // Chọn tất cả / Bỏ chọn tất cả theo bộ lọc hiện tại
    const handleToggleSelectAll = (select: boolean) => {
        setExtractedVocabs((prev) =>
            prev.map((v) => {
                if (activeLevelFilter === 'ALL' || v.level === activeLevelFilter) {
                    return { ...v, selected: select };
                }
                return v;
            })
        );
    };

    // Danh sách từ vựng lọc theo cấp độ CEFR hiện tại
    const filteredVocabs = extractedVocabs.filter(
        (v) => activeLevelFilter === 'ALL' || v.level === activeLevelFilter
    );

    const selectedVocabs = extractedVocabs.filter((v) => v.selected);

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-24">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    {/* Header Title */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2.5 mb-1">
                                <FileSearch className="w-6 h-6 text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-900">
                                    Quét tài liệu & Trích xuất từ vựng CEFR
                                </h1>
                            </div>
                            <p className="text-xs text-slate-400 font-normal">
                                Tải lên tài liệu PDF, DOCX, TXT để hệ thống tự động bóc tách từ vựng và phân loại cấp độ A1 - C2.
                            </p>
                        </div>

                        {extractedVocabs.length > 0 && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer"
                            >
                                <RefreshCw className="w-4 h-4 text-blue-600" />
                                <span>Quét tài liệu khác</span>
                            </button>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* KHU VỰC 1: UPLOAD FILE & THANH TIẾN TRÌNH QUÉT */}
                    {extractedVocabs.length === 0 && !isScanning ? (
                        <div
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white border-2 border-dashed border-blue-200 hover:border-blue-500 rounded-3xl p-10 lg:p-14 text-center shadow-xs transition-all cursor-pointer group flex flex-col items-center justify-center gap-4 my-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                    Kéo thả tài liệu vào đây hoặc <span className="text-blue-600 underline">Bấm để chọn file</span>
                                </h3>
                                <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
                                    Hỗ trợ tài liệu văn bản dạng PDF, DOCX, TXT... Hệ thống tự động phân tích và xếp loại từ vựng từ A1 đến C2.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-slate-400">
                                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">PDF</span>
                                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">DOCX</span>
                                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">TXT</span>
                            </div>
                        </div>
                    ) : isScanning ? (
                        /* THANH TIẾN TRÌNH PHẦN TRĂM (%) KHI ĐANG QUẾT */
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-xs mb-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                        <FileText className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm">{selectedFile?.name || 'Đang quét file...'}</h3>
                                        <p className="text-xs text-slate-400">
                                            Dung lượng: {selectedFile ? (selectedFile.size / 1024).toFixed(1) + ' KB' : '...'} · Thời gian chạy: {elapsedTime} giây
                                        </p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-blue-600">{progressPercent}%</span>
                            </div>

                            {/* Main Progress Bar */}
                            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-sm"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                                <span className="flex items-center gap-2 text-blue-600 font-bold">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{currentStepText}</span>
                                </span>
                                <span>Vui lòng không đóng trình duyệt</span>
                            </div>
                        </div>
                    ) : null}

                    {/* KHU VỰC 2: KẾT QUẢ VÀ HÀNG CHỜ TỪ VỰNG THEO CEFR (A1 - C2) */}
                    {extractedVocabs.length > 0 && !isScanning && (
                        <div>
                            {/* CEFR Level Filter Bar */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-2">
                                        <Filter className="w-3.5 h-3.5" />
                                        Lọc CEFR:
                                    </span>

                                    <button
                                        onClick={() => setActiveLevelFilter('ALL')}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                            activeLevelFilter === 'ALL'
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                    >
                                        Tất cả ({extractedVocabs.length})
                                    </button>

                                    {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]).map((level) => {
                                        const count = extractedVocabs.filter((v) => v.level === level).length;
                                        const badge = CEFR_BADGES[level];
                                        const isActive = activeLevelFilter === level;

                                        return (
                                            <button
                                                key={level}
                                                onClick={() => setActiveLevelFilter(level)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                                                    isActive
                                                        ? `${badge.bg} ${badge.color} ${badge.border} ring-2 ring-blue-500/20 shadow-2xs`
                                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                {level} ({count})
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleSelectAll(true)}
                                        className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Chọn tất cả
                                    </button>
                                    <span className="text-slate-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleSelectAll(false)}
                                        className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Bỏ chọn
                                    </button>
                                </div>
                            </div>

                            {/* VOCABULARY STAGING QUEUE GRID */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                                {filteredVocabs.map((item) => {
                                    const badge = CEFR_BADGES[item.level];

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => handleToggleSelect(item.id)}
                                            className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all cursor-pointer flex flex-col justify-between relative group ${
                                                item.selected
                                                    ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                                                    : 'border-slate-200 opacity-75 hover:opacity-100'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg} ${badge.color} ${badge.border}`}>
                                                        {badge.label}
                                                    </span>

                                                    {/* Custom Checkbox */}
                                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                                        item.selected
                                                            ? 'bg-blue-600 border-blue-600 text-white'
                                                            : 'border-slate-300 bg-white'
                                                    }`}>
                                                        {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                    </div>
                                                </div>

                                                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                    {item.term} <span className="text-xs font-semibold text-slate-400 italic">({item.partOfSpeech})</span>
                                                </h3>
                                                <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                                                    {item.definition}
                                                </p>
                                                {item.example && (
                                                    <p className="text-[11px] text-slate-400 italic font-normal">
                                                        "{item.example}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* FLOATING ACTION BOTTOM BAR */}
                            <div className="fixed bottom-6 left-[230px] right-6 max-w-[1400px] mx-auto bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 z-30 border border-slate-800 animate-in slide-in-from-bottom-5">
                                <div className="flex items-center gap-3">
                                    <Sparkles className="w-5 h-5 text-amber-400" />
                                    <span className="text-xs font-semibold">
                                        Đã chọn <strong className="text-white font-bold text-sm">{selectedVocabs.length}</strong> / {extractedVocabs.length} từ vựng trong hàng chờ
                                    </span>
                                </div>

                                <button
                                    disabled={selectedVocabs.length === 0}
                                    onClick={() => setIsAddToSetOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 cursor-pointer active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Thêm ({selectedVocabs.length}) từ vựng vào bộ thẻ của tôi</span>
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Chọn Bộ thẻ để thêm từ vựng */}
            <AddToSetModal
                isOpen={isAddToSetOpen}
                onClose={() => setIsAddToSetOpen(false)}
                selectedVocabs={selectedVocabs}
                onSuccess={() => {
                    setExtractedVocabs([]);
                }}
            />
        </div>
    );
};

export default VocaScanDocumentPage;
