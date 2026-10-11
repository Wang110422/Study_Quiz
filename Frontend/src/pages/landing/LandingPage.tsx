import React, { useState, useEffect, type ComponentType } from "react";
import { Link } from "react-router-dom";
import {
  Languages,
  ScanLine,
  CheckCircle2,
  Zap,
  Upload,
  Sparkles,
  Clock3,
  X,
  FileText,
  Menu,
  ArrowRight,
  ShieldCheck,
  XCircle,
  Check,
  BrainCircuit,
  Target,
  BookOpen,
  Star,
  ChevronDown,
  MessageCircle,
  CirclePlay,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

const minhAnh = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
const quocHuy = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80";
const thaoLinh = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80";

const stats = [
  ["500.000+", "Từ vựng đã tạo tự động"],
  ["98%", "Tiết kiệm thời gian soạn bài"],
  ["50.000+", "Lượt thi thử hoàn thành"],
  ["+1.5 Band", "Mức tăng điểm trung bình"],
];

const testimonials = [
  {
    image: minhAnh,
    name: "Minh Anh",
    role: "Sinh viên ĐH Ngoại Thương",
    result: "IELTS Reading 6.0 → 7.5",
    quote:
      "Trước đây mình mất cả buổi để note từ mới. Giờ chỉ cần chụp trang sách là có ngay flashcard để học.",
  },
  {
    image: quocHuy,
    name: "Quốc Huy",
    role: "Sinh viên ĐH Bách Khoa",
    result: "TOEIC 680 → 835",
    quote:
      "Phòng thi bấm giờ giúp mình quen áp lực thật. Phần phân tích lỗi sai rất rõ và đúng trọng tâm.",
  },
  {
    image: thaoLinh,
    name: "Thảo Linh",
    role: "Học sinh THPT Chuyên Sư Phạm",
    result: "9.2 điểm Tiếng Anh",
    quote:
      "Mình học lại đúng những từ hay quên thay vì ôn cả bộ. Thời gian học giảm nhưng nhớ lâu hơn hẳn.",
  },
];

const faqs = [
  [
    "Ứng dụng hỗ trợ những định dạng file nào?",
    "Bạn có thể tải lên PDF, DOCX, PNG và JPG. Ảnh chụp rõ chữ sẽ cho kết quả trích xuất tốt nhất.",
  ],
  [
    "LingoMaster khác gì so với Quizlet?",
    "LingoMaster tự quét tài liệu để trích xuất từ, tạo nội dung học và còn có phòng thi thử bấm giờ theo format từng kỳ thi.",
  ],
  [
    "Dữ liệu và tài liệu tải lên có được bảo mật không?",
    "Tài liệu của bạn được xử lý an toàn, chỉ phục vụ việc tạo nội dung học và không được công khai cho người khác.",
  ],
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="LingoMaster - về đầu trang">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-pop">
        <Languages className="h-5 w-5" />
      </span>
      <span className="font-display text-xl font-extrabold text-foreground">LingoMaster</span>
    </Link>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-2xl leading-7 text-muted-foreground">{text}</p>}
    </div>
  );
}

function ProductVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl lg:mx-0">
      <div className="marketing-window overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-pop">
        <div className="flex h-11 items-center gap-2 border-b border-border px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning" />
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          <span className="ml-3 rounded-full bg-muted px-4 py-1 text-[10px] text-muted-foreground">
            lingomaster.vn/scan
          </span>
        </div>
        <div className="grid min-h-[390px] gap-4 p-4 sm:grid-cols-[0.92fr_1.08fr] sm:p-6">
          <div className="relative overflow-hidden rounded-2xl bg-secondary p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">IELTS_Reading.pdf</span>
              <span className="rounded-full bg-card px-2 py-1 text-[10px] font-semibold text-success">
                Đang quét
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[88, 96, 72, 91, 64, 84, 74].map((width, index) => (
                <div key={index} className="h-2 rounded-full bg-border" style={{ width: `${width}%` }} />
              ))}
            </div>
            <div className="scan-beam absolute inset-x-3 h-0.5 bg-primary shadow-[0_0_18px_var(--primary)]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-xl border border-primary/20 bg-card/95 p-3 shadow-card">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <ScanLine className="h-4 w-4" /> Đã tìm thấy 24 từ quan trọng
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground shadow-pop">
              <p className="text-xs font-semibold opacity-75">FLASHCARD 01 / 24</p>
              <p className="mt-8 font-display text-3xl font-bold">acquisition</p>
              <p className="mt-1 text-sm opacity-75">/ˌæk.wɪˈzɪʃ.ən/</p>
              <div className="mt-8 border-t border-primary-foreground/20 pt-4 text-sm">
                sự tiếp thu, sự đạt được
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Câu hỏi tự động</span>
                <span className="text-xs font-bold text-success">8/10 điểm</span>
              </div>
              <p className="mt-3 text-sm font-semibold">Choose the best word for the blank.</p>
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-soft p-3 text-xs font-semibold text-success">
                <CheckCircle2 className="h-4 w-4" /> acquisition
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="floating-badge absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-pop sm:flex">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-soft text-success">
          <Zap className="h-5 w-5" />
        </span>
        <span>
          <b className="block text-sm">Hoàn tất trong 3 giây</b>
          <small className="text-muted-foreground">Sẵn sàng để học</small>
        </span>
      </div>
    </div>
  );
}

function FeatureVisual({ type }: { type: "scan" | "memory" | "exam" }) {
  if (type === "scan") {
    return (
      <div className="feature-visual bg-info-soft">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-pop">
          <div className="flex items-center gap-3">
            <span className="icon-tile">
              <Upload />
            </span>
            <div>
              <b className="text-sm">Tải tài liệu lên</b>
              <p className="text-xs text-muted-foreground">PDF, DOCX, PNG, JPG</p>
            </div>
          </div>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <span className="rounded-xl bg-primary-soft p-3">24 từ mới</span>
            <span className="rounded-xl bg-success-soft p-3 text-success">8 câu hỏi</span>
            <span className="rounded-xl bg-warning-soft p-3 text-warning">A2 → B2</span>
            <span className="rounded-xl bg-muted p-3">Có phiên âm</span>
          </div>
        </div>
      </div>
    );
  }
  if (type === "memory") {
    return (
      <div className="feature-visual bg-success-soft">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-pop">
          <div className="flex items-center justify-between">
            <b className="text-sm">Lịch ôn hôm nay</b>
            <span className="text-xs text-success">12 phút</span>
          </div>
          <div className="mt-5 flex items-end justify-between gap-2">
            {[42, 64, 50, 82, 58, 92, 70].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-primary"
                  style={{ height: `${height}px`, opacity: 0.45 + index * 0.07 }}
                />
                <span className="text-[9px] text-muted-foreground">T{index + 2}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-primary-soft p-3 text-xs">
            <b>8 từ cần ôn đúng lúc</b>
            <p className="mt-1 text-muted-foreground">Ưu tiên những từ bạn hay quên.</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="feature-visual bg-warning-soft">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-pop">
        <div className="flex items-center justify-between">
          <b className="text-sm">TOEIC Reading — Part 5</b>
          <span className="flex items-center gap-1 text-xs text-destructive">
            <Clock3 className="h-3.5 w-3.5" /> 09:42
          </span>
        </div>
        <p className="mt-6 text-sm font-medium">The report must be submitted ___ Friday.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded-lg border p-2">A. at</span>
          <span className="rounded-lg border p-2">B. in</span>
          <span className="rounded-lg border border-primary bg-primary-soft p-2 font-bold text-primary">
            C. by
          </span>
          <span className="rounded-lg border p-2">D. on</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-4">
          <span className="text-xs text-muted-foreground">Câu 18 / 30</span>
          <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">
            Dự kiến 825+
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  eyebrow,
  title,
  text,
  bullets,
  type,
  reverse,
}: {
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  text: string;
  bullets: string[];
  type: "scan" | "memory" | "exam";
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <div className={cn(reverse && "lg:order-2")}>
        <span className="icon-tile">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h3 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h3>
        <p className="mt-4 leading-7 text-muted-foreground">{text}</p>
        <ul className="mt-6 space-y-3">
          {bullets.map((item) => (
            <li key={item} className="flex gap-3 text-sm font-medium">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-success" />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className={cn(reverse && "lg:order-1")}>
        <FeatureVisual type={type} />
      </div>
    </div>
  );
}

function DemoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Video demo LingoMaster"
        className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-card shadow-pop"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-4 top-4 z-10 rounded-full cursor-pointer"
          onClick={onClose}
          aria-label="Đóng video"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="aspect-video bg-secondary p-6 sm:p-10">
          <div className="grid h-full gap-4 sm:grid-cols-[0.85fr_1.15fr]">
            <div className="relative overflow-hidden rounded-2xl bg-card p-5">
              <FileText className="h-8 w-8 text-primary" />
              <b className="mt-4 block">Đề thi IELTS Reading.pdf</b>
              <div className="mt-6 space-y-3">
                {[90, 70, 85, 60, 94].map((v) => (
                  <div key={v} className="h-2 rounded bg-border" style={{ width: `${v}%` }} />
                ))}
              </div>
              <div className="scan-beam absolute inset-x-3 h-0.5 bg-primary" />
            </div>
            <div className="flex flex-col justify-center rounded-2xl bg-primary p-6 text-primary-foreground">
              <Sparkles className="h-7 w-7" />
              <p className="mt-4 text-sm font-bold uppercase">3 giây sau</p>
              <p className="mt-2 font-display text-3xl font-bold">
                24 flashcard
                <br />+ 10 câu luyện tập
              </p>
              <p className="mt-4 text-sm opacity-80">
                Đã có nghĩa, phiên âm, ví dụ và phân loại độ khó.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 p-5 border-t border-border">
          <div>
            <b>Quét một lần, học ngay lập tức</b>
            <p className="text-sm text-muted-foreground">Demo mô phỏng quy trình tạo bộ học.</p>
          </div>
          <span className="hidden text-sm font-bold text-primary sm:block">00:30</span>
        </div>
      </div>
    </div>
  );
}

export function MarketingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    document.title = "LingoMaster — Quét tài liệu, học từ và thi thử";
  }, []);

  const nav = [
    ["Tính năng", "#features"],
    ["Kho đề thi", "#exams"],
    ["Bảng giá", "#pricing"],
    ["Cộng đồng", "#community"],
  ];

  const primaryActionTo = isAuthenticated ? "/lessons" : "/login";

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-5 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Điều hướng chính">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-semibold text-muted-foreground transition hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <Button className="h-11 rounded-xl px-5 shadow-pop" asChild>
                <Link to="/lessons">
                  Vào học ngay <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button className="h-11 rounded-xl px-5 shadow-pop" asChild>
                  <Link to="/login">Dùng thử miễn phí</Link>
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        {mobileOpen && (
          <nav className="border-t bg-card px-5 py-4 md:hidden">
            {nav.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-semibold text-foreground"
              >
                {label}
              </a>
            ))}
            <Button className="mt-2 w-full" asChild>
              <Link to={primaryActionTo}>
                {isAuthenticated ? "Vào học ngay" : "Dùng thử miễn phí"}
              </Link>
            </Button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative px-5 pb-24 pt-16 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Học thông minh từ mọi tài liệu
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl text-foreground">
                Biến mọi tài liệu thành{" "}
                <span className="text-primary">bộ thẻ từ vựng & bài thi thử</span> chỉ sau 3 giây.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                Nền tảng học thông minh thay thế cách học thủ công. Tải PDF hoặc chụp ảnh sách để tự
                động tạo flashcard, ôn tập ngắt quãng và cọ xát với phòng thi chuẩn format.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="h-13 rounded-xl px-6 text-base shadow-pop cursor-pointer" asChild>
                  <Link to={primaryActionTo}>
                    Bắt đầu học miễn phí <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-13 rounded-xl px-6 text-base cursor-pointer"
                  onClick={() => setDemoOpen(true)}
                >
                  <CirclePlay className="mr-2 h-5 w-5" /> Xem video demo 30s
                </Button>
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-success" /> Không cần thẻ tín dụng · Bắt đầu
                trong 1 phút
              </p>
            </div>
            <ProductVisual />
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border bg-card px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="text-center">
                  <strong className="font-display text-3xl font-extrabold text-primary sm:text-4xl">
                    {value}
                  </strong>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-sm">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-border pt-7 text-sm font-extrabold text-muted-foreground">
              <span className="text-xs font-medium uppercase text-foreground/70">
                Hỗ trợ kỳ thi
              </span>
              {["TOEIC", "IELTS", "HSK", "JLPT", "THPT Quốc Gia"].map((exam) => (
                <span key={exam} className="text-foreground font-bold">
                  {exam}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Old vs New Section */}
        <section className="px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Không học nhiều hơn — học thông minh hơn"
              title="Từ 2 giờ soạn tay đến 3 giây sẵn sàng học"
              text="Loại bỏ những công việc lặp lại để tập trung vào điều quan trọng nhất: hiểu, nhớ và vận dụng."
            />
            <div className="mt-14 grid overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-2">
              <div className="p-7 sm:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <XCircle className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold">Cách học cũ</h3>
                </div>
                <ul className="mt-7 space-y-5">
                  {[
                    "Chép tay hoặc gõ từng từ lên ứng dụng, mất đến 2 giờ mỗi ngày.",
                    "Thuộc nghĩa nhưng không biết áp dụng vào ngữ cảnh bài đọc.",
                    "Thiếu phòng thi bấm giờ để làm quen áp lực thực tế.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <X className="mt-1 h-4 w-4 flex-none text-destructive" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-primary p-7 text-primary-foreground sm:p-10">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/15">
                    <Zap className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-bold">Giải pháp LingoMaster</h3>
                </div>
                <ul className="mt-7 space-y-5">
                  {[
                    "Quét trang sách hoặc đề thi, có bộ học ngay lập tức.",
                    "Học từ vựng đi cùng câu hỏi và ngữ cảnh thực chiến.",
                    "Thi thử bấm giờ, chấm điểm và chỉ ra điểm yếu tự động.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6">
                      <Check className="mt-1 h-4 w-4 flex-none" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="scroll-mt-20 bg-card px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Bộ công cụ học tập toàn diện"
              title="Một quy trình liền mạch từ tài liệu đến điểm số"
            />
            <div className="mt-20 space-y-24 lg:space-y-32">
              <FeatureRow
                icon={ScanLine}
                eyebrow="OCR & trích xuất tức thì"
                title="Tải tài liệu lên – Nhận bộ từ vựng ngay."
                text="Hệ thống nhận diện từ quan trọng, tra sẵn phiên âm, nghĩa tiếng Việt, ví dụ và tự động phân loại theo độ khó."
                bullets={[
                  "Nhận PDF, Word và ảnh chụp",
                  "Tự động lọc từ quan trọng",
                  "Sửa và duyệt trước khi lưu",
                ]}
                type="scan"
              />
              <FeatureRow
                icon={BrainCircuit}
                eyebrow="Spaced Repetition"
                title="Ôn tập khoa học, không lo học trước quên sau."
                text="Lịch ôn tự động phân tích từ nào bạn hay quên và nhắc lại đúng thời điểm vàng của trí nhớ."
                bullets={[
                  "Flashcard và viết chính tả",
                  "Trắc nghiệm phản xạ và ghép thẻ",
                  "Lịch ôn cá nhân hóa mỗi ngày",
                ]}
                type="memory"
                reverse
              />
              <div id="exams" className="scroll-mt-28">
                <FeatureRow
                  icon={Target}
                  eyebrow="Phòng luyện thi"
                  title="Không chỉ học từ – Bạn làm chủ cả kỳ thi."
                  text="Chuyển bộ từ vừa học thành câu hỏi chuẩn format, bấm giờ như thi thật và nhận kết quả ngay khi hoàn thành."
                  bullets={[
                    "Reading, Listening và Fill-in-the-blank",
                    "Đồng hồ thi và lưu tiến độ",
                    "Chấm điểm, giải thích và phân tích điểm yếu",
                  ]}
                  type="exam"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section className="px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Bắt đầu thật đơn giản"
              title="Từ trang sách đến phòng thi chỉ trong 3 bước"
            />
            <div className="relative mt-14 grid gap-6 md:grid-cols-3">
              {[
                [Upload, "01", "Quét tài liệu", "Chụp ảnh hoặc tải file đề thi, tài liệu của bạn lên."],
                [BookOpen, "02", "Luyện từ vựng", "Ôn nhanh qua các bộ thẻ sinh tự động theo lịch ghi nhớ."],
                [Target, "03", "Thi thử thực tế", "Làm bài kiểm tra mô phỏng để tự tin khi bước vào kỳ thi."],
              ].map(([Icon, number, title, desc]) => {
                const StepIcon = Icon as typeof Upload;
                return (
                  <article
                    key={String(number)}
                    className="relative rounded-2xl border border-border bg-card p-7 shadow-card"
                  >
                    <span className="text-xs font-bold text-primary">BƯỚC {String(number)}</span>
                    <span className="mt-8 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <StepIcon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold">{String(title)}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(desc)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Community / Testimonials */}
        <section id="community" className="scroll-mt-20 bg-secondary px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Cộng đồng học hiệu quả"
              title="Điểm số thật, thay đổi thật"
              text="Hàng nghìn bạn học đang tiết kiệm thời gian mỗi ngày và tiến gần hơn đến mục tiêu."
            />
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-card"
                >
                  <div className="flex gap-1 text-warning">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="mt-5 text-sm leading-7">“{item.quote}”</blockquote>
                  <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                    <img
                      src={item.image}
                      alt={`Ảnh ${item.name}`}
                      loading="lazy"
                      width={816}
                      height={816}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <b className="block text-sm">{item.name}</b>
                      <p className="truncate text-xs text-muted-foreground">{item.role}</p>
                    </div>
                    <span className="ml-auto hidden rounded-full bg-success-soft px-2.5 py-1 text-[10px] font-bold text-success sm:block">
                      {item.result}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Bảng giá minh bạch"
              title="Chọn kế hoạch phù hợp với mục tiêu"
              text="Bắt đầu miễn phí. Nâng cấp khi bạn cần quét nhiều hơn và luyện đề không giới hạn."
            />
            <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
              {[
                {
                  name: "Miễn phí",
                  price: "0đ",
                  note: "Dùng mãi mãi",
                  items: ["Quét 5 trang mỗi tuần", "Flashcard cơ bản", "2 đề thi thử mỗi tháng"],
                  popular: false,
                  cta: "Bắt đầu miễn phí",
                },
                {
                  name: "Học sinh / Sinh viên",
                  price: "79.000đ",
                  note: "/ tháng",
                  items: [
                    "Quét tài liệu không giới hạn",
                    "Mở khóa toàn bộ đề thi",
                    "Phân tích điểm yếu thông minh",
                    "Tất cả chế độ học",
                  ],
                  popular: true,
                  cta: "Dùng thử Pro miễn phí",
                },
                {
                  name: "Trọn đời",
                  price: "1.490.000đ",
                  note: "Thanh toán một lần",
                  items: [
                    "Toàn bộ quyền lợi Pro",
                    "Không phí gia hạn",
                    "Tính năng mới trọn đời",
                    "Hỗ trợ ưu tiên",
                  ],
                  popular: false,
                  cta: "Sở hữu trọn đời",
                },
              ].map((plan) => (
                <article
                  key={plan.name}
                  className={cn(
                    "relative flex flex-col rounded-2xl border bg-card p-7 shadow-card",
                    plan.popular ? "border-primary shadow-pop" : "border-border"
                  )}
                >
                  {plan.popular && (
                    <span className="absolute right-5 top-0 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase text-primary-foreground">
                      Phổ biến nhất
                    </span>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-5 flex items-end gap-2">
                    <strong className="font-display text-4xl font-extrabold">{plan.price}</strong>
                    <span className="pb-1 text-xs text-muted-foreground">{plan.note}</span>
                  </div>
                  <ul className="my-7 space-y-3">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 flex-none text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="mt-auto h-11 rounded-xl"
                    asChild
                  >
                    <Link to={primaryActionTo}>{plan.cta}</Link>
                  </Button>
                </article>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-muted-foreground">
              Gói năm tiết kiệm 35% · Có thể hủy bất kỳ lúc nào
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="bg-card px-5 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <SectionHeading eyebrow="Câu hỏi thường gặp" title="Mọi điều bạn cần biết" />
            <div className="mt-12 divide-y divide-border border-y border-border">
              {faqs.map(([question, answer], index) => (
                <div key={question}>
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-between rounded-none px-0 py-5 text-left text-base font-bold cursor-pointer hover:bg-transparent"
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    aria-expanded={openFaq === index}
                  >
                    {question}
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition duration-200",
                        openFaq === index && "rotate-180"
                      )}
                    />
                  </Button>
                  {openFaq === index && (
                    <p className="pb-6 pr-10 text-sm leading-7 text-muted-foreground">{answer}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-5 py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-pop sm:px-10 lg:py-20">
            <Sparkles className="mx-auto h-8 w-8" />
            <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold sm:text-5xl">
              Sẵn sàng bứt phá điểm số ngay hôm nay?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 opacity-80 sm:text-base">
              Gia nhập cộng đồng hơn 50.000 sĩ tử ôn thi thông minh hơn mỗi ngày.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 h-13 rounded-xl px-6 text-primary shadow-lg cursor-pointer"
              asChild
            >
              <Link to={primaryActionTo}>
                Tạo tài khoản học miễn phí ngay <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-5 pb-8 pt-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-border pb-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
                Nền tảng biến mọi tài liệu thành trải nghiệm học tập và luyện thi thông minh.
              </p>
            </div>
            {[
              ["Sản phẩm", "Tính năng", "Kho đề thi", "Bảng giá"],
              ["Cộng đồng", "Fanpage", "Nhóm học tập", "Trung tâm hỗ trợ"],
              ["Pháp lý", "Điều khoản sử dụng", "Chính sách bảo mật", "Liên hệ"],
            ].map(([heading, ...items]) => (
              <div key={heading}>
                <b className="text-sm">{heading}</b>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item}>
                      <a
                        href={item === "Bảng giá" ? "#pricing" : "#features"}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>© 2026 LingoMaster. All rights reserved.</span>
            <span className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> support@lingomaster.vn
            </span>
          </div>
        </div>
      </footer>

      {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
    </div>
  );
}

export default MarketingPage;
