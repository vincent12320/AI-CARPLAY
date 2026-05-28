import { BatteryCharging } from "lucide-react";
import { useVehicle } from "@/stores/vehicleStore";

export function VehicleCard() {
  const { range, battery, charging } = useVehicle();
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl bg-white/95 p-3 shadow-md ring-1 ring-black/5">
      <div>
        <div className="text-xl font-bold leading-tight">{range} <span className="text-xs font-normal text-muted-foreground">km</span></div>
        <div className="text-[11px] text-muted-foreground">剩余续航</div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-success">
            <BatteryCharging className="h-3 w-3" /> {charging ? "充电中" : "未充电"}
          </span>
          <span className="font-semibold">{battery}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10">
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${battery}%` }} />
        </div>
      </div>
    </div>
  );
}
