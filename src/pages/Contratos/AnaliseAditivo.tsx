import React, { useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import StatusPill from "../../components/ui/Status";
import { PrimaryButton, Select, Input } from "../../components/ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";

export default function AnaliseAditivo() {
  const [contrato, setContrato] = useState(MOCK_CONTRATOS[0].numero);
  const [valorAditivo, setValorAditivo] = useState("30000");
  const [justificativa, setJustificativa] = useState("Ajuste de quantitativos e escopo.");

  const c = useMemo(() => MOCK_CONTRATOS.find((x) => x.numero === contrato) ?? MOCK_CONTRATOS[0], [contrato]);

  const panorama = useMemo(() => {
    const incc = c.valorTotal * 1.05;
    const incorrido = c.valorPago + c.valorAPagar;
    const ad = Number(valorAditivo.replace(/\./g, "").replace(/,/g, ".")) || 0;
    const novoTotal = c.valorTotal + ad;
    const incorridoNovo = incorrido + ad;
    const desvio = incorridoNovo - incc;
    return { incc, incorrido, ad, novoTotal, desvio };
  }, [c, valorAditivo]);

  return (
    <div className="space-y-4">
      <Card title="Análise — Aditivo" subtitle="Verificar impacto no contrato e no orçamento (INCC vs incorrido)">
        <div className="grid gap-3 md:grid-cols-3">
          <Select
            value={contrato}
            onChange={setContrato}
            options={MOCK_CONTRATOS.map((x) => ({ value: x.numero, label: `${x.numero} · ${x.fornecedorNome}` }))}
          />
          <Input value={valorAditivo} onChange={setValorAditivo} placeholder="Valor do aditivo (R$)" />
          <Input value={justificativa} onChange={setJustificativa} placeholder="Justificativa" />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <Resumo label="Total contrato" value={brl(c.valorTotal)} />
          <Resumo label="Incorrido atual" value={brl(panorama.incorrido)} />
          <Resumo label="Aditivo" value={brl(panorama.ad)} />
          <Resumo label="Novo total contrato" value={brl(panorama.novoTotal)} />
          <Resumo label="Desvio vs INCC" value={brl(panorama.desvio)} tone={panorama.desvio <= 0 ? "ok" : "warn"} />
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={() => alert("Protótipo: salvar análise de aditivo no histórico")}>Salvar análise</PrimaryButton>
        </div>
      </Card>

      <Card title="Panorama do contrato" subtitle="Status, medido, a medir e incorrido">
        <Table
          columns={[
            { key: "campo", header: "Campo" },
            { key: "valor", header: "Valor" }
          ]}
          rows={[
            { campo: "Contrato", valor: c.numero },
            { campo: "Fornecedor", valor: `${c.fornecedorCodigo} · ${c.fornecedorNome}` },
            { campo: "Objeto", valor: c.objeto },
            { campo: "Status", valor: <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} /> },
            { campo: "Total", valor: brl(c.valorTotal) },
            { campo: "Medido", valor: brl(c.valorMedido) },
            { campo: "A pagar", valor: brl(c.valorAPagar) },
            { campo: "Pago", valor: brl(c.valorPago) }
          ]}
        />
      </Card>
    </div>
  );
}

function Resumo({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${tone === "warn" ? "text-amber-900" : tone === "ok" ? "text-emerald-800" : "text-zinc-900"}`}>
        {value}
      </div>
    </div>
  );
}
