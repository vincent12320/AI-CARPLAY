import { useEffect } from "react";
import {
  X, Play, Pause, SkipBack, SkipForward, Heart, Repeat, Shuffle,
  ListMusic, Search, Radio, Flame, Sparkles, Music2,
} from "lucide-react";
import { useUI } from "@/stores/uiStore";
import { useMusic, TRACKS, fmtTime, type Track } from "@/stores/musicStore";
import { useState } from "react";

const PLAYLISTS = [
  { title: "热门榜单", sub: "飙升音乐", cover: "linear-gradient(135deg,#a78bfa,#ec4899)" },
  { title: "推荐歌曲", sub: "专属推荐", cover: "linear-gradient(135deg,#38bdf8,#6366f1)" },
  { title: "摇滚精选", sub: "专属推荐", cover: "linear-gradient(135deg,#2dd4bf,#0ea5e9)" },
  { title: "轻松一刻", sub: "助眠白噪", cover: "linear-gradient(135deg,#fbbf24,#f43f5e)" },
];

const RADIOS = [
  { title: "驾驶电台", cover: "linear-gradient(135deg,#6366f1,#0ea5e9)" },
  { title: "情感夜话", cover: "linear-gradient(135deg,#ec4899,#8b5cf6)" },
  { title: "新闻早报", cover: "linear-gradient(135deg,#10b981,#0d9488)" },
  { title: "相声段子", cover: "linear-gradient(135deg,#f59e0b,#ef4444)" },
];

const TABS = ["发现音乐", "我的收藏", "我的下载"];

export function MusicApp() {
  const open = useUI((s) => s.musicOpen);
  const close = useUI((s) => s.closeMusic);
  const [tab, setTab] = useState(0);
  const { index, playing, progress, favorites, toggle, next, prev, select, setProgress, toggleFavorite } = useMusic();
  const cur = TRACKS[index];

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => useMusic.getState().tick(), 1000);
    return () => clearInterval(id);
  }, [open]);

  if (!open) return null;

  const list = tab === 1 ? TRACKS.filter((t) => favorites.includes(t.id)) : TRACKS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm app-overlay-fade" onClick={close} />
      <div className="glass-strong relative z-10 flex h-[94%] w-[97%] max-w-[1220px] overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5 app-pop">
        {/* ===== Left: now playing ===== */}
        <aside className="relative hidden w-[320px] shrink-0 flex-col items-center gap-4 bg-gradient-to-b from-brand/15 to-brand/5 p-7 md:flex">
          <div className="mt-2 flex items-center gap-2 self-start text-xs font-semibold text-muted-foreground">
            <Music2 className="h-4 w-4 text-brand" /> 正在播放
          </div>
          {/* vinyl */}
          <div className="relative mt-3 grid place-items-center">
            <div className="pointer-events-none absolute -top-3 right-6 z-20 origin-top">
              <div className="h-3 w-3 rounded-full bg-neutral-400 ring-2 ring-white" />
              <div
                className="ml-1 h-14 w-[3px] origin-top rounded-full bg-neutral-500"
                style={{ transform: playing ? "rotate(20deg)" : "rotate(-2deg)", transition: "transform .5s" }}
              />
            </div>
            <div
              className="h-52 w-52 rounded-full shadow-xl"
              style={{
                animation: "vinyl-spin 6s linear infinite",
                animationPlayState: playing ? "running" : "paused",
                background:
                  "repeating-radial-gradient(circle at center,#171717 0px,#171717 2px,#2c2c2c 4px,#171717 6px)",
              }}
            >
              <div
                className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-black/40"
                style={{ background: cur.cover }}
              />
              <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-200 ring-1 ring-black/30" />
            </div>
          </div>
          <div className="mt-3 text-center">
            <h2 className="text-xl font-bold text-foreground">{cur.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{cur.artist} · {cur.album}</p>
          </div>
          {/* progress */}
          <div className="mt-2 w-full">
            <input
              type="range"
              min={0}
              max={cur.duration}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-brand"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{fmtTime(progress)}</span>
              <span>{fmtTime(cur.duration)}</span>
            </div>
          </div>
          {/* controls */}
          <div className="mt-1 flex items-center gap-5">
            <button className="text-muted-foreground hover:text-foreground"><Shuffle className="h-5 w-5" /></button>
            <button onClick={prev} className="text-foreground hover:scale-110 transition"><SkipBack className="h-6 w-6" /></button>
            <button onClick={toggle} className="grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg hover:bg-brand/90">
              {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
            </button>
            <button onClick={next} className="text-foreground hover:scale-110 transition"><SkipForward className="h-6 w-6" /></button>
            <button
              onClick={() => toggleFavorite(cur.id)}
              className={favorites.includes(cur.id) ? "text-rose-500" : "text-muted-foreground hover:text-foreground"}
            >
              <Heart className="h-5 w-5" fill={favorites.includes(cur.id) ? "currentColor" : "none"} />
            </button>
          </div>
        </aside>

        {/* ===== Right: browse ===== */}
        <section className="flex flex-1 flex-col overflow-hidden">
          {/* header */}
          <div className="flex items-center gap-6 px-7 pt-5">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`relative pb-1 text-base font-semibold transition ${i === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {t}
                {i === tab && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand" />}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-sm text-muted-foreground">
              <Search className="h-4 w-4" /> 搜索音乐
            </div>
            <button onClick={close} className="grid h-9 w-9 place-items-center rounded-full hover:bg-foreground/10">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 pb-6 pt-4">
            {tab === 0 && (
              <>
                {/* feature playlists */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {PLAYLISTS.map((p) => (
                    <button
                      key={p.title}
                      onClick={() => select(TRACKS[Math.floor(Math.random() * TRACKS.length)].id)}
                      className="group relative h-28 overflow-hidden rounded-2xl p-4 text-left text-white shadow-md"
                      style={{ background: p.cover }}
                    >
                      <Flame className="absolute right-3 top-3 h-5 w-5 opacity-70" />
                      <p className="text-xs opacity-90">{p.sub}</p>
                      <p className="mt-1 text-lg font-bold">{p.title}</p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0.5 text-[11px] backdrop-blur">
                        <Play className="h-3 w-3" /> 播放
                      </span>
                    </button>
                  ))}
                </div>

                <SectionTitle icon={Sparkles}>能量充电</SectionTitle>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-2">
                  {TRACKS.map((t, i) => (
                    <SongRow key={t.id} track={t} n={i + 1} active={t.id === cur.id} playing={playing}
                      fav={favorites.includes(t.id)}
                      onPlay={() => (t.id === cur.id ? toggle() : select(t.id))}
                      onFav={() => toggleFavorite(t.id)} />
                  ))}
                </div>

                <SectionTitle icon={Radio}>专属电台</SectionTitle>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {RADIOS.map((r) => (
                    <button key={r.title} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5 transition hover:bg-white">
                      <span className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: r.cover }}>
                        <Radio className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-semibold text-foreground">{r.title}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {tab !== 0 && (
              <div>
                <SectionTitle icon={tab === 1 ? Heart : ListMusic}>{tab === 1 ? "我的收藏" : "我的下载"}</SectionTitle>
                {list.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">这里还没有歌曲～</p>
                ) : (
                  <div className="grid grid-cols-1 gap-x-6 lg:grid-cols-2">
                    {list.map((t, i) => (
                      <SongRow key={t.id} track={t} n={i + 1} active={t.id === cur.id} playing={playing}
                        fav={favorites.includes(t.id)}
                        onPlay={() => (t.id === cur.id ? toggle() : select(t.id))}
                        onFav={() => toggleFavorite(t.id)} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-6 flex items-center gap-2 text-base font-bold text-foreground">
      <Icon className="h-4 w-4 text-brand" /> {children}
    </h3>
  );
}

function SongRow({ track, n, active, playing, fav, onPlay, onFav }: {
  track: Track; n: number; active: boolean; playing: boolean; fav: boolean;
  onPlay: () => void; onFav: () => void;
}) {
  return (
    <div className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${active ? "bg-brand/10" : "hover:bg-black/5"}`}>
      <button onClick={onPlay} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg shadow-sm" style={{ background: track.cover }}>
        <span className="absolute inset-0 grid place-items-center bg-black/30 text-white opacity-0 transition group-hover:opacity-100">
          {active && playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </span>
      </button>
      <div className="min-w-0 flex-1" onClick={onPlay} role="button">
        <p className={`truncate text-sm font-semibold ${active ? "text-brand" : "text-foreground"}`}>{track.title}</p>
        <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
      </div>
      <span className="text-xs text-muted-foreground">{fmtTime(track.duration)}</span>
      <button onClick={onFav} className={fav ? "text-rose-500" : "text-muted-foreground opacity-0 transition group-hover:opacity-100"}>
        <Heart className="h-4 w-4" fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}
