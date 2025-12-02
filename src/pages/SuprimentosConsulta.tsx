import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { FilterBar } from "../components/layout/FilterBar";
import { Select } from "../components/ui/Select";
import { Table } from "../components/ui/Table";
import { brl } from "../utils/format";
import { useAppStore } from "../store/useAppStore";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import type { Insumo } from "../types/domain";

export default function PageSuprimentosConsulta() {
  const { obraId, companyId } = useAppStore();
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("TODOS");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsumos() {
      if (!isSupabaseEnabled || !supabase || !companyId) return;
      setLoading(true);
      setError(null);

      const query = supabase
        .from("insumos")
        .select(
          "id, codigo, descricao, categoria, tipo, und, orcado_qtd, orcado_valor, incorrido_qtd, incorrido_valor, updated_at"
        )
        .eq("company_id", companyId);

      if (obraId) {
        query.eq("obra_id", obraId);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const mapped: Insumo[] = (data ?? []).map((i) => ({
        codigo: i.codigo,
        descricao: i.descricao,
        categoria: i.categoria ?? "",
        tipo: i.tipo ?? "MAT",
        und: i.und ?? "",
        orcadoQtd: Number(i.orcado_qtd ?? 0),
        orcadoValor: Number(i.orcado_valor ?? 0),
        incorridoQtd: Number(i.incorrido_qtd ?? 0),
        incorridoValor: Number(i.incorrido_valor ?? 0),
      }));

      setInsumos(mapped);
      setLoading(false);
    }

    fetchInsumos();
  }, [companyId, obraId]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return insumos.filter((i) => {
      const okText = !t || `${i.codigo} ${i.descricao} ${i.categoria}`.toLowerCase().includes(t);
      const okTipo = tipo === "TODOS" || i.tipo === tipo;
      return okText && okTipo;
    });
  }, [insumos, q, tipo]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <div className="relative w-full md:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar insumo..."
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <Select
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "TODOS", label: "Tipo: todos" },
                { value: "MAT", label: "Material" },
                { value: "MO", label: "Mão de obra" },
                { value: "MAT+MO", label: "Mat+MO" },
                { value: "COMPOSIÇÃO", label: "Composição" },
              ]}
            />
          </>
        }
        right={<div />}
      />

      <Card title="Insumos" subtitle="Orçado x incorrido da planilha importada">
        {error ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        ) : null}

        {!isSupabaseEnabled ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Configure o Supabase para consultar os insumos importados.
          </div>
        ) : (
          <Table
            columns={[
              { key: "codigo", header: "Código" },
              { key: "descricao", header: "Descrição" },
              { key: "categoria", header: "Categoria" },
              { key: "tipo", header: "Tipo" },
              { key: "orcado", header: "Orçado", align: "right" },
              { key: "incorrido", header: "Incorrido", align: "right" },
            ]}
            rows={rows.map((i) => ({
              codigo: i.codigo,
              descricao: i.descricao,
              categoria: i.categoria,
              tipo: i.tipo,
              orcado: brl(i.orcadoValor),
              incorrido: brl(i.incorridoValor),
            }))}
            emptyMessage={loading ? "Carregando dados..." : "Nenhum insumo encontrado para esta obra."}
          />
        )}
      </Card>
    </div>
  );
}
