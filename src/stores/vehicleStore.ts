import { create } from "zustand";

export type AirflowMode = "face" | "feet" | "face-feet" | "defrost";

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
  setTempLeft: (v) => set({ tempLeft: Math.max(16, Math.min(32, v)) }),
  setTempRight: (v) => set({ tempRight: Math.max(16, Math.min(32, v)) }),
  setFanSpeed: (v) => set({ fanSpeed: Math.max(0, Math.min(7, v)) }),
  toggleLocked: () => set((s) => ({ locked: !s.locked })),
  toggleAc: () => set((s) => ({ acOn: !s.acOn })),
  setAirflow: (m) => set({ airflow: m }),
  toggleRecirculate: () => set((s) => ({ recirculate: !s.recirculate })),
  setSeatHeatLeft: (v) => set({ seatHeatLeft: Math.max(0, Math.min(3, v)) }),
  setSeatHeatRight: (v) => set({ seatHeatRight: Math.max(0, Math.min(3, v)) }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(100, v)) }),
}));
