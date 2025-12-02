import React from "react";
import { Calendar, FileDown } from "lucide-react";
import type { Obra } from "../../types/domain";
import { PrimaryButton } from "../ui/Buttons";
import { Select } from "../ui/Select";

export function Topbar({
  obra,
  setObraId,
  obras,
  periodo,
  setPeriodo,
  onExport,
}: {
  obra: Obra;
  obras: Obra[];
  setObraId: (id: string) => void;
  periodo: string;
  setPeriodo: (v: string) => void;
  onExport: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xl font-semibold tracking-tight">{obra.nome}</div>
        <div className="mt-1 text-sm text-zinc-500">
          Centro de custo: <span className="font-medium text-zinc-700">{obra.centroCusto}</span> · Sigla: {obra.sigla}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
          <Select
            value={obra.id}
            onChange={setObraId}
            options={obras.map((o) => ({ value: o.id, label: `${o.centroCusto} · ${o.sigla} · ${o.nome}` }))}
          />
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="Período (ex.: 01/2024–12/2024)"
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
        </div>

        <PrimaryButton onClick={onExport}>
          <FileDown className="h-4 w-4" /> Exportar
        </PrimaryButton>
      </div>
    </div>
  );
}
