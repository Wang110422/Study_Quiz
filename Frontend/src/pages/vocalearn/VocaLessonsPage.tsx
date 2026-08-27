import React, { useState, useEffect } from 'react';
import {
  BookOpenText,
  Sparkles,
  Layers,
  Play,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import VocaHeader from '@/components/vocalearn/layout/VocaHeader';
import VocaSidebar from '@/components/vocalearn/layout/VocaSidebar';
import { SectionTitle } from '@/components/app/PageHeader';
import {
  EmojiTile,
  Pill,
  BtnPrimary,
  BtnOutline,
  TabPill,
} from '@/components/app/ui-bits';
import grammarService, { type GrammarSetDTO } from '@/services/grammarService';
import studySetService from '@/services/studySetService';
import type { StudySet } from '@/types';

// 6 Tabs chính: Nghe, Nói, Đọc, Viết, Từ vựng, Ngữ pháp
type TabKey = 'listening' | 'speaking' | 'reading' | 'writing' | 'vocab' | 'grammar';
type SkillKey = 'listening' | 'speaking' | 'reading' | 'writing';

interface TabItem {
  id: TabKey;
  name: string;
  emoji: string;
}

const tabs: TabItem[] = [
  { id: 'listening', name: 'Nghe', emoji: '🎧' },
  { id: 'speaking', name: 'Nói', emoji: '🗣️' },
  { id: 'reading', name: 'Đọc', emoji: '📖' },
  { id: 'writing', name: 'Viết', emoji: '✍️' },
  { id: 'vocab', name: 'Từ vựng', emoji: '📚' },
  { id: 'grammar', name: 'Ngữ pháp', emoji: '📐' },
];

// Dữ liệu Bài học mẹo theo từng kỹ năng (lessonGroups)
const lessonGroups: Record<SkillKey, { id: string; title: string; summary: string; tips: string[]; cta: string }[]> = {
  listening: [
    {
      id: 'lis-1',
      title: 'Mẹo làm dạng câu Nhận diện Thông tin chi tiết (Part 1)',
      summary: 'Kỹ năng bắt từ khóa số điện thoại, địa chỉ, tên riêng và ngày tháng với độ chính xác tuyệt đối.',
      tips: [
        'Đọc lướt chỗ trống để dự đoán loại từ cần điền (danh từ, con số, thời gian, tên người).',
        'Cảnh giác với các bẫy sửa lại thông tin của người nói (Ví dụ: "It is 5 PM, oh sorry, 5:30 PM").',
        'Chú ý các âm đuôi /s/, /ed/ và cách phát âm bảng chữ cái tiếng Anh khi đánh vần.',
      ],
      cta: 'Học mẹo Nghe Part 1',
    },
    {
      id: 'lis-2',
      title: 'Chiến thuật làm bài Hội thoại nhiều người nói (Part 2 & 3)',
      summary: 'Cách theo dõi mạch hội thoại, xác định thái độ, cảm xúc và ý định ẩn của người nói.',
      tips: [
        'Xác định rõ câu hỏi đang hỏi về quan điểm của người nam hay người nữ.',
        'Lắng nghe các từ chuyển hướng thảo luận: "However", "Actually", "To be honest".',
        'Đánh dấu đáp án nháp ngay khi nghe được từ đồng nghĩa (paraphrase), không đợi hết bài.',
      ],
      cta: 'Học mẹo Nghe Part 2 & 3',
    },
  ],

  speaking: [
    {
      id: 'spk-1',
      title: 'Cấu trúc trả lời Phần Giới thiệu & Trải nghiệm cá nhân',
      summary: 'Kỹ thuật mở rộng câu trả lời theo công thức A.R.E.A (Answer - Reason - Example - Alternative).',
      tips: [
        'Không trả lời cụt lủn Yes/No; luôn bổ sung ít nhất 2 câu giải thích lý do hoặc ví dụ.',
        'Sử dụng các cụm liên kết tự nhiên: "Well, to be fair...", "I would say that...".',
        'Giữ tốc độ nói vừa phải, phát âm rõ ràng nguyên âm và trọng âm từ.',
      ],
      cta: 'Học mẹo Nói Cá nhân',
    },
    {
      id: 'spk-2',
      title: 'Kỹ năng Miêu tả Tranh & So sánh 2 bức ảnh',
      summary: 'Cách triển khai bài nói theo bố cục tổng quan đến chi tiết và suy đoán hoàn cảnh.',
      tips: [
        'Bắt đầu bằng một câu khái quát: "Both pictures show people engaging in...".',
        'Dùng các cấu trúc suy đoán: "It seems to me that...", "They look like they are...".',
        'So sánh điểm giống nhau trước, sau đó chỉ ra điểm tương phản rõ rệt nhất.',
      ],
      cta: 'Học mẹo Miêu tả & So sánh',
    },
  ],

  reading: [
    {
      id: 'rdg-1',
      title: 'Tuyệt chiêu xử lý dạng bài Nối Tiêu đề (Matching Headings)',
      summary: 'Phương pháp đọc lướt câu chủ đề, phân biệt ý chính bao quát và các ví dụ minh họa.',
      tips: [
        'Đọc danh sách tiêu đề trước để gạch chân các từ khóa phân biệt giữa các tiêu đề.',
        'Tập trung đọc 1-2 câu đầu và câu cuối của mỗi đoạn văn để bắt ý chính.',
        'Nếu một tiêu đề chỉ chứa thông tin của 1 câu đơn lẻ -> Đó là bẫy chi tiết, không phải ý chính.',
      ],
      cta: 'Học mẹo Nối Tiêu đề',
    },
    {
      id: 'rdg-2',
      title: 'Bí quyết làm dạng bài Sắp xếp trật tự câu thành đoạn văn',
      summary: 'Cách tìm câu mở đầu độc lập và dựa vào đại từ thay thế để liên kết logic.',
      tips: [
        'Tìm câu mở đầu: Thường là câu giới thiệu chủ đề, không chứa đại từ như "he", "it", "this".',
        'Theo dõi các từ chỉ thời gian: "Initially", "Then", "Later", "Finally".',
        'Chú ý mạo từ: Danh từ xuất hiện lần đầu dùng "a/an", nhắc lại lần sau dùng "the".',
      ],
      cta: 'Học mẹo Sắp xếp Đoạn văn',
    },
  ],

  writing: [
    {
      id: 'wrt-1',
      title: 'Kỹ thuật Viết Email Trang trọng & Thân mật (Formal / Informal)',
      summary: 'Quy chuẩn lời chào, phân đoạn nội dung và cách kết thư chuẩn xác cho từng đối tượng.',
      tips: [
        'Email thân mật: Dùng từ ngữ tự nhiên, được phép viết tắt (I\'m, don\'t), chào "Hi [Name]".',
        'Email trang trọng: Tuyệt đối không viết tắt, dùng cấu trúc bị động và từ vựng lịch sự.',
        'Đảm bảo trả lời đầy đủ 100% các yêu cầu được nêu trong đề bài.',
      ],
      cta: 'Học mẹo Viết Email',
    },
    {
      id: 'wrt-2',
      title: 'Cấu trúc Viết Bài luận Nghị luận xã hội (Opinion / Discussion)',
      summary: 'Dàn ý 4 đoạn chuẩn mực: Mở bài (Paraphrase + Thesis) - 2 Thân bài - Kết bài.',
      tips: [
        'Mở bài gồm đúng 2 câu: Câu 1 diễn đạt lại đề bài, Câu 2 nêu quan điểm cá nhân.',
        'Mỗi đoạn thân bài chỉ tập trung vào 1 luận điểm chính kèm dẫn chứng hoặc ví dụ cụ thể.',
        'Sử dụng các liên từ học thuật: "Furthermore", "In contrast", "Consequently".',
      ],
      cta: 'Học mẹo Viết Luận',
    },
  ],
};

const VocaLessonsPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('listening');
  const [vocabSets, setVocabSets] = useState<StudySet[]>([]);
  const [grammarSets, setGrammarSets] = useState<GrammarSetDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Tải dữ liệu thật từ CSDL backend cho từ vựng và ngữ pháp
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (tab === 'vocab') {
          const sets = await studySetService.getAllStudySets();
          setVocabSets(sets);
        } else if (tab === 'grammar') {
          const gSets = await grammarService.getAllGrammarSets();
          setGrammarSets(gSets);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bài học:', err);
      } finally {
        setLoading(false);
      }
    };

    if (tab === 'vocab' || tab === 'grammar') {
      fetchData();
    }
  }, [tab]);

  const isSet = tab === 'vocab' || tab === 'grammar';
  const groups = isSet ? [] : lessonGroups[tab as SkillKey] || [];

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
                <span>{t.emoji}</span> {t.name}
              </TabPill>
            ))}
          </div>

          {/* 3. Hiển thị nội dung tương ứng */}
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
                    badge={`${vocabSets.length} bộ`}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {vocabSets.map((s) => {
                      const termsCount = s.vocabularies?.length || s.vocabulariesCount || 0;
                      return (
                        <article
                          key={s.id}
                          className="surface-card flex flex-col gap-3.5 p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xs transition group"
                        >
                          <div className="flex items-start gap-3">
                            <EmojiTile>📚</EmojiTile>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {s.titleName || s.title || `Bộ từ vựng #${s.id}`}
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
                            <Pill tone="info" className="text-[11px]">{s.authorName || 'Hệ thống'}</Pill>
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

                    {vocabSets.length === 0 && (
                      <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl">
                        Chưa có bộ từ vựng nào trong cơ sở dữ liệu.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <SectionTitle
                    title="Bộ ngữ pháp trong cơ sở dữ liệu"
                    badge={`${grammarSets.length} bộ`}
                  />

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {grammarSets.map((s) => (
                      <article
                        key={s.id}
                        className="surface-card flex flex-col gap-3.5 p-6 rounded-3xl border border-border hover:border-primary/40 hover:shadow-xs transition group"
                      >
                        <div className="flex items-start gap-3">
                          <EmojiTile>{s.emoji || '📐'}</EmojiTile>
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

                    {grammarSets.length === 0 && (
                      <div className="surface-card col-span-full p-12 text-center text-sm text-muted-foreground rounded-3xl">
                        Chưa có bộ ngữ pháp nào trong cơ sở dữ liệu.
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
                badge={`${groups.length} nhóm`}
              />

              <div className="grid gap-6 xl:grid-cols-2">
                {groups.map((g) => (
                  <article
                    key={g.id}
                    className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xs flex flex-col"
                  >
                    <div className="bg-primary px-6 py-5 text-primary-foreground">
                      <h3 className="font-display text-lg font-bold">{g.title}</h3>
                      <p className="mt-2 text-xs leading-relaxed text-primary-foreground/85 font-normal">
                        {g.summary}
                      </p>
                    </div>

                    <div className="space-y-3 p-6 flex-1 flex flex-col justify-between bg-muted/20">
                      <div className="space-y-2.5">
                        {g.tips.map((tip) => (
                          <div
                            key={tip}
                            className="flex items-start gap-3 rounded-2xl bg-card border border-border/50 px-4 py-3.5 text-xs font-semibold text-foreground shadow-2xs"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                            <span className="leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3">
                        <Link to="/exams">
                          <BtnOutline className="h-11 w-full !border-primary !text-primary hover:!bg-primary/10 flex items-center justify-center gap-2 text-xs font-bold rounded-2xl cursor-pointer">
                            <BookOpenText className="h-4 w-4" /> {g.cta}
                          </BtnOutline>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VocaLessonsPage;
