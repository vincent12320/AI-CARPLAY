import { useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Mic, Send, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVPA } from "@/stores/vpaStore";
import { useSettings } from "@/stores/settingsStore";
import { mockReply, streamChat } from "@/lib/llm";
import { getRecognizer, isSpeechSupported } from "@/lib/speech";
import { suggestFollowups } from "@/lib/intent";
import { VPAAvatar } from "./VPAAvatar";
import { VPAMinimized } from "./VPAMinimized";

export function VPAPanel() {
  const {
    open, minimized, mode, avatar, messages, streaming, suggestions,
    setOpen, setMinimized, setMode, setAvatar, pushMessage, setStreaming, setSuggestions,
  } = useVPA();
  const persona = useSettings((s) => s.persona);
  const ai = useSettings((s) => s.ai);
  const memories = useSettings((s) => s.memories);
  const memoryEnabled = useSettings((s) => s.memoryEnabled);

  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  if (!open) return null;
  if (minimized) return <VPAMinimized />;

  const memorySystem = memoryEnabled && memories.length
    ? `已知用户长期记忆：\n${memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")}\n`
    : "";
  const sysPrompt = `你是车载智能助手「${persona.name}」，语气${toneText(persona.tone)}，使用${persona.language === "zh-CN" ? "中文" : "英文"}简洁回答。${memorySystem}回答要短，1-3 句话。`;

  async function ask(prompt: string) {
    setMode("chat");
    pushMessage({ role: "user", content: prompt });
    setStreaming("");
    setAvatar("speaking");
    let full = "";
    try {
      const gen = ai.apiKey
        ? streamChat(ai, [
            { role: "system", content: sysPrompt },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ])
        : mockReply(prompt);
      for await (const chunk of gen) {
        full += chunk;
        setStreaming(full);
      }
    } catch (e) {
      full = `（出错：${(e as Error).message}）`;
      setStreaming(full);
    } finally {
      pushMessage({ role: "assistant", content: full });
      setStreaming("");
      setSuggestions(suggestFollowups(full));
      setAvatar("idle");
    }
  }

  function startVoice() {
    const r = getRecognizer(persona.language);
    if (!r) {
      setShowInput(true);
      return;
    }
    setAvatar("listening");
    r.onresult = (e: any) => {
      const t = e.results?.[0]?.[0]?.transcript ?? "";
      if (t) ask(t);
    };
    r.onerror = () => setAvatar("idle");
    r.onend = () => setAvatar((s) => (s === "listening" ? "idle" : s) as any);
    try { r.start(); } catch { /* ignore */ }
  }

  function submitText() {
    const t = text.trim();
    if (!t) return;
    setText("");
    setShowInput(false);
    ask(t);
  }

  return (
    <div
      className="pointer-events-auto mx-auto mt-3 w-[760px] max-w-[92%] animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="glass-strong relative rounded-3xl p-5 ring-1 ring-white/60">
        {/* header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-brand" />
            <span>{persona.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>已完成思考</span>
            <ChevronDown className="h-3 w-3" />
            <button onClick={() => setMinimized(true)} className="ml-2 rounded-full p-1 hover:bg-black/5" aria-label="最小化">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-black/5" aria-label="关闭">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="mt-3 min-h-[140px]">
          {mode === "greeting" && <GreetingView onCTA={() => setMode("intent")} />}
          {mode === "chat" && (
            <div className="flex gap-4">
              <VPAAvatar state={avatar} size={88} />
              <div ref={scrollerRef} className="max-h-[180px] flex-1 overflow-y-auto pr-2 text-sm leading-relaxed">
                {messages.map((m, i) => (
                  <div key={i} className={m.role === "user" ? "mt-2 text-right" : "mt-2"}>
                    <span className={m.role === "user"
                      ? "inline-block rounded-2xl bg-brand px-3 py-1.5 text-white"
                      : "text-foreground"}>
                      {m.content}
                    </span>
                  </div>
                ))}
                {streaming && (
                  <div className="mt-2 text-foreground">
                    {streaming}
                    <span className="ml-0.5 inline-block w-0.5 h-3.5 bg-foreground align-middle" style={{ animation: "typewriter-caret 0.9s steps(1) infinite" }} />
                  </div>
                )}
                {!messages.length && !streaming && (
                  <div className="text-muted-foreground">你好呀，我在听～</div>
                )}
              </div>
            </div>
          )}
          {mode === "intent" && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full bg-brand/10 px-4 py-2 text-sm text-brand transition hover:bg-brand/20"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* suggestions after chat */}
        {mode === "chat" && !streaming && suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full bg-black/5 px-3 py-1 text-xs text-foreground transition hover:bg-black/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* footer input */}
        <div className="mt-4 flex items-center gap-2">
          {showInput ? (
            <>
              <Input
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder="对 iSPACE 说点什么…"
                className="h-10 rounded-full bg-white/80"
              />
              <Button size="icon" className="h-10 w-10 rounded-full bg-brand hover:bg-brand/90" onClick={submitText}>
                <Send className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={startVoice}
                className="h-10 rounded-full bg-brand text-white hover:bg-brand/90"
              >
                <Mic className="mr-1 h-4 w-4" />
                {isSpeechSupported() ? "按住说话" : "语音不可用"}
              </Button>
              <Button variant="ghost" onClick={() => setShowInput(true)} className="rounded-full">
                文字输入
              </Button>
              {mode !== "greeting" && (
                <Button variant="ghost" onClick={() => useVPA.getState().reset()} className="ml-auto rounded-full text-xs text-muted-foreground">
                  清空对话
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GreetingView({ onCTA }: { onCTA: () => void }) {
  const persona = useSettings((s) => s.persona);
  const memories = useSettings((s) => s.memories);
  const name = memories.find((m) => m.key === "用户姓名")?.value ?? "你";
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-foreground">
          {name}，生日快乐！
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          今天为你准备了一份生日歌单和回家路线，要不要先看看？
        </p>
        <button
          onClick={onCTA}
          className="mt-4 inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:opacity-90"
        >
          去查看 →
        </button>
      </div>
      <VPAAvatar state="idle" size={104} />
      <div className="text-[10px] text-muted-foreground">{persona.tone}</div>
    </div>
  );
}

function toneText(t: string) {
  switch (t) {
    case "friendly": return "亲切自然";
    case "professional": return "专业克制";
    case "playful": return "活泼俏皮";
    case "calm": return "沉稳安静";
    default: return "亲切自然";
  }
}
