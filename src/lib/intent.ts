import type { IntentRule } from "@/stores/settingsStore";

export function detectIntent(text: string, rules: IntentRule[]): IntentRule | null {
  const t = text.toLowerCase();
  for (const r of rules) {
    if (r.patterns.some((p) => t.includes(p.toLowerCase()))) return r;
  }
  return null;
}

export function suggestFollowups(lastReply: string): string[] {
  const pool = [
    "顺便放点轻音乐",
    "导航回家",
    "调到 22 度",
    "讲个冷笑话",
    "今天有什么提醒",
    "切换驾驶模式",
  ];
  // crude shuffle
  return pool.sort(() => Math.random() - 0.5).slice(0, 3);
  // lastReply unused; keep param for future LLM-based generation
  void lastReply;
}
