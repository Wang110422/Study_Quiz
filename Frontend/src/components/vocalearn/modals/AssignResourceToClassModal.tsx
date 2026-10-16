import React, { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle2, Loader2, X, Plus, BookOpen, FileText } from 'lucide-react';
import classGroupService, { type ClassOrGroup } from '../../../services/classGroupService';

interface AssignResourceToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'studySet' | 'exam';
  resourceId: number;
  resourceTitle: string;
  onSuccess?: () => void;
}

export const AssignResourceToClassModal: React.FC<AssignResourceToClassModalProps> = ({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceTitle,
  onSuccess,
}) => {
  const [classes, setClasses] = useState<ClassOrGroup[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      classGroupService
        .getUserClasses()
        .then((res) => {
          setClasses(res || []);
          if (res && res.length > 0) {
            setSelectedClassId(res[0].id);
          }
        })
        .catch((err) => {
          console.error('Lỗi khi tải danh sách lớp học:', err);
          setError('Không thể tải danh sách lớp học');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;

    setSubmitting(true);
    setError(null);
    try {
      if (resourceType === 'studySet') {
        await classGroupService.addStudySetToClass(selectedClassId, resourceId);
      } else {
        await classGroupService.addExamToClass(selectedClassId, resourceId);
      }
      setToast('Đã giao thành công vào lớp học!');
      setTimeout(() => {
        setToast(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Lỗi khi giao tài nguyên vào lớp:', err);
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi giao bài vào lớp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Giao Vào Lớp Học</h3>
              <p className="text-[11px] text-muted-foreground truncate max-w-[260px]">
                {resourceType === 'studySet' ? 'Bộ từ vựng' : 'Đề thi'}: {resourceTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {toast && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Chọn lớp học cần giao:</label>
            {loading ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>Đang tải danh sách lớp học...</span>
              </div>
            ) : classes.length === 0 ? (
              <div className="p-4 rounded-xl bg-muted/40 text-center text-xs text-muted-foreground">
                Bạn chưa có lớp học nào. Hãy vào mục <strong>Lớp học</strong> để tạo lớp mới trước.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {classes.map((cls) => {
                  const isSelected = selectedClassId === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => setSelectedClassId(cls.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary shadow-xs'
                          : 'border-border bg-card hover:bg-muted/40 text-foreground'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{cls.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          Mã lớp: {cls.joinCode} • {cls.studentsCount || 0} học sinh
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || classes.length === 0 || !selectedClassId}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang giao...</span>
                </>
              ) : (
                <span>Xác nhận giao bài</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignResourceToClassModal;
