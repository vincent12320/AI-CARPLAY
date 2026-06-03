import { useEffect, useState } from "react";
import { Bell, Bluetooth, Mic, Plug, Settings, Signal } from "lucide-react";
import { useVPA } from "@/stores/vpaStore";

export function TopStatusBar() {
  const [now, setNow] = useState(() => fmtTime(new Date()));
  const togglePanel = useVPA((s) => s.togglePanel);
  const open = useVPA((s) => s.open);
  const setOpen = useVPA((s) => s.setOpen);
  const setMinimized = useVPA((s) => s.setMinimized);

  useEffect(() => {
    const t = setInterval(() => setNow(fmtTime(new Date())), 30_000);
    return () => clearInterval(t);
  }, []);

  const handleOpenVPA = () => {
    setOpen(true);
    setMinimized(false);
  };

  return (
    <div className="flex h-[52px] w-full items-center justify-between px-5 text-white">
      <div className="flex items-center gap-4 text-sm font-medium drop-shadow">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-md ring-1 ring-white/40">
          <span className="text-xs">妙</span>
        </div>
        <Bell className="h-4 w-4 opacity-90" />
        <span className="flex items-center gap-1">☀ 12°</span>
        <span className="rounded-full bg-success/90 px-2 py-0.5 text-[11px] font-semibold text-white">
          32 优
        </span>
        <span className="text-lg font-semibold tracking-wide">{now}</span>
      </div>

      <div className="flex items-center gap-4 text-white/90 drop-shadow">
        <span className="flex items-center gap-1 text-xs">
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" /> REC
        </span>
        <Plug className="h-4 w-4" />
        <Bluetooth className="h-4 w-4" />
        <span className="flex items-center gap-1 text-xs"><Signal className="h-4 w-4" /> 5G</span>
        <button
          onClick={togglePanel}
          className="rounded-full p-1.5 hover:bg-white/20 transition"
          aria-label="设置"
        >
          <Settings className="h-4 w-4" />
        </button>
        <Mic
          className={`h-4 w-4 cursor-pointer transition ${open ? "opacity-60" : "opacity-100 text-brand animate-pulse"}`}
          onClick={handleOpenVPA}
        />
      </div>
    </div>
  );
}

function fmtTime(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n: number) {
  return n.toString().padStart(2, "0");
}
