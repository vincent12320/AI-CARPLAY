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
      <Vinyl cover={t.cover} playing={playing} />
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

function Vinyl({ cover, playing }: { cover: string; playing: boolean }) {
  return (
    <div className="relative h-14 w-14 shrink-0">
      {/* record disc */}
      <div
        className="h-14 w-14 rounded-full animate-vinyl shadow-md"
        style={{
          animationPlayState: playing ? "running" : "paused",
          background:
            "repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #2c2c2c 2px, #1a1a1a 3px)",
        }}
      >
        {/* grooves outer ring tint */}
        <div className="absolute inset-0 rounded-full ring-1 ring-black/60" />
        {/* center label = album cover */}
        <div
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-black/40"
          style={{ background: cover }}
        />
        {/* spindle hole */}
        <div className="absolute left-1/2 top-1/2 h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 ring-1 ring-black/30" />
      </div>
      {/* static tonearm (top-right, fixed angle) */}
      <div className="pointer-events-none absolute -right-1 -top-1">
        <div className="relative">
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-neutral-400 ring-1 ring-black/20" />
          <span
            className="absolute right-1 top-1 block h-6 w-[3px] origin-top rounded-full bg-neutral-500"
            style={{ transform: "rotate(38deg)" }}
          />
          <span
            className="absolute h-1.5 w-1.5 rounded-full bg-neutral-600"
            style={{ right: -1, top: 22 }}
          />
        </div>
      </div>
    </div>
  );
}
