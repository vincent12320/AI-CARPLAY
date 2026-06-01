import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settingsStore";
import type { AvatarState } from "@/stores/vpaStore";

export function VPAAvatar({ state, size = 96 }: { state: AvatarState; size?: number }) {
  const color = useSettings((s) => s.persona.avatarColor);

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* ===== ambient rings / glows per state ===== */}
      {state === "idle" && (
        <span className="absolute inset-0 rounded-full bg-brand/40 blur-md animate-breathe-glow" />
      )}
      {state === "happy" && (
        <>
          <span className="absolute inset-0 rounded-full ring-2 ring-success/60 animate-happy-glow" />
          <span className="absolute inset-0 rounded-full ring-2 ring-success/40 animate-happy-glow [animation-delay:0.5s]" />
        </>
      )}
      {state === "thinking" && (
        <>
          <span className="absolute inset-0 rounded-full ring-2 ring-brand/40 animate-think-ripple" />
          <span
            className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-white animate-gear"
            style={{ fontSize: size * 0.16 }}
          >
            ⚙
          </span>
        </>
      )}

      {/* ===== face body ===== */}
      <div
        key={state}
        className={cn(
          "avatar-fade relative grid place-items-center rounded-full shadow-xl",
          state === "idle" && "animate-float-soft",
          state === "default" && "animate-float-soft",
          state === "focus" && "animate-focus-glow",
        )}
        style={{ width: size, height: size, background: color }}
      >
        {/* eyebrows (thinking = furrowed) */}
        {state === "thinking" && (
          <div className="absolute flex gap-3" style={{ top: size * 0.24 }}>
            <span className="block h-[2px] w-3 rotate-12 rounded-full bg-brand/80" />
            <span className="block h-[2px] w-3 -rotate-12 rounded-full bg-brand/80" />
          </div>
        )}

        {/* eyes */}
        <div
          className="flex items-center gap-3"
          style={{ marginTop: state === "thinking" ? -size * 0.14 : -size * 0.05 }}
        >
          <Eye size={size} state={state} />
          <Eye size={size} state={state} />
        </div>

        {/* mouth */}
        {state === "happy" ? (
          <div
            className="absolute rounded-b-full border-b-[3px] border-brand/90"
            style={{ width: size * 0.26, height: size * 0.13, bottom: size * 0.2 }}
          />
        ) : (
          <div
            className={cn("absolute rounded-full bg-brand/90", state === "speaking" && "animate-mouth")}
            style={{
              width: state === "focus" ? size * 0.14 : size * 0.22,
              height: size * 0.05,
              bottom: size * 0.22,
            }}
          />
        )}

        {/* highlight */}
        <div
          className="absolute rounded-full bg-white/15"
          style={{ width: size * 0.5, height: size * 0.18, top: size * 0.08 }}
        />
      </div>
    </div>
  );
}

function Eye({ size, state }: { size: number; state: AvatarState }) {
  // happy = upward curved (crescent) eyes
  if (state === "happy") {
    return (
      <div
        className="rounded-t-full border-t-[3px] border-brand"
        style={{ width: size * 0.16, height: size * 0.09 }}
      />
    );
  }
  const talking = state === "speaking";
  const focused = state === "focus";
  const thinking = state === "thinking";
  return (
    <div
      className={cn(
        "rounded-full bg-brand shadow-[0_0_12px_var(--brand)]",
        state !== "focus" && "animate-blink",
      )}
      style={{
        width: focused ? size * 0.1 : size * 0.14,
        height: focused ? size * 0.18 : size * 0.14,
        transform: talking
          ? "scale(0.85)"
          : thinking
            ? "translateY(-2px)"
            : undefined,
      }}
    />
  );
}
