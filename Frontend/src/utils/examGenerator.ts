// src/utils/examGenerator.ts
import { EXAM_BLUEPRINTS } from '../constants/examBlueprints';
import { getDefaultOptionsForAnswerType } from './examBlueprintUtils';
import { type ScannedExamQuestion } from '../services/docScannerService';

export function generateEmptyFullTest(
  exam: 'TOEIC' | 'TOPIK_I' | 'TOPIK_II',
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'
): ScannedExamQuestion[] {
  const blueprint = EXAM_BLUEPRINTS[exam]?.[skill];
  if (!blueprint) return [];

  const questions: ScannedExamQuestion[] = [];

  blueprint.questionRules.forEach((rule) => {
    const [start, end] = rule.range;
    const groupSize = rule.groupSize || 1;
    let groupIndex = 1;

    // Trích xuất partNumber chuẩn (ví dụ TOEIC_L_P1 -> 1, TOPIK2_W_P2 -> 2)
    const partMatch = rule.partCode.match(/_P(\d+)/i) || rule.partCode.match(/PART[_-]?(\d+)/i) || rule.partCode.match(/(\d+)$/);
    const partNumber = partMatch ? parseInt(partMatch[1], 10) : 1;

    for (let qNum = start; qNum <= end; qNum += groupSize) {
      const currentGroupEnd = Math.min(qNum + groupSize - 1, end);
      const isGroup = rule.isGrouped && groupSize > 1;
      
      const passageGroupId = isGroup 
        ? `${exam.toLowerCase()}-${rule.partCode.toLowerCase()}-g${groupIndex}` 
        : undefined;
      const passageTitle = isGroup 
        ? `${rule.name} - Nhóm ${groupIndex} (Câu ${qNum} - ${currentGroupEnd})` 
        : undefined;

      for (let subQ = qNum; subQ <= currentGroupEnd; subQ++) {
        const isFillInBlank = rule.answerType === 'FILL_IN_BLANK';
        let defaultContent = '';
        let defaultPassageText = rule.hasPassageText ? '' : undefined;
        let defaultCorrectAnswer = '';

        if (isFillInBlank) {
          defaultContent = `다음을 읽고 ( ㉠ )과 ( ㉡ )에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)`;
          defaultCorrectAnswer = JSON.stringify({ blank_1: '', blank_2: '' });
          if (subQ === 51) {
            defaultPassageText = `무료로 드립니다\n\n저는 유학생인데 공부를 마치고 다음 주에 고향으로 돌아갑니다. 그래서 지금 (      ㉠      ). 책상, 의자, 컴퓨터, 경영학 전공 책 등이 있습니다. 이번 주 금요일까지 방을 비워 줘야 합니다. (      ㉡      ). 제 전화번호는 010-1234-5678입니다.`;
          } else if (subQ === 52) {
            defaultPassageText = `[설명문 제목]\n\n어떤 행동이나 현상에 대한 설명이 들어갑니다. 그러므로 (      ㉠      ). 또한 이러한 특징 때문에 (      ㉡      ).`;
          }
        } else if (subQ === 53 && exam === 'TOPIK_II' && skill === 'WRITING') {
          defaultContent = '';
          defaultPassageText = `다음을 참고하여 "인주시의 자전거 이용자 변화"에 대해 200～300자로 글을 쓰십시오. (30점)`;
          defaultCorrectAnswer = '';
        } else if (subQ === 54 && exam === 'TOPIK_II' && skill === 'WRITING') {
          defaultContent = '';
          defaultPassageText = `다음은 "청소년기의 중요성"에 대한 글입니다. 다음 내용을 중심으로 자신의 생각을 600～700자로 쓰십시오. (50점)\n\n1. 청소년기가 중요한 이유는 무엇인가?\n2. 청소년기에 겪는 어려움은 무엇인가?\n3. 이러한 어려움을 극복하기 위해 어떤 노력이 필요한가?`;
          defaultCorrectAnswer = '';
        }

        questions.push({
          id: `${exam.toLowerCase()}-${skill.toLowerCase()}-${subQ}`,
          questionNumber: subQ,
          partNumber,
          partName: rule.name,
          passageGroupId,
          passageTitle,
          passageText: defaultPassageText,
          content: defaultContent,
          // Tự sinh ['A', 'B', 'C'] cho Part 2 TOEIC hoặc ['A', 'B', 'C', 'D'] cho các part khác
          options: getDefaultOptionsForAnswerType(rule.answerType),
          correctAnswer: defaultCorrectAnswer,
          explanation: '',
          selected: true,
        });
      }
      groupIndex++;
    }
  });

  return questions;
}
