import { useParams, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, Loader2, RefreshCw as CloudSync, Trash2 } from 'lucide-react';
import VocaHeader from '../../components/vocalearn/layout/VocaHeader';
import VocaSidebar from '../../components/vocalearn/layout/VocaSidebar';
import useFolderDetail from '../../hooks/useFolderDetail';
import useFolders from '../../hooks/useFolders';

const FolderDetailPage = () => {
    const { folderSlug } = useParams<{ folderSlug: string }>();
    const location = useLocation();
    const { folder, studySets, loading, deleteStudySet } = useFolderDetail(folderSlug);
    const { syncGoogleDrive, isSyncing, syncMessage } = useFolders();

    const displayTitle = folder?.name || folderSlug || 'Chi tiết thư mục';
    const displayDesc = folder?.description || 'Các bộ từ vựng thuộc thư mục này';
    const displayIcon = folder?.icon || '📁';

    // Nguồn trang trước đó (nếu mở từ Nhóm học hoặc Lớp học)
    const backTarget = location.state?.from || '/folders';
    const backLabel = location.state?.fromName ? `Quay lại ${location.state.fromName}` : 'Quay lại Thư viện của bạn';

    return (
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none">
            <VocaSidebar />

            <div className="pl-[260px] flex flex-col min-h-screen">
                <VocaHeader />

                <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
                    {/* Breadcrumbs Navigation Smart Context-Aware */}
                    <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Link to={backTarget} className="hover:text-blue-600 flex items-center gap-1 font-bold text-blue-600 transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>{backLabel}</span>
                        </Link>
                        <span>/</span>
                        <span className="text-slate-900 font-bold">{displayTitle}</span>
                    </div>

                    {/* Sync Message Alert */}
                    {syncMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl p-3.5 mb-4 flex items-center justify-between shadow-xs">
                            <div className="flex items-center gap-2">
                                <CloudSync className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>{syncMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Folder Banner Header */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shrink-0">
                                {displayIcon}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    {displayTitle}
                                </h1>
                                <p className="text-xs text-slate-400 font-normal mt-0.5">
                                    {displayDesc}
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                                    <span className="px-2.5 py-0.5 bg-slate-100 rounded-md">
                                        {studySets.length} bộ thẻ
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap">
                            <button
                                onClick={() => syncGoogleDrive(folder?.id, folder?.slug)}
                                disabled={isSyncing}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60"
                                title="Đồng bộ riêng Thư mục này với Google Drive & Sheet"
                            >
                                <CloudSync className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ Google'}</span>
                            </button>

                            {/* Link / Nút Mở File Google Sheet chứa các StudySets & từ vựng */}
                            <a
                                href={folder?.sheetUrl || (syncMessage && syncMessage.includes('http') ? syncMessage.split(' ').find(word => word.startsWith('http')) : 'https://docs.google.com/spreadsheets/u/0/')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                                title="Mở file Google Sheet chứa các sheet StudySet và danh sách từ vựng của thư mục này"
                            >
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z" />
                                </svg>
                                <span>📊 Mở File Google Sheet</span>
                            </a>

                            <Link
                                to={`/create-set?folderSlug=${folder?.slug || ''}&folderId=${folder?.id || ''}`}
                                className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Thêm bộ thẻ vào thư mục</span>
                            </Link>
                        </div>
                    </div>

                    {/* StudySets List Section */}
                    <div className="mb-6">
                        <h2 className="text-base font-bold text-slate-900 mb-3">
                            Danh sách Bộ chủ đề học phần ({studySets.length})
                        </h2>

                        {loading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="text-xs">Đang tải bộ từ vựng...</span>
                            </div>
                        ) : studySets.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                                <p className="text-sm font-semibold">Chưa có bộ từ vựng nào trong thư mục này.</p>
                                <Link
                                    to="/create-set"
                                    className="text-xs text-blue-600 font-bold hover:underline mt-1 inline-block"
                                >
                                    + Bấm vào đây để tạo bộ từ vựng đầu tiên!
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {studySets.map((set) => (
                                    <div
                                        key={set.id}
                                        className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group relative"
                                    >
                                        <div>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-bold">
                                                    📚
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (window.confirm(`Bạn có muốn chuyển bộ thẻ "${set.titleName}" vào Thùng Rác?`)) {
                                                            deleteStudySet(set.id);
                                                        }
                                                    }}
                                                    className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                                                    title="Xóa bộ thẻ vào Thùng rác"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <Link
                                                to={`/folders/${folderSlug}/${set.slug}`}
                                                state={{ from: location.pathname, fromName: displayTitle }}
                                            >
                                                <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                                    {set.titleName}
                                                </h3>
                                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                                    {set.vocabularies ? set.vocabularies.length : 0} thuật ngữ
                                                </p>
                                            </Link>
                                        </div>

                                        <Link
                                            to={`/folders/${folderSlug}/${set.slug}`}
                                            state={{ from: location.pathname, fromName: displayTitle }}
                                            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600"
                                        >
                                            <span>Bắt đầu học từ vựng</span>
                                            <BookOpen className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default FolderDetailPage;
