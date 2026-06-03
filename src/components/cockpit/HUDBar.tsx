import { useState } from "react";
import {
  Camera, Car, ChevronLeft, ChevronRight, Grid3x3,
  Home, Lock, LockOpen, Phone, Snowflake, Volume2, Volume1, VolumeX,
  Wind, Armchair, Fan, Power, RefreshCw, Wind as WindIcon, ArrowUp,
  ArrowDown, PhoneCall, Video, Maximize, Coffee, Briefcase, Tent, Moon,
} from "lucide-react";
import { useVehicle, type AirflowMode } from "@/stores/vehicleStore";
import { useUI } from "@/stores/uiStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

export function HUDBar() {
  const {
    tempLeft, tempRight, fanSpeed, locked,
    setTempLeft, setTempRight, setFanSpeed, toggleLocked,
  } = useVehicle();
  const openAppCenter = useUI((s) => s.openAppCenter);
  const openVehicleSettings = useUI((s) => s.openVehicleSettings);

  return (
    <div className="glass-dark mx-3 mb-3 mt-1 flex h-[48px] items-center justify-between gap-2 rounded-2xl px-4 text-white">
      {/* Left: app center + vehicle settings */}
      <div className="flex items-center gap-1.5">
        <Icon onClick={openAppCenter} className="bg-white/10"><Grid3x3 className="h-4 w-4" /></Icon>
        <Icon onClick={() => openVehicleSettings()} className="bg-white/10"><Car className="h-4 w-4" /></Icon>
      </div>

      {/* Center: climate controls */}
      <div className="flex items-center gap-2">
        <TempControl value={tempLeft} onChange={setTempLeft} />

        <HudPopover
          triggerClass="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-white/10"
          trigger={<><Snowflake className="h-4 w-4" /><span>{fanSpeed}</span></>}
        >
          <ACPanel fanSpeed={fanSpeed} setFanSpeed={setFanSpeed} />
        </HudPopover>

        <HudPopover trigger={<Wind className="h-4 w-4" />}><AirflowPanel /></HudPopover>
        <HudPopover trigger={<Fan className="h-4 w-4" />}><CirculationPanel /></HudPopover>
        <HudPopover trigger={<Armchair className="h-4 w-4" />}><SeatPanel /></HudPopover>

        <Icon onClick={toggleLocked}>{locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}</Icon>
        <TempControl value={tempRight} onChange={setTempRight} />
      </div>

      {/* Right: shortcuts */}
      <div className="flex items-center gap-1.5">
        <HudPopover trigger={<Home className="h-4 w-4" />}><ScenePanel /></HudPopover>
        <HudPopover trigger={<Phone className="h-4 w-4" />} triggerClass="grid h-8 w-8 place-items-center rounded-full bg-success text-white transition hover:bg-success/90">
          <PhonePanel />
        </HudPopover>
        <HudPopover trigger={<Camera className="h-4 w-4" />}><CameraPanel /></HudPopover>
        <HudPopover trigger={<Volume2 className="h-4 w-4" />}><VolumePanel /></HudPopover>
      </div>
    </div>
  );
}

/* ---------- popover scaffolding ---------- */

function HudPopover({ trigger, triggerClass, children }: { trigger: React.ReactNode; triggerClass?: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className={triggerClass ?? "grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15"}>
          {trigger}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        sideOffset={12}
        className="glass-strong w-64 rounded-2xl border-0 p-4 text-foreground ring-1 ring-black/5"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm font-bold text-foreground">{children}</p>;
}

/* ---------- panels ---------- */

function ACPanel({ fanSpeed, setFanSpeed }: { fanSpeed: number; setFanSpeed: (v: number) => void }) {
  const { acOn, toggleAc } = useVehicle();
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <PanelTitle>空调</PanelTitle>
        <button
          onClick={toggleAc}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${acOn ? "bg-success text-white" : "bg-black/10 text-muted-foreground"}`}
        >
          <Power className="h-3.5 w-3.5" /> {acOn ? "开" : "关"}
        </button>
      </div>
      <p className="mb-2 text-xs text-muted-foreground">风量</p>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setFanSpeed(i + 1)}
            className={`h-8 flex-1 rounded-md text-xs font-semibold transition ${i < fanSpeed ? "bg-brand text-white" : "bg-black/5 text-muted-foreground hover:bg-black/10"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

function AirflowPanel() {
  const { airflow, setAirflow } = useVehicle();
  const modes: { id: AirflowMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "face", label: "吹面", icon: WindIcon },
    { id: "face-feet", label: "面+脚", icon: ArrowUp },
    { id: "feet", label: "吹脚", icon: ArrowDown },
    { id: "defrost", label: "除霜", icon: RefreshCw },
  ];
  return (
    <div>
      <PanelTitle>出风方向</PanelTitle>
      <div className="grid grid-cols-2 gap-2">
        {modes.map(({ id, label, icon: I }) => (
          <button
            key={id}
            onClick={() => setAirflow(id)}
            className={`flex flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition ${airflow === id ? "bg-brand text-white" : "bg-black/5 text-muted-foreground hover:bg-black/10"}`}
          >
            <I className="h-5 w-5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CirculationPanel() {
  const { recirculate, toggleRecirculate } = useVehicle();
  return (
    <div>
      <PanelTitle>循环模式</PanelTitle>
      <div className="flex gap-2">
        <button
          onClick={() => recirculate || toggleRecirculate()}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition ${recirculate ? "bg-brand text-white" : "bg-black/5 text-muted-foreground hover:bg-black/10"}`}
        >
          <RefreshCw className="h-5 w-5" /> 内循环
        </button>
        <button
          onClick={() => recirculate && toggleRecirculate()}
          className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition ${!recirculate ? "bg-brand text-white" : "bg-black/5 text-muted-foreground hover:bg-black/10"}`}
        >
          <WindIcon className="h-5 w-5" /> 外循环
        </button>
      </div>
    </div>
  );
}

function SeatPanel() {
  const { seatHeatLeft, seatHeatRight, setSeatHeatLeft, setSeatHeatRight } = useVehicle();
  return (
    <div>
      <PanelTitle>座椅加热</PanelTitle>
      <SeatRow label="主驾" value={seatHeatLeft} onChange={setSeatHeatLeft} />
      <div className="mt-3">
        <SeatRow label="副驾" value={seatHeatRight} onChange={setSeatHeatRight} />
      </div>
    </div>
  );
}

function SeatRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value === 0 ? "关闭" : `${value}档`}</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((lv) => (
          <button
            key={lv}
            onClick={() => onChange(lv)}
            className={`h-7 flex-1 rounded-md text-xs font-semibold transition ${value >= lv && lv > 0 ? "bg-amber-500 text-white" : lv === 0 && value === 0 ? "bg-black/10 text-foreground" : "bg-black/5 text-muted-foreground hover:bg-black/10"}`}
          >
            {lv === 0 ? "关" : lv}
          </button>
        ))}
      </div>
    </div>
  );
}

function ScenePanel() {
  const scenes = [
    { label: "回家模式", icon: Home },
    { label: "通勤模式", icon: Briefcase },
    { label: "露营模式", icon: Tent },
    { label: "小憩模式", icon: Moon },
    { label: "咖啡时刻", icon: Coffee },
    { label: "导航回家", icon: Car },
  ];
  return (
    <div>
      <PanelTitle>智能场景</PanelTitle>
      <div className="grid grid-cols-3 gap-2">
        {scenes.map(({ label, icon: I }) => (
          <button
            key={label}
            onClick={() => toast.success(`已开启「${label}」`)}
            className="flex flex-col items-center gap-1 rounded-xl bg-black/5 py-3 text-[11px] font-medium text-foreground transition hover:bg-brand hover:text-white"
          >
            <I className="h-5 w-5" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PhonePanel() {
  const contacts = [
    { name: "妈妈", num: "138 0013 8000" },
    { name: "老王", num: "139 0013 9000" },
    { name: "充电客服", num: "400 800 1234" },
  ];
  return (
    <div>
      <PanelTitle>最近通话</PanelTitle>
      <div className="space-y-1">
        {contacts.map((c) => (
          <button
            key={c.name}
            onClick={() => toast.success(`正在呼叫 ${c.name}…`)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-black/5"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand">{c.name[0]}</span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-foreground">{c.name}</span>
              <span className="block text-xs text-muted-foreground">{c.num}</span>
            </span>
            <PhoneCall className="h-4 w-4 text-success" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CameraPanel() {
  const views = [
    { label: "全景环视", icon: Maximize },
    { label: "前视", icon: ArrowUp },
    { label: "后视", icon: ArrowDown },
    { label: "行车记录", icon: Video },
  ];
  return (
    <div>
      <PanelTitle>360° 影像</PanelTitle>
      <div className="mb-3 grid h-24 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white/70">
        <Car className="h-10 w-10" strokeWidth={1.2} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {views.map(({ label, icon: I }) => (
          <button
            key={label}
            onClick={() => toast.success(`切换至「${label}」`)}
            className="flex items-center gap-2 rounded-xl bg-black/5 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-black/10"
          >
            <I className="h-4 w-4 text-brand" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function VolumePanel() {
  const { volume, setVolume } = useVehicle();
  const VolIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  return (
    <div>
      <PanelTitle>音量</PanelTitle>
      <div className="flex items-center gap-3">
        <VolIcon className="h-5 w-5 text-foreground" />
        <Slider value={[volume]} max={100} step={1} onValueChange={(v) => setVolume(v[0])} className="flex-1" />
        <span className="w-8 text-right text-sm font-semibold text-foreground">{volume}</span>
      </div>
      <div className="mt-3 flex gap-2">
        {[0, 30, 60, 100].map((v) => (
          <button
            key={v}
            onClick={() => setVolume(v)}
            className="flex-1 rounded-md bg-black/5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-black/10"
          >
            {v === 0 ? "静音" : v}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- atoms ---------- */

function Icon({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-full transition hover:bg-white/15 ${className}`}
    >
      {children}
    </button>
  );
}

function IconBtn({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full transition hover:bg-white/15 ${className}`}>
      {children}
    </span>
  );
}

function TempControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">
      <button onClick={() => onChange(value - 0.5)} className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/15">
        <ChevronLeft className="h-3 w-3" />
      </button>
      <span className="min-w-10 text-center font-semibold">{value.toFixed(1)}°</span>
      <button onClick={() => onChange(value + 0.5)} className="grid h-5 w-5 place-items-center rounded-full hover:bg-white/15">
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}
