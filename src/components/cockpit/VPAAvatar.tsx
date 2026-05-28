import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settingsStore";
import type { AvatarState } from "@/stores/vpaStore";

export function VPAAvatar({ state, size = 96 }: { state: AvatarState; size?: number }) {
  const color = useSettings((s) => s.persona.avatarColor);
  return (
    <div
      className="relative grid place-items-center"
      style={{ width: size, height: size }}
    >
      {state === "listening" && (
        <>
          <span
            className="absolute inset-0 rounded-full ring-2 ring-brand/60"
            style={{ animation: "pulse-ring 1.4s ease-out infinite" }}
          />
          <span
            className="absolute inset-0 rounded-full ring-2 ring-brand/40"
            style={{ animation: "pulse-ring 1.4s ease-out infinite 0.5s" }}
          />
        </>
      )}
      <div
        className={cn(
          "relative grid place-items-center rounded-full shadow-xl",
          state === "idle" && "animate-float-soft",
        )}
        style={{ width: size, height: size, background: color }}
      >
        {/* eyes */}
        <div className="flex items-center gap-3" style={{ marginTop: -size * 0.05 }}>
          <Eye size={size} talking={state === "speaking"} />
          <Eye size={size} talking={state === "speaking"} />
        </div>
        {/* mouth */}
        <div
          className={cn("absolute rounded-full bg-brand/90", state === "speaking" && "animate-mouth")}
          style={{
            width: size * 0.22,
            height: size * 0.05,
            bottom: size * 0.22,
          }}
        />
        {/* highlight */}
        <div
          className="absolute rounded-full bg-white/15"
          style={{ width: size * 0.5, height: size * 0.18, top: size * 0.08 }}
        />
      </div>
    </div>
  );
}

function Eye({ size, talking }: { size: number; talking: boolean }) {
  return (
    <div
      className="rounded-full bg-brand shadow-[0_0_12px_var(--brand)] animate-blink"
      style={{
        width: size * 0.14,
        height: size * 0.14,
        transform: talking ? "scale(0.85)" : undefined,
      }}
    />
  );
}
