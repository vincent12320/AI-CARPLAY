export type FeedbackChoice = "satisfied" | "unsatisfied" | "later";

const OPTIONS: { key: FeedbackChoice; label: string }[] = [
  { key: "satisfied", label: "😊 满意" },
  { key: "unsatisfied", label: "😞 不满意" },
  { key: "later", label: "🕐 以后再说" },
];

export function FeedbackCard({
  thanks,
  onSelect,
}: {
  thanks: boolean;
  onSelect: (c: FeedbackChoice) => void;
}) {
  if (thanks) {
    return (
      <div className="mt-3 animate-in fade-in duration-300">
        <div className="rounded-2xl bg-success/10 px-4 py-2.5 text-sm font-medium text-success">
          感谢您的反馈！
        </div>
      </div>
    );
  }
  return (
    <div className="mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="rounded-2xl bg-white/80 p-3 ring-1 ring-black/5">
        <div className="text-sm font-semibold text-foreground">对本次回答是否满意？</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {OPTIONS.map((o) => (
            <button
              key={o.key}
              onClick={() => onSelect(o.key)}
              className="rounded-full bg-black/5 px-4 py-1.5 text-sm text-foreground transition hover:bg-brand/15 hover:text-brand"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Match a recognized voice phrase to a feedback choice, or null. */
export function matchFeedbackVoice(text: string): FeedbackChoice | null {
  const t = text.replace(/\s/g, "");
  if (/不满意|不太满意|不好|差/.test(t)) return "unsatisfied";
  if (/满意|不错|好的|挺好|很好/.test(t)) return "satisfied";
  if (/以后再说|以后|稍后|下次|跳过/.test(t)) return "later";
  return null;
}
