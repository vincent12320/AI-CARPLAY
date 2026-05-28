import { useState } from "react";
import { Pause, Play, Radio, SkipBack, SkipForward } from "lucide-react";

const TRACKS = [
  { title: "夜空中最亮的星", artist: "逃跑计划", cover: "linear-gradient(135deg,#4a9fd8,#1e3a8a)" },
  { title: "晴天", artist: "周杰伦", cover: "linear-gradient(135deg,#fbbf24,#f97316)" },
  { title: "稻香", artist: "周杰伦", cover: "linear-gradient(135deg,#84cc16,#15803d)" },
];

export function MusicCard() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const t = TRACKS[idx];
  return (
    <div className="flex h-full items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5">
      <div
        className="h-14 w-14 shrink-0 rounded-xl shadow-sm"
        style={{ background: t.cover }}
      />
      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{t.title}</div>
          <div className="truncate text-[11px] text-muted-foreground">{t.artist}</div>
        </div>
        <div className="flex items-center gap-1 text-foreground">
          <button onClick={() => setIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length)} className="rounded-full p-1.5 hover:bg-black/5">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setPlaying((p) => !p)} className="rounded-full bg-foreground p-1.5 text-background hover:opacity-90">
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % TRACKS.length)} className="rounded-full p-1.5 hover:bg-black/5">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button className="ml-auto rounded-full p-1.5 hover:bg-black/5" title="切换音源">
            <Radio className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
