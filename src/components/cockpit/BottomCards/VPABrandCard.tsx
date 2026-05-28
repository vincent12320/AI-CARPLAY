import { useEffect, useState } from "react";
import { useVPA } from "@/stores/vpaStore";
import { useSettings } from "@/stores/settingsStore";

const HINTS = [
  '试试说"今天天气如何"',
  '试试说"导航回家"',
  '试试说"放首民谣"',
  '试试说"温度调到 22 度"',
];

export function VPABrandCard() {
  const setMode = useVPA((s) => s.setMode);
  const setOpen = useVPA((s) => s.setOpen);
  const setMinimized = useVPA((s) => s.setMinimized);
  const name = useSettings((s) => s.persona.name);
  const [hintIdx, setHintIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHintIdx((i) => (i + 1) % HINTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <button
      onClick={() => { setOpen(true); setMinimized(false); setMode("chat"); }}
      className="group flex h-full flex-col items-stretch justify-between rounded-2xl bg-gradient-to-br from-brand to-[#1e3a8a] p-3 text-left text-white shadow-md ring-1 ring-white/20"
    >
      <div className="text-sm font-bold tracking-wider">✦ {name}</div>
      <div className="flex items-end justify-between gap-2">
        <div className="text-[11px] leading-tight opacity-90 line-clamp-2">{HINTS[hintIdx]}</div>
        <Waveform />
      </div>
    </button>
  );
}

function Waveform() {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white/90"
          style={{
            height: "100%",
            animation: `wave-bar 1.1s ease-in-out ${i * 0.08}s infinite`,
            transformOrigin: "bottom",
          }}
        />
      ))}
    </div>
  );
}
