import {
  Compass, Phone, MessageCircle, Radio, ShoppingBag, Camera, PlayCircle,
  Disc3, Bluetooth, Aperture, Car, Video, X, MessageSquareText, CloudSun,
  Bell, Bluetooth as BT, Wifi, Signal, BatteryCharging, Settings,
} from "lucide-react";
import { useUI } from "@/stores/uiStore";
import { toast } from "sonner";

type App = { label: string; icon: React.ComponentType<{ className?: string }>; color: string };

const COMMON: App[] = [
  { label: "车主指南", icon: Compass, color: "from-blue-500 to-blue-600" },
  { label: "电话", icon: Phone, color: "from-emerald-500 to-emerald-600" },
  { label: "畅聊", icon: MessageCircle, color: "from-green-500 to-green-600" },
  { label: "收音机", icon: Radio, color: "from-rose-500 to-red-600" },
  { label: "应用市场", icon: ShoppingBag, color: "from-sky-500 to-blue-600" },
  { label: "相机", icon: Camera, color: "from-slate-700 to-slate-900" },
];

const ALL: App[] = [
  { label: "畅聊", icon: MessageCircle, color: "from-green-500 to-green-600" },
  { label: "车主指南", icon: Compass, color: "from-blue-500 to-blue-600" },
  { label: "电话", icon: Phone, color: "from-emerald-500 to-emerald-600" },
  { label: "腾讯视频", icon: PlayCircle, color: "from-sky-400 to-indigo-500" },
  { label: "智能驾驶", icon: Disc3, color: "from-slate-500 to-slate-700" },
  { label: "蓝牙音乐", icon: Bluetooth, color: "from-blue-500 to-cyan-600" },
  { label: "全景环视", icon: Aperture, color: "from-green-500 to-emerald-600" },
  { label: "设置", icon: Car, color: "from-slate-400 to-slate-600" },
  { label: "视频", icon: Video, color: "from-blue-500 to-indigo-600" },
  { label: "收音机", icon: Radio, color: "from-rose-500 to-red-600" },
  { label: "应用市场", icon: ShoppingBag, color: "from-sky-500 to-blue-600" },
  { label: "相机", icon: Camera, color: "from-slate-700 to-slate-900" },
];

export function AppCenter() {
  const open = useUI((s) => s.appCenterOpen);
  const close = useUI((s) => s.closeAppCenter);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm app-overlay-fade" onClick={close} />
      <div className="glass-strong relative z-10 flex h-[92%] w-[96%] max-w-[1180px] flex-col overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5 app-pop">
        {/* mini status bar */}
        <div className="flex items-center justify-between px-6 pt-4 pb-2 text-foreground">
          <div className="flex items-center gap-4">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-foreground/10 text-foreground">
              <Settings className="h-4 w-4" />
            </div>
            <MessageSquareText className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-1 text-sm">
              <CloudSun className="h-5 w-5 text-amber-500" />
              <span className="font-medium">25°</span>
            </div>
            <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-medium text-muted-foreground">运动模式</span>
          </div>
          <span className="text-base font-semibold tracking-wide">12:36</span>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Bell className="h-4 w-4" />
            <BatteryCharging className="h-4 w-4" />
            <BT className="h-4 w-4" />
            <Wifi className="h-4 w-4" />
            <Signal className="h-4 w-4" />
            <button onClick={close} className="ml-1 grid h-8 w-8 place-items-center rounded-full hover:bg-foreground/10">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
          <Section title="常见应用" apps={COMMON} />
          <div className="mt-6">
            <Section title="所有应用" apps={ALL} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, apps }: { title: string; apps: App[] }) {
  return (
    <div>
      <h3 className="mb-4 text-base font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-6 gap-x-4 gap-y-6">
        {apps.map((a, i) => (
          <AppTile key={`${a.label}-${i}`} app={a} />
        ))}
      </div>
    </div>
  );
}

function AppTile({ app }: { app: App }) {
  const Icon = app.icon;
  return (
    <button
      onClick={() => toast.success(`打开「${app.label}」`)}
      className="group flex flex-col items-center gap-2"
    >
      <div
        className={`grid h-[68px] w-[68px] place-items-center rounded-[20px] bg-gradient-to-br ${app.color} text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-active:scale-95`}
      >
        <Icon className="h-8 w-8" />
      </div>
      <span className="text-xs font-medium text-foreground">{app.label}</span>
    </button>
  );
}
