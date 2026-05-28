import { NavCard } from "./NavCard";
import { MusicCard } from "./MusicCard";
import { VPABrandCard } from "./VPABrandCard";
import { VehicleCard } from "./VehicleCard";
import { CallCard } from "./CallCard";

export function BottomCards() {
  return (
    <div className="glass-card mx-3 rounded-t-3xl px-3 py-2.5">
      <div className="grid h-[100px] grid-cols-[1.4fr_1.4fr_1.2fr_1fr_0.7fr] gap-2.5">
        <NavCard />
        <MusicCard />
        <VPABrandCard />
        <VehicleCard />
        <CallCard />
      </div>
    </div>
  );
}
