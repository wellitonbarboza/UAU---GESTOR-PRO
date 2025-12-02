import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { PrimaryButton, Input } from "../components/ui/Controls";
import { useAppStore } from "../store/useAppStore";
import { cx } from "../lib/format";
import { AlertCircle, ArrowRight } from "lucide-react";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import type { Obra } from "../types/domain";

export default function Obras() {
  const { obraId, setObraId, companyId, companyName, obras, setObras } = useAppStore();
  const [form, setForm] = useState({ centroCusto: "", sigla: "", nome: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadObras() {
      if (!isSupabaseEnabled || !supabase || !companyId) return;
      const { data, error: fetchError } = await supabase
        .from("obras")
        .select("id, centro_custo, sigla, nome, status, updated_at, created_at")
        .eq("company_id", companyId)
        .order("centro_custo", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      const mapped: Obra[] = (data ?? []).map((o) => ({
        id: o.id,
        centroCusto: o.centro_custo,
        sigla: o.sigla,
        nome: o.nome,
        status: o.status,
        empresa: companyName ?? undefined,
        atualizadoEm: o.updated_at ?? o.created_at ?? new Date().toISOString(),
      }));

      setObras(mapped);
      if (!obraId && mapped[0]) {
        setObraId(mapped[0].id);
      }
    }

    loadObras();
  }, [companyId, companyName, obraId, setObraId, setObras]);

  const rows = useMemo(() => obras, [obras]);

  async function salvar() {
    setError(null);

    if (!form.centroCusto.trim() || !form.sigla.trim() || !form.nome.trim()) {
      setError("Preencha centro de custo, sigla e nome.");
      return;
    }

    if (!isSupabaseEnabled || !supabase) {
      setError("Supabase não configurado. Configure as variáveis de ambiente e refaça o login.");
      return;
    }

    if (!companyId) {
      setError("Usuário sem empresa vinculada. Entre novamente após vincular um perfil.");
      return;
    }

    setSaving(true);

    const { data, error: insertError } = await supabase
      .from("obras")
      .insert({
        company_id: companyId,
        centro_custo: form.centroCusto.trim(),
        sigla: form.sigla.trim(),
        nome: form.nome.trim(),
      })
      .select("id, centro_custo, sigla, nome, status, updated_at, created_at")
      .maybeSingle();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    if (data) {
      const novaObra: Obra = {
        id: data.id,
        centroCusto: data.centro_custo,
        sigla: data.sigla,
        nome: data.nome,
        status: data.status,
        empresa: companyName ?? undefined,
        atualizadoEm: data.updated_at ?? data.created_at ?? new Date().toISOString(),
      };

      const atualizadas = [...obras, novaObra].sort((a, b) => a.centroCusto.localeCompare(b.centroCusto));
      setObras(atualizadas);
      setObraId(novaObra.id);
      setForm({ centroCusto: "", sigla: "", nome: "" });
    }

    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <Card title="Obras cadastradas" subtitle="Cada obra pode ter um arquivo (upload) com as abas exportadas do UAU">
        <Table
          columns={[
            { key: "cc", header: "Centro de custo" },
            { key: "sigla", header: "Sigla" },
            { key: "nome", header: "Obra" },
            { key: "empresa", header: "Empresa" },
            { key: "atualizado", header: "Atualizado" },
            { key: "acao", header: "Ação" }
          ]}
          rows={rows.map((o) => ({
            cc: o.centroCusto,
            sigla: o.sigla,
            nome: o.nome,
            empresa: o.empresa ?? companyName ?? "-",
            atualizado: new Date(o.atualizadoEm).toLocaleDateString("pt-BR"),
            acao: (
              <button
                onClick={() => setObraId(o.id)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50",
                  o.id === obraId ? "border-zinc-900" : ""
                )}
              >
                Abrir <ArrowRight className="h-4 w-4" />
              </button>
            )
          }))}
        />
      </Card>

      <Card title="Cadastro" subtitle="Cadastre manualmente uma obra e vincule o upload da planilha">
        <div className="space-y-3">
          {error ? (
            <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-4">
            <Input value={form.centroCusto} onChange={(v) => setForm((p) => ({ ...p, centroCusto: v }))} placeholder="Centro de custo (ex.: 310)" />
            <Input value={form.sigla} onChange={(v) => setForm((p) => ({ ...p, sigla: v }))} placeholder="Sigla (ex.: OBR)" />
            <Input value={form.nome} onChange={(v) => setForm((p) => ({ ...p, nome: v }))} placeholder="Nome da obra" />
            <PrimaryButton onClick={salvar} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
