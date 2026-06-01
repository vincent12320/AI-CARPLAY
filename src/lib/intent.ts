import type { AIConfig, IntentRule } from "@/stores/settingsStore";
import { complete } from "@/lib/llm";

export function detectIntent(text: string, rules: IntentRule[]): IntentRule | null {
  const t = text.toLowerCase();
  for (const r of rules) {
    if (r.patterns.some((p) => t.includes(p.toLowerCase()))) return r;
  }
  return null;
}

/** Keyword-based local fallback when no API key or model fails. */
function localFallback(recent: string): string[] {
  const t = recent.toLowerCase();
  if (/天气|气温|下雨/.test(t)) return ["明天会下雨吗", "适合洗车吗", "要带伞吗", "周末天气"];
  if (/音乐|歌|播放/.test(t)) return ["换一首", "调大音量", "推荐相似歌", "收藏这首"];
  if (/导航|去|回家|公司|路线/.test(t)) return ["避开拥堵", "还有多久到", "找充电站", "换条路线"];
  if (/温度|空调|车窗|座椅/.test(t)) return ["再低一度", "打开座椅加热", "开启外循环", "关掉空调"];
  return ["讲个笑话", "今天有提醒吗", "放点轻音乐", "导航回家"];
}

function extractJsonArray(s: string): string[] | null {
  const match = s.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]);
    if (Array.isArray(arr)) return arr.map((x) => String(x)).filter(Boolean);
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Generate 4 contextual follow-up questions from the recent conversation.
 * Uses the configured LLM when available; otherwise falls back to local set.
 */
export async function suggestFollowups(ai: AIConfig, recent: string): Promise<string[]> {
  const fallback = localFallback(recent);
  if (!ai.apiKey) return fallback;
  try {
    const out = await complete(ai, [
      {
        role: "system",
        content:
          "你是车载助手的推荐问生成器。根据对话，输出用户可能想继续问的 4 条追问。" +
          "要求：与当前话题强相关、口语化、每条不超过 10 个字。" +
          '只返回 JSON 数组，例如 ["问题一","问题二","问题三","问题四"]，不要任何额外文字。',
      },
      { role: "user", content: `对话内容：\n${recent}` },
    ]);
    const arr = extractJsonArray(out);
    if (arr && arr.length) return arr.slice(0, 4);
  } catch {
    /* ignore */
  }
  return fallback;
}
