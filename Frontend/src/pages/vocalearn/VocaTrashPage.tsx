import { useState, useEffect } from 'react';
import {
  Trash2,
  Undo2,
  XCircle,
  Folder,
  Layers,
  Type,
  Loader2,
  Check,
} from 'lucide-react';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { PageHeader } from '@/components/app/PageHeader';
import { EmojiTile } from '@/components/app/ui-bits';
import trashService, { type TrashData } from '@/services/trashService';

const VocaTrashPage = () => {
  const [tab, setTab] = useState<'folders' | 'sets' | 'words'>('folders');
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
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
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
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Đã xóa</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Các mục đã xóa được giữ lại 30 ngày trước khi bị loại bỏ vĩnh viễn.
                </p>
              </div>
            </div>
          </div>

          {/* Action Message Toast */}
          {actionMessage && (
            <div className="p-3.5 bg-success-soft border border-success/30 text-success text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-success" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* 2. Filter Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
            <button
              type="button"
              onClick={() => setTab("folders")}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${
                tab === "folders"
                  ? "bg-primary text-primary-foreground shadow-pop"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Folder className="h-4 w-4" /> Thư mục ({trashData.folders.length})
            </button>

            <button
              type="button"
              onClick={() => setTab("sets")}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${
                tab === "sets"
                  ? "bg-primary text-primary-foreground shadow-pop"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Layers className="h-4 w-4" /> Bộ từ vựng ({trashData.studySets.length})
            </button>

            <button
              type="button"
              onClick={() => setTab("words")}
              className={`inline-flex h-10 items-center gap-2 rounded-full px-5 text-xs font-bold transition cursor-pointer ${
                tab === "words"
                  ? "bg-primary text-primary-foreground shadow-pop"
                  : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <Type className="h-4 w-4" /> Từ vựng ({trashData.vocabularies.length})
            </button>
          </div>

          {/* 3. Content Section */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-xs font-semibold">Đang tải các mục đã xóa...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: THƯ MỤC ĐÃ XÓA */}
              {tab === "folders" && (
                <div>
                  {trashData.folders.length === 0 ? (
                    <div className="surface-card p-12 text-center text-muted-foreground">
                      <Folder className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-60" />
                      <p className="text-sm font-semibold text-foreground">Không có thư mục nào trong thùng rác.</p>
                      <p className="text-xs text-muted-foreground mt-1">Các thư mục bị xóa sẽ xuất hiện ở đây trong vòng 30 ngày.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {trashData.folders.map((item) => (
                        <article key={item.id} className="surface-card p-5 flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <EmojiTile>{item.icon || '📁'}</EmojiTile>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-sm">{item.name}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {item.description || 'Thư mục đã bị xóa mềm'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
                            <button
                              type="button"
                              onClick={() => handleRestore('folder', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
                            >
                              <Undo2 className="h-4 w-4 text-primary" /> Khôi phục
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete('folder', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive transition hover:bg-destructive/10 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" /> Xóa hẳn
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: BỘ TỪ VỰNG ĐÃ XÓA */}
              {tab === "sets" && (
                <div>
                  {trashData.studySets.length === 0 ? (
                    <div className="surface-card p-12 text-center text-muted-foreground">
                      <Layers className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-60" />
                      <p className="text-sm font-semibold text-foreground">Không có bộ từ vựng nào trong thùng rác.</p>
                      <p className="text-xs text-muted-foreground mt-1">Các bộ thẻ bị xóa sẽ xuất hiện ở đây trong vòng 30 ngày.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {trashData.studySets.map((item) => (
                        <article key={item.id} className="surface-card p-5 flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <EmojiTile>📚</EmojiTile>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-sm">{item.titleName}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {item.description || 'Bộ từ vựng đã bị xóa mềm'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
                            <button
                              type="button"
                              onClick={() => handleRestore('set', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
                            >
                              <Undo2 className="h-4 w-4 text-primary" /> Khôi phục
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete('set', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive transition hover:bg-destructive/10 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" /> Xóa hẳn
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TỪ VỰNG ĐÃ XÓA */}
              {tab === "words" && (
                <div>
                  {trashData.vocabularies.length === 0 ? (
                    <div className="surface-card p-12 text-center text-muted-foreground">
                      <Type className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-60" />
                      <p className="text-sm font-semibold text-foreground">Không có từ vựng nào trong thùng rác.</p>
                      <p className="text-xs text-muted-foreground mt-1">Các từ vựng bị xóa sẽ xuất hiện ở đây trong vòng 30 ngày.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {trashData.vocabularies.map((item) => (
                        <article key={item.id} className="surface-card p-5 flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <EmojiTile>🔤</EmojiTile>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-foreground text-sm">{item.term}</p>
                              <p className="mt-0.5 text-xs text-muted-foreground bg-muted/50 p-2 rounded-xl border border-border mt-1">
                                {item.definition}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-2 border-t border-border pt-4">
                            <button
                              type="button"
                              onClick={() => handleRestore('vocabulary', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition hover:bg-muted cursor-pointer"
                            >
                              <Undo2 className="h-4 w-4 text-primary" /> Khôi phục
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete('vocabulary', item.id)}
                              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/5 px-4 text-xs font-semibold text-destructive transition hover:bg-destructive/10 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" /> Xóa hẳn
                            </button>
                          </div>
                        </article>
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
