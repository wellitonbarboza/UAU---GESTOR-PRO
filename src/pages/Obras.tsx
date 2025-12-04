import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { PrimaryButton, Input, Select } from "../components/ui/Controls";
import { useAppStore } from "../store/useAppStore";
import { cx } from "../lib/format";
import { AlertCircle, ArrowRight } from "lucide-react";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import type { Obra } from "../types/domain";
import { ADMIN_EMAIL } from "../config/auth";

export default function Obras() {
  const { obraId, setObraId, companyId, companyName, obras, setObras, user } = useAppStore();
  const [form, setForm] = useState({ centroCusto: "", sigla: "", nome: "", status: "ATIVA" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingObraId, setEditingObraId] = useState<string | null>(null);
  const isAdmin = user?.role === "admin" || user?.email === ADMIN_EMAIL;

  const statusOptions = [
    { value: "ATIVA", label: "Ativa" },
    { value: "PAUSADA", label: "Pausada" },
    { value: "CONCLUIDA", label: "Concluída" }
  ];

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

  function resetForm() {
    setForm({ centroCusto: "", sigla: "", nome: "", status: "ATIVA" });
    setEditingObraId(null);
  }

  function startEdit(obra: Obra) {
    setForm({
      centroCusto: obra.centroCusto,
      sigla: obra.sigla,
      nome: obra.nome,
      status: obra.status ?? "ATIVA"
    });
    setEditingObraId(obra.id);
  }

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

    const payload = {
      company_id: companyId,
      centro_custo: form.centroCusto.trim(),
      sigla: form.sigla.trim(),
      nome: form.nome.trim(),
      status: form.status as Obra["status"],
    };

    const query = editingObraId
      ? supabase
          .from("obras")
          .update(payload)
          .eq("id", editingObraId)
          .select("id, centro_custo, sigla, nome, status, updated_at, created_at")
          .maybeSingle()
      : supabase
          .from("obras")
          .insert(payload)
          .select("id, centro_custo, sigla, nome, status, updated_at, created_at")
          .maybeSingle();

    const { data, error: insertError } = await query;

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

      let atualizadas: Obra[];

      if (editingObraId) {
        atualizadas = obras
          .map((o) => (o.id === editingObraId ? novaObra : o))
          .sort((a, b) => a.centroCusto.localeCompare(b.centroCusto));
      } else {
        atualizadas = [...obras, novaObra].sort((a, b) => a.centroCusto.localeCompare(b.centroCusto));
        setObraId(novaObra.id);
      }

      setObras(atualizadas);
      resetForm();
    }

    setSaving(false);
  }

  async function deletar(obraParaExcluir: Obra) {
    setError(null);

    if (!isSupabaseEnabled || !supabase) {
      setError("Supabase não configurado. Configure as variáveis de ambiente e refaça o login.");
      return;
    }

    const { error: deleteError } = await supabase.from("obras").delete().eq("id", obraParaExcluir.id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    const atualizadas = obras.filter((o) => o.id !== obraParaExcluir.id);
    setObras(atualizadas);
    if (obraId === obraParaExcluir.id) {
      setObraId(atualizadas[0]?.id ?? "");
    }
    if (editingObraId === obraParaExcluir.id) {
      resetForm();
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <Card title="Acesso restrito" subtitle="Somente administradores podem cadastrar ou vincular obras aos usuários.">
          <p className="text-sm text-zinc-600">
            Todas as obras cadastradas ficam sob responsabilidade do perfil administrador padrão ({ADMIN_EMAIL}).
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        title="Obras cadastradas"
        subtitle="Obras registradas pelo administrador (vinculadas ao perfil administrador) podem receber upload das abas do UAU"
      >
        <Table
          columns={[
            { key: "cc", header: "Centro de custo" },
            { key: "sigla", header: "Sigla" },
            { key: "nome", header: "Obra" },
            { key: "status", header: "Status" },
            { key: "empresa", header: "Empresa" },
            { key: "atualizado", header: "Atualizado" },
            { key: "acao", header: "Ação" }
          ]}
          rows={rows.map((o) => ({
            cc: o.centroCusto,
            sigla: o.sigla,
            nome: o.nome,
            status: o.status ?? "-",
            empresa: o.empresa ?? companyName ?? "-",
            atualizado: new Date(o.atualizadoEm).toLocaleDateString("pt-BR"),
            acao: (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setObraId(o.id)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50",
                    o.id === obraId ? "border-zinc-900" : ""
                  )}
                >
                  Abrir <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => startEdit(o)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-white px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletar(o)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-white px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
                >
                  Excluir
                </button>
              </div>
            )
          }))}
        />
      </Card>

      <Card
        title={editingObraId ? "Editar obra" : "Cadastro"}
        subtitle="Cadastre manualmente uma obra em nome do administrador e vincule o upload da planilha"
      >
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
            <Select value={form.status} onChange={(v) => setForm((p) => ({ ...p, status: v }))} options={statusOptions} />
            <PrimaryButton onClick={salvar} disabled={saving}>
              {saving ? "Salvando..." : editingObraId ? "Salvar alterações" : "Salvar"}
            </PrimaryButton>
            {editingObraId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm font-semibold text-zinc-700 underline"
              >
                Cancelar edição
              </button>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}
