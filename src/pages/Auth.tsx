import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import { Input, PrimaryButton } from "../components/ui/Controls";
import { paths } from "../routes/paths";
import { supabase, isSupabaseEnabled } from "../lib/supabaseClient";
import { useAppStore } from "../store/useAppStore";

export default function Auth() {
  const nav = useNavigate();
  const { setUser } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function entrar() {
    setMsg(null);

    if (!isSupabaseEnabled || !supabase) {
      setUser({ email: email || "demo@local" });
      nav(paths.dashboard);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(error.message);
      return;
    }

    setUser({ email });
    nav(paths.dashboard);
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-4">
      <div className="mx-auto max-w-lg">
        <Card
          title="Entrar"
          subtitle={isSupabaseEnabled ? "Supabase habilitado" : "Modo demo (Supabase não configurado)"}
        >
          <div className="space-y-3">
            <Input value={email} onChange={setEmail} placeholder="E-mail" />
            <Input value={password} onChange={setPassword} placeholder="Senha" />
            {msg ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{msg}</div> : null}
            <PrimaryButton onClick={entrar}>Entrar</PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
