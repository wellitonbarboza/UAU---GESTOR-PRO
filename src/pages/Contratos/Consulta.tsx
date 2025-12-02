import React, { useMemo, useState } from "react";
import { Search, FileDown } from "lucide-react";
import Card from "../../ui/Card";
import StatusPill from "../../ui/Status";
import ProgressBar from "../../ui/Progress";
import { IconButton, Select } from "../../ui/Controls";
import { brl, pct } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";

export default function Consulta() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("TODOS");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return MOCK_CONTRATOS.filter((c) => {
      const okText = !t || `${c.numero} ${c.fornecedorNome} ${c.objeto} ${c.servicoCodigo ?? ""} ${c.servicoDescricao ?? ""}`.toLowerCase().includes(t);
      const okStatus = status === "TODOS" || c.status === status;
      return okText && okStatus;
    });
  }, [q, status]);

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
                placeholder="Buscar contrato, fornecedor, serviço..."
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>

            <Select
              value={status}
              onChange={setStatus}
              options={[
                { value: "TODOS", label: "Status: todos" },
                { value: "VIGENTE", label: "Vigente" },
                { value: "FINALIZADO", label: "Finalizado" },
                { value: "SUSPENSO", label: "Suspenso" }
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <IconButton title="Exportar" onClick={() => alert("Protótipo: exportar consulta")}>
              <FileDown className="h-4 w-4" /> Exportar
            </IconButton>
          </div>
        </div>
      </div>

      <Card title="Contratos" subtitle="Consulta com % medido, incorrido e panorama">
        <div className="space-y-3">
          {list.map((c) => {
            const perc = c.valorTotal ? c.valorMedido / c.valorTotal : 0;
            const inc = c.valorPago + c.valorAPagar;

            return (
              <div key={c.numero} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{c.numero} · {c.fornecedorCodigo} · {c.fornecedorNome}</div>
                    <div className="mt-1 text-xs text-zinc-500">{c.objeto}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} />
                      <StatusPill tone="muted" text={c.situacao} />
                      {c.servicoCodigo ? <StatusPill tone="muted" text={`Serviço ${c.servicoCodigo}`} /> : null}
                    </div>
                  </div>

                  <div className="w-full max-w-md">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>% medido</span>
                      <span className="font-semibold text-zinc-800">{pct(perc)}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={perc} />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Total</div>
                        <div className="font-semibold">{brl(c.valorTotal)}</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Medido</div>
                        <div className="font-semibold">{brl(c.valorMedido)}</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Incorrido</div>
                        <div className="font-semibold">{brl(inc)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {list.length === 0 ? <div className="text-sm text-zinc-500">Nenhum contrato encontrado.</div> : null}
        </div>
      </Card>
    </div>
  );
}
