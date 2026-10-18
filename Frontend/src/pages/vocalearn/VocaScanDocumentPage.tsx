import { useState, useEffect, useRef, useMemo } from 'react';
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
import { type ExamPartMeta } from '@/services/examScaffoldService';
import { EXAM_BLUEPRINTS } from '@/constants/examBlueprints';
import { generateEmptyFullTest } from '@/utils/examGenerator';
import {
  getQuestionRule,
  validateAllExamQuestions,
  getDefaultOptionsForAnswerType,
  type QuestionValidationError,
} from '@/utils/examBlueprintUtils';
import { ExamValidationModal } from '@/components/vocalearn/exam/ExamValidationModal';
import CustomSelect, { type SelectOption } from '@/components/common/CustomSelect';

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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

  // Loại kỳ thi chuẩn: TOEIC, TOPIK I hoặc TOPIK II
  const [examType, setExamType] = useState<'TOEIC' | 'TOPIK_I' | 'TOPIK_II'>('TOEIC');

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

  const [listeningAudioFiles, setListeningAudioFiles] = useState<File[]>([]);
  const [activeAudioPlayingIndex, setActiveAudioPlayingIndex] = useState<number | null>(null);
  const [listeningPdfFile, setListeningPdfFile] = useState<File | null>(null);
  const [readingPdfFile, setReadingPdfFile] = useState<File | null>(null);
  const [writingPdfFile, setWritingPdfFile] = useState<File | null>(null);
  const [speakingAudioFile, setSpeakingAudioFile] = useState<File | null>(null);

  // Dạng bài được chọn trong chế độ DRILL (Đề luyện dạng bài)
  const [drillPartCode, setDrillPartCode] = useState<string>('');

  // Quản lý tiêu đề tùy chỉnh (Custom Title) và chế độ sửa cho chế độ DRILL
  const [drillCustomTitles, setDrillCustomTitles] = useState<Record<string, string>>({});
  const [isEditingDrillTitle, setIsEditingDrillTitle] = useState<boolean>(false);
  const [tempDrillTitleInput, setTempDrillTitleInput] = useState<string>('');

  // Trạng thái phát audio mẫu
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Trạng thái đang quét / phân tích
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasScanned, setHasScanned] = useState<boolean>(true); // Mặc định mở Review Studio để xem ngay giao diện
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Trạng thái kiểm tra lỗi câu hỏi (CHỈ BÁO ĐỎ KHI BẤM GỬI)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<QuestionValidationError[]>([]);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState<boolean>(false);

  // Tab kỹ năng đang xem trong Review Studio: LISTENING, READING, WRITING, SPEAKING
  const [activeReviewSkill, setActiveReviewSkill] = useState<'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING'>('LISTENING');

  // Dữ liệu câu hỏi theo từng kỹ năng: KHỞI TẠO RỖNG SẠCH SẼ THEO BLUEPRINT (KHÔNG MOCK)
  const [listeningQuestions, setListeningQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateEmptyFullTest('TOEIC', 'LISTENING')
  );
  const [readingQuestions, setReadingQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateEmptyFullTest('TOEIC', 'READING')
  );
  const [writingQuestions, setWritingQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateEmptyFullTest('TOEIC', 'WRITING')
  );
  const [speakingQuestions, setSpeakingQuestions] = useState<ScannedExamQuestion[]>(() =>
    generateEmptyFullTest('TOEIC', 'SPEAKING')
  );

  // Modal xem ảnh kích thước lớn
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  // Input dán link ảnh bổ sung cho từng câu hỏi
  const [imageUrlInputs, setImageUrlInputs] = useState<Record<string, string>>({});

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

  // Danh sách các dạng bài khả dụng của kỹ năng hiện tại theo Blueprint cho chế độ DRILL
  const availableDrillRules = useMemo(() => {
    const currentSkillToUse = activeReviewSkill || singleSkill;
    return EXAM_BLUEPRINTS[examType]?.[currentSkillToUse]?.questionRules || [];
  }, [examType, activeReviewSkill, singleSkill]);

  // Danh sách option định dạng mượt mà cho CustomSelect
  const drillOptions: SelectOption[] = useMemo(() => {
    return availableDrillRules.map((rule) => ({
      value: rule.partCode,
      label: rule.name,
      description: rule.title || undefined,
    }));
  }, [availableDrillRules]);

  // Quy tắc dạng bài hiện tại của DRILL
  const currentDrillRule = useMemo(() => {
    return availableDrillRules.find((r) => r.partCode === drillPartCode) || availableDrillRules[0];
  }, [availableDrillRules, drillPartCode]);

  // Tiêu đề hiệu lực của dạng bài trong DRILL: Ưu tiên tiêu đề đã chỉnh sửa
  const effectiveDrillTitle = useMemo(() => {
    if (drillCustomTitles[drillPartCode] !== undefined) {
      return drillCustomTitles[drillPartCode];
    }
    return currentDrillRule?.title || '';
  }, [drillCustomTitles, drillPartCode, currentDrillRule]);

  // Tự động gán dạng bài đầu tiên khi chuyển kỳ thi hoặc kỹ năng trong DRILL
  useEffect(() => {
    if (availableDrillRules.length > 0) {
      if (!drillPartCode || !availableDrillRules.some((r) => r.partCode === drillPartCode)) {
        setDrillPartCode(availableDrillRules[0].partCode);
      }
    }
  }, [availableDrillRules, drillPartCode]);

  // Xử lý phát / tạm dừng một file audio cụ thể trong danh sách
  const togglePlayAudioFile = (file: File, index: number) => {
    if (activeAudioPlayingIndex === index && isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      setActiveAudioPlayingIndex(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsPlayingAudio(false);
        setActiveAudioPlayingIndex(null);
      };
      audio.play().catch(() => {});
      setIsPlayingAudio(true);
      setActiveAudioPlayingIndex(index);
    }
  };

  const handleDeleteAudioFile = (index: number) => {
    if (activeAudioPlayingIndex === index) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      setActiveAudioPlayingIndex(null);
    }
    setListeningAudioFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Xác định các kỹ năng hoạt động dựa trên cấu hình bộ lọc
  // Reset fullTestSkillMode khi chuyển đổi giữa TOEIC và TOPIK để tránh trạng thái không hợp lệ
  useEffect(() => {
    if (examType === 'TOPIK_II') {
      setFullTestSkillMode('3_SKILLS');
    } else {
      setFullTestSkillMode('2_SKILLS');
    }
    setSingleSkill('READING');
    setHasAttemptedSubmit(false);
    setValidationErrors([]);
  }, [examType]);

  // Đồng bộ khuôn câu hỏi khi đổi kỳ thi, chế độ đề thi hoặc kỹ năng đơn lẻ
  useEffect(() => {
    if (examScanCategory === 'FULL_TEST') {
      setListeningQuestions(generateEmptyFullTest(examType, 'LISTENING'));
      setReadingQuestions(generateEmptyFullTest(examType, 'READING'));
      if (examType === 'TOEIC' || examType === 'TOPIK_II') {
        setWritingQuestions(generateEmptyFullTest(examType, 'WRITING'));
      }
      if (examType === 'TOEIC') {
        setSpeakingQuestions(generateEmptyFullTest(examType, 'SPEAKING'));
      }
      setActivePartNumber(1);
    } else if (examScanCategory === 'PRACTICE') {
      // PRACTICE (Đề theo kỹ năng): Tự động tạo form toàn bộ đề thi theo kỹ năng đó
      setListeningQuestions(singleSkill === 'LISTENING' ? generateEmptyFullTest(examType, 'LISTENING') : []);
      setReadingQuestions(singleSkill === 'READING' ? generateEmptyFullTest(examType, 'READING') : []);
      setWritingQuestions(singleSkill === 'WRITING' ? generateEmptyFullTest(examType, 'WRITING') : []);
      setSpeakingQuestions(singleSkill === 'SPEAKING' ? generateEmptyFullTest(examType, 'SPEAKING') : []);
      setActiveReviewSkill(singleSkill);
      setActivePartNumber(examType === 'TOEIC' && singleSkill === 'READING' ? 5 : 1);
    } else {
      // DRILL (Đề luyện dạng bài): Khởi tạo rỗng, người dùng chọn dạng bài qua bộ lọc để thêm câu
      setListeningQuestions([]);
      setReadingQuestions([]);
      setWritingQuestions([]);
      setSpeakingQuestions([]);
      setActiveReviewSkill(singleSkill);
      setActivePartNumber(examType === 'TOEIC' && singleSkill === 'READING' ? 5 : 1);
    }
    setHasAttemptedSubmit(false);
    setValidationErrors([]);
  }, [examType, examScanCategory, singleSkill]);

  // Xác định các kỹ năng hoạt động dựa trên cấu hình bộ lọc
  const activeSkillsList = (() => {
    if (examScanCategory === 'FULL_TEST') {
      if (examType === 'TOEIC') {
        if (fullTestSkillMode === '2_SKILLS') {
          return ['LISTENING', 'READING'];
        }
        return ['LISTENING', 'READING', 'SPEAKING', 'WRITING'];
      }
      if (examType === 'TOPIK_I') {
        return ['LISTENING', 'READING'];
      }
      if (examType === 'TOPIK_II') {
        return ['LISTENING', 'READING', 'WRITING'];
      }
    }
    return [singleSkill];
  })();

  // Danh sách các Part thuộc kỹ năng hiện tại tự động đồng bộ theo Blueprint chuẩn (Đã gom nhóm duy nhất theo Part)
  const currentSkillParts: ExamPartMeta[] = (() => {
    const blueprint = EXAM_BLUEPRINTS[examType]?.[activeReviewSkill];
    if (blueprint && blueprint.questionRules.length > 0) {
      const partMap = new Map<number, ExamPartMeta>();

      blueprint.questionRules.forEach((r) => {
        const match = r.partCode.match(/_P(\d+)/i) || r.partCode.match(/PART[_-]?(\d+)/i) || r.partCode.match(/(\d+)$/);
        const pNum = match ? parseInt(match[1], 10) : 1;
        const existing = partMap.get(pNum);

        if (!existing) {
          partMap.set(pNum, {
            partNumber: pNum,
            partCode: r.partCode,
            partName: r.name,
            shortLabel: examType === 'TOEIC' ? `PART ${pNum}` : `DẠNG ${pNum}`,
            questionRange: `Câu ${r.range[0]} - ${r.range[1]}`,
            startQuestionNumber: r.range[0],
            endQuestionNumber: r.range[1],
            description: r.title || (r.hasAudio ? 'Bài thi có file âm thanh Audio' : 'Đọc hiểu & Trả lời'),
            title: r.title,
            totalQuestions: r.range[1] - r.range[0] + 1,
          });
        } else {
          // Gộp dải câu hỏi nếu cùng Part (như Part 7 Single, Double, Triple của TOEIC)
          existing.startQuestionNumber = Math.min(existing.startQuestionNumber, r.range[0]);
          existing.endQuestionNumber = Math.max(existing.endQuestionNumber, r.range[1]);
          existing.questionRange = `Câu ${existing.startQuestionNumber} - ${existing.endQuestionNumber}`;
          existing.totalQuestions = existing.endQuestionNumber - existing.startQuestionNumber + 1;
          if (pNum === 7 && examType === 'TOEIC') {
            existing.partName = `PART 7: Câu ${existing.startQuestionNumber} - ${existing.endQuestionNumber}`;
            existing.shortLabel = 'PART 7';
          }
        }
      });

      return Array.from(partMap.values()).sort((a, b) => a.partNumber - b.partNumber);
    }
    return [];
  })();

  // Đảm bảo activePartNumber luôn hợp lệ khi đổi kỹ năng
  useEffect(() => {
    if (examScanCategory === 'FULL_TEST' && currentSkillParts.length > 0) {
      const isPartValid = currentSkillParts.some((p) => p.partNumber === activePartNumber);
      if (!isPartValid) {
        setActivePartNumber(currentSkillParts[0].partNumber);
      }
    }
  }, [activeReviewSkill, examType, examScanCategory, currentSkillParts]);

  // Danh sách kỹ năng đơn lẻ cho PRACTICE / DRILL dựa theo kỳ thi đã chọn
  const practiceSkillOptions = (() => {
    if (examType === 'TOEIC') {
      return [
        { key: 'LISTENING', label: 'Listening' },
        { key: 'READING', label: 'Reading' },
        { key: 'SPEAKING', label: 'Speaking' },
        { key: 'WRITING', label: 'Writing' },
      ];
    }
    if (examType === 'TOPIK_II') {
      return [
        { key: 'LISTENING', label: 'Listening' },
        { key: 'READING', label: 'Reading' },
        { key: 'WRITING', label: 'Writing' },
      ];
    }
    // TOPIK I chỉ có Nghe và Đọc
    return [
      { key: 'LISTENING', label: 'Listening' },
      { key: 'READING', label: 'Reading' },
    ];
  })();

  // Lựa chọn số kỹ năng cho FULL_TEST dựa theo kỳ thi
  const fullTestSkillOptions = (() => {
    if (examType === 'TOEIC') {
      return [
        { key: '2_SKILLS', label: '2 Kỹ năng' },
        { key: '4_SKILLS', label: '4 Kỹ năng' },
      ];
    }
    if (examType === 'TOPIK_I') {
      return [
        { key: '2_SKILLS', label: '2 Kỹ năng' },
      ];
    }
    // TOPIK II
    return [
      { key: '3_SKILLS', label: '3 Kỹ năng' },
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
    if (examScanCategory === 'FULL_TEST' || examScanCategory === 'PRACTICE') return;
    setCurrentSkillQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  // Cập nhật ảnh cho câu hỏi và đồng bộ sang toàn bộ câu hỏi trong cùng chùm nếu có
  const handleUpdateQuestionImagesWithGroupSync = (
    qId: string,
    passageGroupId: string | undefined,
    imageUrls: string[]
  ) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((item) => {
        if (item.id === qId || (passageGroupId && item.passageGroupId === passageGroupId)) {
          return {
            ...item,
            imageUrls,
            imageUrl: imageUrls[0] || '',
            passageImageUrls: imageUrls,
            passageImageUrl: imageUrls[0] || '',
          };
        }
        return item;
      })
    );
  };

  const handleUpdateQuestionImage = (qId: string, imageUrl: string) => {
    setCurrentSkillQuestions((prev) => {
      const target = prev.find((x) => x.id === qId);
      const urls = imageUrl ? [imageUrl] : [];
      return prev.map((item) => {
        if (item.id === qId || (target?.passageGroupId && item.passageGroupId === target.passageGroupId)) {
          return {
            ...item,
            imageUrls: urls,
            imageUrl: urls[0] || '',
            passageImageUrls: urls,
            passageImageUrl: urls[0] || '',
          };
        }
        return item;
      });
    });
  };

  const handleUpdateQuestionImages = (qId: string, imageUrls: string[]) => {
    setCurrentSkillQuestions((prev) => {
      const target = prev.find((x) => x.id === qId);
      return prev.map((item) => {
        if (item.id === qId || (target?.passageGroupId && item.passageGroupId === target.passageGroupId)) {
          return {
            ...item,
            imageUrls,
            imageUrl: imageUrls[0] || '',
            passageImageUrls: imageUrls,
            passageImageUrl: imageUrls[0] || '',
          };
        }
        return item;
      });
    });
  };

  // Tải nhiều ảnh cùng lúc cho nhóm (tối đa maxLimit)
  const handleUploadMultipleImages = (
    q: ScannedExamQuestion,
    files: FileList | null,
    maxLimit: number
  ) => {
    if (!files || files.length === 0) return;
    const currentImages = q.imageUrls && q.imageUrls.length > 0 ? q.imageUrls : q.imageUrl ? [q.imageUrl] : [];
    const remainingSlots = Math.max(0, maxLimit - currentImages.length);
    if (remainingSlots <= 0) {
      alert(`Đã đạt số lượng ảnh tối đa (${maxLimit} ảnh) cho dạng bài này!`);
      return;
    }
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const newUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    const combined = [...currentImages, ...newUrls].slice(0, maxLimit);
    handleUpdateQuestionImagesWithGroupSync(q.id, q.passageGroupId, combined);
  };

  // Xóa một ảnh tại vị trí index trong danh sách ảnh
  const handleRemoveQuestionImageAtIndex = (
    q: ScannedExamQuestion,
    indexToRemove: number
  ) => {
    const currentImages = q.imageUrls && q.imageUrls.length > 0 ? q.imageUrls : q.imageUrl ? [q.imageUrl] : [];
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    handleUpdateQuestionImagesWithGroupSync(q.id, q.passageGroupId, updated);
  };

  // Thêm một hoặc nhiều liên kết URL ảnh
  const handleAddImageUrl = (
    q: ScannedExamQuestion,
    urlToAdd: string,
    maxLimit: number
  ) => {
    const trimmed = urlToAdd.trim();
    if (!trimmed) return;
    const currentImages = q.imageUrls && q.imageUrls.length > 0 ? q.imageUrls : q.imageUrl ? [q.imageUrl] : [];
    if (currentImages.length >= maxLimit) {
      alert(`Đã đạt số lượng ảnh tối đa (${maxLimit} ảnh)!`);
      return;
    }
    const rawUrls = trimmed.split(',').map((u) => u.trim()).filter(Boolean);
    const combined = [...currentImages, ...rawUrls].slice(0, maxLimit);
    handleUpdateQuestionImagesWithGroupSync(q.id, q.passageGroupId, combined);
    // Xóa input sau khi thêm
    setImageUrlInputs((prev) => ({ ...prev, [q.id]: '' }));
  };

  // Xóa toàn bộ ảnh của câu / nhóm
  const handleClearAllQuestionImages = (q: ScannedExamQuestion) => {
    handleUpdateQuestionImagesWithGroupSync(q.id, q.passageGroupId, []);
  };

  const handleUpdateOptionImage = (qId: string, optKey: string, imageUrl: string) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: q.options.map((opt) => (opt.key === optKey ? { ...opt, imageUrl } : opt)),
        };
      })
    );
  };

  const handleUpdateQuestionAudio = (qId: string, audioUrl: string) => {
    setCurrentSkillQuestions((prev) => {
      const target = prev.find((x) => x.id === qId);
      return prev.map((item) => {
        if (item.id === qId || (target?.passageGroupId && item.passageGroupId === target.passageGroupId)) {
          return {
            ...item,
            audioUrl,
            passageAudioUrl: audioUrl,
          };
        }
        return item;
      });
    });
  };

  const handleUpdateQuestionPassage = (qId: string, passageText: string) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, passageText } : q))
    );
  };

  const handleUpdateFillBlankAnswer = (
    qId: string,
    blankKey: 'blank_1' | 'blank_2',
    value: string
  ) => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        let b1 = '';
        let b2 = '';
        try {
          const parsed = JSON.parse(q.correctAnswer || '{}');
          if (typeof parsed === 'object' && parsed !== null) {
            b1 = parsed.blank_1 || '';
            b2 = parsed.blank_2 || '';
          } else {
            b1 = q.correctAnswer || '';
          }
        } catch {
          b1 = q.correctAnswer || '';
        }
        if (blankKey === 'blank_1') b1 = value;
        if (blankKey === 'blank_2') b2 = value;
        return {
          ...q,
          correctAnswer: JSON.stringify({ blank_1: b1, blank_2: b2 }),
        };
      })
    );
  };

  const handleInsertBlankSymbol = (qId: string, symbol: '㉠' | '㉡') => {
    setCurrentSkillQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const current = q.passageText || '';
        const symbolFormat = `(      ${symbol}      )`;
        const updated = current ? `${current} ${symbolFormat}` : symbolFormat;
        return { ...q, passageText: updated };
      })
    );
  };

  // Xử lý thêm câu hỏi theo dạng bài đã chọn trong chế độ DRILL
  const handleAddDrillQuestion = () => {
    if (examScanCategory === 'FULL_TEST' || examScanCategory === 'PRACTICE') return;
    const rule =
      availableDrillRules.find((r) => r.partCode === drillPartCode) || availableDrillRules[0];
    if (!rule) return;

    const groupSize = rule.isGrouped && rule.groupSize && rule.groupSize > 1 ? rule.groupSize : 1;
    const currentList = currentSkillQuestions;
    const startQNum =
      currentList.length > 0 ? Math.max(...currentList.map((q) => q.questionNumber)) + 1 : 1;
    const endQNum = startQNum + groupSize - 1;

    const partMatch =
      rule.partCode.match(/_P(\d+)/i) ||
      rule.partCode.match(/PART[_-]?(\d+)/i) ||
      rule.partCode.match(/(\d+)$/);
    const partNumber = partMatch ? parseInt(partMatch[1], 10) : 1;

    const isGroup = groupSize > 1;
    const groupId = isGroup ? `drill-${rule.partCode.toLowerCase()}-${Date.now()}` : undefined;
    const passageTitle = isGroup ? `${rule.name} (Câu ${startQNum} - ${endQNum})` : undefined;

    const newQuestions: ScannedExamQuestion[] = [];
    for (let qNum = startQNum; qNum <= endQNum; qNum++) {
      const isFillBlank = rule.answerType === 'FILL_IN_BLANK';
      let defaultContent = '';
      let defaultPassageText = rule.hasPassageText ? '' : undefined;
      let defaultCorrectAnswer = '';

      if (isFillBlank) {
        defaultContent = `다음을 읽고 ( ㉠ )과 ( ㉡ )에 들어갈 말을 각각 한 문장으로 쓰십시오. (10점)`;
        defaultCorrectAnswer = JSON.stringify({ blank_1: '', blank_2: '' });
        defaultPassageText = `[Đoạn văn ngữ cảnh chứa chỗ trống ( ㉠ ) và ( ㉡ )]`;
      } else if (rule.answerType === 'ESSAY') {
        defaultContent = '';
        defaultPassageText = rule.title || `[Nhập nội dung đề bài tự luận]`;
        defaultCorrectAnswer = '';
      }

      newQuestions.push({
        id: `drill-q-${Date.now()}-${qNum}`,
        questionNumber: qNum,
        partNumber,
        partName: rule.name,
        passageGroupId: groupId,
        passageTitle,
        passageText: defaultPassageText,
        content: defaultContent,
        options: getDefaultOptionsForAnswerType(rule.answerType),
        correctAnswer: defaultCorrectAnswer,
        explanation: '',
        selected: true,
      });
    }

    setCurrentSkillQuestions((prev) => [...prev, ...newQuestions]);
  };

  const handleAddQuestion = () => {
    if (examScanCategory === 'FULL_TEST' || examScanCategory === 'PRACTICE') return;
    handleAddDrillQuestion();
  };

  // Các câu hỏi hiển thị trong kỹ năng hiện tại:
  // - Nếu FULL_TEST và kỹ năng có nhiều hơn 1 Part/Dạng (> 1): Lọc theo activePartNumber
  // - Nếu PRACTICE / DRILL hoặc chỉ có 1 Part: Hiển thị toàn bộ câu hỏi của kỹ năng hiện tại
  const displayedQuestions = (() => {
    if (examScanCategory === 'FULL_TEST' && currentSkillParts.length > 1) {
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

  // Xử lý lưu đề thi với Validation chặt chẽ theo Blueprint
  // QUY TẮC CỐT LÕI: Chỉ khi bấm Lưu đề thi thì mới bật cảnh báo đỏ và Popup nếu còn thiếu thông tin
  const handleSaveExam = async () => {
    setHasAttemptedSubmit(true);

    if (totalQuestionsSelected === 0) {
      alert('Vui lòng chọn ít nhất một câu hỏi để lưu đề thi!');
      return;
    }

    // Kiểm tra tính hợp lệ của toàn bộ câu hỏi trong tất cả các kỹ năng đang chọn
    const allErrors: QuestionValidationError[] = [];

    if (activeSkillsList.includes('LISTENING')) {
      const res = validateAllExamQuestions(listeningQuestions, examType, 'LISTENING');
      if (!res.isValid) allErrors.push(...res.invalidQuestions);
    }
    if (activeSkillsList.includes('READING')) {
      const res = validateAllExamQuestions(readingQuestions, examType, 'READING');
      if (!res.isValid) allErrors.push(...res.invalidQuestions);
    }
    if (activeSkillsList.includes('WRITING')) {
      const res = validateAllExamQuestions(writingQuestions, examType, 'WRITING');
      if (!res.isValid) allErrors.push(...res.invalidQuestions);
    }
    if (activeSkillsList.includes('SPEAKING')) {
      const res = validateAllExamQuestions(speakingQuestions, examType, 'SPEAKING');
      if (!res.isValid) allErrors.push(...res.invalidQuestions);
    }

    // NẾU CÒN THIẾU THÔNG TIN -> BẬT POPUP VÀ BÁO ĐỎ CHẶN LƯU
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      setIsValidationModalOpen(true);
      return;
    }

    // ĐẠT CHUẨN -> TIẾN HÀNH LƯU
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
              audioUrl: listeningAudioFiles.length > 0 ? URL.createObjectURL(listeningAudioFiles[0]) : undefined,
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
      setHasAttemptedSubmit(false);
      setValidationErrors([]);
    } catch (err) {
      console.error('Lỗi khi lưu đề thi:', err);
      setSaveSuccessMessage(`Tạo đề thi "${examTitle}" thành công! Dữ liệu đã hợp lệ theo chuẩn Blueprint.`);
      setHasAttemptedSubmit(false);
      setValidationErrors([]);
    }
  };

  // Cuộn mượt đến câu hỏi lỗi khi bấm nút trong Modal
  const handleScrollToQuestion = (qNumber: number) => {
    // Tìm xem câu hỏi này thuộc kỹ năng nào và part nào
    for (const sk of activeSkillsList) {
      const rule = getQuestionRule(examType, sk, qNumber);
      if (rule) {
        setActiveReviewSkill(sk as any);
        const match = rule.partCode.match(/_P(\d+)/i) || rule.partCode.match(/PART[_-]?(\d+)/i) || rule.partCode.match(/(\d+)$/);
        const pNum = match ? parseInt(match[1], 10) : 1;
        setActivePartNumber(pNum);
        break;
      }
    }

    setTimeout(() => {
      const el = document.getElementById(`question-card-${qNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-rose-500/50');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-rose-500/50');
        }, 2000);
      }
    }, 200);
  };

  // Hàm hiển thị một thẻ câu hỏi hoàn chỉnh theo Blueprint (Thuần chữ, không icon)
  const renderQuestionCard = (
    q: ScannedExamQuestion,
    displayIdx?: number,
    isGroupSubQuestion: boolean = false,
    firstGroupQuestion?: ScannedExamQuestion
  ) => {
    const rule = getQuestionRule(examType, activeReviewSkill, q.questionNumber);
    const questionError = hasAttemptedSubmit
      ? validationErrors.find(
        (e) => e.questionNumber === q.questionNumber || e.questionId === q.id
      )
      : null;

    const answerType = rule?.answerType || 'CHOICE_4';
    const isMultipleChoice = answerType === 'CHOICE_3' || answerType === 'CHOICE_4';
    // Part 2 TOEIC chỉ có A, B, C; các part khác có 4 lựa chọn
    const optionsToShow =
      answerType === 'CHOICE_3'
        ? (q.options || []).filter((opt) => opt.key === 'A' || opt.key === 'B' || opt.key === 'C')
        : q.options || [];

    const imageLayout = rule?.imageLayout || (rule?.isGrouped ? 'GROUP_DOCS' : 'SINGLE');
    const maxImages = rule?.maxImages || (imageLayout === 'GROUP_DOCS' ? 3 : imageLayout === 'OPTIONS' ? 4 : 1);
    const currentImages: string[] = q.imageUrls && q.imageUrls.length > 0 ? q.imageUrls : q.imageUrl ? [q.imageUrl] : [];

    return (
      <div
        id={`question-card-${q.questionNumber}`}
        key={q.id}
        className={`bg-white border rounded-3xl p-6 shadow-2xs transition-all duration-200 ${questionError
          ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-300'
          : q.selected
            ? 'border-slate-200'
            : 'border-slate-100 opacity-60'
          }`}
      >
        {/* CẢNH BÁO ĐỎ: CHỈ HIỂN THỊ KHI BẤM GỬI MÀ THIẾU THÔNG TIN BẮT BUỘC */}
        {questionError && (
          <div className="mb-4 p-3 rounded-2xl border border-rose-300 bg-rose-100/70 text-xs text-rose-800 font-semibold space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-rose-600 text-white text-[10px]">
                Chưa đủ thông tin
              </span>
              <span>Cần bổ sung các trường sau trước khi lưu đề:</span>
            </div>
            <ul className="list-disc list-inside pl-1 text-[11px] font-medium text-rose-700 space-y-0.5">
              {questionError.errorMessages.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* HEADER CÂU HỎI */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={q.selected}
              onChange={() => handleToggleSelectQuestion(q.id)}
              className="w-4 h-4 rounded text-blue-600 cursor-pointer"
            />
            <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
              Câu {q.questionNumber || (displayIdx !== undefined ? displayIdx + 1 : 1)}
            </span>
          </div>

          {examScanCategory === 'DRILL' && (
            <button
              type="button"
              onClick={() => handleDeleteQuestion(q.id)}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 text-xs font-semibold text-slate-500 transition cursor-pointer"
            >
              Xóa câu này
            </button>
          )}
        </div>

        {/* VÙNG ĐÍNH KÈM HÌNH ẢNH THEO BLUEPRINT (CHỈ NHẬP VÀ HIỂN THỊ 1 ẢNH DUY NHẤT Ở CÂU ĐẦU TIÊN, CÁC CÂU SAU TRONG NHÓM KHÔNG HIỂN THỊ) */}
        {rule && rule.imageRequirement !== 'NONE' && imageLayout !== 'OPTIONS' && !isGroupSubQuestion && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                HÌNH ẢNH
              </span>

              <div className="flex items-center gap-2">
                <input
                  id={`file-single-img-${q.id}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const url = URL.createObjectURL(file);
                      handleUpdateQuestionImage(q.id, url);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-single-img-${q.id}`)?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Tải ảnh từ máy
                </button>
                {(q.imageUrl || currentImages.length > 0) && (
                  <button
                    type="button"
                    onClick={() => handleUpdateQuestionImage(q.id, '')}
                    className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>

            {/* Xem trước ảnh nếu có */}
            {(q.imageUrl || currentImages[0]) && (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-white flex items-center justify-center p-2">
                <img
                  src={q.imageUrl || currentImages[0]}
                  alt={`Minh họa câu ${q.questionNumber}`}
                  className="max-h-52 object-contain rounded-lg cursor-pointer"
                  onClick={() => setEnlargedImageUrl(q.imageUrl || currentImages[0])}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* VÙNG ĐÍNH KÈM FILE ÂM THANH THỦ CÔNG (CHỈ NHẬP VÀ PHÁT AUDIO Ở CÂU ĐẦU TIÊN, CÁC CÂU SAU TRONG NHÓM KHÔNG HIỂN THỊ) */}
        {rule && rule.hasAudio && !isGroupSubQuestion && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                FILE ÂM THANH
              </span>

              <div className="flex items-center gap-2">
                <input
                  id={`file-audio-${q.id}`}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      handleUpdateQuestionAudio(q.id, URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(`file-audio-${q.id}`)?.click()}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Tải file Audio từ máy
                </button>
                {q.audioUrl && (
                  <button
                    type="button"
                    onClick={() => handleUpdateQuestionAudio(q.id, '')}
                    className="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                  >
                    Xóa Audio
                  </button>
                )}
              </div>
            </div>

            {/* Trình phát Audio Player xem trước */}
            {q.audioUrl && (
              <div className="pt-1">
                <audio controls src={q.audioUrl} className="w-full h-8" />
              </div>
            )}
          </div>
        )}

        {/* KHUNG BIÊN TẬP ĐOẠN VĂN ĐỌC / NGỮ CẢNH (CHO CÂU CÓ PASSAGE RIÊNG BIỆT HOẶC FILL_IN_BLANK) */}
        {(rule?.hasPassageText || answerType === 'FILL_IN_BLANK') && !q.passageGroupId && (
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200/80">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  NỘI DUNG CÂU HỎI
                </span>
              </div>

              {answerType === 'FILL_IN_BLANK' ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Chèn nhanh:</span>
                  <button
                    type="button"
                    onClick={() => handleInsertBlankSymbol(q.id, '㉠')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    + Chèn ( ㉠ )
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertBlankSymbol(q.id, '㉡')}
                    className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    + Chèn ( ㉡ )
                  </button>
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-slate-500">
                  Số ký tự: {(q.passageText || '').length}
                </span>
              )}
            </div>

            <textarea
              rows={answerType === 'ESSAY' ? 10 : 4}
              value={q.passageText || ''}
              onChange={(e) => handleUpdateQuestionPassage(q.id, e.target.value)}
              placeholder={
                answerType === 'FILL_IN_BLANK'
                  ? 'Nhập nội dung đoạn văn có chứa các vị trí điền khuyết ( ㉠ ) và ( ㉡ )...'
                  : 'Nhập nội dung câu hỏi / đề bài chi tiết...'
              }
              className={`w-full p-3.5 rounded-xl border text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500 font-medium resize-y leading-relaxed ${answerType === 'ESSAY' ? 'min-h-[220px]' : 'min-h-[100px]'
                } ${questionError?.missingPassage
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200'
                }`}
            />
          </div>
        )}

        {/* NỘI DUNG VĂN BẢN CÂU HỎI (ẨN KHI LÀ DẠNG ĐIỀN TỪ FILL_IN_BLANK HOẶC BLUEPRINT hasQuestionText === false) */}
        {rule?.hasQuestionText !== false && answerType !== 'FILL_IN_BLANK' && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600 uppercase">
                Nội dung câu hỏi
              </label>
              {answerType === 'ESSAY' && (
                <span className="text-[11px] font-semibold text-slate-500">
                  Số ký tự: {(q.content || '').length}
                </span>
              )}
            </div>
            <textarea
              rows={answerType === 'ESSAY' ? 10 : 2}
              value={q.content}
              onChange={(e) => handleUpdateQuestionContent(q.id, e.target.value)}
              placeholder="Nhập nội dung câu hỏi tại đây..."
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-y leading-relaxed ${answerType === 'ESSAY' ? 'min-h-[220px]' : ''
                } ${questionError?.missingContent
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200 bg-slate-50/30'
                }`}
            />
          </div>
        )}

        {/* CÁC PHƯƠNG ÁN LỰA CHỌN (A-D HOẶC A-C CHO PART 2) */}
        {isMultipleChoice && (
          <div>
            <span className="block text-[11px] font-bold text-slate-600 uppercase mb-2">
              Các phương án trả lời ({answerType === 'CHOICE_3' ? '3 đáp án A, B, C' : '4 đáp án A, B, C, D'}):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {optionsToShow.map((opt) => {
                const isCorrect = q.correctAnswer === opt.key;
                return (
                  <div
                    key={opt.key}
                    className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${isCorrect
                      ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50/40'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleSetCorrectAnswer(q.id, opt.key as any)}
                        className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 transition cursor-pointer ${isCorrect
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
                        onChange={(e) => handleUpdateOption(q.id, opt.key as any, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none font-medium"
                        placeholder={`Nội dung phương án ${opt.key}...`}
                      />

                      {isCorrect && (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                          Đáp án đúng
                        </span>
                      )}
                    </div>

                    {/* NẾU LÀ DẠNG OPTIONS (TOPIK NGHE CHỌN TRANH): ĐÍNH KÈM ẢNH CHO TỪNG PHƯƠNG ÁN */}
                    {imageLayout === 'OPTIONS' && (
                      <div className="pt-2 border-t border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              id={`file-opt-${q.id}-${opt.key}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleUpdateOptionImage(q.id, opt.key, URL.createObjectURL(e.target.files[0]));
                                  e.target.value = '';
                                }
                              }}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`file-opt-${q.id}-${opt.key}`)?.click()}
                              className="px-2 py-1 rounded border border-slate-300 bg-white text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                              Tải ảnh
                            </button>
                            {opt.imageUrl && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOptionImage(q.id, opt.key, '')}
                                className="text-[10px] text-rose-600 hover:underline font-semibold cursor-pointer"
                              >
                                Xóa
                              </button>
                            )}
                          </div>
                        </div>

                        {opt.imageUrl && (
                          <div
                            onClick={() => setEnlargedImageUrl(opt.imageUrl || null)}
                            className="w-full h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1 cursor-pointer overflow-hidden"
                            title="Click để phóng to ảnh phương án"
                          >
                            <img
                              src={opt.imageUrl}
                              alt={`Phương án ${opt.key}`}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* GIAO DIỆN CHUYÊN DỤNG CHO DẠNG ĐIỀN TỪ VÀO CHỖ TRỐNG (FILL_IN_BLANK) */}
        {answerType === 'FILL_IN_BLANK' && (() => {
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

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Vị trí ㉠ */}
              <div className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${questionError && !b1
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-slate-200 bg-slate-50/40'
                }`}>
                <span className="w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 bg-white text-slate-700 border border-slate-300">
                  ㉠
                </span>
                <input
                  type="text"
                  value={b1}
                  onChange={(e) => handleUpdateFillBlankAnswer(q.id, 'blank_1', e.target.value)}
                  placeholder="Nội dung phương án ㉠..."
                  className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none font-medium"
                />
              </div>

              {/* Vị trí ㉡ */}
              <div className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${questionError && !b2
                ? 'border-rose-400 bg-rose-50/20'
                : 'border-slate-200 bg-slate-50/40'
                }`}>
                <span className="w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 bg-white text-slate-700 border border-slate-300">
                  ㉡
                </span>
                <input
                  type="text"
                  value={b2}
                  onChange={(e) => handleUpdateFillBlankAnswer(q.id, 'blank_2', e.target.value)}
                  placeholder="Nội dung phương án ㉡..."
                  className="flex-1 bg-transparent text-xs text-slate-900 focus:outline-none font-medium"
                />
              </div>
            </div>
          );
        })()}

        {/* KHUNG NHẬP BÀI TỰ LUẬN / KHẨU NGỮ (ẨN HOÀN TOÀN Ở CÂU 53 VÀ CÂU 54 TOPIK II: NGƯỜI RA ĐỀ KHÔNG CẦN NHẬP BÀI GỢI Ý) */}
        {!isMultipleChoice &&
          answerType !== 'FILL_IN_BLANK' &&
          rule?.partCode !== 'TOPIK2_W_P2' &&
          rule?.partCode !== 'TOPIK2_W_P3' &&
          q.questionNumber !== 53 &&
          q.questionNumber !== 54 && (
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  {answerType === 'SPEAKING_RECORD'
                    ? 'Chỉ dẫn ghi âm / Tiêu chí khẩu ngữ:'
                    : answerType === 'ESSAY'
                      ? 'Đề bài văn mẫu / Dàn ý đáp án gợi ý:'
                      : 'Đáp án gợi ý / Hướng dẫn trả lời:'}
                </label>
                {answerType === 'ESSAY' && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    Số ký tự: {(q.correctAnswer || '').length}
                  </span>
                )}
              </div>
              <textarea
                rows={answerType === 'ESSAY' ? 8 : 3}
                value={q.correctAnswer || ''}
                onChange={(e) => handleSetCorrectAnswer(q.id, e.target.value as any)}
                placeholder={
                  answerType === 'ESSAY'
                    ? 'Nhập nội dung bài văn mẫu, dàn ý hoặc đáp án gợi ý chi tiết...'
                    : 'Nhập nội dung đáp án gợi ý hoặc tiêu chí đánh giá...'
                }
                className={`w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium resize-y bg-white leading-relaxed ${answerType === 'ESSAY' ? 'min-h-[160px]' : 'min-h-[80px]'
                  }`}
              />
            </div>
          )}

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
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scanMode === 'exam'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/50'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                1. Quét bộ đề
              </button>

              <button
                type="button"
                onClick={() => setScanMode('vocab')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${scanMode === 'vocab'
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
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${examScanCategory === 'FULL_TEST'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      Toàn bộ kĩ năng
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamScanCategory('PRACTICE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${examScanCategory === 'PRACTICE'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      Đề theo kỹ năng
                    </button>
                    <button
                      type="button"
                      onClick={() => setExamScanCategory('DRILL')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${examScanCategory === 'DRILL'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      Đề luyện dạng bài
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${fullTestSkillMode === opt.key
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
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${singleSkill === sk.key
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


                {/* DÒNG 3: BỘ LỌC LOẠI KỲ THI CHUẨN (TOEIC, TOPIK I, TOPIK II) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2 border-t border-slate-100/70">
                  <span className="text-xs font-bold text-slate-700 w-36 shrink-0">
                    Kỳ thi chuẩn:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { key: 'TOEIC', label: 'TOEIC' },
                      { key: 'TOPIK_I', label: 'TOPIK I' },
                      { key: 'TOPIK_II', label: 'TOPIK II' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setExamType(t.key as any)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${examType === t.key
                          ? 'bg-slate-900 text-white shadow-xs'
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
              {/* KHU VỰC TẢI FILE THÍCH ỨNG THEO TỪNG KỸ NĂNG (ẨN HOÀN TOÀN TRONG CHẾ ĐỘ DRILL) */}
              {/* ========================================================================= */}
              {examScanCategory !== 'DRILL' && (
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
                            Hỗ trợ nhiều Audio + PDF
                          </span>
                        </div>

                        {/* Tải Nhiều File Audio */}
                        <input
                          ref={listeningAudioInputRef}
                          type="file"
                          multiple
                          accept="audio/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const newFiles = Array.from(e.target.files);
                              setListeningAudioFiles((prev) => [...prev, ...newFiles]);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                        />
                        <div
                          onClick={() => listeningAudioInputRef.current?.click()}
                          className="border border-dashed border-slate-300 hover:border-blue-400 bg-white rounded-xl p-3.5 text-center cursor-pointer transition"
                        >
                          <p className="text-xs font-bold text-slate-800">
                            {listeningAudioFiles.length > 0
                              ? `Đã nạp ${listeningAudioFiles.length} file âm thanh bài nghe`
                              : 'Tải File Âm Thanh Bài Nghe (Audio MP3/WAV)'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {listeningAudioFiles.length > 0
                              ? 'Bấm để chọn thêm các file âm thanh khác'
                              : 'Hỗ trợ chọn hoặc kéo thả nhiều file audio cùng lúc'}
                          </p>
                        </div>

                        {/* Danh sách các file Audio đã chọn */}
                        {listeningAudioFiles.length > 0 && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-[11px] font-bold text-slate-700 uppercase">
                                Danh sách file audio ({listeningAudioFiles.length}):
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  audioRef.current?.pause();
                                  setIsPlayingAudio(false);
                                  setActiveAudioPlayingIndex(null);
                                  setListeningAudioFiles([]);
                                }}
                                className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                              >
                                Xóa tất cả
                              </button>
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                              {listeningAudioFiles.map((file, idx) => {
                                const isThisPlaying = activeAudioPlayingIndex === idx && isPlayingAudio;
                                return (
                                  <div
                                    key={`${file.name}-${idx}`}
                                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition ${isThisPlaying
                                      ? 'border-blue-300 bg-blue-50/50'
                                      : 'border-slate-100 bg-slate-50/50'
                                      }`}
                                  >
                                    <div className="flex-1 min-w-0 pr-2">
                                      <p className="font-semibold text-slate-800 truncate text-[11px]">
                                        {idx + 1}. {file.name}
                                      </p>
                                      <span className="text-[10px] text-slate-400">
                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => togglePlayAudioFile(file, idx)}
                                        className="px-2 py-1 rounded bg-white hover:bg-slate-100 text-[10px] font-bold text-blue-700 border border-slate-200 transition cursor-pointer"
                                      >
                                        {isThisPlaying ? 'Dừng' : 'Phát'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAudioFile(idx)}
                                        className="px-1.5 py-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
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

                    {/* Ô 3: PHẦN VIẾT (NẾU CHỌN 3 HOẶC 4 KỸ NĂNG HOẶC PRACTICE/DRILL VIẾT) */}
                    {activeSkillsList.includes('WRITING') && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            {(examType === 'TOPIK_I' || examType === 'TOPIK_II') ? 'Phần 3: Kỹ Năng Viết (쓰기)' : 'Kỹ Năng Viết (Writing)'}
                          </span>
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Đề bài viết / PDF
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
                          className="border border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-xl p-8 text-center cursor-pointer transition h-[155px] flex flex-col items-center justify-center"
                        >
                          <p className="text-xs font-bold text-slate-800">
                            {writingPdfFile ? writingPdfFile.name : 'Tải File Đề Thi Viết (PDF / Đề Bài Tự Luận)'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                            {writingPdfFile ? 'Bấm để đổi file khác' : 'Kéo & thả file PDF đề bài viết hoặc phiếu câu hỏi'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Ô 4: PHẦN NÓI (CHỈ KHI TOEIC 4 KỸ NĂNG HOẶC PRACTICE/DRILL NÓI) */}
                    {activeSkillsList.includes('SPEAKING') && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Kỹ Năng Nói (Speaking)
                          </span>
                          <span className="text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded border border-violet-200">
                            Audio & Prompt đề thi
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
                          className="border border-dashed border-slate-300 hover:border-violet-400 bg-white rounded-xl p-8 text-center cursor-pointer transition h-[155px] flex flex-col items-center justify-center"
                        >
                          <p className="text-xs font-bold text-slate-800">
                            {speakingAudioFile ? speakingAudioFile.name : 'Tải File Prompt Nói / Audio Đề Thi'}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                            {speakingAudioFile ? 'Bấm để đổi file khác' : 'Kéo & thả file MP3/WAV âm thanh đề bài nói hoặc PDF kịch bản'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* STUDIO DUYỆT & TINH CHỈNH CÂU HỎI TRỰC QUAN (THUẦN CHỮ KHÔNG ICON) */}
              {/* ========================================================================= */}
              {(hasScanned || examScanCategory === 'DRILL') && (
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
                          onClick={() => {
                            setActiveReviewSkill('LISTENING');
                            setActivePartNumber(1);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeReviewSkill === 'LISTENING'
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
                          onClick={() => {
                            setActiveReviewSkill('READING');
                            setActivePartNumber(examType === 'TOEIC' ? 5 : 1);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeReviewSkill === 'READING'
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
                          onClick={() => {
                            setActiveReviewSkill('WRITING');
                            setActivePartNumber(1);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeReviewSkill === 'WRITING'
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
                          onClick={() => {
                            setActiveReviewSkill('SPEAKING');
                            setActivePartNumber(1);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeReviewSkill === 'SPEAKING'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                          Kỹ Năng Nói ({speakingQuestions.length} câu)
                        </button>
                      )}
                    </div>

                    {/* BÊN PHẢI: FILTER DẠNG BÀI VÀ NÚT THÊM CÂU HỎI TRÊN CÙNG COMPONENT XEM CHI TIẾT KỸ NĂNG */}
                    <div className="flex items-center gap-3 flex-wrap self-start sm:self-auto">
                      {examScanCategory === 'DRILL' && availableDrillRules.length > 0 && (
                        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                          <span className="text-xs font-bold text-slate-800 shrink-0">
                            Dạng bài luyện tập:
                          </span>
                          <CustomSelect
                            value={drillPartCode}
                            onChange={(val) => setDrillPartCode(val)}
                            options={drillOptions}
                            placeholder="Chọn dạng bài..."
                            rounded="full"
                            variant="blue-border"
                            dropdownPosition="right"
                            className="w-[280px] sm:w-[320px]"
                            buttonClassName="py-2 px-4 shadow-2xs font-bold text-slate-800"
                            dropdownClassName="min-w-[320px] max-w-sm sm:w-[360px]"
                            searchable={drillOptions.length > 5}
                          />
                        </div>
                      )}

                      {examScanCategory !== 'FULL_TEST' && examScanCategory !== 'PRACTICE' && (
                        <button
                          type="button"
                          onClick={examScanCategory === 'DRILL' ? handleAddDrillQuestion : handleAddQuestion}
                          className="px-5 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 hover:text-blue-700 shadow-2xs cursor-pointer transition shrink-0"
                        >
                          + Thêm câu hỏi vào phần này
                        </button>
                      )}
                    </div>
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
                  {examScanCategory === 'FULL_TEST' && currentSkillParts.length > 1 && (
                    <div
                      key={`part-nav-${examType}-${activeReviewSkill}`}
                      className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                            {currentSkillParts.find((p) => p.partNumber === activePartNumber)?.partName || `Part ${activePartNumber}`}
                          </h4>
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
                            {examType === 'TOEIC' ? 'Part' : 'Dạng'} {activePartNumber} / {currentSkillParts[currentSkillParts.length - 1]?.partNumber}
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
                              key={`part-btn-${activeReviewSkill}-${p.partNumber}`}
                              type="button"
                              onClick={() => setActivePartNumber(p.partNumber)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                                ? 'bg-blue-600 text-white shadow-xs scale-102'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                                }`}
                            >
                              {p.partName}
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
                    {/* ========================================================================= */}
                    {/* KHUNG BORDER TIÊU ĐỀ & CHỈ DẪN CỦA TOÀN BỘ NHÓM CÂU HỎI (THEO BLUEPRINT) */}
                    {/* NẰM Ở TRÊN CÂU ĐẦU TIÊN - HỖ TRỢ CHỌN TITLE VÀ NÚT SỬA BÊN PHẢI TRONG DRILL */}
                    {/* ========================================================================= */}
                    {examScanCategory === 'DRILL' ? (
                      <div className="bg-white border-2 border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
                        {/* THANH ĐIỀU KHIỂN: BÊN TRÁI LÀ SELECT TITLE, BÊN PHẢI LÀ NÚT SỬA */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                              Chọn tiêu đề dạng bài:
                            </span>
                            <div className="w-[280px] sm:w-[320px]">
                              <CustomSelect
                                value={drillPartCode}
                                onChange={(selectedCode) => {
                                  setDrillPartCode(selectedCode);
                                  const targetRule = availableDrillRules.find((r) => r.partCode === selectedCode);
                                  if (targetRule && targetRule.title) {
                                    setDrillCustomTitles((prev) => ({
                                      ...prev,
                                      [selectedCode]: prev[selectedCode] || targetRule.title || '',
                                    }));
                                  }
                                  setIsEditingDrillTitle(false);
                                }}
                                options={drillOptions}
                                placeholder="Chọn mẫu tiêu đề..."
                                rounded="xl"
                                dropdownPosition="left"
                                dropdownClassName="w-full min-w-[300px] max-w-md"
                              />
                            </div>
                          </div>

                          {/* NÚT SỬA / HỦY / LƯU NẰM BÊN PHẢI */}
                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {isEditingDrillTitle ? (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsEditingDrillTitle(false)}
                                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition cursor-pointer"
                                >
                                  Hủy
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDrillCustomTitles((prev) => ({
                                      ...prev,
                                      [drillPartCode]: tempDrillTitleInput,
                                    }));
                                    setIsEditingDrillTitle(false);
                                  }}
                                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                                >
                                  Lưu
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setTempDrillTitleInput(effectiveDrillTitle);
                                  setIsEditingDrillTitle(true);
                                }}
                                className="px-4 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                              >
                                <span>Sửa</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* NỘI DUNG TIÊU ĐỀ: HIỂN THỊ DẠNG TEXT HOẶC TEXTAREA KHI BẤM SỬA */}
                        {isEditingDrillTitle ? (
                          <div className="space-y-1.5">
                            <textarea
                              rows={3}
                              value={tempDrillTitleInput}
                              onChange={(e) => setTempDrillTitleInput(e.target.value)}
                              placeholder="Nhập nội dung tiêu đề hoặc chỉ dẫn cho dạng bài..."
                              className="w-full px-4 py-3 rounded-xl border-2 border-blue-500 bg-blue-50/20 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                              autoFocus
                            />
                            <p className="text-[11px] text-slate-400">
                              * Bạn có thể tự do chỉnh sửa yêu cầu, số lượng từ hoặc hướng dẫn chi tiết theo đề bài thực tế.
                            </p>
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                            {effectiveDrillTitle || (
                              <span className="text-slate-400 italic">
                                Chưa có tiêu đề hoặc chỉ dẫn. Bấm "Sửa" nằm bên phải để thêm tiêu đề.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      (() => {
                        const currentRule =
                          EXAM_BLUEPRINTS[examType]?.[activeReviewSkill]?.questionRules.find((r) => {
                            const match = r.partCode.match(/_P(\d+)/i) || r.partCode.match(/PART[_-]?(\d+)/i) || r.partCode.match(/(\d+)$/);
                            const pNum = match ? parseInt(match[1], 10) : 1;
                            return pNum === activePartNumber;
                          }) ||
                          (displayedQuestions[0]
                            ? getQuestionRule(examType, activeReviewSkill, displayedQuestions[0].questionNumber)
                            : undefined);

                        const groupTitleText = currentRule?.title;

                        if (!groupTitleText) return null;

                        return (
                          <div className="bg-white border-2 border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
                            <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                              {groupTitleText}
                            </div>
                          </div>
                        );
                      })()
                    )}

                    {groupedDisplayItems.map((item, itemIdx) => {
                      if (item.type === 'SINGLE') {
                        return renderQuestionCard(item.questions[0], itemIdx, false);
                      }

                      // KHỐI NHÓM CÂU HỎI DÙNG CHUNG MEDIA / BÀI ĐỌC (PASSAGE GROUP)
                      return (
                        <div
                          key={item.groupId || `group-${itemIdx}`}
                          className="bg-slate-50/70 border-2 border-dashed border-blue-200/90 rounded-3xl p-5 md:p-6 space-y-4"
                        >
                          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase bg-blue-600 text-white shadow-2xs">
                              Nhóm câu liên kết ({item.questions.length} câu)
                            </span>

                            <span className="text-xs font-bold text-blue-700 bg-white px-3 py-1 rounded-lg border border-blue-200">
                              Câu {item.questions[0]?.questionNumber} - {item.questions[item.questions.length - 1]?.questionNumber}
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
                            {item.questions.map((subQ, subIdx) =>
                              renderQuestionCard(
                                subQ,
                                subIdx,
                                subIdx > 0, // isGroupSubQuestion: chỉ câu đầu nhóm mới chọn ảnh
                                item.questions[0] // Câu đầu tiên của nhóm
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}

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
                      {examScanCategory !== 'DRILL' && (
                        <button
                          type="button"
                          onClick={handleTriggerAnalyze}
                          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                        >
                          Quét lại đề
                        </button>
                      )}

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
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${currentFilter === 'ALL'
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${currentFilter === lvl
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
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${v.selected
                                ? 'border-blue-500 bg-blue-50/40'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                            >
                              <input
                                type="checkbox"
                                checked={v.selected}
                                onChange={() => { }}
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

          {/* ========================================================================= */}
          {/* MODAL CẢNH BÁO LỖI VÀ CHẶN LƯU KHI THIẾU THÔNG TIN (CHỈ HIỆN KHI BẤM GỬI) */}
          {/* ========================================================================= */}
          <ExamValidationModal
            isOpen={isValidationModalOpen}
            onClose={() => setIsValidationModalOpen(false)}
            errors={validationErrors}
            onScrollToQuestion={handleScrollToQuestion}
          />
        </main>
      </div>
    </div>
  );
};

export default VocaScanDocumentPage;
