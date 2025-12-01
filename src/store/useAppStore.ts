import { create } from 'zustand';

interface AppState {
  selectedObra?: string;
  period: string;
  user?: { id: string };
  setObra: (obra?: string) => void;
  setPeriod: (period: string) => void;
  setUser: (user?: { id: string }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedObra: undefined,
  period: new Date().toISOString().slice(0, 7),
  user: undefined,
  setObra: (obra) => set({ selectedObra: obra }),
  setPeriod: (period) => set({ period }),
  setUser: (user) => set({ user })
}));
