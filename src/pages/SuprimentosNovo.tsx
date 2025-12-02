import React, { useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import { Card } from "../components/ui/Card";
import { PrimaryButton } from "../components/ui/Buttons";

export default function PageSuprimentosNovo() {
  const [itens, setItens] = useState<Array<{ desc: string; qtd: string }>>([{ desc: "", qtd: "" }]);

  return (
    <div className="space-y-4">
      <Card title="Compras — Novo pedido" subtitle="Liste os itens que deseja solicitar para a obra selecionada">
        <div className="space-y-3">
          {itens.map((it, idx) => (
            <div key={idx} className="grid gap-2 md:grid-cols-6">
              <input
                value={it.desc}
                onChange={(e) => {
                  const v = e.target.value;
                  setItens((p) => p.map((x, i) => (i === idx ? { ...x, desc: v } : x)));
                }}
                className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 md:col-span-5"
                placeholder="Descrição do item"
              />
              <input
                value={it.qtd}
                onChange={(e) => {
                  const v = e.target.value;
                  setItens((p) => p.map((x, i) => (i === idx ? { ...x, qtd: v } : x)));
                }}
                className="h-10 rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200 md:col-span-1"
                placeholder="Qtd"
              />
            </div>
          ))}

          <div className="flex flex-wrap gap-2">
            <PrimaryButton
              onClick={() => setItens((p) => [...p, { desc: "", qtd: "" }])}
            >
              <Plus className="h-4 w-4" /> Adicionar item
            </PrimaryButton>

            <PrimaryButton
              onClick={() => alert("Registro de pedidos será integrado ao backend de suprimentos.")}
            >
              <ShoppingCart className="h-4 w-4" /> Registrar pedido
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
