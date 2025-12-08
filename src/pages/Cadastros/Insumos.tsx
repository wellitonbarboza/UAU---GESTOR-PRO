import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { useAppStore } from "../../store/useAppStore";
import { isSupabaseEnabled, supabase } from "../../lib/supabaseClient";

type InsumoRow = {
  id: string;
  codigo: string;
  descricao: string;
  un: string | null;
  cod_cat: string | null;
  desc_cat: string | null;
};

type SupabaseInsumoRow = {
  CodInsProcItem: string;
  DescrItens: string;
  UnidProcItem: string | null;
  CategItens: string | null;
  Desc_CGer: string | null;
};

export default function Insumos() {
  const { companyId, obraId } = useAppStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insumos, setInsumos] = useState<InsumoRow[]>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseEnabled || !supabase) {
        setError("Configure o Supabase para carregar os insumos reais.");
        return;
      }

      if (!companyId) {
        setError("Empresa não encontrada na sessão. Faça login novamente.");
        return;
      }

      if (!obraId) {
        setError("Selecione uma obra para listar os insumos desta importação.");
        return;
      }

      setLoading(true);
      setError(null);

        const { data, error: supaError } = await supabase
          .from("334-ITENS INSUMOS PROCESSOS")
          .select('"CodInsProcItem", "DescrItens", "UnidProcItem", "CategItens", "Desc_CGer", uau_import_batches!inner(company_id)')
        .eq("uau_import_batches.company_id", companyId)
        .eq("obra_id", obraId)
        .order("CodInsProcItem", { ascending: true });
   
      if (supaError) {
        setError(supaError.message);
        setLoading(false);
        return;
      }

      const rows = (data ?? []) as SupabaseInsumoRow[];

      setInsumos(
        rows.map((item) => ({
          id: `${item.CodInsProcItem}-${obraId}`,
          codigo: item.CodInsProcItem,
          descricao: item.DescrItens,
          un: item.UnidProcItem,
          cod_cat: item.CategItens,
          desc_cat: item.Desc_CGer
        }))
      );
      setLoading(false);
    }

    load();
  }, [companyId, obraId]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return insumos.filter((i) => {
      if (!t) return true;
      return i.codigo.toLowerCase().includes(t) || i.descricao.toLowerCase().includes(t);
    });
  }, [insumos, q]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código ou descrição do insumo..."
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          {error ? <div className="text-sm text-amber-700">{error}</div> : null}
        </div>
      </div>

      <Card
        title="Insumos"
        subtitle="Cadastro base extraído da aba 334-Itens Insumos Processos"
        right={loading ? <div className="text-xs text-zinc-500">Carregando...</div> : null}
      >
        <Table
          columns={[
            { key: "codigo", header: "Código" },
            { key: "descricao", header: "Descrição" },
            { key: "un", header: "Un." },
            { key: "cod_cat", header: "Cód. Cat" },
            { key: "desc_cat", header: "Desc. Cat" }
          ]}
          rows={list.map((i) => ({
            codigo: i.codigo,
            descricao: i.descricao,
            un: i.un ?? "-",
            cod_cat: i.cod_cat ?? "-",
            desc_cat: i.desc_cat ?? "-"
          }))}
          emptyMessage={loading ? "Carregando insumos..." : error ? "Não foi possível carregar os insumos." : "Nenhum insumo encontrado."}
        />
      </Card>
    </div>
  );
}
