import {
  Camera, Car, ChevronLeft, ChevronRight, Grid3x3,
  Home, Lock, LockOpen, Phone, Snowflake, Unlock as _u,
  Volume2, Wind, Armchair, Fan,
} from "lucide-react";
import { useVehicle } from "@/stores/vehicleStore";
import { useUI } from "@/stores/uiStore";

void _u;

export function HUDBar() {
  const { tempLeft, tempRight, fanSpeed, locked, setTempLeft, setTempRight, setFanSpeed, toggleLocked } = useVehicle();
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
        <button onClick={() => setFanSpeed(fanSpeed === 7 ? 0 : fanSpeed + 1)} className="flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:bg-white/10">
          <Snowflake className="h-4 w-4" />
          <span>{fanSpeed}</span>
        </button>
        <Icon><Wind className="h-4 w-4" /></Icon>
        <Icon><Fan className="h-4 w-4" /></Icon>
        <Icon><Armchair className="h-4 w-4" /></Icon>
        <Icon onClick={toggleLocked}>{locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}</Icon>
        <TempControl value={tempRight} onChange={setTempRight} />
      </div>

      {/* Right: shortcuts */}
      <div className="flex items-center gap-1.5">
        <Icon><Home className="h-4 w-4" /></Icon>
        <Icon className="bg-success text-white"><Phone className="h-4 w-4" /></Icon>
        <Icon><Camera className="h-4 w-4" /></Icon>
        <Icon><Volume2 className="h-4 w-4" /></Icon>
      </div>
    </div>
  );
}

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
