import { type ScannedExamQuestion } from './docScannerService';

export interface ExamPartMeta {
  partNumber: number;
  partName: string;
  shortLabel: string;
  questionRange: string;
  startQuestionNumber: number;
  endQuestionNumber: number;
  description: string;
}

// =========================================================================
// METADATA CÁC PART CHO TOEIC (7 PARTS - 200 CÂU)
// =========================================================================
export const TOEIC_LISTENING_PARTS: ExamPartMeta[] = [
  {
    partNumber: 1,
    partName: 'Part 1: Photographs',
    shortLabel: 'Part 1',
    questionRange: 'Câu 1 - 6',
    startQuestionNumber: 1,
    endQuestionNumber: 6,
    description: 'Miêu tả tranh vẽ - 6 câu hỏi riêng lẻ kèm hình ảnh thực tế.',
  },
  {
    partNumber: 2,
    partName: 'Part 2: Question - Response',
    shortLabel: 'Part 2',
    questionRange: 'Câu 7 - 31',
    startQuestionNumber: 7,
    endQuestionNumber: 31,
    description: 'Hỏi & Đáp âm thanh - 25 câu trắc nghiệm 3 phương án A, B, C.',
  },
  {
    partNumber: 3,
    partName: 'Part 3: Conversations',
    shortLabel: 'Part 3',
    questionRange: 'Câu 32 - 70',
    startQuestionNumber: 32,
    endQuestionNumber: 70,
    description: 'Đoạn hội thoại - 13 nhóm hội thoại, mỗi nhóm gồm 3 câu hỏi liên kết.',
  },
  {
    partNumber: 4,
    partName: 'Part 4: Short Talks',
    shortLabel: 'Part 4',
    questionRange: 'Câu 71 - 100',
    startQuestionNumber: 71,
    endQuestionNumber: 100,
    description: 'Bài nói ngắn / Thông báo - 10 nhóm bài nói, mỗi nhóm gồm 3 câu hỏi.',
  },
];

export const TOEIC_READING_PARTS: ExamPartMeta[] = [
  {
    partNumber: 5,
    partName: 'Part 5: Incomplete Sentences',
    shortLabel: 'Part 5',
    questionRange: 'Câu 101 - 130',
    startQuestionNumber: 101,
    endQuestionNumber: 130,
    description: 'Hoàn thành câu - 30 câu hỏi ngữ pháp và từ vựng đơn lẻ.',
  },
  {
    partNumber: 6,
    partName: 'Part 6: Text Completion',
    shortLabel: 'Part 6',
    questionRange: 'Câu 131 - 146',
    startQuestionNumber: 131,
    endQuestionNumber: 146,
    description: 'Điền đoạn văn - 4 bài đọc điền từ, mỗi bài gồm 4 câu hỏi liên kết.',
  },
  {
    partNumber: 7,
    partName: 'Part 7: Reading Comprehension',
    shortLabel: 'Part 7',
    questionRange: 'Câu 147 - 200',
    startQuestionNumber: 147,
    endQuestionNumber: 200,
    description: 'Đọc hiểu đoạn văn - Bài đọc đơn (Single) & Đoạn văn kép/ba (Multiple).',
  },
];

// =========================================================================
// METADATA CÁC PART CHO TOPIK I (4+5 DẠNG - 70 CÂU)
// =========================================================================
export const TOPIK_LISTENING_PARTS: ExamPartMeta[] = [
  {
    partNumber: 1,
    partName: 'Dạng 1: Đối đáp câu hỏi',
    shortLabel: 'Dạng 1',
    questionRange: 'Câu 1 - 4',
    startQuestionNumber: 1,
    endQuestionNumber: 4,
    description: 'Nghe lời thoại và chọn câu chào hỏi, đối đáp tiếp theo phù hợp.',
  },
  {
    partNumber: 2,
    partName: 'Dạng 2: Bối cảnh & Chủ đề',
    shortLabel: 'Dạng 2',
    questionRange: 'Câu 5 - 14',
    startQuestionNumber: 5,
    endQuestionNumber: 14,
    description: 'Nghe đối thoại ngắn chọn địa điểm (bệnh viện, thư viện, chợ) hoặc đồ vật.',
  },
  {
    partNumber: 3,
    partName: 'Dạng 3: Tranh vẽ & Nội dung đúng',
    shortLabel: 'Dạng 3',
    questionRange: 'Câu 15 - 24',
    startQuestionNumber: 15,
    endQuestionNumber: 24,
    description: 'Nghe đoạn văn/lời thoại chọn bức tranh đúng hoặc chi tiết khớp nội dung.',
  },
  {
    partNumber: 4,
    partName: 'Dạng 4: Đối thoại dài đa câu hỏi',
    shortLabel: 'Dạng 4',
    questionRange: 'Câu 25 - 30',
    startQuestionNumber: 25,
    endQuestionNumber: 30,
    description: '3 nhóm hội thoại dài, mỗi đoạn dùng chung audio cho 2 câu hỏi liên kết.',
  },
];

export const TOPIK_READING_PARTS: ExamPartMeta[] = [
  {
    partNumber: 1,
    partName: 'Dạng 1: Chủ đề & Biển báo',
    shortLabel: 'Dạng 1',
    questionRange: 'Câu 31 - 34',
    startQuestionNumber: 31,
    endQuestionNumber: 34,
    description: 'Đọc từ vựng, thực đơn, biển báo công cộng và chọn chủ đề tương ứng.',
  },
  {
    partNumber: 2,
    partName: 'Dạng 2: Điền từ & Ngữ pháp',
    shortLabel: 'Dạng 2',
    questionRange: 'Câu 35 - 38',
    startQuestionNumber: 35,
    endQuestionNumber: 38,
    description: 'Chọn trợ từ, từ nối, hoặc đuôi câu thích hợp điền vào chỗ trống.',
  },
  {
    partNumber: 3,
    partName: 'Dạng 3: Đoạn văn ngắn',
    shortLabel: 'Dạng 3',
    questionRange: 'Câu 39 - 46',
    startQuestionNumber: 39,
    endQuestionNumber: 46,
    description: 'Đọc đoạn nhật ký, ghi chú ngắn và chọn nội dung trùng khớp.',
  },
  {
    partNumber: 4,
    partName: 'Dạng 4: Thông báo & Quảng cáo',
    shortLabel: 'Dạng 4',
    questionRange: 'Câu 47 - 56',
    startQuestionNumber: 47,
    endQuestionNumber: 56,
    description: 'Đọc vé tàu, lịch biểu sự kiện, thông báo tuyển dụng chọn thông tin đúng.',
  },
  {
    partNumber: 5,
    partName: 'Dạng 5: Đoạn văn dài đa câu hỏi',
    shortLabel: 'Dạng 5',
    questionRange: 'Câu 57 - 70',
    startQuestionNumber: 57,
    endQuestionNumber: 70,
    description: '7 nhóm đoạn văn dài, mỗi đoạn dùng chung bài đọc cho 2 câu hỏi liên kết.',
  },
];

// =========================================================================
// MẪU KHỞI TẠO ĐƠN GIẢN CHO PRACTICE / DRILL (THỦ CÔNG)
// =========================================================================
export const createSinglePracticeTemplate = (
  skill: 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING',
  startNum = 1
): ScannedExamQuestion[] => [
  {
    id: `prac-${Date.now()}-1`,
    questionNumber: startNum,
    content: 'Nhập nội dung câu hỏi luyện tập tại đây...',
    options: [
      { key: 'A', text: 'Phương án A' },
      { key: 'B', text: 'Phương án B' },
      { key: 'C', text: 'Phương án C' },
      { key: 'D', text: 'Phương án D' },
    ],
    correctAnswer: 'A',
    explanation: 'Giải thích chi tiết cho đáp án đúng...',
    selected: true,
  },
];

// =========================================================================
// BỘ SINH KHUÔN ĐỀ THI TOEIC HOÀN CHỈNH (200 CÂU)
// =========================================================================
export const generateToeicFullTestQuestions = (
  skill: 'LISTENING' | 'READING'
): ScannedExamQuestion[] => {
  const questions: ScannedExamQuestion[] = [];

  if (skill === 'LISTENING') {
    // Part 1: Câu 1 - 6 (Photographs)
    for (let i = 1; i <= 6; i++) {
      questions.push({
        id: `toeic-lis-${i}`,
        questionNumber: i,
        partNumber: 1,
        partName: 'Part 1: Photographs',
        content: `Look at the picture marked No. ${i} in your test book and select the statement that best describes what you see in the picture.`,
        imageUrl:
          i === 1
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
            : i === 2
            ? 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
        options: [
          { key: 'A', text: 'They are discussing a project presentation in the meeting hall.' },
          { key: 'B', text: 'A technician is inspecting electronic equipment on the wall.' },
          { key: 'C', text: 'Documents are being organized inside an office cabinet.' },
          { key: 'D', text: 'A colleague is walking down the corridor toward reception.' },
        ],
        correctAnswer: 'A',
        explanation: 'Dựa vào hình ảnh minh họa thực tế được nhận diện từ tài liệu.',
        selected: true,
      });
    }

    // Part 2: Câu 7 - 31 (Question - Response: 25 câu)
    for (let i = 7; i <= 31; i++) {
      questions.push({
        id: `toeic-lis-${i}`,
        questionNumber: i,
        partNumber: 2,
        partName: 'Part 2: Question - Response',
        content: `You will hear a question or statement and three responses. Select the best response to the question or statement (Marked No. ${i}).`,
        options: [
          { key: 'A', text: 'Yes, it was scheduled for next Monday morning.' },
          { key: 'B', text: 'In the main conference auditorium on the 2nd floor.' },
          { key: 'C', text: 'About fifteen minutes before noon.' },
          { key: 'D', text: '[Phương án D không dùng trong Part 2 chuẩn]' },
        ],
        correctAnswer: 'B',
        explanation: 'Part 2 đánh giá phản xạ đối đáp trực tiếp trong giao tiếp công sở.',
        selected: true,
      });
    }

    // Part 3: Câu 32 - 70 (Conversations: 13 nhóm x 3 câu)
    let p3GroupIdx = 1;
    for (let qNum = 32; qNum <= 70; qNum += 3) {
      const gId = `toeic-p3-group-${p3GroupIdx}`;
      const endQ = Math.min(qNum + 2, 70);
      const title = `Đoạn hội thoại ${p3GroupIdx} (Câu ${qNum} - ${endQ})`;

      for (let subQ = qNum; subQ <= endQ; subQ++) {
        questions.push({
          id: `toeic-lis-${subQ}`,
          questionNumber: subQ,
          partNumber: 3,
          partName: 'Part 3: Conversations',
          passageGroupId: gId,
          passageTitle: title,
          content:
            subQ === qNum
              ? 'What is the conversation mainly about?'
              : subQ === qNum + 1
              ? 'What problem does the woman mention regarding the client request?'
              : 'What will the man most likely do next?',
          options: [
            { key: 'A', text: 'Rescheduling a product launch exhibition' },
            { key: 'B', text: 'Contacting the supplier for replacement parts' },
            { key: 'C', text: 'Reviewing quarterly financial performance' },
            { key: 'D', text: 'Sending updated project documentation via email' },
          ],
          correctAnswer: 'A',
          explanation: 'Nghe đoạn hội thoại đối đáp 2-3 người để nắm bắt ý chính và hành động tiếp theo.',
          selected: true,
        });
      }
      p3GroupIdx++;
    }

    // Part 4: Câu 71 - 100 (Short Talks: 10 nhóm x 3 câu)
    let p4GroupIdx = 1;
    for (let qNum = 71; qNum <= 100; qNum += 3) {
      const gId = `toeic-p4-group-${p4GroupIdx}`;
      const endQ = Math.min(qNum + 2, 100);
      const title = `Bài nói ngắn ${p4GroupIdx} (Câu ${qNum} - ${endQ})`;

      for (let subQ = qNum; subQ <= endQ; subQ++) {
        questions.push({
          id: `toeic-lis-${subQ}`,
          questionNumber: subQ,
          partNumber: 4,
          partName: 'Part 4: Short Talks',
          passageGroupId: gId,
          passageTitle: title,
          content:
            subQ === qNum
              ? 'Where is the announcement most likely being made?'
              : subQ === qNum + 1
              ? 'What are listeners reminded to do before departure?'
              : 'What additional service is available at the customer desk?',
          options: [
            { key: 'A', text: 'At an international flight transit terminal' },
            { key: 'B', text: 'At a municipal railway station platform' },
            { key: 'C', text: 'At a newly renovated department store' },
            { key: 'D', text: 'Inside an express passenger bus terminal' },
          ],
          correctAnswer: 'A',
          explanation: 'Part 4 là bài độc thoại thông báo, bản tin phát thanh hoặc hướng dẫn du lịch.',
          selected: true,
        });
      }
      p4GroupIdx++;
    }
  } else {
    // READING: Part 5, 6, 7 (100 câu: 101 - 200)

    // Part 5: Câu 101 - 130 (Incomplete Sentences: 30 câu đơn lẻ)
    for (let i = 101; i <= 130; i++) {
      questions.push({
        id: `toeic-read-${i}`,
        questionNumber: i,
        partNumber: 5,
        partName: 'Part 5: Incomplete Sentences',
        content: `All attendees must register _______ the front reception desk prior to entering the keynote session (No. ${i}).`,
        options: [
          { key: 'A', text: 'at' },
          { key: 'B', text: 'during' },
          { key: 'C', text: 'towards' },
          { key: 'D', text: 'between' },
        ],
        correctAnswer: 'A',
        explanation: 'Giới từ chỉ địa điểm cụ thể: "at the front reception desk".',
        selected: true,
      });
    }

    // Part 6: Câu 131 - 146 (Text Completion: 4 đoạn x 4 câu)
    let p6GroupIdx = 1;
    for (let qNum = 131; qNum <= 146; qNum += 4) {
      const gId = `toeic-p6-group-${p6GroupIdx}`;
      const endQ = Math.min(qNum + 3, 146);
      const title = `Đoạn văn điền khuyết ${p6GroupIdx} (Câu ${qNum} - ${endQ})`;

      for (let subQ = qNum; subQ <= endQ; subQ++) {
        questions.push({
          id: `toeic-read-${subQ}`,
          questionNumber: subQ,
          partNumber: 6,
          partName: 'Part 6: Text Completion',
          passageGroupId: gId,
          passageTitle: title,
          passageText:
            'NOTICE OF SYSTEM MAINTENANCE: Please be advised that our internal database servers will undergo a routine upgrade this coming weekend. As a result, certain services will be temporarily unavailable...',
          content: `Select the word, phrase, or sentence that best completes blank [${subQ}].`,
          options: [
            { key: 'A', text: 'efficiently' },
            { key: 'B', text: 'efficiency' },
            { key: 'C', text: 'efficient' },
            { key: 'D', text: 'efficiencies' },
          ],
          correctAnswer: 'A',
          explanation: 'Part 6 kiểm tra ngữ cảnh đoạn văn và sự liên kết logic câu.',
          selected: true,
        });
      }
      p6GroupIdx++;
    }

    // Part 7: Câu 147 - 200 (Reading Comprehension: 54 câu)
    let p7GroupIdx = 1;
    let curQ = 147;
    while (curQ <= 200) {
      const groupSize = curQ <= 175 ? 3 : 5; // Single passages ~3 câu, Multiple passages 5 câu
      const endQ = Math.min(curQ + groupSize - 1, 200);
      const gId = `toeic-p7-group-${p7GroupIdx}`;
      const title =
        curQ <= 175
          ? `Đoạn đọc đơn ${p7GroupIdx} (Câu ${curQ} - ${endQ})`
          : `Đoạn đọc kép/ba ${p7GroupIdx} (Câu ${curQ} - ${endQ})`;

      for (let subQ = curQ; subQ <= endQ; subQ++) {
        questions.push({
          id: `toeic-read-${subQ}`,
          questionNumber: subQ,
          partNumber: 7,
          partName: 'Part 7: Reading Comprehension',
          passageGroupId: gId,
          passageTitle: title,
          passageText:
            'MEMORANDUM & EMAIL NOTICE: To all regional branch managers. We are pleased to announce the successful rollout of the new digital inventory management portal across all 15 distribution centers...',
          content:
            subQ === curQ
              ? 'What is the primary purpose of the notice?'
              : subQ === curQ + 1
              ? 'According to the text, what is indicated about the inventory portal?'
              : 'What are staff members instructed to submit by Friday afternoon?',
          options: [
            { key: 'A', text: 'To outline operational guidelines for new warehouse facilities' },
            { key: 'B', text: 'To request approval for annual departmental expenditures' },
            { key: 'C', text: 'To announce updates to the internal logistics software' },
            { key: 'D', text: 'To announce the retirement of a senior operations executive' },
          ],
          correctAnswer: 'C',
          explanation: 'Đọc hiểu tài liệu thực tế trong môi trường thương mại quốc tế.',
          selected: true,
        });
      }

      curQ = endQ + 1;
      p7GroupIdx++;
    }
  }

  return questions;
};

// =========================================================================
// BỘ SINH KHUÔN ĐỀ THI TOPIK I HOÀN CHỈNH (70 CÂU: 30 NGHE + 40 ĐỌC)
// =========================================================================
export const generateTopikFullTestQuestions = (
  skill: 'LISTENING' | 'READING'
): ScannedExamQuestion[] => {
  const questions: ScannedExamQuestion[] = [];

  if (skill === 'LISTENING') {
    // 30 câu Nghe (Câu 1 - 30) chia thành 4 Dạng

    // Dạng 1: Câu 1 - 4 (Đối đáp câu hỏi)
    for (let i = 1; i <= 4; i++) {
      questions.push({
        id: `topik-lis-${i}`,
        questionNumber: i,
        partNumber: 1,
        partName: 'Dạng 1: Chọn câu đối đáp phù hợp',
        content: `다음을 듣고 보기와 같이 물음에 알맞은 대답을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '네, 한국 사람이에요.' },
          { key: 'B', text: '아니요, 학생이 아니에요.' },
          { key: 'C', text: '네, 반갑습니다.' },
          { key: 'D', text: '아니요, 내일 가요.' },
        ],
        correctAnswer: 'A',
        explanation: 'Nghe câu hỏi đơn giản và chọn câu trả lời tự nhiên, chính xác.',
        selected: true,
      });
    }

    // Dạng 2: Câu 5 - 14 (Bối cảnh & Chủ đề: 10 câu)
    for (let i = 5; i <= 14; i++) {
      questions.push({
        id: `topik-lis-${i}`,
        questionNumber: i,
        partNumber: 2,
        partName: 'Dạng 2: Chọn bối cảnh & chủ đề',
        content: `여기는 어디입니까? 보기와 같이 알맞은 것을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '도서관 (Thư viện)' },
          { key: 'B', text: '병원 (Bệnh viện)' },
          { key: 'C', text: '식당 (Nhà hàng)' },
          { key: 'D', text: '공항 (Sân bay)' },
        ],
        correctAnswer: 'A',
        explanation: 'Nhận diện địa điểm bối cảnh qua từ khóa trong cuộc thoại.',
        selected: true,
      });
    }

    // Dạng 3: Câu 15 - 24 (Tranh vẽ & Nội dung đúng: 10 câu)
    for (let i = 15; i <= 24; i++) {
      questions.push({
        id: `topik-lis-${i}`,
        questionNumber: i,
        partNumber: 3,
        partName: 'Dạng 3: Chọn tranh vẽ & nội dung đúng',
        content: `다음 대화를 듣고 알맞은 그림이나 알맞은 내용을 고르십시오 (Câu ${i}).`,
        imageUrl:
          i === 15
            ? 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80'
            : undefined,
        options: [
          { key: 'A', text: '여자가 책을 빌리고 있습니다.' },
          { key: 'B', text: '남자가 커피를 주문하고 있습니다.' },
          { key: 'C', text: '두 사람이 버스를 기다리고 있습니다.' },
          { key: 'D', text: '선생님이 시험을 보고 있습니다.' },
        ],
        correctAnswer: 'A',
        explanation: 'Khớp nối hành động người nói với bức tranh hoặc nhận định đúng sự thật.',
        selected: true,
      });
    }

    // Dạng 4: Câu 25 - 30 (Hội thoại dài: 3 nhóm x 2 câu)
    let topikP4Idx = 1;
    for (let qNum = 25; qNum <= 30; qNum += 2) {
      const gId = `topik-p4-group-${topikP4Idx}`;
      const endQ = qNum + 1;
      const title = `Đoạn hội thoại ${topikP4Idx} (Câu ${qNum} - ${endQ})`;

      for (let subQ = qNum; subQ <= endQ; subQ++) {
        questions.push({
          id: `topik-lis-${subQ}`,
          questionNumber: subQ,
          partNumber: 4,
          partName: 'Dạng 4: Đối thoại dài đa câu hỏi',
          passageGroupId: gId,
          passageTitle: title,
          content:
            subQ === qNum
              ? '남자는 왜 여자를 찾아갔습니까?'
              : '들은 내용과 같은 것을 고르십시오.',
          options: [
            { key: 'A', text: '동아리 활동 시간을 문의하려고' },
            { key: 'B', text: '도서관 회원증을 새로 발급받으려고' },
            { key: 'C', text: '한국어 말하기 대회 신청서를 제출하려고' },
            { key: 'D', text: '주말 봉사활동 일정을 확인하려고' },
          ],
          correctAnswer: 'A',
          explanation: 'Nghe đối thoại dài và giải quyết 2 câu hỏi liên kết.',
          selected: true,
        });
      }
      topikP4Idx++;
    }
  } else {
    // 40 câu Đọc (Câu 31 - 70) chia thành 5 Dạng

    // Dạng 1: Câu 31 - 34 (Chủ đề & Biển báo: 4 câu)
    for (let i = 31; i <= 34; i++) {
      questions.push({
        id: `topik-read-${i}`,
        questionNumber: i,
        partNumber: 1,
        partName: 'Dạng 1: Chọn chủ đề & biển báo',
        content: `무엇에 대한 글입니까? 보기와 같이 알맞은 것을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '날씨 (Thời tiết)' },
          { key: 'B', text: '휴일 (Ngày nghỉ)' },
          { key: 'C', text: '음식 (Món ăn)' },
          { key: 'D', text: '취미 (Sở thích)' },
        ],
        correctAnswer: 'A',
        explanation: 'Nhận diện chủ đề bao quát của từ vựng và câu ngắn.',
        selected: true,
      });
    }

    // Dạng 2: Câu 35 - 38 (Điền từ & Ngữ pháp: 4 câu)
    for (let i = 35; i <= 38; i++) {
      questions.push({
        id: `topik-read-${i}`,
        questionNumber: i,
        partNumber: 2,
        partName: 'Dạng 2: Điền từ & ngữ pháp vào chỗ trống',
        content: `( )에 들어갈 가장 알맞은 것을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '에서' },
          { key: 'B', text: '으로' },
          { key: 'C', text: '에게' },
          { key: 'D', text: '부터' },
        ],
        correctAnswer: 'A',
        explanation: 'Kiểm tra ngữ pháp sơ cấp và trợ từ cách.',
        selected: true,
      });
    }

    // Dạng 3: Câu 39 - 46 (Đoạn văn ngắn: 8 câu)
    for (let i = 39; i <= 46; i++) {
      questions.push({
        id: `topik-read-${i}`,
        questionNumber: i,
        partNumber: 3,
        partName: 'Dạng 3: Đọc đoạn văn ngắn',
        content: `글의 내용과 같은 것을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '이 사람은 어제 친구를 만났습니다.' },
          { key: 'B', text: '주말에 집에서 청소를 했습니다.' },
          { key: 'C', text: '오후에 서점에서 책을 샀습니다.' },
          { key: 'D', text: '내일 아침 일찍 출근해야 합니다.' },
        ],
        correctAnswer: 'A',
        explanation: 'Đọc hiểu mẩu chuyện ngắn và đối chiếu chi tiết đúng.',
        selected: true,
      });
    }

    // Dạng 4: Câu 47 - 56 (Thông báo & Quảng cáo: 10 câu)
    for (let i = 47; i <= 56; i++) {
      questions.push({
        id: `topik-read-${i}`,
        questionNumber: i,
        partNumber: 4,
        partName: 'Dạng 4: Đọc thông báo & bảng biểu',
        content: `안내문이나 표를 보고 내용과 맞는 것을 고르십시오 (Câu ${i}).`,
        options: [
          { key: 'A', text: '주말에는 무료로 이용할 수 있습니다.' },
          { key: 'B', text: '오전 9시부터 오후 6시까지 운영합니다.' },
          { key: 'C', text: '어린이는 반드시 보호자와 함께 입장해야 합니다.' },
          { key: 'D', text: '인터넷으로 미리 예약해야 들어갈 수 있습니다.' },
        ],
        correctAnswer: 'B',
        explanation: 'Khai thác thông tin từ bảng biểu, áp phích, vé tham quan.',
        selected: true,
      });
    }

    // Dạng 5: Câu 57 - 70 (Đoạn văn dài đa câu hỏi: 7 nhóm x 2 câu)
    let topikReadP5Idx = 1;
    for (let qNum = 57; qNum <= 70; qNum += 2) {
      const gId = `topik-read-p5-group-${topikReadP5Idx}`;
      const endQ = qNum + 1;
      const title = `Đoạn văn đọc hiểu ${topikReadP5Idx} (Câu ${qNum} - ${endQ})`;

      for (let subQ = qNum; subQ <= endQ; subQ++) {
        questions.push({
          id: `topik-read-${subQ}`,
          questionNumber: subQ,
          partNumber: 5,
          partName: 'Dạng 5: Đoạn văn dài đa câu hỏi',
          passageGroupId: gId,
          passageTitle: title,
          passageText:
            '저는 지난 주말에 고향 친구들과 함께 제주도로 여행을 다녀왔습니다. 비행기를 타고 한 시간 만에 도착했는데 제주의 바다는 정말 푸르고 아름다웠습니다...',
          content:
            subQ === qNum
              ? '이 글의 중심 생각을 고르십시오.'
              : '글의 내용과 같은 것을 고르십시오.',
          options: [
            { key: 'A', text: '오랜만에 친구들과 즐거운 추억을 만들었다.' },
            { key: 'B', text: '제주도 날씨가 좋지 않아서 아쉬웠다.' },
            { key: 'C', text: '다음 주에 혼자 다시 제주도에 가기로 했다.' },
            { key: 'D', text: '제주도 전통 음식이 입에 맞지 않았다.' },
          ],
          correctAnswer: 'A',
          explanation: 'Đọc hiểu đoạn văn hoàn chỉnh và giải quyết 2 câu hỏi liên kết.',
          selected: true,
        });
      }
      topikReadP5Idx++;
    }
  }

  return questions;
};
