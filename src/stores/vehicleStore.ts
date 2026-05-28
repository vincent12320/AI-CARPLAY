import { create } from "zustand";

type VehicleState = {
  range: number;          // km
  battery: number;        // %
  charging: boolean;
  tempLeft: number;
  tempRight: number;
  fanSpeed: number;
  locked: boolean;
  driveMode: "comfort" | "sport" | "eco";
  setTempLeft: (v: number) => void;
  setTempRight: (v: number) => void;
  setFanSpeed: (v: number) => void;
  toggleLocked: () => void;
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
  setTempLeft: (v) => set({ tempLeft: Math.max(16, Math.min(32, v)) }),
  setTempRight: (v) => set({ tempRight: Math.max(16, Math.min(32, v)) }),
  setFanSpeed: (v) => set({ fanSpeed: Math.max(0, Math.min(7, v)) }),
  toggleLocked: () => set((s) => ({ locked: !s.locked })),
}));
