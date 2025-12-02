import React, { useMemo, useState } from "react";
import Card from "../../ui/Card";
import Table from "../../ui/Table";
import { PrimaryButton, Input } from "../../ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_INSUMOS } from "../../mock/data";

type PedidoLinha = { codigo: string; descricao: string; und: string; qtd: number; unit: number };

export default function NovoPedido() {
  const [busca, setBusca] = useState("");
  const [pedido, setPedido] = useState<PedidoLinha[]>([]);

  const candidatos = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return MOCK_INSUMOS.filter((i) => !t || `${i.codigo} ${i.descricao}`.toLowerCase().includes(t)).slice(0, 8);
  }, [busca]);

  const total = useMemo(() => pedido.reduce((s, p) => s + p.qtd * p.unit, 0), [pedido]);

  function add(i: typeof MOCK_INSUMOS[number]) {
    const unit = i.orcadoQtd > 0 ? i.orcadoValor / i.orcadoQtd : 0;
    setPedido((p) => [...p, { codigo: i.codigo, descricao: i.descricao, und: i.und, qtd: 1, unit }]);
  }

  function setQtd(idx: number, qtd: number) {
    setPedido((p) => p.map((x, i) => (i === idx ? { ...x, qtd } : x)));
  }

  return (
    <div className="space-y-4">
      <Card title="Compras — Novo pedido" subtitle="Selecionar insumos e simular impacto vs orçamento/incorrido">
        <div className="grid gap-3 md:grid-cols-3">
          <Input value={busca} onChange={setBusca} placeholder="Buscar insumo (código ou nome)" />
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-xs text-zinc-500">Total do pedido</div>
            <div className="mt-1 text-sm font-semibold">{brl(total)}</div>
          </div>
          <div className="flex items-center justify-end">
            <PrimaryButton onClick={() => alert("Protótipo: salvar análise de compra no histórico")}>Salvar análise</PrimaryButton>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="text-sm font-semibold">Sugestões</div>
            <div className="mt-2 grid gap-2">
              {candidatos.map((i) => (
                <button
                  key={i.codigo}
                  onClick={() => add(i)}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm hover:bg-zinc-100"
                >
                  <span className="text-left">
                    <div className="font-semibold">{i.codigo}</div>
                    <div className="text-xs text-zinc-500">{i.descricao}</div>
                  </span>
                  <span className="text-xs text-zinc-600">Adicionar</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-3">
            <div className="text-sm font-semibold">Itens do pedido</div>
            <div className="mt-2">
              <Table
                columns={[
                  { key: "codigo", header: "Código" },
                  { key: "desc", header: "Descrição" },
                  { key: "und", header: "Und" },
                  { key: "qtd", header: "Qtd", align: "right" },
                  { key: "total", header: "Total", align: "right" }
                ]}
                rows={pedido.map((p, idx) => ({
                  codigo: p.codigo,
                  desc: p.descricao,
                  und: p.und,
                  qtd: (
                    <input
                      type="number"
                      min={0}
                      value={p.qtd}
                      onChange={(e) => setQtd(idx, Number(e.target.value))}
                      className="h-9 w-24 rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-right outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  ),
                  total: brl(p.qtd * p.unit)
                }))}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
