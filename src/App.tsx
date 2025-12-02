import React, { useMemo, useState } from "react";
import type { PageKey } from "./types/navigation";
import { MOCK_OBRAS } from "./data/mock";
import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

import PageAuth from "./pages/Auth";
import PageDashboard from "./pages/Dashboard";
import PageDadosUpload from "./pages/DadosUpload";
import PageObras from "./pages/Obras";
import PageContratoNovo from "./pages/ContratoNovo";
import PageContratoAditivo from "./pages/ContratoAditivo";
import PageContratoConsulta from "./pages/ContratoConsulta";
import PageContratoEqualizacao from "./pages/ContratoEqualizacao";
import PageContratoDistrato from "./pages/ContratoDistrato";
import PageSuprimentosNovo from "./pages/SuprimentosNovo";
import PageSuprimentosConsulta from "./pages/SuprimentosConsulta";
import PageHistorico from "./pages/Historico";

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [current, setCurrent] = useState<PageKey>("DASH");
  const [obraId, setObraId] = useState(MOCK_OBRAS[0]?.id ?? "obr1");
  const [periodo, setPeriodo] = useState("01/2024–12/2024");

  const obra = useMemo(() => MOCK_OBRAS.find((o) => o.id === obraId) ?? MOCK_OBRAS[0], [obraId]);

  function onExport() {
    // export simples para GitHub/demo: baixa um JSON com estado
    const payload = { current, obraId, periodo, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gestor-pro-export-${obraId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authed) return <PageAuth onEnter={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
          <Sidebar current={current} setCurrent={setCurrent} />

          <main className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <Topbar
                obra={obra}
                setObraId={setObraId}
                periodo={periodo}
                setPeriodo={setPeriodo}
                onExport={onExport}
              />
            </div>

            {current === "DASH" ? <PageDashboard obraId={obraId} /> : null}
            {current === "DADOS" ? <PageDadosUpload obra={obra} /> : null}
            {current === "OBRAS" ? <PageObras obraId={obraId} setObraId={setObraId} /> : null}

            {current === "CONTRATO_NOVO" ? <PageContratoNovo /> : null}
            {current === "CONTRATO_ADITIVO" ? <PageContratoAditivo /> : null}
            {current === "CONTRATO_CONSULTA" ? <PageContratoConsulta /> : null}
            {current === "CONTRATO_EQUALIZACAO" ? <PageContratoEqualizacao /> : null}
            {current === "CONTRATO_DISTRATO" ? <PageContratoDistrato /> : null}

            {current === "SUP_NOVO" ? <PageSuprimentosNovo /> : null}
            {current === "SUP_CONSULTA" ? <PageSuprimentosConsulta /> : null}

            {current === "HIST" ? <PageHistorico obraId={obraId} /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

