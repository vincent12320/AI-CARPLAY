import { create } from "zustand";

export type AvatarState = "idle" | "listening" | "speaking";
export type VPAMode = "greeting" | "chat" | "intent";

export type ChatMsg = { role: "user" | "assistant"; content: string };

type VPAState = {
  open: boolean;
  minimized: boolean;
  mode: VPAMode;
  avatar: AvatarState;
  messages: ChatMsg[];
  streaming: string;          // partial assistant content currently streaming
  suggestions: string[];
  panelOpen: boolean;         // settings panel
  setOpen: (v: boolean) => void;
  setMinimized: (v: boolean) => void;
  setMode: (m: VPAMode) => void;
  setAvatar: (a: AvatarState) => void;
  pushMessage: (m: ChatMsg) => void;
  setStreaming: (s: string) => void;
  setSuggestions: (s: string[]) => void;
  reset: () => void;
  togglePanel: () => void;
};

export const useVPA = create<VPAState>((set) => ({
  open: true,
  minimized: false,
  mode: "greeting",
  avatar: "idle",
  messages: [],
  streaming: "",
  suggestions: ["今天天气如何", "去公司怎么走", "放点轻松的音乐"],
  panelOpen: false,
  setOpen: (v) => set({ open: v }),
  setMinimized: (v) => set({ minimized: v }),
  setMode: (m) => set({ mode: m }),
  setAvatar: (a) => set({ avatar: a }),
  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setStreaming: (s) => set({ streaming: s }),
  setSuggestions: (s) => set({ suggestions: s }),
  reset: () => set({ messages: [], streaming: "", mode: "greeting" }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}));
