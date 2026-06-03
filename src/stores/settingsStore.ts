import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMemories, addMemory as addServerMemory, removeMemory as removeServerMemory, clearMemories as clearServerMemories } from "@/lib/api/memory.functions";
import { logDbError } from "@/lib/api/errors";

export type AIConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  stream: boolean;
};

export type DifyConfig = {
  endpoint: string;
  apiKey: string;
  enabled: boolean;
};

export type IntentRule = {
  name: string;
  patterns: string[];
  action: string;
};

export type Persona = {
  name: string;
  tone: "friendly" | "professional" | "playful" | "calm";
  language: "zh-CN" | "en-US";
  avatarColor: string;
  greetingTemplate: string;
};

export type MemoryItem = {
  id: string;
  key: string;
  value: string;
  createdAt: number;
};

type SettingsState = {
  ai: AIConfig;
  dify: DifyConfig;
  intentRules: IntentRule[];
  memoryEnabled: boolean;
  memories: MemoryItem[];
  persona: Persona;
  setAI: (p: Partial<AIConfig>) => void;
  setDify: (p: Partial<DifyConfig>) => void;
  setIntentRules: (r: IntentRule[]) => void;
  setMemoryEnabled: (v: boolean) => void;
  addMemory: (key: string, value: string) => void;
  removeMemory: (id: string) => void;
  clearMemories: () => void;
  setPersona: (p: Partial<Persona>) => void;
  hydrateMemoriesFromServer: () => Promise<void>;
};

const DEFAULT_INTENT_RULES: IntentRule[] = [
  { name: "导航", patterns: ["去", "导航", "回家", "公司"], action: "navigation" },
  { name: "媒体", patterns: ["播放", "音乐", "歌", "下一首"], action: "media" },
  { name: "氛围", patterns: ["灯光", "氛围", "亮度", "颜色"], action: "ambient" },
  { name: "车控", patterns: ["温度", "空调", "车窗", "座椅", "锁车"], action: "vehicle" },
  { name: "闲聊", patterns: ["你好", "聊聊", "讲个"], action: "chat" },
];

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      ai: { baseURL: "https://api.openai.com/v1", apiKey: "", model: "gpt-4o-mini", stream: true },
      dify: { endpoint: "", apiKey: "", enabled: false },
      intentRules: DEFAULT_INTENT_RULES,
      memoryEnabled: true,
      memories: [
        { id: "m1", key: "用户姓名", value: "妙妙", createdAt: Date.now() },
        { id: "m2", key: "生日", value: "今天", createdAt: Date.now() },
        { id: "m3", key: "偏好音乐", value: "民谣 / 后摇", createdAt: Date.now() },
      ],
      persona: {
        name: "iSPACE",
        tone: "friendly",
        language: "zh-CN",
        avatarColor: "#111827",
        greetingTemplate: "{name}，{occasion}快乐！",
      },
      setAI: (p) => set((s) => ({ ai: { ...s.ai, ...p } })),
      setDify: (p) => set((s) => ({ dify: { ...s.dify, ...p } })),
      setIntentRules: (r) => set({ intentRules: r }),
      setMemoryEnabled: (v) => set({ memoryEnabled: v }),
      addMemory: (key, value) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        set((s) => ({
          memories: [...s.memories, { id, key, value, createdAt: now }],
        }));
        // fire-and-forget 同步到服务端
        addServerMemory({ data: { key, value } }).catch((e) => logDbError("addMemory", e));
      },
      removeMemory: (id) => {
        set((s) => ({ memories: s.memories.filter((m) => m.id !== id) }));
        removeServerMemory({ data: { id } }).catch((e) => logDbError("removeMemory", e));
      },
      clearMemories: () => {
        set({ memories: [] });
        clearServerMemories().catch((e) => logDbError("clearMemories", e));
      },
      setPersona: (p) => set((s) => ({ persona: { ...s.persona, ...p } })),
      hydrateMemoriesFromServer: async () => {
        try {
          const serverMemories = await getMemories();
          if (serverMemories.length > 0) {
            // 服务端有数据 → 覆盖本地
            set({ memories: serverMemories });
          } else {
            // 服务端为空 → 将本地数据迁移到服务端
            const localMemories = useSettings.getState().memories;
            if (localMemories.length > 0) {
              for (const m of localMemories) {
                await addServerMemory({ data: { key: m.key, value: m.value } }).catch(() => {});
              }
            }
          }
        } catch (e) {
          logDbError("hydrateMemories", e);
        }
      },
    }),
    { name: "ispace-settings" },
  ),
);
