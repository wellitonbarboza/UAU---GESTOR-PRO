import { create } from "zustand";
import type { Obra } from "../types/domain";

type User = { email: string; role?: "admin" | "operacional" | "viewer" } | null;

type AppState = {
  companyId: string | null;
  companyName: string | null;
  obras: Obra[];
  obraId: string;
  periodo: string;
  user: User;
  setCompany: (id: string | null, name?: string | null) => void;
  setObras: (obras: Obra[]) => void;
  setObraId: (id: string) => void;
  setPeriodo: (p: string) => void;
  setUser: (u: User) => void;
};

export const useAppStore = create<AppState>((set) => ({
  companyId: null,
  companyName: null,
  obras: [],
  obraId: "",
  periodo: "01/2024–12/2024",
  user: null,
  setCompany: (companyId, companyName = null) => set({ companyId, companyName }),
  setObras: (obras) => set({ obras }),
  setObraId: (obraId) => set({ obraId }),
  setPeriodo: (periodo) => set({ periodo }),
  setUser: (user) => set({ user })
}));
