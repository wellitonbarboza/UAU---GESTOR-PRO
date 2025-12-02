import { ADMIN_EMAIL } from "../config/auth";

type DemoUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "admin" | "operacional" | "viewer";
  is_active: boolean;
};

const STORAGE_KEY = "uau-allowed-users";

function ensureAdminSeed(users: DemoUser[]): DemoUser[] {
  const hasAdmin = users.some((u) => u.email === ADMIN_EMAIL);
  if (hasAdmin) return users;
  return [
    {
      id: crypto.randomUUID(),
      email: ADMIN_EMAIL,
      full_name: "Administrador",
      role: "admin",
      is_active: true
    },
    ...users
  ];
}

export function loadDemoAllowedUsers(): DemoUser[] {
  if (typeof localStorage === "undefined") return ensureAdminSeed([]);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ensureAdminSeed([]);
    const parsed = JSON.parse(raw) as DemoUser[];
    return ensureAdminSeed(parsed);
  } catch (err) {
    console.error("Erro ao carregar usuários locais", err);
    return ensureAdminSeed([]);
  }
}

export function saveDemoAllowedUsers(users: DemoUser[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function upsertDemoAllowedUser(payload: Omit<DemoUser, "id"> & { id?: string }): DemoUser[] {
  const users = loadDemoAllowedUsers();
  if (payload.id) {
    const updated = users.map((u) => (u.id === payload.id ? { ...u, ...payload } : u));
    saveDemoAllowedUsers(updated);
    return updated;
  }
  const next: DemoUser = { ...payload, id: crypto.randomUUID() };
  const updated = [...users, next];
  saveDemoAllowedUsers(updated);
  return updated;
}

export function deleteDemoAllowedUser(id: string): DemoUser[] {
  const users = loadDemoAllowedUsers();
  const filtered = users.filter((u) => u.id !== id && u.email !== ADMIN_EMAIL);
  return ensureAdminSeed(filtered);
}

export type { DemoUser };
