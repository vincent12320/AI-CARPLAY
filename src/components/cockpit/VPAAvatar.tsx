import { Heart, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settingsStore";
import type { AvatarState } from "@/stores/vpaStore";

export function VPAAvatar({ state, size = 96 }: { state: AvatarState; size?: number }) {
  const color = useSettings((s) => s.persona.avatarColor);

  const showCheeks = ["idle", "default", "happy", "love", "wink", "sad"].includes(state);
  const bounce =
    state === "happy" || state === "love"
      ? "animate-avatar-bounce"
      : state === "surprised"
        ? "animate-avatar-pop"
        : state === "idle" || state === "default"
          ? "animate-float-soft"
          : state === "focus"
            ? "animate-focus-glow"
            : "";

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* ===== ambient rings / glows per state ===== */}
      {state === "idle" && (
        <span className="absolute inset-0 rounded-full bg-brand/40 blur-md animate-breathe-glow" />
      )}
      {(state === "happy" || state === "love") && (
        <>
          <span className="absolute inset-0 rounded-full ring-2 ring-success/50 animate-happy-glow" />
          <span className="absolute inset-0 rounded-full ring-2 ring-success/30 animate-happy-glow [animation-delay:0.5s]" />
        </>
      )}
      {state === "sad" && (
        <span className="absolute inset-0 rounded-full bg-muted-foreground/20 blur-sm animate-pulse" />
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

      {/* floating sparkles for joyful states */}
      {(state === "happy" || state === "love") && (
        <>
          <Sparkles
            className="absolute text-amber-400 animate-sparkle"
            style={{ width: size * 0.18, height: size * 0.18, top: -size * 0.05, left: -size * 0.02 }}
          />
          <Sparkles
            className="absolute text-amber-300 animate-sparkle [animation-delay:0.6s]"
            style={{ width: size * 0.13, height: size * 0.13, bottom: size * 0.02, right: -size * 0.02 }}
          />
        </>
      )}

      {/* antenna */}
      <span
        className="absolute z-10 rounded-full bg-brand/70"
        style={{ width: 2, height: size * 0.12, top: -size * 0.1, left: "50%", transform: "translateX(-50%)" }}
      />
      <span
        className="absolute z-10 rounded-full bg-brand shadow-[0_0_8px_var(--brand)] animate-pulse"
        style={{ width: size * 0.08, height: size * 0.08, top: -size * 0.14, left: "50%", transform: "translateX(-50%)" }}
      />

      {/* ===== face body ===== */}
      <div
        key={state}
        className={cn("avatar-fade relative grid place-items-center rounded-[42%] shadow-xl", bounce)}
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 28%, color-mix(in oklab, ${color} 55%, white), ${color})`,
        }}
      >
        {/* eyebrows (thinking = furrowed) */}
        {state === "thinking" && (
          <div className="absolute flex gap-3" style={{ top: size * 0.24 }}>
            <span className="block h-[2px] w-3 rotate-12 rounded-full bg-white/80" />
            <span className="block h-[2px] w-3 -rotate-12 rounded-full bg-white/80" />
          </div>
        )}
        {state === "surprised" && (
          <div className="absolute flex gap-4" style={{ top: size * 0.18 }}>
            <span className="block h-[2px] w-3 -rotate-12 rounded-full bg-white/70" />
            <span className="block h-[2px] w-3 rotate-12 rounded-full bg-white/70" />
          </div>
        )}

        {/* eyes */}
        <div
          className="flex items-center gap-3"
          style={{ marginTop: state === "thinking" ? -size * 0.14 : -size * 0.05 }}
        >
          <Eye size={size} state={state} side="left" />
          <Eye size={size} state={state} side="right" />
        </div>

        {/* cheeks */}
        {showCheeks && (
          <>
            <span
              className="absolute rounded-full bg-rose-400/50 blur-[1px]"
              style={{ width: size * 0.14, height: size * 0.09, bottom: size * 0.3, left: size * 0.14 }}
            />
            <span
              className="absolute rounded-full bg-rose-400/50 blur-[1px]"
              style={{ width: size * 0.14, height: size * 0.09, bottom: size * 0.3, right: size * 0.14 }}
            />
          </>
        )}

        {/* mouth */}
        <Mouth size={size} state={state} />

        {/* highlight */}
        <div
          className="absolute rounded-full bg-white/20"
          style={{ width: size * 0.5, height: size * 0.18, top: size * 0.08 }}
        />
      </div>
    </div>
  );
}

function Mouth({ size, state }: { size: number; state: AvatarState }) {
  if (state === "happy") {
    return (
      <div
        className="absolute rounded-b-full border-b-[3px] border-white/90 bg-white/15"
        style={{ width: size * 0.3, height: size * 0.16, bottom: size * 0.18 }}
      />
    );
  }
  if (state === "love" || state === "wink") {
    return (
      <div
        className="absolute rounded-b-full border-b-[3px] border-white/90"
        style={{ width: size * 0.22, height: size * 0.11, bottom: size * 0.21 }}
      />
    );
  }
  if (state === "surprised") {
    return (
      <div
        className="absolute rounded-full border-[3px] border-white/90"
        style={{ width: size * 0.16, height: size * 0.18, bottom: size * 0.16 }}
      />
    );
  }
  if (state === "sad") {
    return (
      <div
        className="absolute rounded-t-full border-t-[3px] border-white/70"
        style={{ width: size * 0.22, height: size * 0.08, bottom: size * 0.18 }}
      />
    );
  }
  return (
    <div
      className={cn("absolute rounded-full bg-white/90", state === "speaking" && "animate-mouth")}
      style={{
        width: state === "focus" ? size * 0.14 : size * 0.2,
        height: size * 0.05,
        bottom: size * 0.22,
      }}
    />
  );
}

function Eye({ size, state, side }: { size: number; state: AvatarState; side: "left" | "right" }) {
  // love = heart eyes
  if (state === "love") {
    return (
      <Heart
        className="text-rose-300 animate-avatar-pop"
        style={{ width: size * 0.17, height: size * 0.17 }}
        fill="currentColor"
      />
    );
  }
  // wink = right eye closed (crescent), left open
  if (state === "wink" && side === "right") {
    return (
      <div
        className="rounded-b-full border-b-[3px] border-white"
        style={{ width: size * 0.16, height: size * 0.06 }}
      />
    );
  }
  // happy = upward curved (crescent) eyes
  if (state === "happy") {
    return (
      <div
        className="rounded-t-full border-t-[3px] border-white"
        style={{ width: size * 0.16, height: size * 0.09 }}
      />
    );
  }
  // sad = downward curved eyes (teary)
  if (state === "sad") {
    return (
      <div
        className="relative rounded-b-full border-b-[3px] border-white/70"
        style={{ width: size * 0.16, height: size * 0.09 }}
      >
        <span
          className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-blue-200/60"
        />
      </div>
    );
  }
  if (state === "surprised") {
    return (
      <div
        className="rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
        style={{ width: size * 0.16, height: size * 0.16 }}
      >
        <div
          className="m-[20%] rounded-full bg-brand"
          style={{ width: "60%", height: "60%" }}
        />
      </div>
    );
  }
  const talking = state === "speaking";
  const focused = state === "focus";
  const thinking = state === "thinking";
  return (
    <div
      className={cn(
        "rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]",
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
