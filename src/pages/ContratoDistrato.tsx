import React from "react";
import { Card } from "../components/ui/Card";

export default function PageContratoDistrato() {
  return (
    <div className="space-y-4">
      <Card title="Distrato" subtitle="Protótipo: checklist e baixa de pendências (mock)">
        <div className="text-sm text-zinc-600">
          Estruture aqui: (1) saldo a medir, (2) documentos, (3) termo, (4) pendências, (5) encerramento.
        </div>
      </Card>
    </div>
  );
}
