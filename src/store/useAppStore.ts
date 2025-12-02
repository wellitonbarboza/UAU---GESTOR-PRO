import { create } from "zustand";
import { MOCK_OBRAS } from "../mock/data";

type User = { email: string } | null;

type AppState = {
  obraId: string;
  periodo: string;
  user: User;
  setObraId: (id: string) => void;
  setPeriodo: (p: string) => void;
  setUser: (u: User) => void;
};

export const useAppStore = create<AppState>((set) => ({
  obraId: MOCK_OBRAS[0]?.id ?? "obr1",
  periodo: "01/2024–12/2024",
  user: null,
  setObraId: (obraId) => set({ obraId }),
  setPeriodo: (periodo) => set({ periodo }),
  setUser: (user) => set({ user })
}));
