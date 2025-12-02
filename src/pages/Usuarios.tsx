import React, { useEffect, useMemo, useState } from "react";
import { Check, Mail, Shield, Trash2, XCircle } from "lucide-react";
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

const roleOptions = [
  { value: "admin", label: "Administrador" },
  { value: "operacional", label: "Operacional" },
  { value: "viewer", label: "Visualização" }
];

type AllowedUser = {
  id: string;
  email: string;
  full_name?: string | null;
  role: "admin" | "operacional" | "viewer";
  is_active: boolean;
};

export default function Usuarios() {
  const { user } = useAppStore();
  const [users, setUsers] = useState<AllowedUser[]>([]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("viewer");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = useMemo(() => user?.role === "admin" || user?.email === ADMIN_EMAIL, [user]);

  async function fetchUsers() {
    if (!isSupabaseEnabled || !supabase) {
      const demo = loadDemoAllowedUsers();
      setUsers(demo);
      return;
    }

    const { data, error: queryError } = await supabase
      .from("login_allowed_users")
      .select("id, email, full_name, role, is_active")
      .order("email", { ascending: true });

    if (queryError) {
      setError(queryError.message);
      return;
    }

    setUsers(data ?? []);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function handleCreate() {
    setError(null);
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setError("Informe um e-mail válido.");
      return;
    }
    setSaving(true);

    if (!isSupabaseEnabled || !supabase) {
      const updated = upsertDemoAllowedUser({ email: normalized, full_name: fullName, role: role as AllowedUser["role"], is_active: true });
      setUsers(updated);
      setEmail("");
      setFullName("");
      setRole("viewer");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("login_allowed_users").upsert({
      email: normalized,
      full_name: fullName || null,
      role: role as AllowedUser["role"],
      is_active: true
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    await fetchUsers();
    setEmail("");
    setFullName("");
    setRole("viewer");
    setSaving(false);
  }

  async function toggleActive(target: AllowedUser) {
    if (!isSupabaseEnabled || !supabase) {
      const updated = upsertDemoAllowedUser({ ...target, is_active: !target.is_active });
      setUsers(updated);
      return;
    }

    const { error: updateError } = await supabase
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

    if (!isSupabaseEnabled || !supabase) {
      const updated = deleteDemoAllowedUser(target.id);
      setUsers(updated as AllowedUser[]);
      return;
    }

    const { error: delError } = await supabase.from("login_allowed_users").delete().eq("id", target.id);
    if (delError) {
      setError(delError.message);
      return;
    }
    await fetchUsers();
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
        title="Usuários autorizados"
        subtitle="O administrador controla quem pode acessar, criar perfis e gerenciar obras vinculadas."
      >
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={email} onChange={setEmail} placeholder="E-mail" />
          <Input value={fullName} onChange={setFullName} placeholder="Nome completo (opcional)" />
          <Select value={role} onChange={setRole} options={roleOptions} />
          <div className="flex items-center gap-2">
            <PrimaryButton onClick={handleCreate} disabled={saving}>Cadastrar usuário</PrimaryButton>
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
                <div className="inline-flex items-center gap-2 text-xs text-zinc-600">
                  <Shield className="h-3 w-3" /> Permissão: {roleOptions.find((r) => r.value === u.role)?.label}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
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
