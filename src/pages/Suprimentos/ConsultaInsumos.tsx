import React, { useMemo, useState } from "react";
import { Search, FileDown } from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { IconButton, Select } from "../../components/ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_INSUMOS } from "../../mock/data";

export default function ConsultaInsumos() {
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("TODOS");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return MOCK_INSUMOS.filter((i) => {
      const okText = !t || `${i.codigo} ${i.descricao} ${i.categoria}`.toLowerCase().includes(t);
      const okTipo = tipo === "TODOS" || i.tipo === tipo;
      return okText && okTipo;
    });
  }, [q, tipo]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
            <div className="relative w-full md:max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por código, descrição ou categoria..."
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <Select
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "TODOS", label: "Tipo: todos" },
                { value: "MAT", label: "Material (MAT)" },
                { value: "MO", label: "Mão de obra (MO)" },
                { value: "MAT+MO", label: "Material + MO" },
                { value: "COMPOSIÇÃO", label: "Composição" }
              ]}
            />
          </div>

          <IconButton title="Exportar" onClick={() => alert("Protótipo: exportar consulta de insumos")}>
            <FileDown className="h-4 w-4" /> Exportar
          </IconButton>
        </div>
      </div>

      <Card title="Insumos/Composições" subtitle="Panorama orçado x incorrido">
        <Table
          columns={[
            { key: "codigo", header: "Código" },
            { key: "desc", header: "Descrição" },
            { key: "cat", header: "Categoria" },
            { key: "tipo", header: "Tipo" },
            { key: "orc", header: "Orçado", align: "right" },
            { key: "inc", header: "Incorrido", align: "right" }
          ]}
          rows={list.map((i) => ({
            codigo: i.codigo,
            desc: i.descricao,
            cat: i.categoria,
            tipo: i.tipo,
            orc: brl(i.orcadoValor),
            inc: brl(i.incorridoValor)
          }))}
        />
      </Card>
    </div>
  );
}
