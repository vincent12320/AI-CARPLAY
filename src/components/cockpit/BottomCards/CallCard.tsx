import { Phone } from "lucide-react";
import { toast } from "sonner";

export function CallCard() {
  return (
    <button
      onClick={() => toast.success("拨号中…")}
      className="flex h-full flex-col items-center justify-center gap-1 rounded-2xl bg-success p-3 text-white shadow-md transition hover:opacity-95"
    >
      <Phone className="h-7 w-7" />
      <span className="text-xs font-medium">拨号</span>
    </button>
  );
}
