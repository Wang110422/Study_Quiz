export const currentUser = {
  name: "Chan Wo Sin",
  email: "chanwosin@lingomaster.vn",
  initial: "C",
};

export const homeStats = [
  { emoji: "🔥", value: "12", label: "Ngày streak liên tục" },
  { emoji: "🧠", value: "428", label: "Thuật ngữ đã thuộc" },
  { emoji: "⏱️", value: "3h 20m", label: "Thời gian học tuần này" },
];

export type Roadmap = {
  id: string;
  name: string;
  emoji: string;
  level: "Cơ bản" | "Trung bình" | "Nâng cao";
  days: number;
  done: number;
  total: number;
  description: string;
  author: string;
};

export const roadmaps: Roadmap[] = [
  {
    id: "aptis-b2",
    name: "Aptis B2 trong 30 ngày",
    emoji: "🎯",
    level: "Nâng cao",
    days: 30,
    done: 6,
    total: 10,
    description: "Lộ trình tăng tốc từ vựng học thuật, tập trung Writing và Speaking.",
    author: "Chan Wo Sin",
  },
  {
    id: "business",
    name: "Từ vựng Business Email",
    emoji: "💼",
    level: "Trung bình",
    days: 21,
    done: 3,
    total: 8,
    description: "Cụm từ trang trọng dùng trong email, họp và báo cáo công việc.",
    author: "Minh Anh",
  },
  {
    id: "toeic-core",
    name: "600 từ TOEIC cốt lõi",
    emoji: "📘",
    level: "Cơ bản",
    days: 45,
    done: 9,
    total: 12,
    description: "Bộ từ nền tảng theo 12 chủ điểm thường gặp trong đề TOEIC.",
    author: "Chan Wo Sin",
  },
];

export type CardSet = {
  id: string;
  name: string;
  emoji: string;
  terms: number;
  updated: string;
  folder?: string;
  description: string;
};

export const cardSets: CardSet[] = [
  { id: "s1", name: "Academic Verbs", emoji: "📗", terms: 64, updated: "2 giờ trước", folder: "Aptis Core", description: "Động từ học thuật thường gặp trong Writing Part 4." },
  { id: "s2", name: "Daily Conversation", emoji: "💬", terms: 48, updated: "hôm qua", folder: "Speaking Kit", description: "Cụm giao tiếp tự nhiên cho Speaking Part 1-2." },
  { id: "s3", name: "Environment & Nature", emoji: "🌿", terms: 72, updated: "3 ngày trước", folder: "Aptis Core", description: "Chủ điểm môi trường, khí hậu và phát triển bền vững." },
  { id: "s4", name: "Technology Trends", emoji: "🤖", terms: 55, updated: "5 ngày trước", description: "Từ vựng công nghệ, AI và chuyển đổi số." },
  { id: "s5", name: "Health & Lifestyle", emoji: "🩺", terms: 41, updated: "1 tuần trước", folder: "Speaking Kit", description: "Sức khỏe, thói quen sinh hoạt và thể thao." },
  { id: "s6", name: "Idioms for Speaking", emoji: "✨", terms: 33, updated: "1 tuần trước", description: "Thành ngữ ghi điểm khi nói tự nhiên." },
];

export const reviewCard = { term: "resilient", meaning: "kiên cường, có khả năng phục hồi", due: 18, total: 24 };

export const classUpdates = [
  { initial: "M", name: "Minh Anh", text: "đã thêm bộ thẻ mới vào nhóm Aptis Warriors", time: "12 phút trước" },
  { initial: "T", name: "Thu Hà", text: "hoàn thành mốc #4 của lộ trình Aptis B2", time: "1 giờ trước" },
  { initial: "K", name: "Khánh Duy", text: "đã tham gia nhóm học của bạn", time: "hôm qua" },
];

export const leaderboard = [
  { rank: 1, initial: "M", name: "Minh Anh", streak: 34, score: 4820 },
  { rank: 2, initial: "C", name: "Chan Wo Sin", streak: 12, score: 4310, me: true },
  { rank: 3, initial: "T", name: "Thu Hà", streak: 19, score: 3980 },
  { rank: 4, initial: "K", name: "Khánh Duy", streak: 7, score: 3120 },
  { rank: 5, initial: "L", name: "Lan Phương", streak: 5, score: 2870 },
];

export type StudyGroup = {
  id: string;
  name: string;
  emoji: string;
  code: string;
  description: string;
  members: number;
  maxMembers: number;
  sets: number;
  owner: string;
};

export const studyGroups: StudyGroup[] = [
  { id: "aptis-warriors", name: "Aptis Warriors", emoji: "⚔️", code: "APT-8F2K", description: "Nhóm luyện Aptis ESOL B2, ôn từ vựng mỗi tối 21h.", members: 18, maxMembers: 30, sets: 12, owner: "Chan Wo Sin" },
  { id: "toeic-750", name: "TOEIC 750+ Club", emoji: "🚀", code: "TOE-2M9P", description: "Cày 600 từ cốt lõi và thi thử mini test hằng tuần.", members: 24, maxMembers: 40, sets: 9, owner: "Minh Anh" },
  { id: "ielts-writing", name: "IELTS Writing Lab", emoji: "✍️", code: "IEL-7Q1D", description: "Chia sẻ từ vựng theo topic và chấm chéo bài viết.", members: 11, maxMembers: 25, sets: 7, owner: "Thu Hà" },
];

export const groupMembers = [
  { initial: "C", name: "Chan Wo Sin", email: "chanwosin@lingomaster.vn", role: "Trưởng nhóm" },
  { initial: "M", name: "Minh Anh", email: "minhanh@gmail.com", role: "Thành viên" },
  { initial: "T", name: "Thu Hà", email: "thuha@gmail.com", role: "Thành viên" },
  { initial: "K", name: "Khánh Duy", email: "khanhduy@gmail.com", role: "Thành viên" },
  { initial: "L", name: "Lan Phương", email: "lanphuong@gmail.com", role: "Thành viên" },
  { initial: "H", name: "Hoàng Nam", email: "hoangnam@gmail.com", role: "Thành viên" },
];

export type Folder = {
  id: string;
  name: string;
  short: string;
  description: string;
  sets: number;
  terms: number;
};

export const folders: Folder[] = [
  { id: "aptis-core", name: "Aptis Core", short: "AC", description: "Toàn bộ từ vựng lõi cho 4 kỹ năng Aptis.", sets: 8, terms: 512 },
  { id: "speaking-kit", name: "Speaking Kit", short: "SK", description: "Cụm từ, idiom và mẫu câu dùng khi nói.", sets: 5, terms: 268 },
  { id: "exam-2026", name: "Đề thi 2026", short: "Đ26", description: "Từ vựng trích từ các đề thi mới nhất.", sets: 6, terms: 341 },
  { id: "daily-words", name: "Daily 20 Words", short: "D20", description: "Mỗi ngày 20 từ, ôn theo spaced repetition.", sets: 12, terms: 640 },
];

export const vocabulary = [
  { word: "resilient", ipa: "/rɪˈzɪliənt/", cefr: "B2", pos: "ADJECTIVE", vi: "kiên cường, dễ phục hồi", example: "Small businesses proved remarkably resilient during the crisis." },
  { word: "mitigate", ipa: "/ˈmɪtɪɡeɪt/", cefr: "C1", pos: "VERB", vi: "giảm nhẹ, xoa dịu", example: "New policies aim to mitigate the impact of rising prices." },
  { word: "in the long run", ipa: "", cefr: "B1", pos: "IDIOM", vi: "về lâu dài", example: "Learning ten words a day pays off in the long run." },
  { word: "commute", ipa: "/kəˈmjuːt/", cefr: "B1", pos: "NOUN", vi: "chuyến đi làm hằng ngày", example: "My daily commute takes about forty minutes." },
  { word: "significantly", ipa: "/sɪɡˈnɪfɪkəntli/", cefr: "B2", pos: "ADVERB", vi: "một cách đáng kể", example: "Air quality has improved significantly since 2020." },
  { word: "carbon footprint", ipa: "", cefr: "B2", pos: "PHRASE", vi: "dấu chân carbon", example: "Cycling to work lowers your carbon footprint." },
  { word: "ubiquitous", ipa: "/juːˈbɪkwɪtəs/", cefr: "C2", pos: "ADJECTIVE", vi: "phổ biến khắp nơi", example: "Smartphones have become ubiquitous in classrooms." },
  { word: "cut down on", ipa: "", cefr: "A2", pos: "PHRASE", vi: "cắt giảm", example: "I am trying to cut down on sugary drinks." },
  { word: "advocate", ipa: "/ˈædvəkeɪt/", cefr: "C1", pos: "VERB", vi: "ủng hộ, bênh vực", example: "Many teachers advocate learning vocabulary in context." },
];

export const trashItems = {
  folders: [
    { id: "t1", name: "Từ vựng cũ 2024", emoji: "🗂️", description: "Đã xóa 2 ngày trước · 4 bộ thẻ · 180 thuật ngữ" },
    { id: "t2", name: "Thử nghiệm OCR", emoji: "📁", description: "Đã xóa 5 ngày trước · 1 bộ thẻ · 32 thuật ngữ" },
  ],
  sets: [{ id: "t3", name: "Travel Basics", emoji: "✈️", description: "Đã xóa hôm qua · 26 thuật ngữ" }],
  words: [
    { id: "t4", name: "procrastinate", emoji: "🔤", description: "Đã xóa hôm nay · thuộc bộ Daily Conversation" },
    { id: "t5", name: "meticulous", emoji: "🔤", description: "Đã xóa 3 ngày trước · thuộc bộ Academic Verbs" },
  ],
};

/* ---------- Luyện tập / Đề thi / Thi thử ---------- */

export type PracticeSkill = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  sets: number;
  minutes: number;
  progress: number;
};

export const practiceSkills: PracticeSkill[] = [
  {
    id: "listening",
    name: "Listening",
    emoji: "🎧",
    description: "Nghe hội thoại, ghi chú từ khóa và trả lời câu hỏi.",
    sets: 24,
    minutes: 12,
    progress: 62,
  },
  {
    id: "speaking",
    name: "Speaking",
    emoji: "🎙️",
    description: "Luyện phát âm và trả lời theo chủ đề, có nhận xét AI.",
    sets: 18,
    minutes: 10,
    progress: 41,
  },
  {
    id: "reading",
    name: "Reading",
    emoji: "📖",
    description: "Đọc hiểu đoạn văn, ghép câu và điền từ vào chỗ trống.",
    sets: 32,
    minutes: 15,
    progress: 78,
  },
  {
    id: "writing",
    name: "Writing",
    emoji: "✍️",
    description: "Viết email, mô tả biểu đồ và luyện câu theo mẫu.",
    sets: 16,
    minutes: 20,
    progress: 35,
  },
];

export const practiceVocabModes = [
  { id: "flashcard", emoji: "🗂️", name: "Thẻ ghi nhớ", description: "Lật thẻ để ôn nhanh 20 từ." },
  { id: "quiz", emoji: "✅", name: "Trắc nghiệm", description: "Chọn nghĩa đúng trong 4 đáp án." },
  { id: "typing", emoji: "⌨️", name: "Điền từ", description: "Nghe và viết lại chính tả từ vựng." },
  { id: "match", emoji: "🧩", name: "Ghép cặp", description: "Nối từ với nghĩa trong thời gian giới hạn." },
];

export type ExamSet = {
  id: string;
  name: string;
  exam: "Aptis" | "VSTEP" | "IELTS" | "TOEIC";
  level: string;
  minutes: number;
  questions: number;
  parts: number;
  attempts: number;
  isNew?: boolean;
};

export const examSets: ExamSet[] = [
  { id: "aptis-01", name: "Aptis General Test 01", exam: "Aptis", level: "B1 - B2", minutes: 120, questions: 90, parts: 4, attempts: 1284, isNew: true },
  { id: "aptis-02", name: "Aptis General Test 02", exam: "Aptis", level: "B2", minutes: 120, questions: 90, parts: 4, attempts: 964 },
  { id: "vstep-01", name: "VSTEP B2 Đề số 1", exam: "VSTEP", level: "B2", minutes: 150, questions: 100, parts: 4, attempts: 742 },
  { id: "ielts-rd-03", name: "IELTS Reading Practice 03", exam: "IELTS", level: "6.0 - 7.0", minutes: 60, questions: 40, parts: 3, attempts: 1530 },
  { id: "toeic-lr-05", name: "TOEIC L&R Test 05", exam: "TOEIC", level: "600+", minutes: 120, questions: 200, parts: 7, attempts: 2108 },
  { id: "aptis-vocab", name: "Aptis Grammar & Vocabulary", exam: "Aptis", level: "A2 - B2", minutes: 25, questions: 50, parts: 2, attempts: 655, isNew: true },
];

export const examFilters = ["Tất cả", "Aptis", "VSTEP", "IELTS", "TOEIC"];

export type MockResult = {
  id: string;
  name: string;
  date: string;
  score: string;
  band: string;
  correct: number;
  total: number;
};

export const mockResults: MockResult[] = [
  { id: "r1", name: "Aptis General Test 01", date: "22/08/2026", score: "168/200", band: "B2", correct: 76, total: 90 },
  { id: "r2", name: "VSTEP B2 Đề số 1", date: "15/08/2026", score: "7.5/10", band: "B2", correct: 78, total: 100 },
  { id: "r3", name: "TOEIC L&R Test 05", date: "06/08/2026", score: "720/990", band: "B1", correct: 148, total: 200 },
];

export const mockSkillScores = [
  { skill: "Listening", value: 82 },
  { skill: "Reading", value: 88 },
  { skill: "Writing", value: 64 },
  { skill: "Speaking", value: 58 },
];
