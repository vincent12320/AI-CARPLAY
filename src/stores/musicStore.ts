import { create } from "zustand";

export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // seconds
  cover: string;    // css background (gradient)
};

export const TRACKS: Track[] = [
  { id: "t1", title: "夜空中最亮的星", artist: "逃跑计划", album: "世界", duration: 252, cover: "linear-gradient(135deg,#4a9fd8,#1e3a8a)" },
  { id: "t2", title: "晴天", artist: "周杰伦", album: "叶惠美", duration: 269, cover: "linear-gradient(135deg,#fbbf24,#f97316)" },
  { id: "t3", title: "稻香", artist: "周杰伦", album: "魔杰座", duration: 223, cover: "linear-gradient(135deg,#84cc16,#15803d)" },
  { id: "t4", title: "Love The Way You Lie", artist: "Eminem", album: "Recovery", duration: 263, cover: "linear-gradient(135deg,#ef4444,#7f1d1d)" },
  { id: "t5", title: "Shape Of You", artist: "Ed Sheeran", album: "÷", duration: 234, cover: "linear-gradient(135deg,#06b6d4,#3b82f6)" },
  { id: "t6", title: "Havana", artist: "Camila Cabello", album: "Camila", duration: 217, cover: "linear-gradient(135deg,#f472b6,#a21caf)" },
  { id: "t7", title: "我的新衣", artist: "VAVA", album: "21", duration: 198, cover: "linear-gradient(135deg,#8b5cf6,#4c1d95)" },
  { id: "t8", title: "NOJITO", artist: "周杰伦", album: "最伟大的作品", duration: 245, cover: "linear-gradient(135deg,#10b981,#064e3b)" },
];

type MusicState = {
  index: number;
  playing: boolean;
  progress: number;     // seconds played for current track
  favorites: string[];
  current: () => Track;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  select: (id: string) => void;
  setProgress: (s: number) => void;
  tick: () => void;
  toggleFavorite: (id: string) => void;
};

export const useMusic = create<MusicState>((set, get) => ({
  index: 3,
  playing: true,
  progress: 140,
  favorites: ["t1", "t4"],
  current: () => TRACKS[get().index],
  play: () => set({ playing: true }),
  pause: () => set({ playing: false }),
  toggle: () => set((s) => ({ playing: !s.playing })),
  next: () => set((s) => ({ index: (s.index + 1) % TRACKS.length, progress: 0, playing: true })),
  prev: () => set((s) => ({ index: (s.index - 1 + TRACKS.length) % TRACKS.length, progress: 0, playing: true })),
  select: (id) => {
    const i = TRACKS.findIndex((t) => t.id === id);
    if (i >= 0) set({ index: i, progress: 0, playing: true });
  },
  setProgress: (s) => set({ progress: s }),
  tick: () =>
    set((st) => {
      if (!st.playing) return st;
      const dur = TRACKS[st.index].duration;
      if (st.progress >= dur) {
        return { index: (st.index + 1) % TRACKS.length, progress: 0 };
      }
      return { progress: st.progress + 1 };
    }),
  toggleFavorite: (id) =>
    set((s) => ({
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    })),
}));

export function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
