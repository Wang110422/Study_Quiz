// src/utils/examBlueprintUtils.ts
import { EXAM_BLUEPRINTS, type AnswerType, type QuestionRangeRule } from '../constants/examBlueprints';
import { type ScannedExamQuestion } from '../services/docScannerService';

export interface QuestionValidationError {
  questionId: string;
  questionNumber: number;
  partName: string;
  missingContent?: boolean;
  missingAudio?: boolean;
  missingImage?: boolean;
  missingAnswer?: boolean;
  missingPassage?: boolean;
  errorMessages: string[];
}

/**
 * Tìm kiếm quy tắc cấu hình Blueprint cho một câu hỏi dựa vào kỳ thi, kỹ năng và số thứ tự câu hỏi
 */
export function getQuestionRule(
  exam: string,
  skill: string,
  questionNumber: number
): QuestionRangeRule | undefined {
  const blueprint = EXAM_BLUEPRINTS[exam]?.[skill];
  if (!blueprint) return undefined;

  return blueprint.questionRules.find(
    (rule) => questionNumber >= rule.range[0] && questionNumber <= rule.range[1]
  );
}

/**
 * Tự động sinh danh sách phương án mặc định dựa trên loại đáp án của Blueprint
 */
export function getDefaultOptionsForAnswerType(
  answerType: AnswerType
): { key: string; text: string }[] {
  switch (answerType) {
    case 'CHOICE_3':
      return [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
      ];
    case 'CHOICE_4':
      return [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ];
    default:
      return [];
  }
}

/**
 * Kiểm tra tính hợp lệ của danh sách câu hỏi dựa trên yêu cầu nghiêm ngặt của Blueprint
 * QUY TẮC: Chỉ khi người dùng bấm Lưu đề thi thì hàm này mới được gọi để kích hoạt cảnh báo đỏ
 */
export function validateAllExamQuestions(
  questions: ScannedExamQuestion[],
  exam: string,
  skill: string
): { isValid: boolean; invalidQuestions: QuestionValidationError[] } {
  const invalidQuestions: QuestionValidationError[] = [];

  questions.forEach((q) => {
    // Chỉ kiểm tra các câu hỏi được chọn để lưu
    if (!q.selected) return;

    const rule = getQuestionRule(exam, skill, q.questionNumber);
    const errorMessages: string[] = [];
    let missingContent = false;
    let missingAudio = false;
    let missingImage = false;
    let missingAnswer = false;
    let missingPassage = false;

    const answerType = rule?.answerType || 'CHOICE_4';
    const hasQuestionText = rule ? rule.hasQuestionText !== false : true;

    // 1. Kiểm tra nội dung câu hỏi (chỉ bắt buộc khi Blueprint có hasQuestionText !== false và không phải FILL_IN_BLANK)
    if (hasQuestionText && answerType !== 'FILL_IN_BLANK' && (!q.content || !q.content.trim())) {
      missingContent = true;
      errorMessages.push('Nội dung câu hỏi chưa được nhập');
    }

    // 2. Kiểm tra đoạn văn nếu Blueprint yêu cầu (như câu 51-52 TOPIK II, TOEIC Part 6, Part 7)
    // Chỉ kiểm tra câu đơn, các câu trong chùm kế thừa passage chung
    if (rule?.hasPassageText && !q.passageGroupId && (!q.passageText || !q.passageText.trim())) {
      missingPassage = true;
      if (answerType === 'FILL_IN_BLANK') {
        errorMessages.push('Thiếu đoạn văn ngữ cảnh chứa chỗ trống điền từ ( ㉠ ) và ( ㉡ )');
      } else {
        errorMessages.push('Chưa nhập nội dung đoạn văn bài đọc (Passage)');
      }
    }

    // 3. Audio & Hình ảnh là tùy chọn (không bắt buộc chặn lưu đề thi)
    // Người dùng có thể đính kèm hoặc không tùy ý

    // 5. Kiểm tra Đáp án đúng
    if (answerType === 'CHOICE_3' || answerType === 'CHOICE_4') {
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        missingAnswer = true;
        errorMessages.push('Chưa chọn đáp án đúng cho câu hỏi');
      }
    } else if (answerType === 'FILL_IN_BLANK') {
      // Dạng điền từ vào chỗ trống TOPIK II (chứa vị trí ㉠ và ㉡)
      let b1 = '';
      let b2 = '';
      try {
        const parsed = JSON.parse(q.correctAnswer || '{}');
        if (typeof parsed === 'object' && parsed !== null) {
          b1 = parsed.blank_1 || '';
          b2 = parsed.blank_2 || '';
        } else {
          b1 = String(q.correctAnswer || '');
        }
      } catch {
        b1 = String(q.correctAnswer || '');
      }

      if (!b1 || !b1.trim()) {
        missingAnswer = true;
        errorMessages.push('Chưa nhập đáp án chuẩn cho vị trí ㉠');
      }
      if (!b2 || !b2.trim()) {
        missingAnswer = true;
        errorMessages.push('Chưa nhập đáp án chuẩn cho vị trí ㉡');
      }
    } else {
      // Đối với tự luận / khẩu ngữ (ngoại trừ câu 53 và câu 54 TOPIK II không yêu cầu đáp án mẫu/gợi ý)
      if (
        rule?.partCode !== 'TOPIK2_W_P2' &&
        rule?.partCode !== 'TOPIK2_W_P3' &&
        q.questionNumber !== 53 &&
        q.questionNumber !== 54
      ) {
        if (!q.correctAnswer || !q.correctAnswer.trim()) {
          missingAnswer = true;
          errorMessages.push('Chưa nhập hướng dẫn trả lời / đáp án mẫu');
        }
      }
    }

    if (errorMessages.length > 0) {
      invalidQuestions.push({
        questionId: q.id,
        questionNumber: q.questionNumber,
        partName: rule?.name || q.partName || `Câu ${q.questionNumber}`,
        missingContent,
        missingAudio,
        missingImage,
        missingAnswer,
        missingPassage,
        errorMessages,
      });
    }
  });

  return {
    isValid: invalidQuestions.length === 0,
    invalidQuestions,
  };
}
