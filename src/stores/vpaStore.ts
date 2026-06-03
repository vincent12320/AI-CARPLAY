import { create } from "zustand";

export type AvatarState =
  | "idle"
  | "thinking"
  | "speaking"
  | "happy"
  | "focus"
  | "default"
  | "love"
  | "wink"
  | "surprised";

// forms cycled through automatically when idle (emotional / fun variety)
export const AVATAR_CYCLE: AvatarState[] = [
  "idle",
  "happy",
  "wink",
  "love",
  "surprised",
  "default",
];

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
  suggestionsLoading: boolean;
  roundCount: number;         // completed user+assistant rounds since last feedback
  showFeedback: boolean;      // satisfaction card visible
  feedbackThanks: boolean;    // thank-you message shown
  panelOpen: boolean;         // settings panel
  setOpen: (v: boolean) => void;
  setMinimized: (v: boolean) => void;
  setMode: (m: VPAMode) => void;
  setAvatar: (a: AvatarState) => void;
  pushMessage: (m: ChatMsg) => void;
  setStreaming: (s: string) => void;
  setSuggestions: (s: string[]) => void;
  setSuggestionsLoading: (v: boolean) => void;
  incrementRound: () => void;
  resetRounds: () => void;
  setShowFeedback: (v: boolean) => void;
  setFeedbackThanks: (v: boolean) => void;
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
  suggestionsLoading: false,
  roundCount: 0,
  showFeedback: false,
  feedbackThanks: false,
  panelOpen: false,
  setOpen: (v) => set({ open: v }),
  setMinimized: (v) => set({ minimized: v }),
  setMode: (m) => set({ mode: m }),
  setAvatar: (a) => set({ avatar: a }),
  pushMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  setStreaming: (s) => set({ streaming: s }),
  setSuggestions: (s) => set({ suggestions: s }),
  setSuggestionsLoading: (v) => set({ suggestionsLoading: v }),
  incrementRound: () => set((s) => ({ roundCount: s.roundCount + 1 })),
  resetRounds: () => set({ roundCount: 0 }),
  setShowFeedback: (v) => set({ showFeedback: v }),
  setFeedbackThanks: (v) => set({ feedbackThanks: v }),
  reset: () =>
    set({
      messages: [],
      streaming: "",
      mode: "greeting",
      roundCount: 0,
      showFeedback: false,
      feedbackThanks: false,
    }),
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
}));
