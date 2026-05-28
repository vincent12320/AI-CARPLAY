import type { AIConfig } from "@/stores/settingsStore";
import type { ChatMsg } from "@/stores/vpaStore";

/**
 * OpenAI-compatible streaming chat call.
 * Calls user-provided endpoint directly from browser (key stays in localStorage).
 */
export async function* streamChat(
  cfg: AIConfig,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  if (!cfg.apiKey) {
    yield "（请在右上角设置中填入 API Key 后使用真实 AI 回复。）";
    return;
  }

  const res = await fetch(`${cfg.baseURL.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({ model: cfg.model, messages, stream: cfg.stream }),
    signal,
  });

  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    yield `（请求失败：${res.status} ${t.slice(0, 120)}）`;
    return;
  }

  if (!cfg.stream) {
    const json = await res.json();
    yield json?.choices?.[0]?.message?.content ?? "";
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data:")) continue;
      const data = t.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) yield delta as string;
      } catch {
        /* ignore */
      }
    }
  }
}

/** Local mock: typewriter a canned response when no API key. */
export async function* mockReply(prompt: string): AsyncGenerator<string> {
  const reply = mockAnswer(prompt);
  for (const ch of reply) {
    await new Promise((r) => setTimeout(r, 28));
    yield ch;
  }
}

function mockAnswer(p: string): string {
  if (/天气/.test(p)) return "今天多云转晴，气温 8 到 15 度，适合外出走走 ☁️→☀️";
  if (/音乐|歌/.test(p)) return "已为你打开「轻松民谣」歌单，正在播放第一首 🎵";
  if (/导航|去|回家|公司/.test(p)) return "已为你规划路线，预计 22 分钟到达，途经金沙江路。🧭";
  if (/温度|空调/.test(p)) return "已将车内温度调至 24.5°C，风量保持 2 档。";
  if (/你好|hi|hello/i.test(p)) return "你好呀～我是 iSPACE，今天想聊点什么？";
  return "好的，我记下了。要不要我帮你顺手打开音乐或者规划一下路线？";
}
