import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Mic, Send, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useVPA, AVATAR_CYCLE, type StreamingPhase } from "@/stores/vpaStore";
import { useSettings } from "@/stores/settingsStore";
import { mockReply, streamChat } from "@/lib/llm";
import { getRecognizer, isSpeechSupported } from "@/lib/speech";
import { detectIntent, suggestFollowups } from "@/lib/intent";
import { VPAAvatar } from "./VPAAvatar";
import { FeedbackCard, matchFeedbackVoice, type FeedbackChoice } from "./FeedbackCard";

export function VPAPanel() {
  const {
    open, minimized, mode, avatar, messages, streaming, streamingPhase, suggestions, suggestionsLoading,
    showFeedback, feedbackThanks,
    setOpen, setMinimized, setMode, setAvatar, pushMessage, setStreaming, setStreamingPhase,
    setSuggestions, setSuggestionsLoading,
    incrementRound, resetRounds, setShowFeedback, setFeedbackThanks,
  } = useVPA();
  const persona = useSettings((s) => s.persona);
  const ai = useSettings((s) => s.ai);
  const intentRules = useSettings((s) => s.intentRules);
  const memories = useSettings((s) => s.memories);
  const memoryEnabled = useSettings((s) => s.memoryEnabled);

  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const [careIdx, setCareIdx] = useState(0);
  const [careVisible, setCareVisible] = useState(true);

  const careQuestions = [
    "今天想去哪里打球？",
    "现在想听什么歌？",
    "现在回家嘛？",
    "需要帮你导航到最近的咖啡店吗？",
    "要不要给你讲个笑话？",
    "今天心情怎么样？",
    "需要帮你查一下天气吗？",
  ];
  const scrollerRef = useRef<HTMLDivElement>(null);
  // tracks whether VPA is in an active scene (suppresses auto-rotation)
  const busyRef = useRef(false);
  // 10s inactivity → auto-minimize
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // care question rotation timer
  const careTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming, showFeedback, feedbackThanks]);

  // ===== auto-rotate avatar forms every 10s when idle =====
  useEffect(() => {
    const id = setInterval(() => {
      if (busyRef.current || streaming) return;
      const cur = useVPA.getState().avatar;
      const next = AVATAR_CYCLE[(AVATAR_CYCLE.indexOf(cur) + 1) % AVATAR_CYCLE.length];
      setAvatar(next);
    }, 10000);
    return () => clearInterval(id);
  }, [streaming, setAvatar]);

  // ===== 10s idle → auto-minimize =====
  useEffect(() => {
    if (!open || minimized || streamingPhase !== "idle") {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }
    idleTimerRef.current = setTimeout(() => {
      setMinimized(true);
    }, 10000);
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [open, minimized, streamingPhase, messages.length, setMinimized]);

  // ===== auto-minimize feedback card after 5s of no action =====
  useEffect(() => {
    if (!showFeedback || feedbackThanks) return;
    const id = setTimeout(() => {
      setMinimized(true);
      setShowFeedback(false);
      setFeedbackThanks(false);
      resetRounds();
    }, 5000);
    return () => clearTimeout(id);
  }, [showFeedback, feedbackThanks, setMinimized, setShowFeedback, setFeedbackThanks, resetRounds]);

  // ===== rotate care question: show 6s → hide 2s → next =====
  const careTickRef = useRef<() => void>();
  useEffect(() => {
    if (!minimized) {
      setCareVisible(false);
      careTickRef.current = undefined;
      return;
    }

    const len = careQuestions.length;
    let visible = true;

    function tick() {
      if (!careTickRef.current) return; // stopped
      if (visible) {
        visible = false;
        setCareVisible(false);
        careTimerRef.current = setTimeout(tick, 2000);
      } else {
        visible = true;
        setCareIdx((prev) => (prev + 1) % len);
        setCareVisible(true);
        careTimerRef.current = setTimeout(tick, 6000);
      }
    }

    careTickRef.current = tick;
    setCareVisible(true);
    careTimerRef.current = setTimeout(tick, 6000);

    return () => {
      careTickRef.current = undefined;
      clearTimeout(careTimerRef.current);
    };
  }, [minimized]);

  const memorySystem = memoryEnabled && memories.length
    ? `已知用户长期记忆：\n${memories.map((m) => `- ${m.key}: ${m.value}`).join("\n")}\n`
    : "";
  const sysPrompt = `你是车载智能助手「${persona.name}」，语气${toneText(persona.tone)}，使用${persona.language === "zh-CN" ? "中文" : "英文"}简洁回答。${memorySystem}回答要短，1-3 句话。`;

  const ask = useCallback(async (prompt: string) => {
    busyRef.current = true;
    setMode("chat");
    // hide any pending feedback when a new round starts
    setShowFeedback(false);
    setFeedbackThanks(false);
    pushMessage({ role: "user", content: prompt });
    setStreaming("");
    setStreamingPhase("thinking");

    // task intents (navigation / vehicle control) → focus form
    const rule = detectIntent(prompt, intentRules);
    const isTask = !!rule && (rule.action === "navigation" || rule.action === "vehicle");
    setAvatar(isTask ? "focus" : "thinking");

    let full = "";
    try {
      const history = useVPA.getState().messages;
      const gen = ai.apiKey
        ? streamChat(ai, [
            { role: "system", content: sysPrompt },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: prompt },
          ])
        : mockReply(prompt);
      let first = true;
      for await (const chunk of gen) {
        if (first) {
          if (!isTask) setAvatar("speaking");
          setStreamingPhase("answering");
          first = false;
        }
        full += chunk;
        setStreaming(full);
      }
    } catch (e) {
      full = `（出错：${(e as Error).message}）`;
      setStreaming(full);
    } finally {
      pushMessage({ role: "assistant", content: full });
      setStreaming("");
      setStreamingPhase("idle");
      setAvatar("idle");
      busyRef.current = false;

      // round count + feedback trigger
      incrementRound();
      if (useVPA.getState().roundCount >= 3) {
        setShowFeedback(true);
      }

      // dynamic follow-up suggestions
      setSuggestionsLoading(true);
      const recent = useVPA.getState().messages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "用户" : "助手"}：${m.content}`)
        .join("\n");
      suggestFollowups(ai, recent)
        .then((s) => setSuggestions(s))
        .finally(() => setSuggestionsLoading(false));
    }
  }, [ai, intentRules, sysPrompt, setMode, setShowFeedback, setFeedbackThanks, pushMessage, setStreaming, setStreamingPhase, setSuggestions, setAvatar, incrementRound, setSuggestionsLoading]);

  const handleFeedback = useCallback((choice: FeedbackChoice) => {
    if (choice === "later") {
      setShowFeedback(false);
      resetRounds();
      return;
    }
    busyRef.current = true;
    if (choice === "satisfied") {
      setAvatar("happy");
    } else {
      setAvatar("sad");
    }
    setFeedbackThanks(true);
    setTimeout(() => {
      setAvatar("idle");
      busyRef.current = false;
      setShowFeedback(false);
      setFeedbackThanks(false);
      resetRounds();
    }, 3000);
  }, [setShowFeedback, resetRounds, setFeedbackThanks, setAvatar]);

  function startVoice() {
    const r = getRecognizer(persona.language);
    if (!r) {
      setShowInput(true);
      return;
    }
    const feedbackActive = useVPA.getState().showFeedback && !useVPA.getState().feedbackThanks;
    setAvatar("thinking");
    r.onresult = (e: { results?: { [k: number]: { [k: number]: { transcript?: string } } } }) => {
      const t = e.results?.[0]?.[0]?.transcript ?? "";
      if (!t) return;
      if (feedbackActive) {
        const choice = matchFeedbackVoice(t);
        if (choice) {
          handleFeedback(choice);
          setAvatar("idle");
          return;
        }
      }
      ask(t);
    };
    r.onerror = () => setAvatar("idle");
    r.onend = () => { if (!useVPA.getState().streaming) setAvatar("idle"); };
    try { r.start(); } catch { /* ignore */ }
  }

  function submitText() {
    const t = text.trim();
    if (!t) return;
    setText("");
    setShowInput(false);
    ask(t);
  }

  // 悬浮态：显示 VPA 头像 + 关怀询问
  if (!open || minimized) {
    const care = careQuestions[careIdx];
    return (
      <div className="pointer-events-auto fixed left-1/2 top-4 z-40 flex flex-col items-center gap-2 -translate-x-1/2 animate-in fade-in slide-in-from-top-2 duration-300">
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="transition hover:scale-110 active:scale-95"
          aria-label="打开 VPA"
        >
          <VPAAvatar state={avatar} size={52} />
        </button>
        {careVisible && (
          <button
            onClick={() => { setOpen(true); setMinimized(false); setMode("chat"); ask(care); }}
            className="animate-in fade-in slide-in-from-top-1 duration-300 rounded-full bg-white/90 px-4 py-1.5 text-xs text-foreground shadow-lg ring-1 ring-black/5 transition hover:bg-brand/10 hover:text-brand"
            key={care}
          >
            {care}
          </button>
        )}
      </div>
    );
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
            <PhaseLabel phase={streamingPhase} />
            <ChevronDown className="h-3 w-3" />
            <button onClick={() => setOpen(false)} className="ml-2 rounded-full p-1 hover:bg-black/5" aria-label="关闭">
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
              <div ref={scrollerRef} className="max-h-[200px] flex-1 overflow-y-auto pr-2 text-sm leading-relaxed">
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
                    {streamingPhase === "answering" && (
                      <span className="mr-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </span>
                    )}
                    {streaming}
                    <span className="ml-0.5 inline-block w-0.5 h-3.5 bg-foreground align-middle" style={{ animation: "typewriter-caret 0.9s steps(1) infinite" }} />
                  </div>
                )}
                {!messages.length && !streaming && streamingPhase === "idle" && (
                  <div className="text-muted-foreground">你好呀，我在听～</div>
                )}
                {/* satisfaction feedback (after 3 rounds) */}
                {showFeedback && !streaming && (
                  <FeedbackCard thanks={feedbackThanks} onSelect={handleFeedback} />
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

        {/* dynamic follow-up suggestions */}
        {mode === "chat" && (
          /* thinking: show prev suggestions dimmed */
          streamingPhase === "thinking" && suggestions.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestions.map((s) => (
                <span
                  key={s}
                  className="shrink-0 whitespace-nowrap rounded-full bg-black/5 px-3 py-1 text-xs text-muted-foreground/50 cursor-not-allowed"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : !streaming && (suggestionsLoading || suggestions.length > 0) ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestionsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-7 w-24 shrink-0 animate-pulse rounded-full bg-black/10"
                    />
                  ))
                : suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      className="shrink-0 whitespace-nowrap rounded-full bg-black/5 px-3 py-1 text-xs text-foreground transition hover:bg-black/10 animate-in fade-in duration-300"
                    >
                      {s}
                    </button>
                  ))}
            </div>
          ) : null
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

function PhaseLabel({ phase }: { phase: StreamingPhase }) {
  if (phase === "thinking") {
    return (
      <span className="inline-flex items-center gap-1 text-brand">
        <Loader2 className="h-3 w-3 animate-spin" />
        正在思考…
      </span>
    );
  }
  if (phase === "answering") {
    return (
      <span className="inline-flex items-center gap-1 text-brand">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
        正在回答…
      </span>
    );
  }
  return <span>已完成思考</span>;
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
