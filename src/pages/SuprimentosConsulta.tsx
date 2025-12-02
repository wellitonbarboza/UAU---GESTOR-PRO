import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { FilterBar } from "../components/layout/FilterBar";
import { Select } from "../components/ui/Select";
import { Table } from "../components/ui/Table";
import { brl } from "../utils/format";
import { MOCK_INSUMOS } from "../data/mock";

export default function PageSuprimentosConsulta() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return MOCK_INSUMOS.filter((i) => {
      const okText = !t || `${i.codigo} ${i.descricao} ${i.categoria}`.toLowerCase().includes(t);
      const okTipo = tipo === "TODOS" || i.tipo === tipo;
      return okText && okTipo;
    });
  }, [q, tipo]);

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

      <Card title="Insumos" subtitle="Orçado x Incorrido (mock)">
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
        />
      </Card>
    </div>
  );
}
