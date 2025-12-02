import React, { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { FilterBar } from "../components/layout/FilterBar";
import { Select } from "../components/ui/Select";
import { StatusPill } from "../components/ui/StatusPill";
import { brl } from "../utils/format";
import { MOCK_HISTORICO } from "../data/mock";

export default function PageHistorico({ obraId }: { obraId: string }) {
  const [tipo, setTipo] = useState("TODOS");

  const items = useMemo(() => {
    return MOCK_HISTORICO.filter((h) => h.obraId === obraId).filter((h) => tipo === "TODOS" || h.tipo === tipo);
  }, [obraId, tipo]);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <Select
            value={tipo}
            onChange={setTipo}
            options={[
              { value: "TODOS", label: "Tipo: todos" },
              { value: "CONTRATO_NOVO", label: "Contrato — Novo" },
              { value: "CONTRATO_ADITIVO", label: "Contrato — Aditivo" },
              { value: "DISTRATO", label: "Distrato" },
              { value: "COMPRAS", label: "Compras" },
              { value: "CONSULTA", label: "Consulta" },
            ]}
          />
        }
        right={<div />}
      />

      <Card title="Histórico" subtitle="Eventos gerados no protótipo (mock)">
        <div className="space-y-3">
          {items.map((h) => (
            <div key={h.id} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-sm font-semibold">{h.titulo}</div>
                  <div className="mt-1 text-xs text-zinc-500">{h.criadoEm}</div>
                  <div className="mt-2 text-sm text-zinc-700">{h.resumo}</div>
                  <div className="mt-2">
                    <StatusPill tone="muted" text={h.tipo} />
                  </div>
                </div>
                <div className="min-w-[260px] rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Incorrido atual</span>
                    <span className="font-semibold">{brl(h.impacto.incorridoAtual)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-zinc-500">Incorrido novo</span>
                    <span className="font-semibold">{brl(h.impacto.incorridoNovo)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-500">Desvio</span>
                    <span className="font-semibold">{brl(h.impacto.desvio)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 ? <div className="text-sm text-zinc-500">Sem eventos para esta obra.</div> : null}
        </div>
      </Card>
    </div>
  );
}
