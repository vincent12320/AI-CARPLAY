import { useEffect } from "react";
import { Pause, Play, ListMusic, SkipBack, SkipForward } from "lucide-react";
import { useMusic } from "@/stores/musicStore";
import { useUI } from "@/stores/uiStore";

export function MusicCard() {
  const { index, playing, toggle, next, prev } = useMusic();
  const openMusic = useUI((s) => s.openMusic);
  const t = useMusic((s) => s.current());

  // global playback clock (MusicCard is always mounted)
  useEffect(() => {
    const id = setInterval(() => useMusic.getState().tick(), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full items-center gap-3 rounded-2xl bg-gradient-to-br from-white/95 to-indigo-50/70 p-3 shadow-md ring-1 ring-black/5 backdrop-blur-sm">
      <button onClick={openMusic} title="打开音乐" className="shrink-0">
        <Vinyl cover={t.cover} playing={playing} key={index} />
      </button>
      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        <button onClick={openMusic} className="min-w-0 text-left">
          <div className="truncate text-sm font-semibold">{t.title}</div>
          <div className="truncate text-[11px] text-muted-foreground">{t.artist}</div>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="rounded-full p-1.5 text-muted-foreground transition hover:bg-black/5 hover:text-foreground">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={toggle}
            className="rounded-full bg-brand p-[7px] text-white shadow-sm transition hover:bg-brand/90 hover:shadow-md active:scale-95"
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-white" />}
          </button>
          <button onClick={next} className="rounded-full p-1.5 text-muted-foreground transition hover:bg-black/5 hover:text-foreground">
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button onClick={openMusic} className="ml-auto rounded-full p-1.5 text-muted-foreground transition hover:bg-black/5 hover:text-foreground" title="音乐列表">
            <ListMusic className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Vinyl({ cover, playing }: { cover: string; playing: boolean }) {
  return (
    <div className="relative h-14 w-14 shrink-0">
      {playing && (
        <span className="absolute -inset-1 rounded-full bg-brand/20 blur-sm animate-pulse" />
      )}
      <div
        className="relative h-14 w-14 rounded-full animate-vinyl shadow-lg"
        style={{
          animationPlayState: playing ? "running" : "paused",
          background:
            "repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #2c2c2c 2px, #1a1a1a 3px)",
        }}
      >
        <div className="absolute inset-0 rounded-full ring-1 ring-black/60" />
        <div
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-black/40"
          style={{ background: cover }}
        />
        <div className="absolute left-1/2 top-1/2 h-[7%] w-[7%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 ring-1 ring-black/30" />
      </div>
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
