import React from "react";
import { Card } from "../components/ui/Card";

export default function PageContratoEqualizacao() {
  return (
    <div className="space-y-4">
      <Card title="Equalização" subtitle="Protótipo: comparar propostas, itens e condições (mock)">
        <div className="text-sm text-zinc-600">
          Aqui você pode inserir a tela de equalização (planilha comparativa, pesos por critério, anexos e decisão).
        </div>
      </Card>
    </div>
  );
}
