import { useVPA } from "@/stores/vpaStore";
import { VPAAvatar } from "./VPAAvatar";

export function VPAMinimized() {
  const setMinimized = useVPA((s) => s.setMinimized);
  return (
    <button
      onClick={() => setMinimized(false)}
      className="fixed bottom-44 right-6 z-40 grid h-16 w-16 place-items-center rounded-full glass-strong shadow-2xl transition hover:scale-105"
      aria-label="展开 VPA"
    >
      <VPAAvatar state="idle" size={52} />
    </button>
  );
}
