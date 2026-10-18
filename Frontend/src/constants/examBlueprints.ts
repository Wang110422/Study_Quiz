// src/constants/examBlueprints.ts

export type AnswerType =
  | "CHOICE_4"          // Trắc nghiệm 4 đáp án (A-D hoặc ①-④)
  | "CHOICE_3"          // Trắc nghiệm 3 đáp án (A, B, C của Part 2 TOEIC)
  | "SPEAKING_RECORD"   // Ghi âm câu trả lời
  | "SENTENCE_KEYWORD"  // Viết 1 câu dựa trên ảnh và 2 từ gợi ý
  | "EMAIL_RESPONSE"    // Trả lời thư điện tử
  | "ESSAY"             // Viết bài luận dài
  | "FILL_IN_BLANK";    // Điền cụm từ/từ nối vào chỗ trống

export type ImageLayoutType =
  | "SINGLE"       // 1 ảnh gắn liền câu hỏi đơn (TOEIC Part 1, TOPIK Đọc biển báo)
  | "GROUP_DOCS"   // 1 hoặc nhiều ảnh tài liệu chung cho cả chùm (TOEIC Part 3, 4, 7)
  | "OPTIONS";     // 4 ảnh tương ứng 4 lựa chọn đáp án (TOPIK Nghe chọn tranh)

export interface QuestionRangeRule {
  range: [number, number];                 // Dải câu hỏi [từ câu, đến câu]
  partCode: string;                        // Mã định danh Part
  name: string;                            // Tên Part/Dạng hiển thị
  title?: string;                          // Tiêu đề / Chỉ dẫn (Directions) của toàn bộ nhóm câu hỏi
  hasAudio: boolean;                       // Có file audio không
  imageRequirement: "REQUIRED" | "OPTIONAL" | "NONE"; // Yêu cầu ảnh
  hasPassageText: boolean;                 // Có văn bản đoạn văn không
  hasQuestionText: boolean;                // Có hiển thị ô nhập nội dung câu hỏi hay không
  answerType: AnswerType;                  // Định dạng phương án trả lời
  isGrouped: boolean;                      // Có phải câu hỏi chùm không
  groupSize?: number;                      // Số câu trong mỗi chùm
  maxImages?: number;                      // Số lượng ảnh tối đa
  imageLayout?: ImageLayoutType;           // Cách thức hiển thị ảnh trên UI
}

export interface SkillBlueprint {
  skill: "LISTENING" | "READING" | "SPEAKING" | "WRITING";
  totalQuestions: number;
  questionRules: QuestionRangeRule[];
}

export const EXAM_BLUEPRINTS: Record<string, Record<string, SkillBlueprint>> = {
  // =========================================================================
  // 1. TOEIC (Listening, Reading, Speaking, Writing)
  // =========================================================================
  TOEIC: {
    LISTENING: {
      skill: "LISTENING",
      totalQuestions: 100,
      questionRules: [
        {
          range: [1, 6],
          partCode: "TOEIC_L_P1",
          name: "Part 1: Câu 1 - 6",
          title: "Look at the picture and choose the statement that best describes what you see.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: false, // Thí sinh chỉ nhìn tranh & nghe audio
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [7, 31],
          partCode: "TOEIC_L_P2",
          name: "Part 2: Câu 7 - 31",
          title: "Select the best response to the question or statement.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Chỉ nghe câu hỏi & 3 lựa chọn
          answerType: "CHOICE_3",
          isGrouped: false
        },
        {
          range: [32, 70],
          partCode: "TOEIC_L_P3",
          name: "Part 3: Câu 32 - 70",
          title: "Questions refer to the following conversation. Select the best answer for each question.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: true, // Có text câu hỏi in trong đề
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 3,
          maxImages: 1,
          imageLayout: "GROUP_DOCS"
        },
        {
          range: [71, 100],
          partCode: "TOEIC_L_P4",
          name: "Part 4: Câu 71 - 100",
          title: "Questions refer to the following talk. Select the best answer for each question.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: true, // Có text câu hỏi in trong đề
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 3,
          maxImages: 1,
          imageLayout: "GROUP_DOCS"
        }
      ]
    },
    READING: {
      skill: "READING",
      totalQuestions: 100,
      questionRules: [
        {
          range: [101, 130],
          partCode: "TOEIC_R_P5",
          name: "Part 5: Câu 101 - 130",
          title: "Select the best answer to complete the sentence.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true, // Câu văn chứa chỗ trống
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [131, 146],
          partCode: "TOEIC_R_P6",
          name: "Part 6: Câu 131 - 146",
          title: "Read the texts that follow. Select the best answer to complete each blank.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: false, // Câu hỏi chính là ô số đánh dấu trên passageText
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 4,
          maxImages: 1,
          imageLayout: "GROUP_DOCS"
        },
        {
          range: [147, 175],
          partCode: "TOEIC_R_P7_SINGLE",
          name: "Part 7 Đơn: Câu 147 - 175",
          title: "Questions refer to the following reading material. Select the best answer.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 3,
          maxImages: 1,
          imageLayout: "GROUP_DOCS"
        },
        {
          range: [176, 185],
          partCode: "TOEIC_R_P7_DOUBLE",
          name: "Part 7 Kép: Câu 176 - 185",
          title: "Questions refer to the following two texts. Select the best answer.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 5,
          maxImages: 2,
          imageLayout: "GROUP_DOCS"
        },
        {
          range: [186, 200],
          partCode: "TOEIC_R_P7_TRIPLE",
          name: "Part 7 Ba: Câu 186 - 200",
          title: "Questions refer to the following three texts. Select the best answer.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 5,
          maxImages: 3,
          imageLayout: "GROUP_DOCS"
        }
      ]
    },
    SPEAKING: {
      skill: "SPEAKING",
      totalQuestions: 11,
      questionRules: [
        {
          range: [1, 2],
          partCode: "TOEIC_S_P1",
          name: "Part 1: Câu 1 - 2",
          title: "Read the text displayed on the screen aloud.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false,
          answerType: "SPEAKING_RECORD",
          isGrouped: false
        },
        {
          range: [3, 4],
          partCode: "TOEIC_S_P2",
          name: "Part 2: Câu 3 - 4",
          title: "Describe the picture on your screen in as much detail as possible.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: false,
          answerType: "SPEAKING_RECORD",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [5, 7],
          partCode: "TOEIC_S_P3",
          name: "Part 3: Câu 5 - 7",
          title: "Answer the three questions as if participating in a telephone interview.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "SPEAKING_RECORD",
          isGrouped: false
        },
        {
          range: [8, 10],
          partCode: "TOEIC_S_P4",
          name: "Part 4: Câu 8 - 10",
          title: "Answer the questions based on the schedule or information provided.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "SPEAKING_RECORD",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [11, 11],
          partCode: "TOEIC_S_P5",
          name: "Part 5: Câu 11",
          title: "State your opinion on the topic provided with supporting details.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true,
          answerType: "SPEAKING_RECORD",
          isGrouped: false
        }
      ]
    },
    WRITING: {
      skill: "WRITING",
      totalQuestions: 8,
      questionRules: [
        {
          range: [1, 5],
          partCode: "TOEIC_W_P1",
          name: "Part 1: Câu 1 - 5",
          title: "Write one sentence based on the picture using the two words provided.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: true, // Gồm 2 từ/cụm từ gợi ý
          answerType: "SENTENCE_KEYWORD",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [6, 7],
          partCode: "TOEIC_W_P2",
          name: "Part 2: Câu 6 - 7",
          title: "Read the email and write an appropriate response.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "EMAIL_RESPONSE",
          isGrouped: false
        },
        {
          range: [8, 8],
          partCode: "TOEIC_W_P3",
          name: "Part 3: Câu 8",
          title: "Write an opinion essay supporting your point of view.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true,
          answerType: "ESSAY",
          isGrouped: false
        }
      ]
    }
  },

  // =========================================================================
  // 2. TOPIK I (Nghe 30 câu & Đọc 40 câu - Chuẩn hóa giao diện & Dạng bài)
  // =========================================================================
  TOPIK_I: {
    LISTENING: {
      skill: "LISTENING",
      totalQuestions: 30,
      questionRules: [
        {
          range: [1, 4],
          partCode: "TOPIK1_L_P1",
          name: "Dạng 1: Câu 1 - 4",
          title: "[1～4] 잘 듣고 보기와 같이 물음에 알맞은 대답을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Chỉ nghe câu hỏi, không in text
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [5, 6],
          partCode: "TOPIK1_L_P2",
          name: "Dạng 2: Câu 5 - 6",
          title: "[5～6] 잘 듣고 보기와 같이 이어지는 말을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Chỉ nghe câu trước, chọn câu tiếp theo
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [7, 10],
          partCode: "TOPIK1_L_P3",
          name: "Dạng 3: Câu 7 - 10",
          title: "[7～10] 여기는 어디입니까? 보기와 같이 알맞은 것을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Nghe hội thoại đoán địa điểm
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [11, 14],
          partCode: "TOPIK1_L_P4",
          name: "Dạng 4: Câu 11 - 14",
          title: "[11～14] 다음은 무엇에 대해 말하고 있습니까? 알맞은 것을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Nghe đoán chủ đề
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [15, 16],
          partCode: "TOPIK1_L_P5",
          name: "Dạng 5: Câu 15 - 16",
          title: "[15～16] 다음을 듣고 알맞은 그림을 고르십시오.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: false, // 4 đáp án là 4 bức tranh minh họa
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 4,
          imageLayout: "OPTIONS"
        },
        {
          range: [17, 21],
          partCode: "TOPIK1_L_P6",
          name: "Dạng 6: Câu 17 - 21",
          title: "[17～21] 다음을 듣고 보기와 같이 대화 내용과 같은 것을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false, // Chọn nội dung đúng với bài nghe
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [22, 30],
          partCode: "TOPIK1_L_P7",
          name: "Dạng 7: Câu 22 - 30",
          title: "[22～30] 다음을 듣고 물음에 답하십시오. (두 번 읽겠습니다)",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true, // Chùm câu hỏi dài có in câu hỏi con
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 2
        }
      ]
    },
    READING: {
      skill: "READING",
      totalQuestions: 40,
      questionRules: [
        {
          range: [31, 33],
          partCode: "TOPIK1_R_P1",
          name: "Dạng 1: Câu 31 - 33",
          title: "[31～33] 무엇에 대한 이야기입니까? 보기와 같이 알맞은 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true, // Đoạn giới thiệu ngắn 1-2 câu
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [34, 39],
          partCode: "TOPIK1_R_P2",
          name: "Dạng 2: Câu 34 - 39",
          title: "[34～39] (   )에 들어갈 가장 알맞은 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true, // Câu có ô trống
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [40, 42],
          partCode: "TOPIK1_R_P3",
          name: "Dạng 3: Câu 40 - 42",
          title: "[40～42] 다음을 읽고 맞지 않는 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: false, // Bảng biểu/vé/thông báo (nhập đoạn văn passage hoặc ảnh)
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [43, 45],
          partCode: "TOPIK1_R_P4",
          name: "Dạng 4: Câu 43 - 45",
          title: "[43～45] 다음의 내용과 같은 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false, // Chọn nội dung đúng với đoạn văn ngắn
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [46, 48],
          partCode: "TOPIK1_R_P5",
          name: "Dạng 5: Câu 46 - 48",
          title: "[46～48] 다음을 읽고 중심 생각을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false, // Chọn suy nghĩ trọng tâm
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [49, 56],
          partCode: "TOPIK1_R_P6",
          name: "Dạng 6: Câu 49 - 56",
          title: "[49～56] 다음을 읽고 물음에 답하십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: true, // 2 câu hỏi con đi kèm bài đọc ngắn
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 2
        },
        {
          range: [57, 58],
          partCode: "TOPIK1_R_P7",
          name: "Dạng 7: Câu 57 - 58",
          title: "[57～58] 다음을 순서대로 맞게 배열한 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false, // Sắp xếp 4 câu (가)-(라)
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [59, 70],
          partCode: "TOPIK1_R_P8",
          name: "Dạng 8: Câu 59 - 70",
          title: "[59～70] 다음을 읽고 물음에 답하십시오.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true, // Chùm đọc hiểu dài
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 2
        }
      ]
    }
  },

  // =========================================================================
  // 3. TOPIK II (Listening, Writing, Reading)
  // =========================================================================
  TOPIK_II: {
    LISTENING: {
      skill: "LISTENING",
      totalQuestions: 50,
      questionRules: [
        {
          range: [1, 3],
          partCode: "TOPIK2_L_P1",
          name: "Dạng 1: Câu 1 - 3",
          title: "[1～3] 다음을 듣고 알맞은 그림 또는 그래프를 고르십시오.",
          hasAudio: true,
          imageRequirement: "OPTIONAL",
          hasPassageText: false,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 4,
          imageLayout: "OPTIONS"
        },
        {
          range: [4, 8],
          partCode: "TOPIK2_L_P2",
          name: "Dạng 2: Câu 4 - 8",
          title: "[4～8] 다음을 듣고 이어질 수 있는 말을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [9, 16],
          partCode: "TOPIK2_L_P3",
          name: "Dạng 3: Câu 9 - 16",
          title: "[9～16] 다음을 듣고 대화 내용과 같은 것을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [17, 20],
          partCode: "TOPIK2_L_P4",
          name: "Dạng 4: Câu 17 - 20",
          title: "[17～20] 다음을 듣고 남자의 중심 생각을 고르십시오.",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [21, 50],
          partCode: "TOPIK2_L_P5",
          name: "Dạng 5: Câu 21 - 50",
          title: "[21～50] 다음을 듣고 물음에 답하십시오. (두 번 읽겠습니다)",
          hasAudio: true,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 2
        }
      ]
    },
    WRITING: {
      skill: "WRITING",
      totalQuestions: 4,
      questionRules: [
        {
          range: [51, 52],
          partCode: "TOPIK2_W_P1",
          name: "Dạng 1: Câu 51 - 52",
          title: "[51～52] 다음을 읽고 ㉠과 ㉡에 들어갈 말을 각각 한 문장으로 쓰십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false,
          answerType: "FILL_IN_BLANK",
          isGrouped: false
        },
        {
          range: [53, 53],
          partCode: "TOPIK2_W_P2",
          name: "Dạng 2: Câu 53",
          title: "[53] 다음을 참고하여 200～300자로 글을 쓰십시오.",
          hasAudio: false,
          imageRequirement: "REQUIRED", // Bắt buộc có 1 ảnh biểu đồ
          hasPassageText: true,        // Tắt khung Passage thừa
          hasQuestionText: false,       // Ẩn ô nhập nội dung câu hỏi
          answerType: "ESSAY",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [54, 54],
          partCode: "TOPIK2_W_P3",
          name: "Dạng 3: Câu 54",
          title: "[54] 다음을 주제로 하여 600～700자로 글을 쓰십시오.",
          hasAudio: false,
          imageRequirement: "NONE",     // 100% là chữ, không có ảnh
          hasPassageText: true,        // Không có passage đọc hiểu
          hasQuestionText: false,       // Ẩn ô nhập nội dung câu hỏi
          answerType: "ESSAY",
          isGrouped: false
        }
      ]
    },
    READING: {
      skill: "READING",
      totalQuestions: 50,
      questionRules: [
        {
          range: [1, 4],
          partCode: "TOPIK2_R_P1",
          name: "Dạng 1: Câu 1 - 4",
          title: "[1～4] (   )에 들어갈 가장 알맞은 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: false,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [5, 8],
          partCode: "TOPIK2_R_P2",
          name: "Dạng 2: Câu 5 - 8",
          title: "[5～8] 다음은 무엇에 대한 글인지 고르십시오.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [9, 12],
          partCode: "TOPIK2_R_P3",
          name: "Dạng 3: Câu 9 - 12",
          title: "[9～12] 다음 글 또는 도표의 내용과 같은 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false,
          maxImages: 1,
          imageLayout: "SINGLE"
        },
        {
          range: [13, 15],
          partCode: "TOPIK2_R_P4",
          name: "Dạng 4: Câu 13 - 15",
          title: "[13～15] 다음을 순서대로 맞게 배열한 것을 고르십시오.",
          hasAudio: false,
          imageRequirement: "NONE",
          hasPassageText: true,
          hasQuestionText: false,
          answerType: "CHOICE_4",
          isGrouped: false
        },
        {
          range: [16, 50],
          partCode: "TOPIK2_R_P5",
          name: "Dạng 5: Câu 16 - 50",
          title: "[16～50] 다음을 읽고 물음에 답하십시오.",
          hasAudio: false,
          imageRequirement: "OPTIONAL",
          hasPassageText: true,
          hasQuestionText: true,
          answerType: "CHOICE_4",
          isGrouped: true,
          groupSize: 2
        }
      ]
    }
  }
};
