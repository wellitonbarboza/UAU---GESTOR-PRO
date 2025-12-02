import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import { Input, PrimaryButton } from "../components/ui/Controls";
import { paths } from "../routes/paths";
import { supabase, isSupabaseEnabled } from "../lib/supabaseClient";
import { useAppStore } from "../store/useAppStore";
import { ADMIN_EMAIL } from "../config/auth";
import { loadDemoAllowedUsers } from "../utils/allowedUsersDemo";

export default function Auth() {
  const nav = useNavigate();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function checkAllowedSupabase(targetEmail: string) {
    if (!supabase) return { allowed: false, role: undefined } as const;
    const normalized = targetEmail.trim().toLowerCase();
    const { data, error } = await supabase
      .from("login_allowed_users")
      .select("id, is_active, role")
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      setMsg(error.message);
      return { allowed: false, role: undefined } as const;
    }

    if (!data || !data.is_active) {
      setMsg("Usuário não autorizado. Solicite liberação ao administrador.");
      return { allowed: false, role: undefined } as const;
    }

    return { allowed: true, role: data.role } as const;
  }

  function checkAllowedDemo(targetEmail: string) {
    const normalized = targetEmail.trim().toLowerCase();
    const allowed = loadDemoAllowedUsers().find((u) => u.email === normalized && u.is_active);
    if (!allowed) {
      setMsg("Usuário não autorizado no modo demo. Solicite ao administrador.");
      return { allowed: false, role: undefined } as const;
    }
    return { allowed: true, role: allowed.role } as const;
  }

  async function entrar() {
    setMsg(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setMsg("Informe um e-mail válido.");
      return;
    }

    if (!isSupabaseEnabled || !supabase) {
      const { allowed, role } = checkAllowedDemo(normalizedEmail);
      if (!allowed) return;
      setUser({ email: normalizedEmail, role });
      nav(paths.dashboard);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) {
      setMsg(error.message);
      return;
    }

    const { allowed, role } = await checkAllowedSupabase(normalizedEmail);
    if (!allowed) {
      await supabase.auth.signOut();
      return;
    }

    setUser({ email: normalizedEmail, role });
    nav(paths.dashboard);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-lg">
        <Card
          title="Entrar"
          subtitle={
            isSupabaseEnabled
              ? "Supabase habilitado — somente usuários liberados podem acessar"
              : "Modo demo — apenas usuários autorizados pelo administrador"
          }
        >
          <div className="space-y-3">
            <Input value={email} onChange={setEmail} placeholder="E-mail" />
            <Input value={password} onChange={setPassword} placeholder="Senha" />
            {msg ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{msg}</div>
            ) : null}
            <PrimaryButton onClick={entrar}>Entrar</PrimaryButton>
            <p className="text-xs text-zinc-500">
              Administrador padrão: {ADMIN_EMAIL}. Ele pode liberar novos usuários na seção "Usuários".
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
