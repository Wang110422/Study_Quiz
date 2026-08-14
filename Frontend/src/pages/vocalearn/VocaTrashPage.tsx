import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, XCircle, FolderKanban, Layers, BookOpen, Loader2 } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import trashService, { type TrashData } from '../../services/trashService';

const VocaTrashPage = () => {
    const [activeTab, setActiveTab] = useState<'folders' | 'sets' | 'vocabularies'>('folders');
    const [trashData, setTrashData] = useState<TrashData>({ folders: [], studySets: [], vocabularies: [] });
    const [loading, setLoading] = useState<boolean>(true);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    const fetchTrash = async () => {
        setLoading(true);
        try {
            const data = await trashService.getTrashItems();
            setTrashData(data);
        } catch (err) {
            console.error('Lỗi khi tải thùng rác:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    const handleRestore = async (type: 'folder' | 'set' | 'vocabulary', id: number) => {
        try {
            const success = await trashService.restoreItem(type, id);
            if (success) {
                setActionMessage('Khôi phục mục thành công!');
                setTimeout(() => setActionMessage(null), 3000);
                fetchTrash();
            }
        } catch (err) {
            console.error('Lỗi khôi phục:', err);
        }
    };

    const handlePermanentDelete = async (type: 'folder' | 'set' | 'vocabulary', id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN mục này? Hành động này không thể hoàn tác!')) {
            return;
        }
        try {
            const success = await trashService.permanentDelete(type, id);
            if (success) {
                setActionMessage('Đã xóa vĩnh viễn khỏi hệ thống!');
                setTimeout(() => setActionMessage(null), 3000);
                fetchTrash();
            }
        } catch (err) {
            console.error('Lỗi xóa vĩnh viễn:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none">
            <VocaSidebar />

            <div className="pl-[200px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
                    {/* Header Title */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2.5 mb-1">
                            <Trash2 className="w-6 h-6 text-rose-500" />
                            <h1 className="text-xl font-bold text-slate-900">
                                Thùng rác (Mục đã xóa)
                            </h1>
                        </div>
                        <p className="text-xs text-slate-400 font-normal">
                            Quản lý và khôi phục các Thư mục, Bộ thẻ từ vựng hoặc Từ vựng đã xóa mềm.
                        </p>
                    </div>

                    {/* Alert Message Toast */}
                    {actionMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 mb-5 flex items-center gap-2 shadow-xs animate-in fade-in">
                            <RotateCcw className="w-4 h-4 text-emerald-600" />
                            <span>{actionMessage}</span>
                        </div>
                    )}

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
                        <button
                            onClick={() => setActiveTab('folders')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'folders'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <FolderKanban className="w-4 h-4" />
                            <span>Thư mục ({trashData.folders.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('sets')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'sets'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span>Bộ từ vựng ({trashData.studySets.length})</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('vocabularies')}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'vocabularies'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>Từ vựng ({trashData.vocabularies.length})</span>
                        </button>
                    </div>

                    {/* Content Section */}
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
                            <span className="text-xs font-semibold">Đang tải các mục đã xóa...</span>
                        </div>
                    ) : (
                        <>
                            {/* TAB 1: THƯ MỤC ĐÃ XÓA */}
                            {activeTab === 'folders' && (
                                <div>
                                    {trashData.folders.length === 0 ? (
                                        <div className="py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                                            <p className="text-sm font-semibold">Không có thư mục nào trong thùng rác.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {trashData.folders.map((item) => (
                                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0 border border-amber-100">
                                                            {item.icon || '📁'}
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{item.description || 'Thư mục đã bị xóa mềm'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRestore('folder', item.id)}
                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            <span>Khôi phục</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermanentDelete('folder', item.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Xóa hẳn</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 2: BỘ TỪ VỰNG ĐÃ XÓA */}
                            {activeTab === 'sets' && (
                                <div>
                                    {trashData.studySets.length === 0 ? (
                                        <div className="py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                                            <p className="text-sm font-semibold">Không có bộ từ vựng nào trong thùng rác.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {trashData.studySets.map((item) => (
                                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0 border border-blue-100">
                                                            📚
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-slate-900 text-sm">{item.titleName}</h3>
                                                            <p className="text-xs text-slate-400 mt-0.5">{item.description || 'Bộ từ vựng đã bị xóa mềm'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRestore('set', item.id)}
                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            <span>Khôi phục</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermanentDelete('set', item.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Xóa hẳn</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* TAB 3: TỪ VỰNG ĐÃ XÓA */}
                            {activeTab === 'vocabularies' && (
                                <div>
                                    {trashData.vocabularies.length === 0 ? (
                                        <div className="py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                                            <p className="text-sm font-semibold">Không có từ vựng nào trong thùng rác.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {trashData.vocabularies.map((item) => (
                                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                                                    <div>
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">Từ vựng</span>
                                                        <h3 className="font-bold text-slate-900 text-sm mt-1">{item.term}</h3>
                                                        <p className="text-xs text-slate-500 mt-1 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">{item.definition}</p>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleRestore('vocabulary', item.id)}
                                                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            <span>Khôi phục</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handlePermanentDelete('vocabulary', item.id)}
                                                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>Xóa hẳn</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default VocaTrashPage;
