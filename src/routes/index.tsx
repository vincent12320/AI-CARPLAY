import { useEffect } from "react";
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
import { MusicApp } from "@/components/cockpit/MusicApp";
import { useVPA } from "@/stores/vpaStore";
import { useSettings } from "@/stores/settingsStore";
import { useMusic } from "@/stores/musicStore";
import { useVehicle } from "@/stores/vehicleStore";

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
  // 首次挂载时从服务端同步数据
  useEffect(() => {
    useVPA.getState().hydrateFromServer();
    useSettings.getState().hydrateMemoriesFromServer();
    useMusic.getState().hydrateFromServer();
    useVehicle.getState().hydrateFromServer();
  }, []);

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
      <AppCenter />
      <VehicleSettings />
      <MusicApp />
      <Toaster position="top-center" />
    </div>
  );
}
