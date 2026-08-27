import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Layers, Check, FolderKanban, Lock, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import useFolders from '../../hooks/useFolders';
import studySetService from '../../services/studySetService';

interface TermItem {
    id: number;
    term: string;
    definition: string;
    ipa?: string;
    pos?: string;
    example?: string;
    synonyms?: string;
}

const CreateStudySetPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const presetFolderSlug = searchParams.get('folderSlug');

    const { folders, loading: loadingFolders } = useFolders();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFolderSlug, setSelectedFolderSlug] = useState(presetFolderSlug || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFixedFolder = Boolean(presetFolderSlug);

    const [terms, setTerms] = useState<TermItem[]>([
        { id: 1, term: '', definition: '', ipa: '', pos: '', example: '', synonyms: '' },
        { id: 2, term: '', definition: '', ipa: '', pos: '', example: '', synonyms: '' },
        { id: 3, term: '', definition: '', ipa: '', pos: '', example: '', synonyms: '' },
    ]);

    useEffect(() => {
        if (presetFolderSlug) {
            setSelectedFolderSlug(presetFolderSlug);
        }
    }, [presetFolderSlug]);

    const handleAddTerm = () => {
        setTerms((prev) => [
            ...prev,
            { id: Date.now(), term: '', definition: '', ipa: '', pos: '', example: '', synonyms: '' },
        ]);
    };

    const handleRemoveTerm = (id: number) => {
        if (terms.length <= 1) return;
        setTerms((prev) => prev.filter((t) => t.id !== id));
    };

    const handleMoveTerm = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= terms.length) return;
        setTerms((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const handleTermChange = (id: number, field: keyof TermItem, value: string) => {
        setTerms((prev) =>
            prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const selectedFolder = selectedFolderSlug ? folders.find((f) => f.slug === selectedFolderSlug) : undefined;
            const validVocabularies = terms
                .filter((t) => t.term.trim() !== '')
                .map((t) => ({
                    term: t.term.trim(),
                    definition: t.definition.trim(),
                    ipa: t.ipa?.trim() || undefined,
                    pos: t.pos?.trim() || undefined,
                    partOfSpeech: t.pos?.trim() || undefined,
                    example: t.example?.trim() || undefined,
                    hint: t.example?.trim() || undefined,
                    meaning: t.definition.trim(),
                }));

            const createdSet = await studySetService.createStudySet({
                titleName: title.trim(),
                description: description.trim(),
                folderId: selectedFolder?.id,
                folderSlug: selectedFolderSlug || undefined,
                folderName: selectedFolder?.name,
                vocabularies: validVocabularies,
            });

            const finalFolderSlug = createdSet?.folderSlug || selectedFolderSlug;
            const finalSetSlug = createdSet?.slug || title.toLowerCase().replace(/\s+/g, '-');

            if (finalFolderSlug) {
                navigate(`/folders/${finalFolderSlug}/${finalSetSlug}`);
            } else {
                navigate(`/studyset/${finalSetSlug}`);
            }
        } catch (err) {
            console.error('Lỗi khi tạo bộ từ vựng:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none">
            <VocaSidebar />

            <div className="pl-[260px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1200px] w-full mx-auto">
                    {/* Header Action Bar */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/folders"
                                    className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                                <div>
                                    <h1 className="text-xl font-bold text-slate-900">
                                        Tạo bộ từ vựng mới
                                    </h1>
                                    <p className="text-xs text-slate-400 font-normal">
                                        Thêm thuật ngữ và định nghĩa để bắt đầu ôn luyện
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                            >
                                <Check className="w-4 h-4" />
                                <span>Tạo bộ từ vựng</span>
                            </button>
                        </div>

                        {/* Top Info Settings Card */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-8 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Tên bộ từ vựng <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder='Nhập tiêu đề, ví dụ "Chương 1 - Từ vựng Tiếng Anh Giao Tiếp"'
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Thêm mô tả cho bộ thẻ từ vựng này..."
                                        rows={2}
                                        className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                                        <span>Thư mục chứa <span className="text-slate-400 font-normal">(Tùy chọn)</span></span>
                                        {isFixedFolder && (
                                            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                                <Lock className="w-3 h-3" /> Cố định thư mục hiện tại
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <FolderKanban className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <select
                                            value={selectedFolderSlug}
                                            disabled={isFixedFolder}
                                            onChange={(e) => setSelectedFolderSlug(e.target.value)}
                                            className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none transition-all appearance-none ${
                                                isFixedFolder
                                                    ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                                                    : 'bg-slate-50 border-slate-200 focus:border-blue-500 focus:bg-white text-slate-800 cursor-pointer'
                                            }`}
                                        >
                                            <option value="">🌐 Không chọn thư mục (Tạo bộ thẻ độc lập)</option>
                                            {loadingFolders ? (
                                                <option value="">Đang tải thư mục...</option>
                                            ) : (
                                                folders.map((f) => (
                                                    <option key={f.id || f.slug} value={f.slug}>
                                                        📁 Thư mục: {f.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms List Section */}
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-blue-600" />
                                    <span>Danh sách Thuật ngữ ({terms.length})</span>
                                </h2>
                            </div>

                            {terms.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs transition-all space-y-4 relative group"
                                >
                                    {/* DÒNG TIÊU ĐỀ THẺ: #Số thứ tự + Nút ảnh + Nút xóa + Nút lên/xuống */}
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-500">
                                        <span className="text-sm font-black text-slate-900">{index + 1}</span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                                title="Thêm hình ảnh"
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                <span className="text-[11px]">Ảnh</span>
                                            </button>

                                            {terms.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTerm(item.id)}
                                                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                                                    title="Xóa thẻ"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            {/* Mũi tên lên / xuống để đổi vị trí */}
                                            <div className="flex flex-col ml-1">
                                                <button
                                                    type="button"
                                                    disabled={index === 0}
                                                    onClick={() => handleMoveTerm(index, 'up')}
                                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5 cursor-pointer"
                                                    title="Di chuyển lên"
                                                >
                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={index === terms.length - 1}
                                                    onClick={() => handleMoveTerm(index, 'down')}
                                                    className="text-slate-400 hover:text-slate-700 disabled:opacity-20 p-0.5 cursor-pointer"
                                                    title="Di chuyển xuống"
                                                >
                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* DÒNG 1: THUẬT NGỮ & ĐỊNH NGHĨA */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                                                THUẬT NGỮ
                                            </label>
                                            <input
                                                type="text"
                                                value={item.term}
                                                onChange={(e) => handleTermChange(item.id, 'term', e.target.value)}
                                                placeholder="Nhập thuật ngữ"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                                                ĐỊNH NGHĨA
                                            </label>
                                            <input
                                                type="text"
                                                value={item.definition}
                                                onChange={(e) => handleTermChange(item.id, 'definition', e.target.value)}
                                                placeholder="Nhập định nghĩa"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* DÒNG 2: PHÁT ÂM (TÙY CHỌN) & LOẠI TỪ (TÙY CHỌN) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                                Phát âm <span className="text-slate-400">(Tùy chọn)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.ipa || ''}
                                                onChange={(e) => handleTermChange(item.id, 'ipa', e.target.value)}
                                                placeholder="VD: /həˈloʊ/"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                                Loại từ <span className="text-slate-400">(Tùy chọn)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.pos || ''}
                                                onChange={(e) => handleTermChange(item.id, 'pos', e.target.value)}
                                                placeholder="VD: noun, verb..."
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* DÒNG 3: VÍ DỤ (TÙY CHỌN) & TỪ ĐỒNG NGHĨA (TÙY CHỌN) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                                Ví dụ <span className="text-slate-400">(Tùy chọn)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.example || ''}
                                                onChange={(e) => handleTermChange(item.id, 'example', e.target.value)}
                                                placeholder="Nhập câu ví dụ"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none transition-all italic"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                                                Từ đồng nghĩa <span className="text-slate-400">(Tùy chọn)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.synonyms || ''}
                                                onChange={(e) => handleTermChange(item.id, 'synonyms', e.target.value)}
                                                placeholder="Nhập các từ đồng nghĩa, cách nhau bằng dấu chấm phẩy (;)"
                                                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl px-4 py-2.5 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Term Card Button */}
                        <div className="mb-10">
                            <button
                                type="button"
                                onClick={handleAddTerm}
                                className="w-full py-4 bg-white border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm thẻ từ vựng thứ {terms.length + 1}</span>
                            </button>
                        </div>

                        {/* Bottom Submit Bar */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                            >
                                <Check className="w-4 h-4" />
                                <span>Tạo bộ từ vựng</span>
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
};

export default CreateStudySetPage;
