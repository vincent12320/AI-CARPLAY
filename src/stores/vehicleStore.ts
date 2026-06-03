import { create } from "zustand";
import { getVehiclePreferences, saveVehiclePreferences } from "@/lib/api/vehicle.functions";
import { logDbError } from "@/lib/api/errors";

export type AirflowMode = "face" | "feet" | "face-feet" | "defrost";

// 防抖保存定时器（模块级别，所有 setter 共享）
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function debouncedSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const s = useVehicle.getState();
    saveVehiclePreferences({
      data: {
        tempLeft: s.tempLeft,
        tempRight: s.tempRight,
        fanSpeed: s.fanSpeed,
        locked: s.locked,
        driveMode: s.driveMode,
        acOn: s.acOn,
        airflow: s.airflow,
        recirculate: s.recirculate,
        seatHeatLeft: s.seatHeatLeft,
        seatHeatRight: s.seatHeatRight,
        volume: s.volume,
      },
    }).catch((e) => logDbError("saveVehiclePreferences", e));
  }, 2000);
}

type VehicleState = {
  range: number;          // km
  battery: number;        // %
  charging: boolean;
  tempLeft: number;
  tempRight: number;
  fanSpeed: number;
  locked: boolean;
  driveMode: "comfort" | "sport" | "eco";
  acOn: boolean;
  airflow: AirflowMode;
  recirculate: boolean;   // true = inner loop
  seatHeatLeft: number;   // 0-3
  seatHeatRight: number;  // 0-3
  volume: number;         // 0-100
  syncStatus: "idle" | "loading" | "synced" | "error";
  setTempLeft: (v: number) => void;
  setTempRight: (v: number) => void;
  setFanSpeed: (v: number) => void;
  toggleLocked: () => void;
  toggleAc: () => void;
  setAirflow: (m: AirflowMode) => void;
  toggleRecirculate: () => void;
  setSeatHeatLeft: (v: number) => void;
  setSeatHeatRight: (v: number) => void;
  setVolume: (v: number) => void;
  hydrateFromServer: () => Promise<void>;
};

export const useVehicle = create<VehicleState>((set) => ({
  range: 476,
  battery: 80,
  charging: true,
  tempLeft: 24.5,
  tempRight: 24.5,
  fanSpeed: 2,
  locked: true,
  driveMode: "comfort",
  acOn: true,
  airflow: "face",
  recirculate: true,
  seatHeatLeft: 0,
  seatHeatRight: 0,
  volume: 60,
  syncStatus: "idle",
  setTempLeft: (v) => {
    set({ tempLeft: Math.max(16, Math.min(32, v)) });
    debouncedSave();
  },
  setTempRight: (v) => {
    set({ tempRight: Math.max(16, Math.min(32, v)) });
    debouncedSave();
  },
  setFanSpeed: (v) => {
    set({ fanSpeed: Math.max(0, Math.min(7, v)) });
    debouncedSave();
  },
  toggleLocked: () => {
    set((s) => ({ locked: !s.locked }));
    debouncedSave();
  },
  toggleAc: () => {
    set((s) => ({ acOn: !s.acOn }));
    debouncedSave();
  },
  setAirflow: (m) => {
    set({ airflow: m });
    debouncedSave();
  },
  toggleRecirculate: () => {
    set((s) => ({ recirculate: !s.recirculate }));
    debouncedSave();
  },
  setSeatHeatLeft: (v) => {
    set({ seatHeatLeft: Math.max(0, Math.min(3, v)) });
    debouncedSave();
  },
  setSeatHeatRight: (v) => {
    set({ seatHeatRight: Math.max(0, Math.min(3, v)) });
    debouncedSave();
  },
  setVolume: (v) => {
    set({ volume: Math.max(0, Math.min(100, v)) });
    debouncedSave();
  },
  hydrateFromServer: async () => {
    const current = useVehicle.getState();
    if (current.syncStatus === "synced" || current.syncStatus === "loading") return;
    set({ syncStatus: "loading" });
    try {
      const prefs = await getVehiclePreferences();
      if (prefs) {
        set({
          tempLeft: prefs.tempLeft,
          tempRight: prefs.tempRight,
          fanSpeed: prefs.fanSpeed,
          locked: Boolean(prefs.locked),
          driveMode: prefs.driveMode as VehicleState["driveMode"],
          acOn: Boolean(prefs.acOn),
          airflow: prefs.airflow as AirflowMode,
          recirculate: Boolean(prefs.recirculate),
          seatHeatLeft: prefs.seatHeatLeft,
          seatHeatRight: prefs.seatHeatRight,
          volume: prefs.volume,
          syncStatus: "synced",
        });
      } else {
        set({ syncStatus: "synced" });
      }
    } catch (e) {
      logDbError("hydrateVehicle", e);
      set({ syncStatus: "error" });
    }
  },
}));
