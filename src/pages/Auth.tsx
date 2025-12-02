import React from "react";
import { Card } from "../components/ui/Card";
import { PrimaryButton } from "../components/ui/Buttons";

export default function PageAuth({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl items-center px-4">
      <div className="w-full space-y-4">
        <Card title="UAU · Gestor Pro" subtitle="Protótipo (sem Supabase)">
          <div className="space-y-3">
            <div className="text-sm text-zinc-600">
              Login mock para navegar no protótipo. No app real: Supabase Auth + companyId + roles.
            </div>
            <div className="grid gap-2">
              <input className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" placeholder="E-mail" />
              <input className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200" placeholder="Senha" type="password" />
            </div>
            <PrimaryButton onClick={onEnter}>Entrar</PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
