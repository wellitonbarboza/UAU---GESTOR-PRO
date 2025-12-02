import React, { useMemo, useState } from "react";
import Card from "../ui/Card";
import Table from "../ui/Table";
import { Select } from "../ui/Controls";
import { brl } from "../lib/format";
import { MOCK_HISTORICO } from "../mock/data";
import { useAppStore } from "../store/useAppStore";

export default function Historico() {
  const { obraId } = useAppStore();
  const [tipo, setTipo] = useState("TODOS");

  const rows = useMemo(() => {
    return MOCK_HISTORICO
      .filter((h) => h.obraId === obraId)
      .filter((h) => tipo === "TODOS" || h.tipo === tipo)
      .map((h) => ({
        quando: h.criadoEm,
        tipo: h.tipo,
        titulo: h.titulo,
        desvio: brl(h.impacto.desvio)
      }));
  }, [obraId, tipo]);

  return (
    <div className="space-y-4">
      <Card
        title="Histórico"
        subtitle="Análises e consultas salvas (no app real: persistidas no Supabase)"
        right={
          <div className="w-[240px]">
            <Select
              value={tipo}
              onChange={setTipo}
              options={[
                { value: "TODOS", label: "Tipo: todos" },
                { value: "CONTRATO_NOVO", label: "Contrato — Novo" },
                { value: "CONTRATO_ADITIVO", label: "Contrato — Aditivo" },
                { value: "DISTRATO", label: "Distrato" },
                { value: "COMPRAS", label: "Compras" },
                { value: "CONSULTA", label: "Consulta" }
              ]}
            />
          </div>
        }
      >
        <Table
          columns={[
            { key: "quando", header: "Criado em" },
            { key: "tipo", header: "Tipo" },
            { key: "titulo", header: "Título" },
            { key: "desvio", header: "Desvio", align: "right" }
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}
