import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import { Pill } from '@/components/app/ui-bits';
import docScannerService, {
  docScannerCache,
  type ExtractedVocabulary,
  type CEFRLevel,
  type ScannedPageItem,
  type ScannedExamQuestion,
} from '@/services/docScannerService';
import AddToSetModal from '@/components/vocalearn/modals/AddToSetModal';
import examService from '@/services/examService';
import {
  type ExamPartMeta,
  TOEIC_LISTENING_PARTS,
  TOEIC_READING_PARTS,
  TOPIK_LISTENING_PARTS,
  TOPIK_READING_PARTS,
  generateToeicFullTestQuestions,
  generateTopikFullTestQuestions,
  createSinglePracticeTemplate,
} from '@/services/examScaffoldService';

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// Mẫu câu hỏi khởi tạo phong phú cho giao diện xem trước & chỉnh sửa
const INITIAL_LISTENING_QUESTIONS: ScannedExamQuestion[] = [
  {
    id: 'lis-1',
    questionNumber: 1,
    content: 'Look at the picture marked No. 1 in your test book and select the statement that best describes what you see in the picture.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: 'She is presenting financial data on a digital whiteboard.' },
      { key: 'B', text: 'She is packing documents into an office suitcase.' },
      { key: 'C', text: 'She is drinking a cup of coffee at the cafeteria.' },
      { key: 'D', text: 'She is repairing a computer screen on the desk.' },
    ],
    correctAnswer: 'A',
    explanation: 'Hình ảnh cho thấy người phụ nữ đang đứng thuyết trình các biểu đồ số liệu trên màn hình bảng số.',
    selected: true,
  },
  {
    id: 'lis-2',
    questionNumber: 2,
    content: 'Where did Mr. Henderson say the quarterly regional meeting will be held?',
    options: [
      { key: 'A', text: 'At the downtown convention center in Chicago.' },
      { key: 'B', text: 'In the third-floor conference room next to the reception.' },
      { key: 'C', text: 'On Thursday morning at nine o’clock sharp.' },
      { key: 'D', text: 'Because of budget cuts for overseas travel.' },
    ],
    correctAnswer: 'A',
    explanation: 'Câu hỏi hỏi về địa điểm (Where), đáp án A trả lời chính xác nơi tổ chức.',
    selected: true,
  },
  {
    id: 'lis-3',
    questionNumber: 3,
    content: 'Questions 3 through 5 refer to the following schedule. What time is the keynote speech scheduled to start?',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: '09:00 AM' },
      { key: 'B', text: '10:30 AM' },
      { key: 'C', text: '01:15 PM' },
      { key: 'D', text: '03:45 PM' },
    ],
    correctAnswer: 'B',
    explanation: 'Dựa trên biểu đồ lịch trình sự kiện đính kèm, Keynote bắt đầu lúc 10:30 AM.',
    selected: true,
  },
];

const INITIAL_READING_QUESTIONS: ScannedExamQuestion[] = [
  {
    id: 'read-101',
    questionNumber: 101,
    content: 'Customer satisfaction surveys indicate that our clients appreciate the _______ of our technical support team.',
    options: [
      { key: 'A', text: 'promptness' },
      { key: 'B', text: 'prompt' },
      { key: 'C', text: 'promptly' },
      { key: 'D', text: 'prompter' },
    ],
    correctAnswer: 'A',
    explanation: 'Sau mạo từ "the" và trước giới từ "of" cần một danh từ (promptness - sự nhanh chóng, kịp thời).',
    selected: true,
  },
  {
    id: 'read-102',
    questionNumber: 102,
    content: 'All lab personnel must wear protective safety goggles _______ entering the chemical testing facility.',
    options: [
      { key: 'A', text: 'before' },
      { key: 'B', text: 'under' },
      { key: 'C', text: 'between' },
      { key: 'D', text: 'during' },
    ],
    correctAnswer: 'A',
    explanation: '"before + V-ing" chỉ hành động cần thực hiện trước khi bước vào phòng thử nghiệm.',
    selected: true,
  },
  {
    id: 'read-103',
    questionNumber: 103,
    content: 'Questions 103-104 refer to the following invoice notice. What item has an additional service warranty attached?',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: 'High-speed laser printer model X-200' },
      { key: 'B', text: 'Ergonomic mesh office chairs' },
      { key: 'C', text: 'Wireless conference microphone system' },
      { key: 'D', text: 'Standard A4 printing paper cartons' },
    ],
    correctAnswer: 'A',
    explanation: 'Trong hóa đơn thanh toán, máy in laser X-200 có dòng ghi chú kèm gói bảo hành 2 năm.',
    selected: true,
  },
];

const INITIAL_WRITING_QUESTIONS: ScannedExamQuestion[] = [
  {
    id: 'write-201',
    questionNumber: 1,
    content: 'Write a response email (approx. 100 words) addressing the customer complaint regarding late package delivery and offer a suitable resolution.',
    imageUrl: 'https://images.unsplash.com/photo-1586769852044-692d6e3703f0?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: 'Tiêu chí 1: Trả lời đầy đủ thông tin xin lỗi và đưa ra chính sách đền bù/giao lại.' },
      { key: 'B', text: 'Tiêu chí 2: Cấu trúc email công sở chuẩn mực, ngôn phong lịch sự trang trọng.' },
      { key: 'C', text: 'Tiêu chí 3: Ngữ pháp chính xác, sử dụng từ vựng chuyên ngành vận tải/dịch vụ khách hàng.' },
      { key: 'D', text: 'Tiêu chí 4: Độ dài đoạn văn đảm bảo từ 80 - 120 từ theo quy định đề thi.' },
    ],
    correctAnswer: 'A',
    explanation: 'Dạng bài viết thư điện tử phản hồi yêu cầu ứng viên giải quyết trọn vẹn các yêu cầu trong đề bài.',
    selected: true,
  },
  {
    id: 'write-202',
    questionNumber: 2,
    content: '[TOPIK 쓰기 54번 / TOEIC Essay]: Trình bày quan điểm của bạn về tầm quan trọng của việc học trực tuyến đối với người đi làm trong thời đại số (200 - 300 từ).',
    options: [
      { key: 'A', text: 'Luận điểm: Tính linh hoạt về thời gian và địa điểm học tập.' },
      { key: 'B', text: 'Luận điểm: Tối ưu chi phí và tiếp cận nguồn tài nguyên quốc tế.' },
      { key: 'C', text: 'Phản biện: Thách thức về tính kỷ luật tự giác và thiếu tương tác trực tiếp.' },
      { key: 'D', text: 'Kết luận: Giải pháp kết hợp linh hoạt giữa tự học và thảo luận nhóm.' },
    ],
    correctAnswer: 'A',
    explanation: 'Bài nghị luận đánh giá khả năng tổ chức ý mạch lạc, cấu trúc mở - thân - kết và liên kết câu logic.',
    selected: true,
  },
];

const INITIAL_SPEAKING_QUESTIONS: ScannedExamQuestion[] = [
  {
    id: 'speak-301',
    questionNumber: 1,
    content: 'Read a text aloud: "Welcome to the annual TechInnovate Summit. Today’s morning sessions will cover cloud architecture, machine learning applications, and cybersecurity best practices. Please ensure your badges are visible at all times."',
    options: [
      { key: 'A', text: 'Tiêu chí phát âm: Trọng âm từ, ngữ điệu câu hỏi và câu liệt kê chính xác.' },
      { key: 'B', text: 'Tiêu chí tốc độ: Đọc trôi chảy, ngắt nghỉ đúng cụm nghĩa trong 45 giây.' },
      { key: 'C', text: 'Tiêu chí ngữ âm: Phát âm chuẩn các đuôi -s, -ed và các thuật ngữ kỹ thuật.' },
      { key: 'D', text: 'Tiêu chí âm lượng: Giọng đọc rõ ràng, tự tin, phát âm chuẩn quốc tế.' },
    ],
    correctAnswer: 'A',
    explanation: 'Phần đọc to đoạn văn đánh giá khả năng phát âm chuẩn xác, ngữ điệu tự nhiên và ngắt nghỉ đúng nhịp.',
    selected: true,
  },
  {
    id: 'speak-302',
    questionNumber: 2,
    content: 'Describe a picture: Describe what you see in the photograph in as much detail as possible. You have 45 seconds to prepare and 30 seconds to speak.',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    options: [
      { key: 'A', text: 'Mô tả tổng quan: Nhóm đồng nghiệp đang thảo luận quanh bàn làm việc hiện đại.' },
      { key: 'B', text: 'Mô tả chi tiết: Người phụ nữ chỉ vào laptop, đồng nghiệp nam chăm chú lắng nghe.' },
      { key: 'C', text: 'Mô tả bối cảnh: Văn phòng mở sáng sủa với ánh sáng tự nhiên và sổ ghi chép.' },
      { key: 'D', text: 'Cảm nghĩ / Dự đoán: Không khí làm việc hợp tác, tích cực và tập trung cao độ.' },
    ],
    correctAnswer: 'A',
    explanation: 'Bài miêu tả tranh cần sắp xếp thứ tự: Từ tổng thể (vị trí, hành động chính) đến chi tiết xung quanh và phỏng đoán.',
    selected: true,
  },
];

const VocaScanDocumentPage = () => {
  const navigate = useNavigate();

  // Chế độ Quét chính: Quét bộ đề (exam) hoặc Quét từ vựng (vocab)
  const [scanMode, setScanMode] = useState<'exam' | 'vocab'>('exam');

  // =========================================================================
  // PHẦN 1: STATE BỘ LỌC CẤU HÌNH QUÉT BỘ ĐỀ (EXAM SCANNER - NO ICONS)
  // =========================================================================
  // Chế độ thi: Full đề thi (FULL_TEST), Đề theo kỹ năng (PRACTICE), Đề luyện dạng bài (DRILL)
  const [examScanCategory, setExamScanCategory] = useState<'FULL_TEST' | 'PRACTICE' | 'DRILL'>('FULL_TEST');

  // Quản lý Part đang được chọn để xem trong chế độ FULL_TEST
  const [activePartNumber, setActivePartNumber] = useState<number>(1);

  // Nếu là Full đề thi: Chọn 2, 3 hoặc 4 kỹ năng (tuỳ loại kỳ thi)
  const [fullTestSkillMode, setFullTestSkillMode] = useState<'2_SKILLS' | '3_SKILLS' | '4_SKILLS'>('2_SKILLS');

  // Nếu là Đề theo kỹ năng hoặc Drill: Chọn 1 kỹ năng duy nhất
  const [singleSkill, setSingleSkill] = useState<'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'>('READING');

  // Loại kỳ thi chuẩn: Chỉ TOEIC hoặc TOPIK
  const [examType, setExamType] = useState<'TOEIC' | 'TOPIC'>('TOEIC');

  // Thông tin cấu hình đề thi
  const [examTitle, setExamTitle] = useState<string>('Đề thi thử TOEIC Format Mới 2026');
  const [examDescription, setExamDescription] = useState<string>('Đề thi chuẩn hóa bóc tách từ tài liệu thực tế với các kỹ năng hoàn chỉnh.');
  const [examDuration, setExamDuration] = useState<number>(120);

  // File Upload theo từng kỹ năng
  const listeningAudioInputRef = useRef<HTMLInputElement>(null);
  const listeningPdfInputRef = useRef<HTMLInputElement>(null);
  const readingPdfInputRef = useRef<HTMLInputElement>(null);
  const writingPdfInputRef = useRef<HTMLInputElement>(null);
  const speakingAudioInputRef = useRef<HTMLInputElement>(null);

  const [listeningAudioFile, setListeningAudioFile] = useState<File | null>(null);
  const [listeningAudioUrl, setListeningAudioUrl] = useState<string>('');
  const [listeningPdfFile, setListeningPdfFile] = useState<File | null>(null);
  const [readingPdfFile, setReadingPdfFile] = useState<File | null>(null);
  const [writingPdfFile, setWritingPdfFile] = useState<File | null>(null);
  const [writingPromptText, setWritingPromptText] = useState<string>('');
  const [speakingAudioFile, setSpeakingAudioFile] = useState<File | null>(null);
  const [speakingPromptText, setSpeakingPromptText] = useState<string>('');

  // Trạng thái phát audio mẫu
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trạng thái đang quét / phân tích
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true); // Mặc định mở Review Studio để xem ngay giao diện
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Tab kỹ năng đang xem trong Review Studio: LISTENING, READING, WRITING, SPEAKING
  const [activeReviewSkill, setActiveReviewSkill] = useState<'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'>('LISTENING');

  // Dữ liệu câu hỏi theo từng kỹ năng (mặc định khởi tạo khuôn Full Test TOEIC 200 câu)
  const [listeningQuestions, setListeningQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateToeicFullTestQuestions('LISTENING')
  );
  const [readingQuestions, setReadingQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateToeicFullTestQuestions('READING')
  );
  const [writingQuestions, setWritingQuestions] = useState<ScannedExamQuestion[]>(INITIAL_WRITING_QUESTIONS);
  const [speakingQuestions, setSpeakingQuestions] = useState<ScannedExamQuestion[]>(INITIAL_SPEAKING_QUESTIONS);

  // Modal xem ảnh kích thước lớn
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  // =========================================================================
  // PHẦN 2: STATE QUÉT TỪ VỰNG (VOCABULARY SCANNER - NO ICONS)
  // =========================================================================
  const vocabFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentPageScanning, setCurrentPageScanning] = useState<number>(1);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [currentStepText, setCurrentStepText] = useState<string>('');
  const [scannedPages, setScannedPages] = useState<ScannedPageItem[]>([]);
  const [pageLevelFilters, setPageLevelFilters] = useState<Record<number, 'ALL' | CEFRLevel>>({});
  const [reExtractingPages, setReExtractingPages] = useState<Record<number, boolean>>({});
  const [copiedStatus, setCopiedStatus] = useState<Record<number, boolean>>({});
  const [isAddToSetOpen, setIsAddToSetOpen] = useState<boolean>(false);

  // Khôi phục cache quét từ vựng khi mount
  useEffect(() => {
    const cached = docScannerCache.load();
    if (cached && cached.scannedPages && cached.scannedPages.length > 0) {
      setScannedPages(cached.scannedPages);
      setPageLevelFilters(cached.pageLevelFilters || {});
      setFilePreviewUrl(cached.filePreviewUrl || '');
      setSelectedFile(new File([], cached.fileName || 'Tài liệu đã quét'));
    }
  }, []);

  // Xử lý Audio phát/dừng
  const togglePlayAudio = () => {
    if (!audioRef.current && listeningAudioUrl) {
      audioRef.current = new Audio(listeningAudioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }
    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlayingAudio(true);
      }
    } else {
      // Mô phỏng âm thanh thông báo nếu chưa nạp file thực
      alert('Đã kích hoạt chế độ nghe thử file âm thanh.');
      setIsPlayingAudio(!isPlayingAudio);
    }
  };

  // Xác định các kỹ năng hoạt động dựa trên cấu hình bộ lọc
  // Reset fullTestSkillMode khi chuyển đổi giữa TOEIC và TOPIK để tránh trạng thái không hợp lệ
  useEffect(() => {
    // Khi đổi kỳ thi, reset về 2_SKILLS (an toàn cho cả TOEIC lẫn TOPIK)
    setFullTestSkillMode('2_SKILLS');
    // Reset single skill về READING (có ở cả 2 kỳ thi)
    setSingleSkill('READING');
  }, [examType]);

  // Đồng bộ khuôn câu hỏi khi đổi kỳ thi hoặc đổi chế độ đề
  useEffect(() => {
    if (examScanCategory === 'FULL_TEST') {
      if (examType === 'TOEIC') {
        setListeningQuestions(generateToeicFullTestQuestions('LISTENING'));
        setReadingQuestions(generateToeicFullTestQuestions('READING'));
      } else {
        setListeningQuestions(generateTopikFullTestQuestions('LISTENING'));
        setReadingQuestions(generateTopikFullTestQuestions('READING'));
      }
      setActivePartNumber(1);
    } else {
      // PRACTICE hoặc DRILL: Giảng viên tự tạo thủ công, không sinh sẵn 200 câu
      setListeningQuestions(createSinglePracticeTemplate('LISTENING', 1));
      setReadingQuestions(createSinglePracticeTemplate('READING', 1));
      setActivePartNumber(1);
    }
  }, [examType, examScanCategory]);

  // Xác định các kỹ năng hoạt động dựa trên cấu hình bộ lọc
  const activeSkillsList = (() => {
    if (examScanCategory === 'FULL_TEST') {
      if (fullTestSkillMode === '2_SKILLS') {
        return ['LISTENING', 'READING'];
      }
      if (fullTestSkillMode === '3_SKILLS') {
        // TOPIK II: Nghe + Đọc + Viết
        return ['LISTENING', 'READING', 'WRITING'];
      }
      // 4_SKILLS (TOEIC): Nghe + Nói + Đọc + Viết
      return ['LISTENING', 'READING', 'WRITING', 'SPEAKING'];
    }
    return [singleSkill];
  })();

  // Danh sách các Part thuộc kỹ năng hiện tại
  const currentSkillParts: ExamPartMeta[] = (() => {
    if (examType === 'TOEIC') {
      return activeReviewSkill === 'LISTENING' ? TOEIC_LISTENING_PARTS : TOEIC_READING_PARTS;
    }
    // TOPIK
    return activeReviewSkill === 'LISTENING' ? TOPIK_LISTENING_PARTS : TOPIK_READING_PARTS;
  })();

  // Đảm bảo activePartNumber luôn hợp lệ khi đổi kỹ năng
  useEffect(() => {
    if (examScanCategory === 'FULL_TEST' && currentSkillParts.length > 0) {
      const isPartValid = currentSkillParts.some((p) => p.partNumber === activePartNumber);
      if (!isPartValid) {
        setActivePartNumber(currentSkillParts[0].partNumber);
      }
    }
  }, [activeReviewSkill, examType, examScanCategory]);

  // Danh sách kỹ năng đơn lẻ cho PRACTICE / DRILL dựa theo kỳ thi đã chọn
  const practiceSkillOptions = (() => {
    if (examType === 'TOEIC') {
      return [
        { key: 'LISTENING', label: 'Nghe (Listening)' },
        { key: 'READING', label: 'Đọc (Reading)' },
        { key: 'SPEAKING', label: 'Nói (Speaking)' },
        { key: 'WRITING', label: 'Viết (Writing)' },
      ];
    }
    // TOPIK: Chỉ có Nghe, Đọc, Viết
    return [
      { key: 'LISTENING', label: 'Nghe (Listening)' },
      { key: 'READING', label: 'Đọc (Reading)' },
      { key: 'WRITING', label: 'Viết (Writing)' },
    ];
  })();

  // Lựa chọn số kỹ năng cho FULL_TEST dựa theo kỳ thi
  const fullTestSkillOptions = (() => {
    if (examType === 'TOEIC') {
      return [
        { key: '2_SKILLS', label: '2 Kỹ năng (Nghe + Đọc)' },
        { key: '4_SKILLS', label: '4 Kỹ năng (Nghe + Nói + Đọc + Viết)' },
      ];
    }
    // TOPIK
    return [
      { key: '2_SKILLS', label: '2 Kỹ năng (Nghe + Đọc)' },
      { key: '3_SKILLS', label: '3 Kỹ năng (Nghe + Đọc + Viết)' },
    ];
  })();

  // Đảm bảo activeReviewSkill luôn nằm trong danh sách kỹ năng đang chọn
  useEffect(() => {
    if (!activeSkillsList.includes(activeReviewSkill as any)) {
      setActiveReviewSkill(activeSkillsList[0] as any);
    }
  }, [examScanCategory, fullTestSkillMode, singleSkill]);

  // Danh sách câu hỏi của kỹ năng hiện tại
  const currentSkillQuestions = (() => {
    switch (activeReviewSkill) {
      case 'LISTENING':
        return listeningQuestions;
      case 'READING':
        return readingQuestions;
      case 'WRITING':
        return writingQuestions;
      case 'SPEAKING':
        return speakingQuestions;
      default:
        return readingQuestions;
    }
  })();

  const setCurrentSkillQuestions = (updater: (prev: ScannedExamQuestion[]) => ScannedExamQuestion[]) => {
    switch (activeReviewSkill) {
      case 'LISTENING':
        setListeningQuestions(updater);
        break;
      case 'READING':
        setReadingQuestions(updater);
        break;
      case 'WRITING':
        setWritingQuestions(updater);
        break;
      case 'SPEAKING':
        setSpeakingQuestions(updater);
        break;
    }
  };

  // Các hàm thao tác câu hỏi
  const handleUpdateQuestionContent = (qId: string, newContent: string) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, content: newContent } : q))
    );
  };

  const handleUpdateOption = (qId: string, optKey: 'A' | 'B' | 'C' | 'D', newText: string) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((opt) => (opt.key === optKey ? { ...opt, text: newText } : opt)),
        };
      })
    );
  };

  const handleSetCorrectAnswer = (qId: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, correctAnswer: optKey } : q))
    );
  };

  const handleToggleSelectQuestion = (qId: string) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, selected: !q.selected } : q))
    );
  };

  const handleDeleteQuestion = (qId: string) => {
    setCurrentSkillQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleAddQuestion = () => {
    const nextQNum = currentSkillQuestions.length + 1;
    const newQ: ScannedExamQuestion = {
      id: `custom-q-${Date.now()}`,
      questionNumber: nextQNum,
      partNumber: activePartNumber,
      content: 'Nhập nội dung câu hỏi mới tại đây...',
      options: [
        { key: 'A', text: 'Lựa chọn A' },
        { key: 'B', text: 'Lựa chọn B' },
        { key: 'C', text: 'Lựa chọn C' },
        { key: 'D', text: 'Lựa chọn D' },
      ],
      correctAnswer: 'A',
      explanation: 'Tự thêm bởi giảng viên',
      selected: true,
    };
    setCurrentSkillQuestions((prev) => [...prev, newQ]);
  };

  // Các câu hỏi hiển thị trong kỹ năng hiện tại:
  // - Nếu FULL_TEST và đang ở LISTENING/READING: Lọc theo activePartNumber
  // - Nếu PRACTICE / DRILL: Hiển thị toàn bộ câu hỏi của kỹ năng hiện tại
  const displayedQuestions = (() => {
    if (examScanCategory === 'FULL_TEST' && (activeReviewSkill === 'LISTENING' || activeReviewSkill === 'READING')) {
      const filtered = currentSkillQuestions.filter((q) => q.partNumber === activePartNumber);
      return filtered.length > 0 ? filtered : currentSkillQuestions;
    }
    return currentSkillQuestions;
  })();

  // Gom các câu hỏi liên kết cùng passageGroupId thành nhóm trực quan
  interface GroupedItem {
    type: 'SINGLE' | 'GROUP';
    groupId?: string;
    groupTitle?: string;
    passageText?: string;
    passageAudioUrl?: string;
    passageImageUrl?: string;
    questions: ScannedExamQuestion[];
  }

  const groupedDisplayItems: GroupedItem[] = (() => {
    const items: GroupedItem[] = [];
    let curGroup: GroupedItem | null = null;

    displayedQuestions.forEach((q) => {
      if (q.passageGroupId) {
        if (curGroup && curGroup.groupId === q.passageGroupId) {
          curGroup.questions.push(q);
        } else {
          if (curGroup) {
            items.push(curGroup);
          }
          curGroup = {
            type: 'GROUP',
            groupId: q.passageGroupId,
            groupTitle: q.passageTitle || `Đoạn dùng chung (Câu ${q.questionNumber})`,
            passageText: q.passageText,
            passageAudioUrl: q.passageAudioUrl,
            passageImageUrl: q.passageImageUrl,
            questions: [q],
          };
        }
      } else {
        if (curGroup) {
          items.push(curGroup);
          curGroup = null;
        }
        items.push({
          type: 'SINGLE',
          questions: [q],
        });
      }
    });

    if (curGroup) {
      items.push(curGroup);
    }

    return items;
  })();

  // Kích hoạt phân tích quét đề
  const handleTriggerAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setHasScanned(true);
      alert('Đã hoàn tất phân tích và bóc tách các câu hỏi cho các kỹ năng đã chọn.');
    }, 1200);
  };

  // Tổng số câu hỏi đã chọn trong các kỹ năng đang kích hoạt
  const totalQuestionsSelected =
    (activeSkillsList.includes('LISTENING') ? listeningQuestions.filter((q) => q.selected).length : 0) +
    (activeSkillsList.includes('READING') ? readingQuestions.filter((q) => q.selected).length : 0) +
    (activeSkillsList.includes('WRITING') ? writingQuestions.filter((q) => q.selected).length : 0) +
    (activeSkillsList.includes('SPEAKING') ? speakingQuestions.filter((q) => q.selected).length : 0);

  // Xử lý lưu đề thi
  const handleSaveExam = async () => {
    if (totalQuestionsSelected === 0) {
      alert('Vui lòng chọn ít nhất một câu hỏi để lưu đề thi!');
      return;
    }

    try {
      const durationPerSection = Math.round((examDuration || 120) / Math.max(1, activeSkillsList.length));
      const sectionsToCreate: any[] = [];
      let orderIdx = 1;

      if (activeSkillsList.includes('LISTENING')) {
        sectionsToCreate.push({
          id: 0,
          title: 'Phần thi Nghe (Listening)',
          skill: 'LISTENING',
          orderIndex: orderIdx++,
          minutes: durationPerSection,
          passageGroups: [
            {
              id: 0,
              title: 'Các câu hỏi phần Nghe',
              orderIndex: 1,
              audioUrl: listeningAudioUrl || undefined,
              questions: listeningQuestions.map((q, idx) => ({
                id: 0,
                content: q.content,
                answer: JSON.stringify(q.options.map((opt) => opt.text)),
                correctAnswer: q.options.find((opt) => opt.key === q.correctAnswer)?.text || q.correctAnswer,
                explanation: q.explanation || 'Trích xuất tự động',
                score: 5,
                orderIndex: idx + 1,
              })),
            },
          ],
        });
      }

      if (activeSkillsList.includes('READING')) {
        sectionsToCreate.push({
          id: 0,
          title: 'Phần thi Đọc (Reading)',
          skill: 'READING',
          orderIndex: orderIdx++,
          minutes: durationPerSection,
          passageGroups: [
            {
              id: 0,
              title: 'Các câu hỏi phần Đọc',
              orderIndex: 1,
              questions: readingQuestions.map((q, idx) => ({
                id: 0,
                content: q.content,
                answer: JSON.stringify(q.options.map((opt) => opt.text)),
                correctAnswer: q.options.find((opt) => opt.key === q.correctAnswer)?.text || q.correctAnswer,
                explanation: q.explanation || 'Trích xuất tự động',
                score: 5,
                orderIndex: idx + 1,
              })),
            },
          ],
        });
      }

      if (activeSkillsList.includes('WRITING')) {
        sectionsToCreate.push({
          id: 0,
          title: 'Phần thi Viết (Writing)',
          skill: 'WRITING',
          orderIndex: orderIdx++,
          minutes: durationPerSection,
          passageGroups: [
            {
              id: 0,
              title: 'Các câu hỏi phần Viết',
              orderIndex: 1,
              questions: writingQuestions.map((q, idx) => ({
                id: 0,
                content: q.content,
                answer: JSON.stringify(q.options.map((opt) => opt.text)),
                correctAnswer: q.options.find((opt) => opt.key === q.correctAnswer)?.text || q.correctAnswer,
                explanation: q.explanation || 'Trích xuất tự động',
                score: 5,
                orderIndex: idx + 1,
              })),
            },
          ],
        });
      }

      if (activeSkillsList.includes('SPEAKING')) {
        sectionsToCreate.push({
          id: 0,
          title: 'Phần thi Nói (Speaking)',
          skill: 'SPEAKING',
          orderIndex: orderIdx++,
          minutes: durationPerSection,
          passageGroups: [
            {
              id: 0,
              title: 'Các câu hỏi phần Nói',
              orderIndex: 1,
              questions: speakingQuestions.map((q, idx) => ({
                id: 0,
                content: q.content,
                answer: JSON.stringify(q.options.map((opt) => opt.text)),
                correctAnswer: q.options.find((opt) => opt.key === q.correctAnswer)?.text || q.correctAnswer,
                explanation: q.explanation || 'Trích xuất tự động',
                score: 5,
                orderIndex: idx + 1,
              })),
            },
          ],
        });
      }

      await examService.createExam({
        title: examTitle.trim() || 'Đề thi chuẩn hóa mới',
        description: examDescription.trim() || 'Đề thi trích xuất từ tài liệu quét đa kỹ năng',
        totalMinutes: examDuration || 120,
        totalScore: totalQuestionsSelected * 5,
        type: examType,
        format: examScanCategory,
        sections: sectionsToCreate,
      });

      setSaveSuccessMessage(`Tạo đề thi "${examTitle}" thành công! Đã lưu vào CSDL.`);
    } catch (err) {
      console.error('Lỗi khi lưu đề thi:', err);
      alert('Không thể lưu đề thi vào CSDL. Vui lòng kiểm tra lại kết nối backend!');
    }
  };

  // Hàm hiển thị một thẻ câu hỏi hoàn chỉnh (Thuần chữ, không icon)
  const renderQuestionCard = (q: ScannedExamQuestion, displayIdx?: number) => {
    return (
      <div
        key={q.id}
        className={`bg-white border rounded-3xl p-6 shadow-2xs transition-all duration-200 ${
          q.selected ? 'border-slate-200' : 'border-slate-100 opacity-60'
        }`}
      >
        {/* HEADER CÂU HỎI */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <input
              type="checkbox"
              checked={q.selected}
              onChange={() => handleToggleSelectQuestion(q.id)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Câu {q.questionNumber || (displayIdx !== undefined ? displayIdx + 1 : 1)}
            </span>
            {q.partName && (
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {q.partName}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500">
              Kỹ năng:{' '}
              <strong className="text-slate-800">
                {activeReviewSkill === 'LISTENING' && 'Nghe (Listening)'}
                {activeReviewSkill === 'READING' && 'Đọc (Reading)'}
                {activeReviewSkill === 'WRITING' && 'Viết (Writing)'}
                {activeReviewSkill === 'SPEAKING' && 'Nói (Speaking)'}
              </strong>
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đáp án đúng: {q.correctAnswer}
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleDeleteQuestion(q.id)}
            className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-slate-500 transition cursor-pointer"
          >
            Xóa câu này
          </button>
        </div>

        {/* KHUNG ẢNH MINH HỌA ĐƯỢC CẮT (NẾU CÓ) */}
        {q.imageUrl && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-4">
            <img
              src={q.imageUrl}
              alt={`Minh họa câu ${q.questionNumber}`}
              className="w-48 h-32 object-cover rounded-xl border border-slate-200 shrink-0 cursor-pointer"
              onClick={() => setEnlargedImageUrl(q.imageUrl || null)}
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Ảnh minh họa trích xuất từ tài liệu
              </span>
              <p className="text-xs text-slate-700 font-medium">
                Câu hỏi này có đính kèm ảnh tranh vẽ / sơ đồ biểu đồ được tự động nhận diện và cắt ra từ file đề.
              </p>
              <button
                type="button"
                onClick={() => setEnlargedImageUrl(q.imageUrl || null)}
                className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
              >
                Xem ảnh kích thước lớn
              </button>
            </div>
          </div>
        )}

        {/* NỘI DUNG VĂN BẢN CÂU HỎI */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Nội dung câu hỏi
          </label>
          <textarea
            rows={2}
            value={q.content}
            onChange={(e) => handleUpdateQuestionContent(q.id, e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-none bg-slate-50/30"
          />
        </div>

        {/* 4 PHƯƠNG ÁN LỰA CHỌN A, B, C, D */}
        <div>
          <span className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
            Các phương án (Click vào nút A, B, C, D để đặt đáp án đúng):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isCorrect = q.correctAnswer === opt.key;
              return (
                <div
                  key={opt.key}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleSetCorrectAnswer(q.id, opt.key)}
                    className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 transition cursor-pointer ${
                      isCorrect
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-500'
                    }`}
                    title={`Click để đặt ${opt.key} làm đáp án đúng`}
                  >
                    {opt.key}
                  </button>

                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleUpdateOption(q.id, opt.key, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none font-medium"
                    placeholder={`Nội dung phương án ${opt.key}...`}
                  />

                  {isCorrect && (
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                      Đáp án đúng
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* GIẢI THÍCH CHI TIẾT */}
        {q.explanation && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500">Giải thích:</span>
            <span className="text-xs text-slate-600 italic">{q.explanation}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans flex flex-col select-none pb-28">
      <div className="flex flex-col min-h-screen w-full">
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* ========================================================================= */}
          {/* 1. HEADER CHÍNH: THUẦN VĂN BẢN (KHÔNG CÓ BẤT KỲ ICON NÀO) */}
          {/* ========================================================================= */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  Phân Hệ Quét
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  QUÉT TÀI LIỆU
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                {scanMode === 'exam'
                  ? 'Nhận diện tài liệu đề thi, tự động bóc tách câu hỏi trắc nghiệm đa kỹ năng & lưu thành đề mới.'
                  : 'Trích xuất danh sách từ vựng theo chuẩn CEFR A1-C2 từ tài liệu học tập và tạo bộ thẻ ôn tập.'}
              </p>
            </div>

            {/* Nút Tabs chuyển đổi 2 chế độ (Thuần Chữ) */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/60 shrink-0">
              <button
                type="button"
                onClick={() => setScanMode('exam')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scanMode === 'exam'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. Quét bộ đề
              </button>

              <button
                type="button"
                onClick={() => setScanMode('vocab')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  scanMode === 'vocab'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/50'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. Quét từ vựng
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: PHÂN HỆ QUÉT BỘ ĐỀ (EXAM SCANNER - THUẦN CHỮ KHÔNG ICON) */}
          {/* ========================================================================= */}
          {scanMode === 'exam' && (
            <div className="space-y-6">
              {/* KHỐI BỘ LỌC CẤU HÌNH ĐA TẦNG */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Cấu Hình Bộ Lọc Quét Đề Thi
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">
                    Tuỳ chỉnh linh hoạt theo mục tiêu tạo đề
                  </span>
                </div>

                {/* DÒNG 1: CHẾ ĐỘ QUÉT (FULL TEST vs PRACTICE vs DRILL) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-xs font-bold text-slate-700 w-36 shrink-0">
                    Chế độ đề thi:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setExamScanCategory('FULL_TEST')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examScanCategory === 'FULL_TEST'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Full đề thi (FULL_TEST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamScanCategory('PRACTICE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examScanCategory === 'PRACTICE'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Đề theo kỹ năng (PRACTICE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamScanCategory('DRILL')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        examScanCategory === 'DRILL'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Đề luyện dạng bài (DRILL)
                    </button>
                  </div>
                </div>

                {/* DÒNG 2A: NẾU LÀ FULL TEST -> CHỌN SỐ KỸ NĂNG (ĐỘNG THEO KỲ THI) */}
                {examScanCategory === 'FULL_TEST' && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-100/70">
                    <span className="text-xs font-bold text-slate-700 w-36 shrink-0">
                      Số lượng kỹ năng:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {fullTestSkillOptions.map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setFullTestSkillMode(opt.key as any)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            fullTestSkillMode === opt.key
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DÒNG 2B: NẾU LÀ PRACTICE / DRILL -> CHỌN 1 KỸ NĂNG DUY NHẤT (LỌC THEO KỲ THI) */}
                {(examScanCategory === 'PRACTICE' || examScanCategory === 'DRILL') && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-100/70">
                    <span className="text-xs font-bold text-slate-700 w-36 shrink-0">
                      Kỹ năng đơn lẻ:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {practiceSkillOptions.map((sk) => (
                        <button
                          key={sk.key}
                          type="button"
                          onClick={() => setSingleSkill(sk.key as any)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            singleSkill === sk.key
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {sk.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* DÒNG 3: BỘ LỌC LOẠI KỲ THI CHUẨN (CHỈ TOEIC & TOPIK) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-100/70">
                  <span className="text-xs font-bold text-slate-700 w-36 shrink-0">
                    Kỳ thi chuẩn:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'TOEIC', label: 'TOEIC' },
                      { key: 'TOPIC', label: 'TOPIK' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setExamType(t.key as any)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          examType === t.key
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DÒNG 4: THÔNG TIN CƠ BẢN CỦA ĐỀ THI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu đề đề thi
                    </label>
                    <input
                      type="text"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      placeholder="Ví dụ: Đề thi thử TOEIC Format Mới 2026..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Thời gian làm bài (Phút)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={240}
                      value={examDuration}
                      onChange={(e) => setExamDuration(Number(e.target.value) || 60)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* KHU VỰC TẢI FILE THÍCH ỨNG THEO TỪNG KỸ NĂNG (THUẦN CHỮ KHÔNG ICON) */}
              {/* ========================================================================= */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Khu Vực Tải Lên Tài Liệu Theo Kỹ Năng
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Giao diện tự động thích ứng với cấu hình {activeSkillsList.length} kỹ năng bạn đã chọn.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerAnalyze}
                    disabled={isAnalyzing}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Đang phân tích...' : 'Bắt đầu phân tích đề thi'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ô 1: PHẦN NGHE (NẾU ĐƯỢC CHỌN) */}
                  {activeSkillsList.includes('LISTENING') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Phần 1: Kỹ Năng Nghe (Listening)
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Yêu cầu Audio + PDF
                        </span>
                      </div>

                      {/* Tải Audio */}
                      <input
                        ref={listeningAudioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setListeningAudioFile(file);
                            setListeningAudioUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => listeningAudioInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <p className="text-xs font-bold text-slate-800">
                          {listeningAudioFile ? listeningAudioFile.name : 'Tải File Âm Thanh Bài Nghe (Audio MP3/WAV)'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {listeningAudioFile
                            ? `${(listeningAudioFile.size / (1024 * 1024)).toFixed(2)} MB • Bấm để đổi file khác`
                            : 'Kéo & thả file hoặc click để duyệt từ máy tính'}
                        </p>
                      </div>

                      {/* Thanh nghe thử Audio Player (Thuần chữ) */}
                      {listeningAudioFile && (
                        <div className="bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-slate-700">
                            Trình phát bài nghe:
                          </span>
                          <button
                            type="button"
                            onClick={togglePlayAudio}
                            className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 transition cursor-pointer"
                          >
                            {isPlayingAudio ? 'Tạm dừng bài nghe' : 'Phát bài nghe'}
                          </button>
                        </div>
                      )}

                      {/* Tải PDF câu 1-100 */}
                      <input
                        ref={listeningPdfInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setListeningPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => listeningPdfInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <p className="text-xs font-bold text-slate-800">
                          {listeningPdfFile ? listeningPdfFile.name : 'Tải File Đề Thi Nghe (PDF / Ảnh Câu 1-100)'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {listeningPdfFile ? 'Bấm để đổi file tài liệu khác' : 'Kéo & thả file PDF hoặc ảnh đề thi'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ô 2: PHẦN ĐỌC (NẾU ĐƯỢC CHỌN) */}
                  {activeSkillsList.includes('READING') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Phần 2: Kỹ Năng Đọc (Reading)
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Yêu cầu PDF / Ảnh
                        </span>
                      </div>

                      <input
                        ref={readingPdfInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setReadingPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => readingPdfInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-emerald-400 bg-white rounded-xl p-8 text-center cursor-pointer transition h-[155px] flex flex-col items-center justify-center"
                      >
                        <p className="text-xs font-bold text-slate-800">
                          {readingPdfFile ? readingPdfFile.name : 'Tải File Đề Thi Đọc (PDF / Ảnh Câu 101-200)'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                          {readingPdfFile
                            ? 'Bấm để đổi file tài liệu khác'
                            : 'Kéo & thả file tài liệu PDF hoặc bộ ảnh đề thi đọc vào đây'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ô 3: PHẦN VIẾT (NẾU CHỌN 3 HOẶC 4 KỸ NĂNG HOẶC PRACTICE VIẾT) */}
                  {activeSkillsList.includes('WRITING') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          {examType === 'TOPIC' ? 'Phần 3: Kỹ Năng Viết (쓰기)' : 'Kỹ Năng Viết (Writing)'}
                        </span>
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Đề bài viết & Tự luận
                        </span>
                      </div>

                      {/* Tải PDF đề thi Viết */}
                      <input
                        ref={writingPdfInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setWritingPdfFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => writingPdfInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <p className="text-xs font-bold text-slate-800">
                          {writingPdfFile ? writingPdfFile.name : 'Tải File Đề Thi Viết (PDF / Đề Bài Tự Luận)'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {writingPdfFile ? 'Bấm để đổi file khác' : 'Kéo & thả file PDF đề bài viết hoặc phiếu câu hỏi'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Hoặc nhập trực tiếp đề bài tự luận:
                        </label>
                        <textarea
                          rows={2}
                          value={writingPromptText}
                          onChange={(e) => setWritingPromptText(e.target.value)}
                          placeholder="Ví dụ: Đề bài viết phản hồi email, bài luận tự luận TOPIK 54번 hoặc TOEIC Writing Task..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-amber-500 font-medium resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Ô 4: PHẦN NÓI (CHỈ KHI TOEIC 4 KỸ NĂNG HOẶC PRACTICE NÓI) */}
                  {activeSkillsList.includes('SPEAKING') && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Kỹ Năng Nói (Speaking)
                        </span>
                        <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                          Prompt nói & Audio
                        </span>
                      </div>

                      {/* Tải Audio Prompt bài Nói */}
                      <input
                        ref={speakingAudioInputRef}
                        type="file"
                        accept="audio/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSpeakingAudioFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />
                      <div
                        onClick={() => speakingAudioInputRef.current?.click()}
                        className="border border-dashed border-slate-300 hover:border-violet-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition"
                      >
                        <p className="text-xs font-bold text-slate-800">
                          {speakingAudioFile ? speakingAudioFile.name : 'Tải File Prompt Nói / Audio Đề Thi'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {speakingAudioFile ? 'Bấm để đổi file khác' : 'Kéo & thả file MP3/WAV âm thanh đề bài nói'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Kịch bản hoặc câu hỏi phỏng vấn nói:
                        </label>
                        <textarea
                          rows={2}
                          value={speakingPromptText}
                          onChange={(e) => setSpeakingPromptText(e.target.value)}
                          placeholder="Ví dụ: Đọc to đoạn văn phát âm, miêu tả tranh vẽ, hoặc bài phỏng vấn 45 giây..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-violet-500 font-medium resize-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* STUDIO DUYỆT & TINH CHỈNH CÂU HỎI TRỰC QUAN (THUẦN CHỮ KHÔNG ICON) */}
              {/* ========================================================================= */}
              {hasScanned && (
                <div className="space-y-6">
                  {/* THANH TABS KỸ NĂNG TRONG STUDIO */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-4 px-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500 mr-2 uppercase">
                        Xem chi tiết kỹ năng:
                      </span>
                      {activeSkillsList.includes('LISTENING') && (
                        <button
                          type="button"
                          onClick={() => setActiveReviewSkill('LISTENING')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeReviewSkill === 'LISTENING'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Kỹ Năng Nghe ({listeningQuestions.length} câu)
                        </button>
                      )}

                      {activeSkillsList.includes('READING') && (
                        <button
                          type="button"
                          onClick={() => setActiveReviewSkill('READING')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeReviewSkill === 'READING'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Kỹ Năng Đọc ({readingQuestions.length} câu)
                        </button>
                      )}

                      {activeSkillsList.includes('WRITING') && (
                        <button
                          type="button"
                          onClick={() => setActiveReviewSkill('WRITING')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeReviewSkill === 'WRITING'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Kỹ Năng Viết ({writingQuestions.length} câu)
                        </button>
                      )}

                      {activeSkillsList.includes('SPEAKING') && (
                        <button
                          type="button"
                          onClick={() => setActiveReviewSkill('SPEAKING')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeReviewSkill === 'SPEAKING'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Kỹ Năng Nói ({speakingQuestions.length} câu)
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
                    >
                      + Thêm câu hỏi vào phần này
                    </button>
                  </div>

                  {/* THÔNG BÁO LƯU THÀNH CÔNG NẾU CÓ */}
                  {saveSuccessMessage && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                      <p className="text-xs font-bold text-emerald-800">{saveSuccessMessage}</p>
                      <button
                        type="button"
                        onClick={() => navigate('/practice')}
                        className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800 transition cursor-pointer"
                      >
                        Vào trang làm bài thi
                      </button>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* THANH PHÂN TRANG THEO PART CÓ ANIMATION (CHẾ ĐỘ FULL_TEST) */}
                  {/* ========================================================================= */}
                  {examScanCategory === 'FULL_TEST' && (activeReviewSkill === 'LISTENING' || activeReviewSkill === 'READING') && currentSkillParts.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                              Phân Trang Theo Part / Dạng Bài
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                              {currentSkillParts.find((p) => p.partNumber === activePartNumber)?.partName || `Part ${activePartNumber}`}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {currentSkillParts.find((p) => p.partNumber === activePartNumber)?.description}
                          </p>
                        </div>

                        {/* NÚT ĐIỀU HƯỚNG TRANG TRƯỚC / TIẾP THEO */}
                        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                          <button
                            type="button"
                            disabled={currentSkillParts[0]?.partNumber === activePartNumber}
                            onClick={() => {
                              const idx = currentSkillParts.findIndex((p) => p.partNumber === activePartNumber);
                              if (idx > 0) {
                                setActivePartNumber(currentSkillParts[idx - 1].partNumber);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            Trang trước
                          </button>

                          <span className="text-xs font-extrabold text-slate-600 px-1">
                            Part {activePartNumber} / {currentSkillParts[currentSkillParts.length - 1]?.partNumber}
                          </span>

                          <button
                            type="button"
                            disabled={currentSkillParts[currentSkillParts.length - 1]?.partNumber === activePartNumber}
                            onClick={() => {
                              const idx = currentSkillParts.findIndex((p) => p.partNumber === activePartNumber);
                              if (idx >= 0 && idx < currentSkillParts.length - 1) {
                                setActivePartNumber(currentSkillParts[idx + 1].partNumber);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            Trang tiếp theo
                          </button>
                        </div>
                      </div>

                      {/* DANH SÁCH CÁC THẺ PART CHỌN NHANH */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {currentSkillParts.map((p) => {
                          const isActive = p.partNumber === activePartNumber;
                          return (
                            <button
                              key={p.partNumber}
                              type="button"
                              onClick={() => setActivePartNumber(p.partNumber)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                                isActive
                                  ? 'bg-blue-600 text-white shadow-xs scale-102'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                              }`}
                            >
                              {p.shortLabel}: {p.questionRange}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ========================================================================= */}
                  {/* DANH SÁCH CÂU HỎI THEO PART & PASSAGE GROUP CÓ ANIMATION CHUYỂN TRANG */}
                  {/* ========================================================================= */}
                  <div key={`${activeReviewSkill}-${activePartNumber}-${examScanCategory}`} className="space-y-5 transition-all duration-300 ease-in-out animate-fadeIn">
                    {groupedDisplayItems.map((item, itemIdx) => {
                      if (item.type === 'SINGLE') {
                        return renderQuestionCard(item.questions[0], itemIdx);
                      }

                      // KHỐI NHÓM CÂU HỎI DÙNG CHUNG MEDIA / BÀI ĐỌC (PASSAGE GROUP)
                      return (
                        <div
                          key={item.groupId || `group-${itemIdx}`}
                          className="bg-slate-50/70 border-2 border-dashed border-blue-200/90 rounded-3xl p-5 md:p-6 space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-600 text-white shadow-2xs">
                                  Nhóm câu liên kết ({item.questions.length} câu)
                                </span>
                                <h4 className="text-xs font-bold text-blue-900 tracking-wide uppercase">
                                  {item.groupTitle}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Các câu hỏi dưới đây cùng sử dụng chung nội dung bài đọc hoặc tài liệu đính kèm này.
                              </p>
                            </div>

                            <span className="text-[11px] font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                              Passage Group: {item.groupId}
                            </span>
                          </div>

                          {/* BÀI ĐỌC DÙNG CHUNG NẾU CÓ */}
                          {item.passageText && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-xs text-slate-800 leading-relaxed font-normal shadow-2xs space-y-1">
                              <span className="block text-[11px] font-bold text-slate-500 uppercase">
                                Nội dung bài đọc dùng chung:
                              </span>
                              <p className="whitespace-pre-line text-slate-700 font-medium">
                                {item.passageText}
                              </p>
                            </div>
                          )}

                          {/* DANH SÁCH CÁC CÂU HỎI CON TRONG NHÓM */}
                          <div className="space-y-4 pt-1">
                            {item.questions.map((subQ, subIdx) => renderQuestionCard(subQ, subIdx))}
                          </div>
                        </div>
                      );
                    })}

                    {/* NÚT THÊM CÂU HỎI MỚI NẰM NGAY DƯỚI CÂU HỎI CUỐI CÙNG CỦA DANH SÁCH */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full py-4 bg-white hover:bg-slate-50 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                      >
                        + Thêm câu hỏi mới vào danh sách này
                      </button>
                    </div>
                  </div>

                  {/* BOTTOM BAR CỐ ĐỊNH DUYỆT ĐỀ (THUẦN CHỮ KHÔNG ICON) */}
                  <div className="sticky bottom-6 z-30 bg-white border border-slate-200 p-4 px-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Đã chọn {totalQuestionsSelected} câu hỏi sẵn sàng lưu
                      </p>
                      <p className="text-xs text-slate-400">
                        Phân bổ theo {activeSkillsList.length} kỹ năng đã cấu hình.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTriggerAnalyze}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                      >
                        Quét lại đề
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveExam}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                      >
                        Lưu thành đề thi mới
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: PHÂN HỆ QUÉT TỪ VỰNG (VOCABULARY SCANNER - THUẦN CHỮ KHÔNG ICON) */}
          {/* ========================================================================= */}
          {scanMode === 'vocab' && (
            <div className="space-y-6">
              <input
                ref={vocabFileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedFile(file);
                    const pUrl = URL.createObjectURL(file);
                    setFilePreviewUrl(pUrl);
                    setIsScanning(true);
                    setProgressPercent(0);
                    setScannedPages([]);
                    setCurrentStepText('Đang phân tích các trang tài liệu từ vựng...');

                    docScannerService
                      .scanDocumentPages(file, pUrl, (p, tot, pct) => {
                        setCurrentPageScanning(p);
                        setTotalPagesCount(tot);
                        setProgressPercent(pct);
                        setCurrentStepText(`Đang quét nhận diện Trang ${p}/${tot}...`);
                      })
                      .then((pages) => {
                        setScannedPages(pages);
                        const initF: Record<number, 'ALL' | CEFRLevel> = {};
                        pages.forEach((page) => {
                          initF[page.pageNumber] = 'ALL';
                        });
                        setPageLevelFilters(initF);
                      })
                      .catch((err) => console.error(err))
                      .finally(() => setIsScanning(false));
                  }
                }}
                className="hidden"
              />

              {!selectedFile && (
                <div
                  onClick={() => vocabFileInputRef.current?.click()}
                  className="bg-white border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-3xl p-12 text-center transition-all cursor-pointer shadow-2xs"
                >
                  <span className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-3">
                    Khu vực tải file tài liệu
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Tải tài liệu trích xuất từ vựng (File ảnh hoặc PDF)
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Kéo & thả file vào đây, hoặc click để chọn từ máy tính. Hệ thống tự động phân loại theo khung tham chiếu CEFR A1 - C2.
                  </p>
                </div>
              )}

              {/* TIẾN TRÌNH QUÉT TỪ VỰNG */}
              {isScanning && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{currentStepText}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* KẾT QUẢ CÁC TRANG TỪ VỰNG */}
              {!isScanning && scannedPages.length > 0 && (
                <div className="space-y-6">
                  {scannedPages.map((page) => {
                    const pageVocabs = page.vocabularies || [];
                    const currentFilter = pageLevelFilters[page.pageNumber] || 'ALL';
                    const filteredPageVocabs = pageVocabs.filter(
                      (v) => currentFilter === 'ALL' || v.level === currentFilter
                    );

                    return (
                      <div
                        key={page.pageNumber}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5"
                      >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                          <h3 className="text-base font-bold text-slate-900">
                            {page.pageTitle || `Trang số ${page.pageNumber}`}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(page.rawText || '');
                                setCopiedStatus((prev) => ({ ...prev, [page.pageNumber]: true }));
                                setTimeout(() => setCopiedStatus((prev) => ({ ...prev, [page.pageNumber]: false })), 2000);
                              }}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer"
                            >
                              {copiedStatus[page.pageNumber] ? 'Đã sao chép văn bản' : 'Sao chép văn bản'}
                            </button>
                          </div>
                        </div>

                        {/* Văn bản OCR */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Văn bản OCR nhận diện được từ trang:
                          </label>
                          <textarea
                            rows={3}
                            value={page.rawText}
                            onChange={(e) => {
                              const newText = e.target.value;
                              setScannedPages((prev) =>
                                prev.map((p) => (p.pageNumber === page.pageNumber ? { ...p, rawText: newText } : p))
                              );
                            }}
                            className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono resize-none bg-slate-50/50"
                          />
                        </div>

                        {/* Bộ lọc cấp độ CEFR dạng nút chữ */}
                        <div className="flex items-center gap-2 flex-wrap pt-2">
                          <span className="text-xs font-bold text-slate-600 mr-1">Bộ lọc CEFR:</span>
                          <button
                            type="button"
                            onClick={() => setPageLevelFilters((prev) => ({ ...prev, [page.pageNumber]: 'ALL' }))}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                              currentFilter === 'ALL'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            Tất cả ({pageVocabs.length})
                          </button>
                          {CEFR_LEVELS.map((lvl) => {
                            const count = pageVocabs.filter((v) => v.level === lvl).length;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => setPageLevelFilters((prev) => ({ ...prev, [page.pageNumber]: lvl }))}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                  currentFilter === lvl
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {lvl} ({count})
                              </button>
                            );
                          })}
                        </div>

                        {/* Grid từ vựng */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredPageVocabs.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => {
                                setScannedPages((prev) =>
                                  prev.map((p) => {
                                    if (p.pageNumber !== page.pageNumber) return p;
                                    return {
                                      ...p,
                                      vocabularies: (p.vocabularies || []).map((item) =>
                                        item.id === v.id ? { ...item, selected: !item.selected } : item
                                      ),
                                    };
                                  })
                                );
                              }}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                                v.selected
                                  ? 'border-blue-500 bg-blue-50/40'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={v.selected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-blue-600 cursor-pointer mt-0.5"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">{v.term}</h4>
                                  <Pill tone="info">{v.level}</Pill>
                                </div>
                                {v.ipa && <p className="text-[11px] text-slate-400 font-mono">{v.ipa}</p>}
                                <p className="text-xs text-slate-700 mt-1 font-medium">{v.definition}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Nút lưu từ vựng nổi */}
                  <div className="sticky bottom-6 z-30 bg-white border border-slate-200 p-4 px-6 rounded-3xl shadow-lg flex items-center justify-between gap-4">
                    <p className="text-xs font-bold text-slate-800">
                      Đã chọn {scannedPages.flatMap((p) => p.vocabularies || []).filter((v) => v.selected).length} từ vựng
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddToSetOpen(true)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs"
                    >
                      Lưu vào Bộ thẻ / Thư mục
                    </button>
                  </div>
                </div>
              )}

              {/* Modal lưu từ vựng */}
              <AddToSetModal
                isOpen={isAddToSetOpen}
                onClose={() => setIsAddToSetOpen(false)}
                selectedVocabs={scannedPages.flatMap((p) => p.vocabularies || []).filter((v) => v.selected)}
                selectedVocabularies={scannedPages.flatMap((p) => p.vocabularies || []).filter((v) => v.selected)}
                onSuccess={() => setIsAddToSetOpen(false)}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODAL XEM ẢNH KÍCH THƯỚC LỚN (NẾU CLICK VÀO ẢNH CÂU HỎI) */}
          {/* ========================================================================= */}
          {enlargedImageUrl && (
            <div
              onClick={() => setEnlargedImageUrl(null)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase">
                    Ảnh Minh Họa Câu Hỏi (Kích Thước Gốc)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEnlargedImageUrl(null)}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
                <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 rounded-2xl p-2 border border-slate-200">
                  <img
                    src={enlargedImageUrl}
                    alt="Phóng to ảnh câu hỏi"
                    className="max-h-[65vh] object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VocaScanDocumentPage;
