// src/components/vocalearn/exam/ExamValidationModal.tsx
import React from 'react';
import { type QuestionValidationError } from '@/utils/examBlueprintUtils';

interface ExamValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: QuestionValidationError[];
  onScrollToQuestion: (questionNumber: number) => void;
}

export const ExamValidationModal: React.FC<ExamValidationModalProps> = ({
  isOpen,
  onClose,
  errors,
  onScrollToQuestion,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-rose-200 cursor-default animate-scaleUp"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-600 text-white tracking-wider">
                Chặn lưu đề thi
              </span>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                THÔNG BÁO THIẾU THÔNG TIN BẮT BUỘC
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Phát hiện <strong className="text-rose-600">{errors.length} câu hỏi</strong> chưa hoàn thiện các trường dữ liệu bắt buộc (Nội dung câu hoặc Đáp án) theo chuẩn Blueprint.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-600 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

        {/* DANH SÁCH CÂU HỎI LỖI */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {errors.map((err) => (
            <div
              key={err.questionId || err.questionNumber}
              className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-rose-50 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-lg border border-rose-300">
                    Câu {err.questionNumber}
                  </span>
                  <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {err.partName}
                  </span>
                </div>

                {/* CÁC THẺ LỖI CỤ THỂ */}
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  {err.missingContent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-600 text-white">
                      Thiếu nội dung câu hỏi
                    </span>
                  )}
                  {err.missingAudio && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-600 text-white">
                      Thiếu file Audio
                    </span>
                  )}
                  {err.missingImage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-600 text-white">
                      Thiếu hình ảnh minh họa
                    </span>
                  )}
                  {err.missingPassage && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                      Thiếu đoạn văn điền từ
                    </span>
                  )}
                  {err.missingAnswer && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                      Chưa nhập / chọn đáp án đúng
                    </span>
                  )}
                </div>

                <ul className="text-[11px] text-rose-700 list-disc list-inside space-y-0.5 pt-1">
                  {err.errorMessages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScrollToQuestion(err.questionNumber);
                }}
                className="self-start sm:self-center px-4 py-2 bg-white hover:bg-rose-600 hover:text-white border border-rose-300 text-rose-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs shrink-0"
              >
                Đi tới câu này
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            Vui lòng điền đủ các thông tin báo đỏ trước khi gửi đề thi.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đã hiểu, đóng để bổ sung
          </button>
        </div>
      </div>
    </div>
  );
};
