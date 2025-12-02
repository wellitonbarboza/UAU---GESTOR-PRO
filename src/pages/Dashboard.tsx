import React, { useMemo } from "react";
import { Receipt, CircleDollarSign, Layers, CheckCircle2, AlertTriangle } from "lucide-react";
import KPI from "../components/ui/KPI";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import StatusPill from "../components/ui/Status";
import ProgressBar from "../components/ui/Progress";
import { brl, pct } from "../lib/format";
import { MOCK_CONTRATOS, MOCK_PROCESSOS_SEM_CONTRATO } from "../mock/data";
import { useAppStore } from "../store/useAppStore";

export default function Dashboard() {
  const { obraId } = useAppStore();

  const semContrato = useMemo(() => {
    return [...MOCK_PROCESSOS_SEM_CONTRATO]
      .sort((a, b) => b.pago + b.aPagar - (a.pago + a.aPagar))
      .slice(0, 10);
  }, [obraId]);

  const kpis = useMemo(() => {
    const orcado = 1250000;
    const orcadoINCC = 1342000;
    const cat = 1389000;

    const pago = MOCK_CONTRATOS.reduce((s, c) => s + c.valorPago, 0) + semContrato.reduce((s, p) => s + p.pago, 0);
    const aPagar = MOCK_CONTRATOS.reduce((s, c) => s + c.valorAPagar, 0) + semContrato.reduce((s, p) => s + p.aPagar, 0);
    const incorrido = pago + aPagar;
    const desvio = incorrido - orcadoINCC;

    return { orcado, orcadoINCC, cat, pago, aPagar, incorrido, desvio };
  }, [obraId, semContrato]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <KPI label="Orçado" value={brl(kpis.orcado)} hint="Base: DE-PARA / CAT" icon={<Receipt className="h-5 w-5" />} />
        <KPI label="Orçado INCC" value={brl(kpis.orcadoINCC)} hint="Base: CAT col P" icon={<CircleDollarSign className="h-5 w-5" />} />
        <KPI label="CAT" value={brl(kpis.cat)} hint="Base: CAT col AD" icon={<Layers className="h-5 w-5" />} />
        <KPI label="Incorrido" value={brl(kpis.incorrido)} hint="Pago + A pagar" icon={<Receipt className="h-5 w-5" />} />
        <KPI
          label="Desvio"
          value={brl(kpis.desvio)}
          hint={kpis.desvio <= 0 ? "Dentro/abaixo do INCC" : "Acima do INCC"}
          icon={kpis.desvio <= 0 ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Contratos — panorama" subtitle="Vigentes e finalizados, com % medido e saldo" right={<StatusPill tone="muted" text="Demo" />}>
          <div className="space-y-3">
            {MOCK_CONTRATOS.map((c) => {
              const medPerc = c.valorTotal ? c.valorMedido / c.valorTotal : 0;

              return (
                <div key={c.numero} className="rounded-2xl border border-zinc-200 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{c.numero} · {c.fornecedorNome}</div>
                      <div className="mt-1 text-xs text-zinc-500">{c.objeto}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} />
                        <StatusPill tone="muted" text={c.situacao} />
                        {c.servicoCodigo ? <StatusPill tone="muted" text={`Serviço ${c.servicoCodigo}`} /> : null}
                      </div>
                    </div>

                    <div className="min-w-[220px]">
                      <div className="flex items-center justify-between text-xs text-zinc-500">
                        <span>% medido</span>
                        <span className="font-semibold text-zinc-800">{pct(medPerc)}</span>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={medPerc} />
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                          <div className="text-zinc-500">Total</div>
                          <div className="font-semibold">{brl(c.valorTotal)}</div>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                          <div className="text-zinc-500">Medido</div>
                          <div className="font-semibold">{brl(c.valorMedido)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Pagos sem contrato" subtitle="Top 10 por incorrido" right={<AlertTriangle className="h-4 w-4 text-amber-800" />}>
          <Table
            columns={[
              { key: "processo", header: "Processo" },
              { key: "fornecedor", header: "Fornecedor" },
              { key: "valor", header: "Incorrido", align: "right" }
            ]}
            rows={semContrato.map((p) => ({
              processo: `${p.processo}/${p.parcela}`,
              fornecedor: p.fornecedor,
              valor: brl(p.pago + p.aPagar)
            }))}
          />
        </Card>
      </div>
    </div>
  );
}
