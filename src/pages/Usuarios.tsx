import React, { useEffect, useMemo, useState } from "react";
import { Check, Edit, Mail, Shield, Trash2, XCircle } from "lucide-react";
import Card from "../components/ui/Card";
import { Input, PrimaryButton, Select } from "../components/ui/Controls";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import { useAppStore } from "../store/useAppStore";
import { ADMIN_EMAIL } from "../config/auth";
import {
  deleteDemoAllowedUser,
  loadDemoAllowedUsers,
  upsertDemoAllowedUser
} from "../utils/allowedUsersDemo";
import { DemoCompany, deleteDemoCompany, loadDemoCompanies, upsertDemoCompany } from "../utils/demoCompanies";

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "operacional", label: "Operacional" },
  { value: "viewer", label: "Visualização" }
];

type AllowedUser = {
  id: string;
  email: string;
  full_name?: string | null;
  company_id?: string | null;
  company?: { name: string | null };
  password?: string | null;
  role: "admin" | "operacional" | "viewer";
  is_active: boolean;
};

export default function Usuarios() {
  const { user } = useAppStore();
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [role, setRole] = useState("viewer");
  const [tempPassword, setTempPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<DemoCompany[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [editingCompanyName, setEditingCompanyName] = useState("");

  const isAdmin = useMemo(() => user?.role === "admin" || user?.email === ADMIN_EMAIL, [user]);

  async function fetchUsers() {
    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const demo = loadDemoAllowedUsers();
      setUsers(demo);
      return;
    }

    const { data, error: queryError } = await client
      .from("login_allowed_users")
      .select("id, email, full_name, role, is_active, company_id, password, companies(name)")
      .order("email", { ascending: true });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setUsers(data ?? []);
  }

  useEffect(() => {
    fetchUsers();

    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      setCompanies(loadDemoCompanies());
      return;
    }

    const typedClient = client;

    async function loadCompanies() {
      const { data, error: companyError } = await typedClient
        .from("companies")
        .select("id, name")
        .order("name", { ascending: true });

      if (companyError) {
        setError(companyError.message);
        return;
      }

      setCompanies((data as DemoCompany[]) ?? []);
    }

    loadCompanies();
  }, []);

  function resetUserForm() {
    setEmail("");
    setFullName("");
    setCompanyId("");
    setRole("viewer");
    setTempPassword("");
    setEditingUserId(null);
  }

  async function handleSaveUser() {
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Informe um e-mail válido.");
      return;
    }

    const trimmedPassword = tempPassword.trim();
    if (!editingUserId && !trimmedPassword) {
      setError("Informe uma senha provisória para concluir o cadastro.");
      return;
    }
    setSaving(true);

    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const payload = {
        id: editingUserId ?? undefined,
        email: normalized,
        full_name: fullName,
        company_id: companyId || null,
        role: role as AllowedUser["role"],
        is_active: true,
        ...(trimmedPassword ? { password: trimmedPassword } : {})
      };
      const updated = upsertDemoAllowedUser(payload);
      setUsers(updated);
      resetUserForm();
      setSaving(false);
      return;
    }

    const basePayload = {
      email: normalized,
      full_name: fullName || null,
      company_id: companyId || null,
      role: role as AllowedUser["role"],
      is_active: true
    };

    const payload = {
      ...basePayload,
      ...(trimmedPassword ? { password: trimmedPassword } : editingUserId ? {} : { password: null })
    };

    const { data: upserted, error: insertError } = await (editingUserId
      ? client
          .from("login_allowed_users")
          .update(payload)
          .eq("id", editingUserId)
          .select("id, email, full_name, role, is_active, company_id, password, companies(name)")
          .maybeSingle()
      : client
          .from("login_allowed_users")
          .upsert(payload)
          .select("id, email, full_name, role, is_active, company_id, password, companies(name)")
          .maybeSingle());

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (upserted) {
      setUsers((prev) => {
        const withoutTarget = prev.filter((u) => u.id !== upserted.id);
        return [...withoutTarget, upserted as AllowedUser].sort((a, b) => a.email.localeCompare(b.email));
      });
    } else {
      await fetchUsers();
    }
    resetUserForm();
    setSaving(false);
  }

  async function toggleActive(target: AllowedUser) {
    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const updated = upsertDemoAllowedUser({ ...target, is_active: !target.is_active });
      setUsers(updated);
      return;
    }

    const { error: updateError } = await client
      .from("login_allowed_users")
      .update({ is_active: !target.is_active })
      .eq("id", target.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    await fetchUsers();
  }

  async function deleteUser(target: AllowedUser) {
    if (target.email === ADMIN_EMAIL) {
      setError("O administrador padrão não pode ser removido.");
      return;
    }

    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const updated = deleteDemoAllowedUser(target.id);
      setUsers(updated as AllowedUser[]);
      return;
    }

    const { error: delError } = await client.from("login_allowed_users").delete().eq("id", target.id);
    if (delError) {
      setError(delError.message);
      return;
    }
    await fetchUsers();
  }

  function startEditUser(target: AllowedUser) {
    setEmail(target.email);
    setFullName(target.full_name ?? "");
    setCompanyId(target.company_id ?? "");
    setRole(target.role);
    setTempPassword(target.password ?? "");
    setEditingUserId(target.id);
  }

  async function handleCreateCompany() {
    setError(null);
    const trimmed = newCompanyName.trim();
    if (!trimmed) {
      setError("Informe um nome de empresa válido.");
      return;
    }

    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const updated = upsertDemoCompany({ name: trimmed });
      setCompanies(updated);
      setNewCompanyName("");
      setCompanyId(updated[updated.length - 1]?.id ?? "");
      return;
    }

    const userInfo = await client.auth.getUser();
    const createdBy = userInfo.data.user?.id ?? null;
    const { data, error: insertError } = await client
      .from("companies")
      .insert({ name: trimmed, created_by: createdBy })
      .select("id, name")
      .maybeSingle();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (data) {
      setCompanies((prev) => [...prev, data as DemoCompany]);
      setCompanyId(data.id);
    }
    setNewCompanyName("");
  }

  function startEditCompany(company: DemoCompany) {
    setEditingCompanyId(company.id);
    setEditingCompanyName(company.name);
  }

  async function handleUpdateCompany() {
    setError(null);
    if (!editingCompanyId) return;
    const trimmed = editingCompanyName.trim();
    if (!trimmed) {
      setError("Informe um nome de empresa válido.");
      return;
    }

    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const updated = upsertDemoCompany({ id: editingCompanyId, name: trimmed });
      setCompanies(updated);
      setEditingCompanyId(null);
      setEditingCompanyName("");
      return;
    }

    const { error: updateError } = await client.from("companies").update({ name: trimmed }).eq("id", editingCompanyId);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCompanies((prev) => prev.map((c) => (c.id === editingCompanyId ? { ...c, name: trimmed } : c)));
    setEditingCompanyId(null);
    setEditingCompanyName("");
  }

  async function handleDeleteCompany(targetId: string) {
    setError(null);
    const client = supabase;
    if (!isSupabaseEnabled || !client) {
      const updated = deleteDemoCompany(targetId);
      setCompanies(updated);
      if (companyId === targetId) {
        setCompanyId("");
      }
      return;
    }

    const { error: deleteError } = await client.from("companies").delete().eq("id", targetId);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setCompanies((prev) => prev.filter((c) => c.id !== targetId));
    if (companyId === targetId) {
      setCompanyId("");
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card title="Acesso restrito" subtitle="Somente administradores podem gerenciar usuários.">
          <p className="text-sm text-zinc-600">Solicite acesso ao administrador padrão ({ADMIN_EMAIL}).</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card
        title={editingUserId ? "Editar usuário autorizado" : "Usuários autorizados"}
        subtitle="O administrador controla quem pode acessar, criar perfis e gerenciar obras vinculadas."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={email} onChange={setEmail} placeholder="E-mail" />
          <Input value={fullName} onChange={setFullName} placeholder="Nome completo (opcional)" />
          <Select
            value={companyId}
            onChange={setCompanyId}
            options={[
              { value: "", label: "Sem empresa vinculada" },
              ...companies.map((c) => ({ value: c.id, label: c.name }))
            ]}
          />
          <Select value={role} onChange={setRole} options={roleOptions} />
          <Input
            value={tempPassword}
            onChange={setTempPassword}
            placeholder={editingUserId ? "Senha provisória (preencha para alterar)" : "Senha provisória"}
          />
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleSaveUser} disabled={saving}>
              {editingUserId ? "Salvar alterações" : "Cadastrar usuário"}
            </PrimaryButton>
            {editingUserId ? (
              <button
                type="button"
                onClick={resetUserForm}
                className="text-xs font-semibold text-zinc-600 underline"
              >
                Cancelar edição
              </button>
            ) : null}
            <p className="text-xs text-zinc-500">O acesso fica liberado imediatamente após salvar.</p>
          </div>
        </div>
        {error ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        ) : null}
      </Card>

      <Card title="Lista atual" subtitle="Ative, pause ou exclua usuários autorizados.">
        <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
          {users.map((u) => (
            <div key={u.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                  <Mail className="h-4 w-4" /> {u.email}
                  {u.email === ADMIN_EMAIL ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">Administrador padrão</span>
                  ) : null}
                </div>
                <div className="text-xs text-zinc-500">{u.full_name || "Sem nome informado"}</div>
                <div className="text-xs text-zinc-500">
                  Empresa: {u.company?.name || companies.find((c) => c.id === u.company_id)?.name || "Não vinculada"}
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-zinc-600">
                  <Shield className="h-3 w-3" /> Permissão: {roleOptions.find((r) => r.value === u.role)?.label}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => startEditUser(u)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-blue-200 bg-white px-3 py-2 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(u)}
                  className={`inline-flex items-center gap-1 rounded-2xl border px-3 py-2 ${
                    u.is_active
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700"
                  }`}
                >
                  {u.is_active ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  {u.is_active ? "Acesso liberado" : "Acesso bloqueado"}
                </button>

                <button
                  type="button"
                  onClick={() => deleteUser(u)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-rose-700 hover:bg-rose-50"
                  disabled={u.email === ADMIN_EMAIL}
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">Nenhum usuário cadastrado ainda.</div>
          ) : null}
        </div>
      </Card>

      <Card title="Empresas" subtitle="Cadastre empresas para vincular aos usuários autorizados.">
        <div className="grid gap-3 md:grid-cols-[2fr,1fr]">
          <Input value={newCompanyName} onChange={setNewCompanyName} placeholder="Nome da empresa" />
          <PrimaryButton onClick={handleCreateCompany}>Cadastrar empresa</PrimaryButton>
        </div>
        <div className="mt-3 text-xs text-zinc-500">
          {companies.length === 0
            ? "Nenhuma empresa cadastrada ainda."
            : `Empresas disponíveis: ${companies.map((c) => c.name).join(", ")}`}
        </div>
        <div className="mt-4 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
          {companies.map((company) => (
            <div key={company.id} className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm font-semibold text-zinc-800">{company.name}</div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => startEditCompany(company)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-blue-200 bg-white px-3 py-2 text-blue-700 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(company.id)}
                  className="inline-flex items-center gap-1 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              </div>
            </div>
          ))}
          {companies.length === 0 ? (
            <div className="p-4 text-sm text-zinc-500">Nenhuma empresa cadastrada ainda.</div>
          ) : null}
        </div>

        {editingCompanyId ? (
          <div className="mt-4 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm font-semibold text-amber-800">Editar empresa</div>
            <Input value={editingCompanyName} onChange={setEditingCompanyName} placeholder="Novo nome" />
            <div className="flex items-center gap-2 text-xs">
              <PrimaryButton onClick={handleUpdateCompany}>Salvar alterações</PrimaryButton>
              <button
                type="button"
                onClick={() => {
                  setEditingCompanyId(null);
                  setEditingCompanyName("");
                }}
                className="font-semibold text-amber-800 underline"
              >
                Cancelar edição
              </button>
            </div>
          </div>
        ) : null}
      </Card>

      <Card
        title="Sobre as permissões"
        subtitle="O administrador pode liberar cadastros de profile e manejar as obras vinculadas para os cadastros."
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-600">
          <li>O e-mail {ADMIN_EMAIL} é administrador inicial e sempre permanece ativo.</li>
          <li>Usuários com papel Administrador podem criar novos perfis, alterar ou bloquear acessos e excluir usuários.</li>
          <li>Os usuários liberados podem autenticar no login; bloqueá-los impede novos acessos imediatamente.</li>
        </ul>
      </Card>
    </div>
  );
}
