import React, { useMemo, useState } from "react";
import Card from "../../ui/Card";
import Table from "../../ui/Table";
import StatusPill from "../../ui/Status";
import { PrimaryButton, Select, Input } from "../../ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";

export default function AnaliseNovo() {
  const [servico, setServico] = useState("REVESTIMENTOS");
  const [fornecedor, setFornecedor] = useState("0042 · ROMILTON");
  const [valorProposto, setValorProposto] = useState("185000");
  const [qtdProposta, setQtdProposta] = useState("0");

  const existentes = useMemo(() => {
    return MOCK_CONTRATOS.filter((c) => (c.servicoDescricao || "").toUpperCase().includes(servico.toUpperCase()));
  }, [servico]);

  const panorama = useMemo(() => {
    const orcado = 188000;
    const incc = 201500;
    const cat = 215000;

    const incorridoExistente = existentes.reduce((s, c) => s + c.valorPago + c.valorAPagar, 0);
    const novo = Number(valorProposto.replace(/\./g, "").replace(/,/g, ".")) || 0;

    const total = incorridoExistente + novo;
    const desvio = total - incc;

    return { orcado, incc, cat, incorridoExistente, novo, total, desvio };
  }, [existentes, valorProposto]);

  return (
    <div className="space-y-4">
      <Card title="Análise — Novo contrato" subtitle="Comparar com contratos existentes, incorrido e orçamento (INCC/CAT)">
        <div className="grid gap-3 md:grid-cols-4">
          <Select
            value={servico}
            onChange={setServico}
            options={[
              { value: "REVESTIMENTOS", label: "Serviço/Categoria: Revestimentos" },
              { value: "ESTRUTURA", label: "Serviço/Categoria: Estrutura" },
              { value: "ADMIN/GERAL", label: "Serviço/Categoria: Admin/Geral" }
            ]}
          />

          <Select
            value={fornecedor}
            onChange={setFornecedor}
            options={[
              { value: "0042 · ROMILTON", label: "Fornecedor: 0042 · ROMILTON" },
              { value: "0077 · CONCRETEIRA", label: "Fornecedor: 0077 · CONCRETEIRA" },
              { value: "0031 · LOCADORA", label: "Fornecedor: 0031 · LOCADORA" }
            ]}
          />

          <Input value={qtdProposta} onChange={setQtdProposta} placeholder="Quantidade (opcional)" />
          <Input value={valorProposto} onChange={setValorProposto} placeholder="Valor proposto (R$)" />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-6">
          <Resumo label="Orçado" value={brl(panorama.orcado)} />
          <Resumo label="Orçado INCC" value={brl(panorama.incc)} />
          <Resumo label="CAT" value={brl(panorama.cat)} />
          <Resumo label="Incorrido existente" value={brl(panorama.incorridoExistente)} />
          <Resumo label="Novo contrato" value={brl(panorama.novo)} />
          <Resumo
            label="Desvio vs INCC"
            value={brl(panorama.desvio)}
            tone={panorama.desvio <= 0 ? "ok" : "warn"}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={() => alert("Protótipo: salvar análise no histórico")}>Salvar análise</PrimaryButton>
        </div>
      </Card>

      <Card title="Contratos existentes na categoria" subtitle="O que já está vigente/finalizado (para evitar duplicidade e enxergar incorrido)">
        <Table
          columns={[
            { key: "numero", header: "Contrato" },
            { key: "fornecedor", header: "Fornecedor" },
            { key: "status", header: "Status" },
            { key: "total", header: "Total", align: "right" },
            { key: "medido", header: "Medido", align: "right" },
            { key: "incorrido", header: "Incorrido", align: "right" }
          ]}
          rows={existentes.map((c) => ({
            numero: c.numero,
            fornecedor: `${c.fornecedorCodigo} · ${c.fornecedorNome}`,
            status: <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} />,
            total: brl(c.valorTotal),
            medido: brl(c.valorMedido),
            incorrido: brl(c.valorPago + c.valorAPagar)
          }))}
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
