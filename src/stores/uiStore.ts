import { create } from "zustand";

type UIState = {
  appCenterOpen: boolean;
  vehicleSettingsOpen: boolean;
  vehicleTab: string;
  musicOpen: boolean;
  openAppCenter: () => void;
  closeAppCenter: () => void;
  openVehicleSettings: (tab?: string) => void;
  closeVehicleSettings: () => void;
  setVehicleTab: (t: string) => void;
  openMusic: () => void;
  closeMusic: () => void;
};

export const useUI = create<UIState>((set) => ({
  appCenterOpen: false,
  vehicleSettingsOpen: false,
  vehicleTab: "common",
  musicOpen: false,
  openAppCenter: () => set({ appCenterOpen: true }),
  closeAppCenter: () => set({ appCenterOpen: false }),
  openVehicleSettings: (tab) => set({ vehicleSettingsOpen: true, ...(tab ? { vehicleTab: tab } : {}) }),
  closeVehicleSettings: () => set({ vehicleSettingsOpen: false }),
  setVehicleTab: (t) => set({ vehicleTab: t }),
  openMusic: () => set({ musicOpen: true }),
  closeMusic: () => set({ musicOpen: false }),
}));
