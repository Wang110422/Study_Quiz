import { Search, Plus, Bell } from "lucide-react";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border bg-card/85 px-5 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="font-display text-lg font-bold">LingoMaster</span>
      </div>

      <label className="relative hidden flex-1 max-w-xl items-center md:flex">
        <input
          type="search"
          placeholder="Tra cứu từ vựng, bộ thẻ, thư mục..."
          className="h-11 w-full rounded-full border border-input bg-muted/60 pl-11 pr-4 text-sm outline-none transition focus:border-ring focus:bg-card"
        />
      </label>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
        </button>
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-pop transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Tạo mới
        </button>
      </div>

    </header>
  );
}
