import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { PrimaryButton, Select, Input } from "../../components/ui/Controls";
import StatusPill from "../../components/ui/Status";
import { brl } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";

export default function Distrato() {
  const [contrato, setContrato] = useState(MOCK_CONTRATOS[0].numero);

  const [docEmpresaOk, setDocEmpresaOk] = useState(true);
  const [docFuncOk, setDocFuncOk] = useState(true);
  const [faltas, setFaltas] = useState("");

  const c = useMemo(() => MOCK_CONTRATOS.find((x) => x.numero === contrato) ?? MOCK_CONTRATOS[0], [contrato]);

  const pendencias = useMemo(() => {
    if (docEmpresaOk && docFuncOk) return "Sem pendências";
    const items: string[] = [];
    if (!docEmpresaOk) items.push("Documentos da empresa pendentes");
    if (!docFuncOk) items.push("Documentos de funcionários pendentes");
    return items.join(" · ");
  }, [docEmpresaOk, docFuncOk]);

  return (
    <div className="space-y-4">
      <Card title="Distrato" subtitle="Analisar saldo/incorrido e checklist documental antes de encerrar">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={contrato}
            onChange={setContrato}
            options={MOCK_CONTRATOS.map((x) => ({ value: x.numero, label: `${x.numero} · ${x.fornecedorNome}` }))}
          />

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Pendências</div>
            <div className="mt-1 text-sm font-semibold">{pendencias}</div>
          </div>

          <div className="flex items-center justify-end">
            <PrimaryButton onClick={() => alert("Protótipo: exportar relatório de distrato")}>Exportar</PrimaryButton>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Checklist</div>
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <span>Documentação da empresa</span>
                <input type="checkbox" checked={docEmpresaOk} onChange={(e) => setDocEmpresaOk(e.target.checked)} />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <span>Documentação de funcionários</span>
                <input type="checkbox" checked={docFuncOk} onChange={(e) => setDocFuncOk(e.target.checked)} />
              </label>
            </div>

            {docEmpresaOk && docFuncOk ? (
              <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                Checklist OK. Recomendação: formalizar termo de distrato e baixa de pendências.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="text-xs text-zinc-500">Liste as pendências (uma por linha)</div>
                <textarea
                  value={faltas}
                  onChange={(e) => setFaltas(e.target.value)}
                  className="h-28 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                  placeholder="- Ex.: CND vencida\n- Ex.: ASO faltante\n- Ex.: Folha ponto..."
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Resumo do contrato</div>
            <div className="mt-3">
              <Table
                columns={[
                  { key: "campo", header: "Campo" },
                  { key: "valor", header: "Valor" }
                ]}
                rows={[
                  { campo: "Contrato", valor: c.numero },
                  { campo: "Fornecedor", valor: `${c.fornecedorCodigo} · ${c.fornecedorNome}` },
                  { campo: "Status", valor: <StatusPill tone={c.status === "VIGENTE" ? "warn" : "muted"} text={c.status} /> },
                  { campo: "Total", valor: brl(c.valorTotal) },
                  { campo: "Medido", valor: brl(c.valorMedido) },
                  { campo: "Pago", valor: brl(c.valorPago) },
                  { campo: "A pagar", valor: brl(c.valorAPagar) }
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={() => alert("Protótipo: salvar distrato no histórico")}>Salvar no histórico</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
