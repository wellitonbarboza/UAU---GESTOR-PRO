export type DemoCompany = {
  id: string;
  name: string;
};

const STORAGE_KEY = "uau-demo-companies";

function seedDefaults(): DemoCompany[] {
  return [
    { id: crypto.randomUUID(), name: "Vostro Construtora" },
    { id: crypto.randomUUID(), name: "Beta Engenharia" }
  ];
}

function ensureSeed(companies: DemoCompany[]): DemoCompany[] {
  if (companies.length > 0) return companies;
  return seedDefaults();
}

export function loadDemoCompanies(): DemoCompany[] {
  if (typeof localStorage === "undefined") return seedDefaults();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedDefaults();
    const parsed = JSON.parse(raw) as DemoCompany[];
    return ensureSeed(parsed);
  } catch (err) {
    console.error("Erro ao carregar empresas demo", err);
    return seedDefaults();
  }
}

function saveDemoCompanies(companies: DemoCompany[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

export function upsertDemoCompany(payload: Omit<DemoCompany, "id"> & { id?: string }): DemoCompany[] {
  const companies = loadDemoCompanies();
  if (payload.id) {
    const updated = companies.map((c) => (c.id === payload.id ? { ...c, ...payload } : c));
    saveDemoCompanies(updated);
    return updated;
  }
  const next: DemoCompany = { ...payload, id: crypto.randomUUID() };
  const updated = [...companies, next];
  saveDemoCompanies(updated);
  return updated;
}

export function deleteDemoCompany(id: string): DemoCompany[] {
  const companies = loadDemoCompanies().filter((c) => c.id !== id);
  const seeded = ensureSeed(companies);
  saveDemoCompanies(seeded);
  return seeded;
}
