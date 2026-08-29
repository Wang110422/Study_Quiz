import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  LogOut,
  Volume2,
  VolumeX,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  RotateCcw,
  FileCheck,
  Play,
  Pause,
  Maximize2,
  Headphones,
  Image as ImageIcon,
  HelpCircle,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
} from 'lucide-react';
import examService, {
  type ExamDTO,
  type SectionDTO,
  type PassageGroupDTO,
  type QuestionDTO,
} from '@/services/examService';

// ==============================================================================
// 🛠️ Helpers chuyển đổi Media (Audio / Image)
// ==============================================================================
const getMediaAudioUrl = (audioUrl?: string | null): string => {
  if (!audioUrl) return '';
  if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://') || audioUrl.startsWith('/')) {
    return audioUrl;
  }
  const filename = audioUrl.split(/[\\/]/).pop() || audioUrl;
  const cleanName = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  return `http://localhost:8080/media/audio/${cleanName}`;
};

const getMediaImageUrls = (imageUrl?: string | null): string[] => {
  if (!imageUrl || !imageUrl.trim()) return [];

  let rawList: string[] = [];
  const trimmed = imageUrl.trim();

  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      rawList = JSON.parse(trimmed);
    } catch {
      rawList = [trimmed];
    }
  } else if (trimmed.includes(',') || trimmed.includes(';') || trimmed.includes('|')) {
    rawList = trimmed.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
  } else {
    rawList = [trimmed];
  }

  return rawList.map((item) => {
    if (item.startsWith('http://') || item.startsWith('https://') || item.startsWith('/')) {
      return item;
    }
    const filename = item.split(/[\\/]/).pop() || item;
    const cleanName = filename.match(/\.(png|jpg|jpeg|webp|gif)$/i) ? filename : `${filename}.png`;
    return `http://localhost:8080/media/image/${cleanName}`;
  });
};

// ==============================================================================
// 📋 Hướng dẫn Directions chuẩn TOEIC theo từng Part
// ==============================================================================
const getToeicDirections = (toeicPart?: string | null, skill?: string): string => {
  switch (toeicPart) {
    case 'PART_1':
      return 'Directions: For each question in this part, you will hear four statements about a picture in your test book. When you hear the statements, you must select the one statement that best describes what you see in the picture. The statements will not be printed in your test book and will be spoken only one time.';
    case 'PART_2':
      return 'Directions: You will hear a question or statement and three responses spoken in English. They will not be printed in your test book and will be spoken only one time. Select the best response to the question or statement and mark the letter (A), (B), or (C).';
    case 'PART_3':
      return 'Directions: You will hear some conversations between two or more people. You will be asked to answer three questions about what the speakers say in each conversation. Select the best response to each question and mark the letter (A), (B), (C), or (D).';
    case 'PART_4':
      return 'Directions: You will hear some talks given by a single speaker. You will be asked to answer three questions about what the speaker says in each talk. Select the best response to each question and mark the letter (A), (B), (C), or (D).';
    case 'PART_5':
      return 'Directions: A word or phrase is missing in each of the sentences below. Four answer choices are given below each sentence. Select the best answer to complete the sentence and mark the letter (A), (B), (C), or (D).';
    case 'PART_6':
      return 'Directions: Read the texts that follow. A word, phrase, or sentence is missing in parts of each text. Four answer choices for each question are given below each text. Select the best answer to complete the text.';
    case 'PART_7':
      return 'Directions: In this part you will read a selection of texts, such as notices, letters, and articles. Each text is followed by several questions. Select the best answer for each question and mark the letter (A), (B), (C), or (D).';
    default:
      return skill === 'LISTENING' || skill === 'Listening'
        ? 'Directions: Listen carefully to the recording and choose the best answer for each question.'
        : 'Directions: Read the questions carefully and select the best answer for each item.';
  }
};

// ==============================================================================
// 🎵 Component Trình Phát Audio Hiện Đại
// ==============================================================================
interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  label?: string;
}

const ExamAudioPlayer: React.FC<AudioPlayerProps> = ({ src, label }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [error, setError] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setError(true));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const replay5s = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
    }
  };

  const changeRate = () => {
    const rates = [1.0, 1.25, 1.5, 0.8];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const formatSec = (s: number) => {
    if (isNaN(s)) return '00:00';
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-950 p-4 text-white shadow-md border border-purple-800/40">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onError={() => setError(true)}
      />

      <div className="flex items-center justify-between gap-3 text-xs mb-2">
        <div className="flex items-center gap-2 text-purple-200 font-bold truncate">
          <Headphones className="w-4 h-4 text-purple-400 shrink-0" />
          <span className="truncate">{label || 'Audio bài nghe'}</span>
        </div>
        <span className="font-mono text-purple-300 shrink-0">
          {formatSec(currentTime)} / {formatSec(duration)}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="w-full h-1.5 bg-purple-950/80 rounded-lg appearance-none cursor-pointer accent-purple-400 mb-3"
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white shadow-xs transition cursor-pointer"
            title={isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={replay5s}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-purple-200 transition cursor-pointer"
            title="Lùi lại 5 giây"
          >
            -5s
          </button>
        </div>

        <button
          type="button"
          onClick={changeRate}
          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-purple-300 transition cursor-pointer"
          title="Tốc độ phát"
        >
          {playbackRate}x
        </button>
      </div>

      {error && (
        <p className="mt-2 text-[11px] text-amber-300 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Đang kết nối luồng audio: {src.split('/').pop()}
        </p>
      )}
    </div>
  );
};

// ==============================================================================
// 🌟 MAIN COMPONENT: EXAM PRACTICE ROOM PAGE (LUYỆN ĐỀ THEO TỪNG PHẦN)
// ==============================================================================
const ExamPracticeRoomPage = () => {
  const { examId } = useParams<{ examId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState<ExamDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Kỹ năng / Phần thi đang chọn luyện tập ('ALL', 'LISTENING', 'READING', 'WRITING', 'SPEAKING' hoặc sectionId)
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>(
    searchParams.get('skill') || 'ALL'
  );

  // Quản lý attempt
  const [attemptId, setAttemptId] = useState<number | null>(
    searchParams.get('attemptId') ? Number(searchParams.get('attemptId')) : null
  );
  const [startTimestamp] = useState<number>(Date.now());
  const [recordedScore, setRecordedScore] = useState<number>(0);
  const [submissionResult, setSubmissionResult] = useState<{
    totalScore: number;
    correctCount: number;
    wrongCount: number;
    unansweredCount: number;
    accuracyPercentage: number;
    totalQuestions: number;
    totalTime: number;
  } | null>(null);

  // viewMode: 'intro' (Màn hình giới thiệu phần) | 'questions' (Màn hình làm bài)
  const [viewMode, setViewMode] = useState<'intro' | 'questions'>('intro');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [currentGroupIndex, setCurrentGroupIndex] = useState<number>(0);

  // State điều khiển
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(60 * 60);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showReviewDetails, setShowReviewDetails] = useState<boolean>(false);

  // Tải chi tiết bài thi từ CSDL Backend
  useEffect(() => {
    const fetchExam = async () => {
      if (!examId) return;
      setLoading(true);
      try {
        const data = await examService.getExamDetail(examId);
        setExam(data);
        if (data && data.totalMinutes) {
          setTimeLeft(data.totalMinutes * 60);
        }

        // Tự động tạo lượt thi nếu chưa có attemptId từ URL
        if (!attemptId) {
          const newAttempt = await examService.startAttempt(examId, 'PRACTICE');
          if (newAttempt?.id) {
            setAttemptId(newAttempt.id);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải bài thi luyện tập:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Bộ đếm ngược thời gian làm bài
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Toàn bộ danh sách Sections gốc được sắp xếp theo orderIndex (Nghe orderIndex=1 làm trước, Đọc orderIndex=2 làm sau)
  const allSortedSections = useMemo(() => {
    if (!exam?.sections) return [];
    return [...exam.sections].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
  }, [exam?.sections]);

  // 2. Danh sách kỹ năng có trong đề để làm bộ lọc
  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    allSortedSections.forEach((s) => {
      if (s.skill) skills.add(s.skill);
    });
    return Array.from(skills);
  }, [allSortedSections]);

  // 3. Sections được lọc theo kỹ năng người dùng chọn
  const filteredSections = useMemo(() => {
    if (selectedSkillFilter === 'ALL') {
      return allSortedSections;
    }
    return allSortedSections.filter((s) => s.skill === selectedSkillFilter);
  }, [allSortedSections, selectedSkillFilter]);

  const currentSection: SectionDTO | undefined = filteredSections[currentSectionIndex] || filteredSections[0];

  const groups: PassageGroupDTO[] = useMemo(() => {
    if (!currentSection?.passageGroups) return [];
    return [...currentSection.passageGroups].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
  }, [currentSection?.passageGroups]);

  const currentGroup: PassageGroupDTO | undefined = groups[currentGroupIndex] || groups[0];

  const currentQuestions: QuestionDTO[] = useMemo(() => {
    if (!currentGroup?.questions) return [];
    return [...currentGroup.questions].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
  }, [currentGroup?.questions]);

  // 4. Tổng hợp toàn bộ câu hỏi trong phần luyện tập đang chọn
  const allFlatQuestions = useMemo(() => {
    const list: { question: QuestionDTO; sectionIdx: number; groupIdx: number; qIndexInExam: number }[] = [];
    let count = 1;
    filteredSections.forEach((sec, sIdx) => {
      const sortedPgs = [...(sec.passageGroups || [])].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
      sortedPgs.forEach((pg, gIdx) => {
        const sortedQs = [...(pg.questions || [])].sort((a, b) => (a.orderIndex ?? 999) - (b.orderIndex ?? 999));
        sortedQs.forEach((q) => {
          list.push({
            question: q,
            sectionIdx: sIdx,
            groupIdx: gIdx,
            qIndexInExam: count++,
          });
        });
      });
    });
    return list;
  }, [filteredSections]);

  // 5. Lọc danh sách câu hỏi chỉ thuộc Section hiện tại
  const currentSectionQuestions = useMemo(() => {
    return allFlatQuestions.filter((item) => item.sectionIdx === currentSectionIndex);
  }, [allFlatQuestions, currentSectionIndex]);

  const answeredCountInSection = useMemo(() => {
    return currentSectionQuestions.filter((item) => !!userAnswers[item.question.id]).length;
  }, [currentSectionQuestions, userAnswers]);

  const currentSkillName = currentSection?.skill || (selectedSkillFilter !== 'ALL' ? selectedSkillFilter : 'Listening');
  const toeicPartStr = currentGroup?.toeicPart || (currentSectionIndex === 0 ? 'PART_1' : 'PART_3');
  const partTitleName = currentGroup?.title || (toeicPartStr ? toeicPartStr.replace('_', ' ') : `Part ${currentGroupIndex + 1}`);
  const directionsText = getToeicDirections(toeicPartStr, currentSkillName);

  const audioSrc = getMediaAudioUrl(currentGroup?.audioUrl);
  const imageUrls = getMediaImageUrls(currentGroup?.imageUrl);

  const firstQNum = currentSectionQuestions[0]?.qIndexInExam || 1;
  const lastQNum = currentSectionQuestions[currentSectionQuestions.length - 1]?.qIndexInExam || currentSectionQuestions.length;

  // Tính tổng điểm tối đa của phần luyện tập
  const sectionTotalScore = useMemo(() => {
    let score = 0;
    allFlatQuestions.forEach((item) => {
      score += item.question.score || 5;
    });
    return score > 0 ? score : (allFlatQuestions.length * 5 || 500);
  }, [allFlatQuestions]);

  // Xử lý chọn đáp án
  const handleSelectAnswer = (qId: number, answer: string) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
  };

  // Điều hướng chuyển PassageGroup
  const handlePrevGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentSectionIndex > 0) {
      const prevSecIdx = currentSectionIndex - 1;
      const prevSecGroups = filteredSections[prevSecIdx]?.passageGroups || [];
      setCurrentSectionIndex(prevSecIdx);
      setCurrentGroupIndex(Math.max(0, prevSecGroups.length - 1));
      setViewMode('intro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextGroup = () => {
    if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentSectionIndex < filteredSections.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
      setCurrentGroupIndex(0);
      setViewMode('intro');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmitExam();
    }
  };

  // Nhảy tới câu hỏi cụ thể từ Question Grid
  const handleJumpToQuestion = (targetSecIdx: number, targetGrpIdx: number) => {
    setCurrentSectionIndex(targetSecIdx);
    setCurrentGroupIndex(targetGrpIdx);
    setViewMode('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý đổi Kỹ năng / Phần thi muốn luyện tập
  const handleFilterSkill = (skill: string) => {
    setSelectedSkillFilter(skill);
    setCurrentSectionIndex(0);
    setCurrentGroupIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setViewMode('intro');
    setSearchParams(skill !== 'ALL' ? { skill } : {});
  };

  // Xử lý khi người dùng THOÁT KHỎI PHÒNG LUYỆN ĐỀ
  const handleExit = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn thoát khỏi phòng luyện đề?')) {
      return;
    }
    navigate('/exams');
  };

  // Xử lý khi người dùng NỘP BÀI LUYỆN TẬP
  const handleSubmitExam = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn nộp bài luyện tập ngay bây giờ?')) {
      return;
    }
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimestamp) / 1000));

    // 1. Chấm điểm trực tiếp từ danh sách câu hỏi
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    let totalScore = 0;

    allFlatQuestions.forEach((item) => {
      const q = item.question;
      const userAns = userAnswers[q.id];
      const correctAns = q.correctAnswer;
      const qScore = (q.score && q.score > 0) ? q.score : 5.0;

      if (!userAns || !userAns.trim()) {
        unansweredCount++;
      } else {
        const uTrim = userAns.trim();
        const cTrim = (correctAns || '').trim();
        const isMatch = uTrim ? (uTrim as any).equalsIgnoreCase(cTrim) : (uTrim.toLowerCase() === cTrim.toLowerCase() || uTrim.startsWith(cTrim) || (cTrim.length === 1 && uTrim.includes(`(${cTrim})`)));
        if (isMatch) {
          correctCount++;
          totalScore += qScore;
        } else {
          wrongCount++;
        }
      }
    });

    const calculatedScore = Math.round(totalScore);
    const accuracy = allFlatQuestions.length > 0
      ? Math.round((correctCount / allFlatQuestions.length) * 100)
      : 0;

    setRecordedScore(calculatedScore);
    setSubmissionResult({
      totalScore: calculatedScore,
      correctCount,
      wrongCount,
      unansweredCount,
      accuracyPercentage: accuracy,
      totalQuestions: allFlatQuestions.length,
      totalTime: elapsedSeconds,
    });

    // 2. Gửi kết quả lên server lưu lịch sử
    if (attemptId) {
      try {
        await examService.submitAttempt(attemptId, {
          totalScore: calculatedScore,
          totalTime: elapsedSeconds,
          answerDetail: JSON.stringify(userAnswers),
        });
      } catch (err) {
        console.error('Lỗi khi lưu kết quả bài thi:', err);
      }
    }

    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F0038] text-white flex flex-col items-center justify-center gap-3 font-sans">
        <Loader2 className="w-9 h-9 animate-spin text-purple-300" />
        <p className="text-sm font-semibold tracking-wide">Đang chuẩn bị phòng luyện đề...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-muted-foreground font-semibold">Không tìm thấy thông tin đề thi.</p>
        <Link to="/exams" className="mt-4 inline-block">
          <button className="px-6 py-2.5 rounded-full bg-primary text-white font-bold text-sm">
            Quay lại danh sách đề luyện tập
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F8] text-slate-800 font-sans flex flex-col select-none">
      {/* 🌟 1. TOP BAR MÀU TÍM ĐẬM CHUẨN FORM (#1F0038) */}
      <header className="bg-[#1F0038] text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-purple-300">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-purple-500/30 text-purple-200 font-bold text-[10px] uppercase">
                Luyện đề: {currentSkillName}
              </span>
              <span className="text-xs text-purple-200/80 font-medium">
                {partTitleName} {viewMode === 'questions' ? `(Nhóm ${currentGroupIndex + 1}/${groups.length})` : ''}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white line-clamp-1 mt-0.5">
              {exam.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Sound on / Sound off */}
          {viewMode === 'questions' && (
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{soundOn ? 'Sound on' : 'Sound off'}</span>
            </button>
          )}

          {/* Bộ đếm thời gian ở Top Bar */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-800/60 text-xs font-bold text-purple-200">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          {/* Nút Thoát */}
          <button
            onClick={handleExit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/30 hover:bg-white/15 text-xs font-semibold text-white transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Thoát</span>
          </button>
        </div>
      </header>

      {/* 🌟 2. MÀN HÌNH KẾT QUẢ SAU KHI NỘP BÀI */}
      {isSubmitted ? (
        <main className="flex-1 max-w-[960px] w-full mx-auto p-6 sm:p-10 space-y-6 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                KẾT QUẢ LUYỆN TẬP
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Hoàn thành phần {currentSkillName}!
              </h2>
              <p className="text-sm text-slate-500 mt-1">{exam.title}</p>
            </div>

            {/* 4 Ô Thông Số Kết Quả */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <span className="text-[11px] text-purple-700 font-bold block uppercase tracking-wider">
                  Điểm số đạt
                </span>
                <span className="text-2xl font-extrabold text-purple-950 mt-1 block">
                  {submissionResult?.totalScore ?? recordedScore}
                  <span className="text-xs text-purple-400 font-normal ml-1">
                    / {sectionTotalScore}
                  </span>
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] text-emerald-700 font-bold block uppercase tracking-wider">
                  Số câu đúng
                </span>
                <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
                  {submissionResult?.correctCount || 0}
                  <span className="text-xs text-emerald-500 font-normal ml-1">
                    / {allFlatQuestions.length} câu
                  </span>
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100">
                <span className="text-[11px] text-blue-700 font-bold block uppercase tracking-wider">
                  Độ chính xác
                </span>
                <span className="text-2xl font-extrabold text-blue-700 mt-1 block">
                  {submissionResult?.accuracyPercentage || 0}%
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                <span className="text-[11px] text-amber-700 font-bold block uppercase tracking-wider">
                  Thời gian
                </span>
                <span className="text-2xl font-extrabold text-amber-800 mt-1 block">
                  {Math.floor((submissionResult?.totalTime || 0) / 60)}p
                  <span className="text-xs text-amber-600 font-normal ml-1">
                    {(submissionResult?.totalTime || 0) % 60}s
                  </span>
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setUserAnswers({});
                  setViewMode('intro');
                }}
                className="px-6 py-2.5 rounded-2xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Làm lại phần này
              </button>

              <button
                onClick={() => setShowReviewDetails(!showReviewDetails)}
                className="px-6 py-2.5 rounded-2xl bg-purple-700 text-white font-bold text-xs hover:bg-purple-800 transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Eye className="w-4 h-4" /> {showReviewDetails ? 'Ẩn lời giải' : 'Xem đáp án & Lời giải'}
              </button>

              <Link to="/exams">
                <button className="px-6 py-2.5 rounded-2xl bg-[#1F0038] text-white font-bold text-xs hover:opacity-90 transition cursor-pointer">
                  Chọn bài luyện tập khác
                </button>
              </Link>
            </div>
          </div>

          {/* 🌟 2.1 REVIEW CHI TIẾT ĐÁP ÁN & LỜI GIẢI CHO BÀI LUYỆN TẬP */}
          {showReviewDetails && (
            <div className="space-y-6 pt-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  Chi tiết đáp án & Lời giải bài luyện tập ({allFlatQuestions.length} câu)
                </h3>
              </div>

              <div className="space-y-4">
                {allFlatQuestions.map((item) => {
                  const q = item.question;
                  const userAns = userAnswers[q.id];
                  const correctAns = q.correctAnswer;
                  const isCorrect = userAns && (
                    userAns.toLowerCase() === (correctAns || '').toLowerCase() ||
                    userAns.startsWith(correctAns || '') ||
                    (correctAns?.length === 1 && userAns.includes(`(${correctAns})`))
                  );

                  let opts: string[] = [];
                  try {
                    opts = typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer;
                  } catch {
                    opts = ['(A) Option A', '(B) Option B', '(C) Option C', '(D) Option D'];
                  }

                  return (
                    <div
                      key={q.id}
                      className={`p-6 rounded-3xl border bg-white shadow-xs space-y-4 transition ${isCorrect ? 'border-emerald-200' : 'border-rose-200'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-extrabold text-sm text-slate-900">
                          <span
                            className={`mr-2 px-2.5 py-1 rounded-lg text-xs font-bold ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}
                          >
                            Câu {item.qIndexInExam}:
                          </span>
                          {q.content || 'Select the best answer:'}
                        </span>

                        <span className="shrink-0 flex items-center gap-1 font-bold text-xs">
                          {isCorrect ? (
                            <span className="text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" /> Đúng (+{q.score || 5}đ)
                            </span>
                          ) : (
                            <span className="text-rose-600 flex items-center gap-1">
                              <XCircle className="w-4 h-4" /> Sai (0đ)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Các lựa chọn */}
                      <div className="grid gap-2 sm:grid-cols-2 text-xs">
                        {opts.map((opt) => {
                          const isUserPick = userAns === opt;
                          const isRightChoice =
                            opt.toLowerCase() === (correctAns || '').toLowerCase() ||
                            opt.startsWith(correctAns || '') ||
                            (correctAns?.length === 1 && opt.includes(`(${correctAns})`));

                          let style = 'bg-slate-50 border-slate-200 text-slate-700';
                          if (isRightChoice) {
                            style = 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isUserPick && !isRightChoice) {
                            style = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold line-through';
                          }

                          return (
                            <div
                              key={opt}
                              className={`p-3 rounded-xl border flex items-center justify-between ${style}`}
                            >
                              <span>{opt}</span>
                              {isRightChoice && (
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                                  Đáp án đúng
                                </span>
                              )}
                              {isUserPick && !isRightChoice && (
                                <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                  Bạn chọn
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Lời giải thích */}
                      {q.explanation && (
                        <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 space-y-1">
                          <span className="font-bold flex items-center gap-1 text-purple-800">
                            💡 Giải thích chi tiết:
                          </span>
                          <p className="leading-relaxed font-sans">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      ) : viewMode === 'intro' ? (
        /* 🌟 3. GIAO DIỆN HÌNH 1: MÀN HÌNH NỀN GIỚI THIỆU PHẦN THI (SECTION / PART INTRO) */
        <main className="flex-1 max-w-[960px] w-full mx-auto p-6 sm:p-10 space-y-6 animate-fadeIn">
          {/* Badge kỹ năng */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>{currentSkillName} - {partTitleName}</span>
          </div>

          {/* Tiêu đề đề thi & mô tả */}
          <div className="space-y-2">
            <span className="text-xs text-slate-500 font-medium block">
              TOEIC / Aptis Skill Practice Room
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {exam.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              {exam.description ||
                'Chế độ luyện đề theo từng phần: Bấm giờ làm bài, chấm điểm tự động và xem đáp án giải thích chi tiết.'}
            </p>
          </div>

          {/* 2 Ô Thông Số Bo Tròn: Number of Questions & Time Allowed */}
          <div className="grid grid-cols-2 gap-5 pt-2 max-w-md">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <span className="block text-xs font-semibold text-slate-500">Number of Questions</span>
              <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                {currentSection?.questionCount || currentQuestions.length || allFlatQuestions.length} câu
              </span>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <span className="block text-xs font-semibold text-slate-500">Time Allowed</span>
              <span className="mt-1 block text-2xl font-extrabold text-slate-900">
                {exam.totalMinutes || 45} phút
              </span>
            </div>
          </div>

          {/* Thẻ Hướng Dẫn Part (Directions) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                ℹ️
              </span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Directions: {partTitleName}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {directionsText}
            </p>
          </div>

          {/* Nút Bắt Đầu Làm Bài Thi Phần Này */}
          <div className="pt-4">
            <button
              onClick={() => setViewMode('questions')}
              className="px-8 py-3.5 rounded-2xl bg-[#1F0038] hover:bg-[#2e0153] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>Bắt đầu làm bài thi phần này</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      ) : (
        /* 🌟 4. GIAO DIỆN HÌNH 2: MÀN HÌNH LÀM CÂU HỎI THI THẬT (ACTIVE QUESTION VIEW) */
        <main className="flex-1 max-w-[1360px] w-full mx-auto p-4 sm:p-6 lg:p-8 animate-fadeIn">
          {/* Header Part & Banner Directions */}
          <div className="mb-6 rounded-3xl bg-white border border-slate-200 p-5 shadow-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-extrabold text-xs">
                  {currentSkillName}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {partTitleName}
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                Nhóm câu {currentGroupIndex + 1} / {groups.length}
              </span>
            </div>

            {/* Khung Directions ngắn gọn */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-2">
              <span className="font-bold text-purple-800 shrink-0">Directions:</span>
              <span>{directionsText}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
            {/* 🌟 CỘT CHÍNH: AUDIO PLAYER -> ẢNH MINH HỌA -> NỘI DUNG -> CÁC CÂU HỎI */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              {/* 1. ĐẦU PHẦN BODY: TRÌNH PHÁT AUDIO (NẾU CÓ AUDIO) */}
              {(currentGroup?.audioUrl || audioSrc) && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-purple-600" />
                    Nghe đoạn Audio: {currentGroup?.audioUrl || `Nhóm ${currentGroupIndex + 1}`}
                  </span>
                  <ExamAudioPlayer
                    src={audioSrc}
                    label={currentGroup?.audioUrl || `Track ${partTitleName}`}
                  />
                </div>
              )}

              {/* 2. BÊN DƯỚI: PHẦN ẢNH MINH HỌA (HỖ TRỢ NHIỀU ẢNH XẾP CHỒNG TỪ TRÊN XUỐNG DƯỚI) */}
              {imageUrls.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      Ảnh minh họa ({imageUrls.length} ảnh): {currentGroup?.imageUrl || 'Passage Images'}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {imageUrls.map((imgSrc, imgIdx) => (
                      <div key={imgSrc + imgIdx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-purple-900 bg-purple-50/80 px-3 py-1.5 rounded-xl border border-purple-100/80">
                          <span>
                            📄 {imageUrls.length > 1 ? `Ảnh ${imgIdx + 1} / ${imageUrls.length}` : 'Ảnh đoạn văn'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setZoomedImage(imgSrc)}
                            className="text-purple-600 hover:text-purple-800 text-xs inline-flex items-center gap-1 cursor-pointer font-bold"
                          >
                            <Maximize2 className="w-3 h-3" /> Xem lớn
                          </button>
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-2.5">
                          <img
                            src={imgSrc}
                            alt={`Passage Illustration ${imgIdx + 1}`}
                            className="max-h-[520px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. ĐOẠN VĂN ĐỌC / NGỮ CẢNH (PASSAGE TEXT NẾU CÓ) */}
              {currentGroup?.passageText && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Đoạn văn đọc:</span>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-serif">
                    {currentGroup.passageText}
                  </div>
                </div>
              )}

              {/* 4. DANH SÁCH CÁC CÂU HỎI TRONG PASSAGEGROUP NÀY */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HelpCircle className="w-4 h-4 text-purple-600" />
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Câu hỏi ({currentQuestions.length} câu trong nhóm này):
                  </h4>
                </div>

                {currentQuestions.length === 0 ? (
                  <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-300 space-y-3 my-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                      Phần thi {currentSkillName} ({partTitleName}) đang được cập nhật dữ liệu
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      Hiện tại chưa có câu hỏi cho phần này. Bạn có thể bấm nút quay lại hoặc nộp bài thi.
                    </p>
                  </div>
                ) : (
                  currentQuestions.map((q, qIndex) => {
                    let opts: string[] = [];
                    try {
                      opts = typeof q.answer === 'string' ? JSON.parse(q.answer) : q.answer;
                    } catch {
                      opts = ['(A) Option A', '(B) Option B', '(C) Option C', '(D) Option D'];
                    }

                    const selectedOpt = userAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100/80 space-y-4"
                      >
                        {/* Tiêu đề & Nội dung câu hỏi */}
                        <p className="font-bold text-xs sm:text-sm text-slate-900 leading-relaxed">
                          <span className="text-purple-700 font-extrabold mr-2 bg-purple-100 px-2.5 py-1 rounded-lg">
                            Câu {q.orderIndex || qIndex + 1}:
                          </span>
                          {q.content || 'Select the statement that best describes what you hear / see:'}
                        </p>

                        {/* 4 Lựa chọn A, B, C, D */}
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {opts.map((opt) => {
                            const isSelected = selectedOpt === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => handleSelectAnswer(q.id, opt)}
                                className={`p-3.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${isSelected
                                    ? 'border-purple-600 bg-purple-100 text-purple-950 font-bold shadow-xs'
                                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                  }`}
                              >
                                <span className="line-clamp-2">{opt}</span>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 ml-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* 5. THANH ĐIỀU HƯỚNG CHUYỂN NHÓM CÂU HỎI */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevGroup}
                  disabled={currentSectionIndex === 0 && currentGroupIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" /> Nhóm câu trước
                </button>

                <div className="flex items-center gap-3">
                  {currentGroupIndex < groups.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextGroup}
                      className="px-6 py-2.5 rounded-xl bg-[#1F0038] text-white text-xs font-bold hover:opacity-90 transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Nhóm câu tiếp theo</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : currentSectionIndex < filteredSections.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNextGroup}
                      className="px-6 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <span>Sang phần thi tiếp theo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <FileCheck className="w-4 h-4" /> Nộp bài luyện tập
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 🌟 CỘT PHẢI: QUESTION GRID (CHỈ HIỂN THỊ CÂU HỎI CỦA SECTION HIỆN TẠI) & ĐẾM GIỜ */}
            <aside className="space-y-5">
              {/* Card Đồng Hồ & Tiến Độ */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-600" /> Thời gian còn lại:
                  </span>
                  <span className="font-extrabold text-base text-purple-950 font-mono">
                    {formatTimer(timeLeft)}
                  </span>
                </div>

                {/* Thanh Tiến độ làm bài trong Section hiện tại */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>Đã làm ({currentSkillName}):</span>
                    <span className="font-bold text-purple-700">
                      {answeredCountInSection} / {currentSectionQuestions.length} câu
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${currentSectionQuestions.length > 0
                            ? (answeredCountInSection / currentSectionQuestions.length) * 100
                            : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Bảng Câu Hỏi (Question Grid Palette) - Chỉ hiển thị câu hỏi của Section hiện tại */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Câu hỏi {currentSkillName} ({currentSectionQuestions.length > 0 ? `Câu ${firstQNum} - ${lastQNum}` : '0 câu'}):
                  </span>
                </div>

                {/* Lưới số thứ tự các câu hỏi thuộc Section này */}
                {currentSectionQuestions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium">
                    Chưa có câu hỏi cho phần này
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto p-1">
                    {currentSectionQuestions.map((item) => {
                      const isAnswered = !!userAnswers[item.question.id];
                      const isCurrentGroup =
                        item.sectionIdx === currentSectionIndex && item.groupIdx === currentGroupIndex;

                      return (
                        <button
                          key={item.question.id}
                          type="button"
                          onClick={() => handleJumpToQuestion(item.sectionIdx, item.groupIdx)}
                          className={`h-9 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${isCurrentGroup
                              ? 'bg-[#1F0038] text-white shadow-xs ring-2 ring-purple-400'
                              : isAnswered
                                ? 'bg-purple-100 text-purple-900 border border-purple-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          title={`Câu ${item.qIndexInExam}`}
                        >
                          {item.qIndexInExam}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Chú thích màu sắc */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-200 border border-purple-400" /> Đã làm
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1F0038]" /> Đang mở
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" /> Chưa làm
                  </span>
                </div>

                {/* Nút Nộp bài */}
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileCheck className="w-4 h-4" /> Nộp bài luyện tập
                </button>
              </div>
            </aside>
          </div>
        </main>
      )}

      {/* 🌟 MODAL PHÓNG TO ẢNH (IMAGE LIGHTBOX) */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-fadeIn"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
            <img
              src={zoomedImage}
              alt="Zoomed"
              className="max-h-[85vh] w-auto object-contain rounded-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center font-bold text-sm hover:bg-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPracticeRoomPage;
