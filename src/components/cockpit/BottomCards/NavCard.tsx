import { Home, Building2, Search } from "lucide-react";
import { toast } from "sonner";

export function NavCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5">
      <div className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="搜索目的地"
          className="w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              toast.success(`正在规划：${(e.target as HTMLInputElement).value}`);
            }
          }}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => toast.success("正在导航回家 🏠")}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-black/5 py-1.5 text-xs font-medium hover:bg-black/10"
        >
          <Home className="h-3.5 w-3.5" /> 回家
        </button>
        <button
          onClick={() => toast.success("正在导航去公司 🏢")}
          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-black/5 py-1.5 text-xs font-medium hover:bg-black/10"
        >
          <Building2 className="h-3.5 w-3.5" /> 去公司
        </button>
      </div>
    </div>
  );
}
