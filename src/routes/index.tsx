import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Wallpaper } from "@/components/cockpit/Wallpaper";
import { TopStatusBar } from "@/components/cockpit/TopStatusBar";
import { VPAPanel } from "@/components/cockpit/VPAPanel";
import { BottomCards } from "@/components/cockpit/BottomCards";
import { HUDBar } from "@/components/cockpit/HUDBar";
import { SettingsPanel } from "@/components/cockpit/SettingsPanel";
import { AppCenter } from "@/components/cockpit/AppCenter";
import { VehicleSettings } from "@/components/cockpit/VehicleSettings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iSPACE · 智能座舱" },
      { name: "description", content: "iSPACE — 沉浸式智能座舱 UI，磨砂玻璃风格 VPA 助手与车控面板。" },
      { property: "og:title", content: "iSPACE · 智能座舱" },
      { property: "og:description", content: "沉浸式智能座舱 UI，磨砂玻璃风格 VPA 助手与车控面板。" },
    ],
  }),
  component: Cockpit,
});

function Cockpit() {
  return (
    <div className="relative flex h-screen w-screen flex-col overflow-hidden">
      <Wallpaper />
      <TopStatusBar />
      <div className="flex flex-1 items-start justify-center px-3">
        <VPAPanel />
      </div>
      <BottomCards />
      <HUDBar />
      <SettingsPanel />
      <Toaster position="top-center" />
    </div>
  );
}
