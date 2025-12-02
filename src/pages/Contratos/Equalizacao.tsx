import React, { useMemo, useState } from "react";
import Card from "../../ui/Card";
import Table from "../../ui/Table";
import { PrimaryButton, Input } from "../../ui/Controls";
import { brl } from "../../lib/format";

type LinhaEq = { item: string; und: string; qtd: number; a: number; b: number; c: number };

export default function Equalizacao() {
  const [servico, setServico] = useState("REVESTIMENTOS");
  const [obs, setObs] = useState("Equalização para contratação do pacote de revestimentos.");

  const rows: LinhaEq[] = useMemo(
    () => [
      { item: "Assentamento cerâmica", und: "m²", qtd: 3200, a: 28.5, b: 29.1, c: 27.9 },
      { item: "Rejunte", und: "m²", qtd: 3200, a: 3.2, b: 3.1, c: 3.4 },
      { item: "Rodapé", und: "m", qtd: 850, a: 12.0, b: 12.6, c: 11.8 }
    ],
    []
  );

  const totais = useMemo(() => {
    const totalA = rows.reduce((s, r) => s + r.qtd * r.a, 0);
    const totalB = rows.reduce((s, r) => s + r.qtd * r.b, 0);
    const totalC = rows.reduce((s, r) => s + r.qtd * r.c, 0);
    return { totalA, totalB, totalC };
  }, [rows]);

  return (
    <div className="space-y-4">
      <Card title="Equalização" subtitle="Modelo para comparar fornecedores (pré-contratação)">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={servico} onChange={setServico} placeholder="Tipo de serviço / pacote" />
          <Input value={obs} onChange={setObs} placeholder="Observação" />
        </div>

        <div className="mt-4">
          <Table
            columns={[
              { key: "item", header: "Item" },
              { key: "und", header: "Und" },
              { key: "qtd", header: "Qtd", align: "right" },
              { key: "a", header: "Fornecedor A", align: "right" },
              { key: "b", header: "Fornecedor B", align: "right" },
              { key: "c", header: "Fornecedor C", align: "right" }
            ]}
            rows={rows.map((r) => ({
              item: r.item,
              und: r.und,
              qtd: r.qtd.toLocaleString("pt-BR"),
              a: brl(r.qtd * r.a),
              b: brl(r.qtd * r.b),
              c: brl(r.qtd * r.c)
            }))}
          />
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Resumo label="Total Fornecedor A" value={brl(totais.totalA)} />
          <Resumo label="Total Fornecedor B" value={brl(totais.totalB)} />
          <Resumo label="Total Fornecedor C" value={brl(totais.totalC)} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <PrimaryButton onClick={() => alert("Protótipo: exportar equalização (PDF/XLSX)")}>Exportar</PrimaryButton>
          <PrimaryButton onClick={() => alert("Protótipo: salvar equalização no histórico")}>Salvar</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function Resumo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
