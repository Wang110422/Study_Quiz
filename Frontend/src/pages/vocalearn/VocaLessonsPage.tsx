import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpenText,
  Sparkles,
  Layers,
  Play,
  CheckCircle2,
  Loader2,
  SlidersHorizontal,
  PenTool,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { SectionTitle } from '@/components/app/PageHeader';
import {
  Pill,
  BtnPrimary,
  BtnOutline,
  TabPill,
} from '@/components/app/ui-bits';
import grammarService, { type GrammarSetDTO } from '@/services/grammarService';
import studySetService, { type StudySet } from '@/services/studySetService';
import studyTipService, { type StudyTipDTO } from '@/services/studyTipService';
import examService, { type ExamDTO } from '@/services/examService';

// 6 Tabs chính: Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp
type TabKey = 'listening' | 'speaking' | 'reading' | 'writing' | 'vocab' | 'grammar';

interface TabItem {
  id: TabKey;
  name: string;
}

const tabs: TabItem[] = [
  { id: 'listening', name: 'Nghe' },
  { id: 'speaking', name: 'Nói' },
  { id: 'reading', name: 'Đọc' },
  { id: 'writing', name: 'Viết' },
  { id: 'vocab', name: 'Từ vựng' },
  { id: 'grammar', name: 'Ngữ pháp' },
];

const VocaLessonsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('listening');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [vocabSets, setVocabSets] = useState<StudySet[]>([]);
  const [grammarSets, setGrammarSets] = useState<GrammarSetDTO[]>([]);
  const [studyTips, setStudyTips] = useState<StudyTipDTO[]>([]);
  const [practiceExams, setPracticeExams] = useState<ExamDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Tải dữ liệu thật từ CSDL backend cho từ vựng, ngữ pháp và mẹo học
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'vocab') {
          const sets = await studySetService.getAllStudySets();
          setVocabSets(sets || []);
        } else if (tab === 'grammar') {
          const gSets = await grammarService.getAllGrammarSets();
          setGrammarSets(gSets || []);
        } else {
          // Tải danh sách StudyTip và Exam từ backend
          const [tips, exams] = await Promise.all([
            studyTipService.getStudyTips(tab),
            examService.getPracticeExams(),
          ]);
          setStudyTips(tips || []);
          setPracticeExams(exams || []);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bài học:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab]);

  // Lấy danh sách ExamType động từ bảng exam và study_tips
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    practiceExams.forEach((e) => {
      if (e.type) types.add(e.type);
    });
    studyTips.forEach((t) => {
      if (t.examType) types.add(t.examType);
    });
    return Array.from(types);
  }, [practiceExams, studyTips]);

  const isSet = tab === 'vocab' || tab === 'grammar';

  const defaultExamId = practiceExams.length > 0 ? practiceExams[0].id : 1;

  // Danh sách bài học mẹo 100% từ CSDL thật, không fake dữ liệu
  const displayTips = useMemo(() => {
    let list = studyTips;
    if (typeFilter !== 'ALL') {
      list = list.filter((t) => t.examType === typeFilter);
    }

    return list.map((tip) => {
      const tipLines = (tip.tips && tip.tips.length > 0)
        ? tip.tips
        : (tip.content ? tip.content.split('\n').map(s => s.trim()).filter(Boolean) : []);

      return {
        id: `tip-${tip.id}`,
        title: tip.title,
        partName: tip.partName,
        tips: tipLines,
        cta: tip.cta || `Học mẹo ${tip.partName || 'ngay'}`,
        examId: tip.examId || defaultExamId,
        examType: tip.examType,
      };
    });
  }, [studyTips, typeFilter, defaultExamId]);

  const filteredVocabSets = vocabSets;
  const filteredGrammarSets = grammarSets;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col select-none pb-20">
      {/* Main Wrapper */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <VocaHeader />

        <main className="flex-1 p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 animate-fadeIn">
          {/* 1. Header nằm trong hình chữ nhật bo góc tròn màu trắng */}
          <div className="surface-card p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <BookOpenText className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Bài học</h1>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Học mẹo làm bài theo từng nhóm câu, ôn từ vựng và ngữ pháp theo bộ.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/exams">
                <BtnPrimary className="h-11 shadow-pop">
                  <Sparkles className="h-4 w-4" /> Sang luyện đề
                </BtnPrimary>
              </Link>
            </div>
          </div>

          {/* 2. Tabs 6 mục: Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <TabPill
                key={t.id}
                active={tab === t.id}
                onClick={() => setTab(t.id)}
                className="cursor-pointer"
              >
                {t.name}
              </TabPill>
            ))}
          </div>

          {/* 3. Khung Bộ Lọc Bài Học theo ExamType */}
          <div className="surface-card space-y-3 p-5 rounded-3xl border border-border shadow-2xs">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Bộ lọc loại đề thi
            </div>
            <div className="flex flex-wrap gap-2">
              <TabPill
                active={typeFilter === 'ALL'}
                onClick={() => setTypeFilter('ALL')}
                className="h-9 px-3.5 text-xs font-semibold cursor-pointer"
              >
                Tất cả loại đề
              </TabPill>
              {availableTypes.map((t) => (
                <TabPill
                  key={t}
                  active={typeFilter === t}
                  onClick={() => setTypeFilter(t)}
                  className="h-9 px-3.5 text-xs font-semibold cursor-pointer"
                >
                  {t}
                </TabPill>
              ))}
            </div>
          </div>

          {/* 4. Hiển thị nội dung tương ứng */}
          {loading ? (
            <div className="surface-card p-16 rounded-3xl flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold">Đang tải dữ liệu bài học từ máy chủ...</p>
            </div>
          ) : isSet ? (
            <div className="space-y-4">
              {tab === 'vocab' ? (
                <>
                  <SectionTitle
                    title="Bộ từ vựng trong cơ sở dữ liệu"
                    badge={`${filteredVocabSets.length} bộ`}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredVocabSets.map((s) => {
                      const termsCount = s.vocabularies?.length || 0;
                      return (
                        <article
                          key={s.id}
                          className="surface-card flex flex-col gap-3.5 p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xs transition group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                              <Layers className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {s.titleName || `Bộ từ vựng #${s.id}`}
                              </h3>
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {s.description || 'Bộ thẻ từ vựng ôn tập lặp lại ngắt quãng.'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <Pill tone="muted" className="text-[11px]">
                              <Layers className="h-3.5 w-3.5 text-primary" /> {termsCount} từ vựng
                            </Pill>
                            <Pill tone="info" className="text-[11px]">Hệ thống</Pill>
                          </div>

                          <BtnPrimary
                            onClick={() => navigate(`/studyset/${s.slug || s.id}`)}
                            className="mt-auto h-11 w-full rounded-2xl shadow-pop flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Play className="h-4 w-4" /> Học bộ từ này
                          </BtnPrimary>
                        </article>
                      );
                    })}

                    {filteredVocabSets.length === 0 && (
                      <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl">
                        Không tìm thấy bộ từ vựng nào trong hệ thống.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <SectionTitle
                    title="Bộ ngữ pháp trong cơ sở dữ liệu"
                    badge={`${filteredGrammarSets.length} bộ`}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredGrammarSets.map((s) => (
                      <article
                        key={s.id}
                        className="surface-card flex flex-col gap-3.5 p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xs transition group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <PenTool className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {s.title}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {s.description || 'Cấu trúc ngữ pháp trọng tâm kèm ví dụ thực tế.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <Pill tone="muted" className="text-[11px]">
                            <Layers className="h-3.5 w-3.5 text-primary" /> {s.grammarCount || 0} chủ điểm
                          </Pill>
                          <Pill tone="info" className="text-[11px]">{s.level || 'Trung cấp'}</Pill>
                        </div>

                        <BtnPrimary
                          onClick={() => navigate(`/studyset/${s.slug || s.id}/grammar`)}
                          className="mt-auto h-11 w-full rounded-2xl shadow-pop flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="h-4 w-4" /> Học ngữ pháp
                        </BtnPrimary>
                      </article>
                    ))}

                    {filteredGrammarSets.length === 0 && (
                      <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl">
                        Không tìm thấy bộ ngữ pháp nào trong hệ thống.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <SectionTitle
                title={`Danh sách bài học mẹo ${tabs.find((t) => t.id === tab)?.name}`}
                badge={`${displayTips.length} bài học`}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                {displayTips.map((g) => (
                  <article
                    key={g.id}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xs flex flex-col hover:border-primary/30 transition group"
                  >
                    <div className="bg-primary px-6 py-5 text-primary-foreground">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        {g.partName && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                            {g.partName}
                          </span>
                        )}
                        {g.examType && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-900 shadow-xs ml-auto">
                            {g.examType}
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-lg font-bold leading-snug">{g.title}</h3>
                    </div>

                    <div className="space-y-3 p-6 flex-1 flex flex-col justify-between bg-muted/20">
                      <div className="space-y-2.5">
                        {g.tips.map((tip, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-start gap-3 rounded-2xl bg-card border border-border/50 px-4 py-3.5 text-xs font-semibold text-foreground shadow-2xs leading-relaxed"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3">
                        {/* Khi bấm vào nút học mẹo -> mở phòng làm bài không tính thời gian */}
                        <BtnOutline
                          onClick={() => navigate(`/exams/${g.examId}/practice?mode=lesson&unlimited=true`)}
                          className="h-11 w-full !border-primary !text-primary hover:!bg-primary hover:!text-primary-foreground flex items-center justify-center gap-2 text-xs font-bold rounded-2xl cursor-pointer transition-colors shadow-2xs"
                        >
                          <BookOpenText className="h-4 w-4" /> {g.cta}
                        </BtnOutline>
                      </div>
                    </div>
                  </article>
                ))}

                {displayTips.length === 0 && (
                  <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl">
                    Chưa có bài học mẹo nào trong cơ sở dữ liệu.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VocaLessonsPage;
