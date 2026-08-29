import React, { useState, useEffect } from 'react';
import {
  FileText,
  Play,
  Search,
  Clock,
  FileCheck2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { SectionTitle } from '@/components/app/PageHeader';
import {
  Pill,
  BtnPrimary,
  TabPill,
} from '@/components/app/ui-bits';
import examService, { type ExamDTO } from '@/services/examService';

// Tabs kỹ năng
const skillTabs = [
  { id: 'all', name: 'Tất cả kỹ năng', emoji: '🌟', skillType: null },
  { id: 'listening', name: 'Listening (Nghe)', emoji: '🎧', skillType: 'LISTENING' },
  { id: 'reading', name: 'Reading (Đọc)', emoji: '📖', skillType: 'READING' },
  { id: 'writing', name: 'Writing (Viết)', emoji: '✍️', skillType: 'WRITING' },
  { id: 'speaking', name: 'Speaking (Nói)', emoji: '🗣️', skillType: 'SPEAKING' },
];

const VocaExamsPage = () => {
  const navigate = useNavigate();
  const [skill, setSkill] = useState<string>('all');
  const [query, setQuery] = useState<string>('');
  const [exams, setExams] = useState<ExamDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Tải danh sách đề luyện tập từ CSDL
  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const data = await examService.getPracticeExams();
        setExams(data);
      } catch (err) {
        console.error('Lỗi khi tải danh sách đề luyện tập:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const activeTab = skillTabs.find((s) => s.id === skill) || skillTabs[0];

  // Lọc theo kỹ năng và tìm kiếm
  const filteredList = exams.filter((e) => {
    const matchSkill =
      skill === 'all' ||
      e.primarySkill === activeTab.skillType ||
      e.sections?.some((s) => s.skill === activeTab.skillType);

    const matchQuery =
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(query.toLowerCase()));

    return matchSkill && matchQuery;
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      {/* Sidebar cố định bên trái */}
      <VocaSidebar />

      {/* Main Wrapper */}
      <div className="pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Luyện đề</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Bộ đề luyện thi theo từng kỹ năng, phân loại theo dạng câu hỏi và bài đọc nghe.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/mock-test">
                <BtnPrimary className="h-11 shadow-pop">
                  <Play className="h-4 w-4" /> Vào thi thử
                </BtnPrimary>
              </Link>
            </div>
          </div>

          {/* 2. Tabs phân loại kỹ năng */}
          <div className="flex flex-wrap gap-2">
            {skillTabs.map((s) => (
              <TabPill
                key={s.id}
                active={skill === s.id}
                onClick={() => setSkill(s.id)}
                className="cursor-pointer"
              >
                <span>{s.emoji}</span> {s.name}
              </TabPill>
            ))}
          </div>

          {/* 3. Ô tìm kiếm bộ đề */}
          <label className="surface-card relative flex h-14 items-center p-0 rounded-2xl border border-border shadow-2xs cursor-text">
            <Search className="pointer-events-none absolute left-5 h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Tìm bộ đề ${activeTab.name.toLowerCase()}...`}
              className="h-full w-full rounded-2xl bg-transparent pl-12 pr-5 text-sm text-foreground outline-none"
            />
          </label>

          {/* 4. Tiêu đề danh sách bộ đề */}
          <SectionTitle title={`Bộ đề ${activeTab.name}`} badge={`${filteredList.length} bộ đề`} />

          {/* 5. Grid danh sách bộ đề luyện thi từ CSDL */}
          {loading ? (
            <div className="surface-card p-16 rounded-3xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold">Đang tải danh sách bộ đề từ cơ sở dữ liệu...</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredList.map((e) => {
                const skillBadge = e.primarySkill || (e.sections && e.sections[0]?.skill) || 'TOEIC';
                const totalQ = e.totalQuestions || (e.sections ? e.sections.reduce((acc, s) => acc + (s.questionCount || 0), 0) : 10);

                return (
                  <article
                    key={e.id}
                    className="surface-card flex flex-col gap-4 p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xs transition group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="icon-tile group-hover:scale-105 transition-transform">
                        <FileText className="h-5 w-5 text-primary" />
                      </span>
                      <Pill tone="info" className="text-xs font-semibold">{skillBadge}</Pill>
                    </div>

                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {e.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {e.description || 'Bộ đề luyện tập bấm giờ chuẩn format.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                      <div className="rounded-2xl bg-muted/60 p-3.5 border border-border/40">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 text-primary" /> Thời gian
                        </span>
                        <span className="mt-1 block font-display text-lg font-bold text-foreground">
                          {e.totalMinutes || 30} phút
                        </span>
                      </div>
                      <div className="rounded-2xl bg-muted/60 p-3.5 border border-border/40">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                          <FileCheck2 className="h-3.5 w-3.5 text-primary" /> Câu hỏi
                        </span>
                        <span className="mt-1 block font-display text-lg font-bold text-foreground">
                          {totalQ} câu
                        </span>
                      </div>
                    </div>

                    <BtnPrimary
                      onClick={() => {
                        const skillParam = activeTab.skillType ? `?skill=${activeTab.skillType}` : '';
                        navigate(`/exams/${e.id}/practice${skillParam}`);
                      }}
                      className="mt-2 h-11 w-full rounded-2xl shadow-pop flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Luyện đề này <ArrowRight className="h-4 w-4" />
                    </BtnPrimary>
                  </article>
                );
              })}

              {filteredList.length === 0 && (
                <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl border border-border">
                  Chưa có bộ đề luyện tập nào cho kỹ năng này trong cơ sở dữ liệu.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VocaExamsPage;
