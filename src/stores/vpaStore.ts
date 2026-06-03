import { create } from "zustand";
import { getChatHistory, saveChatMessage, clearChatHistory } from "@/lib/api/chat.functions";
import { logDbError } from "@/lib/api/errors";

export type AvatarState =
  | "idle"
  | "thinking"
  | "speaking"
  | "happy"
  | "sad"
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
export type StreamingPhase = "idle" | "thinking" | "answering";

export type ChatMsg = { role: "user" | "assistant"; content: string };

type VPAState = {
  open: boolean;
  minimized: boolean;
  mode: VPAMode;
  avatar: AvatarState;
  messages: ChatMsg[];
  streaming: string;          // partial assistant content currently streaming
  streamingPhase: StreamingPhase; // thinking → answering → idle
  suggestions: string[];
  suggestionsLoading: boolean;
  roundCount: number;         // completed user+assistant rounds since last feedback
  showFeedback: boolean;      // satisfaction card visible
  feedbackThanks: boolean;    // thank-you message shown
  panelOpen: boolean;         // settings panel
  syncStatus: "idle" | "loading" | "synced" | "error";
  setOpen: (v: boolean) => void;
  setMinimized: (v: boolean) => void;
  setMode: (m: VPAMode) => void;
  setAvatar: (a: AvatarState) => void;
  pushMessage: (m: ChatMsg) => void;
  setStreaming: (s: string) => void;
  setStreamingPhase: (p: StreamingPhase) => void;
  setSuggestions: (s: string[]) => void;
  setSuggestionsLoading: (v: boolean) => void;
  incrementRound: () => void;
  resetRounds: () => void;
  setShowFeedback: (v: boolean) => void;
  setFeedbackThanks: (v: boolean) => void;
  reset: () => void;
  togglePanel: () => void;
  hydrateFromServer: () => Promise<void>;
};

export const useVPA = create<VPAState>((set) => ({
  open: true,
  minimized: false,
  mode: "greeting",
  avatar: "idle",
  messages: [],
  streaming: "",
  streamingPhase: "idle",
  suggestions: ["今天天气如何", "去公司怎么走", "放点轻松的音乐"],
  suggestionsLoading: false,
  roundCount: 0,
  showFeedback: false,
  feedbackThanks: false,
  panelOpen: false,
  syncStatus: "idle",
  setOpen: (v) => set({ open: v }),
  setMinimized: (v) => set({ minimized: v }),
  setMode: (m) => set({ mode: m }),
  setAvatar: (a) => set({ avatar: a }),
  pushMessage: (m) => {
    set((s) => ({ messages: [...s.messages, m] }));
    // fire-and-forget: 异步写入服务端，不阻塞 UI
    saveChatMessage({ data: m }).catch((e) => logDbError("saveChatMessage", e));
  },
  setStreaming: (s) => set({ streaming: s }),
  setStreamingPhase: (p) => set({ streamingPhase: p }),
  setSuggestions: (s) => set({ suggestions: s }),
  setSuggestionsLoading: (v) => set({ suggestionsLoading: v }),
  incrementRound: () => set((s) => ({ roundCount: s.roundCount + 1 })),
  resetRounds: () => set({ roundCount: 0 }),
  setShowFeedback: (v) => set({ showFeedback: v }),
  setFeedbackThanks: (v) => set({ feedbackThanks: v }),
  reset: () => {
    set({
      messages: [],
      streaming: "",
      streamingPhase: "idle",
      mode: "greeting",
      roundCount: 0,
      showFeedback: false,
      feedbackThanks: false,
    });
    clearChatHistory().catch((e) => logDbError("clearChatHistory", e));
  },
  togglePanel: () => set((s) => ({ panelOpen: !s.panelOpen })),
  hydrateFromServer: async () => {
    const current = useVPA.getState();
    if (current.syncStatus === "synced" || current.syncStatus === "loading") return;
    set({ syncStatus: "loading" });
    try {
      const history = await getChatHistory({ data: { limit: 200 } });
      set({ messages: history, syncStatus: "synced" });
    } catch (e) {
      logDbError("hydrateVPA", e);
      set({ syncStatus: "error" });
    }
  },
}));
