import React, { useMemo, useState } from "react";
import { FileDown, GitBranch, Plus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FilterBar } from "../components/layout/FilterBar";
import { ReportPreview } from "../components/layout/ReportPreview";
import { Card } from "../components/ui/Card";
import { PrimaryButton, IconButton } from "../components/ui/Buttons";
import { Select } from "../components/ui/Select";
import { StatusPill } from "../components/ui/StatusPill";
import { brl } from "../utils/format";
import { MOCK_CONTRATOS } from "../data/mock";

function parseBRL(s: string) {
  const n = Number(String(s).replace(/\./g, "").replace(/,/g, "."));
  return Number.isFinite(n) ? n : 0;
}

export default function PageContratoNovo() {
  const [modo, setModo] = useState<"NOVO" | "ADITIVO">("NOVO");
  const [servico, setServico] = useState("REVESTIMENTOS");
  const [fornecedor, setFornecedor] = useState("0042 · ROMILTON");
  const [valorProposto, setValorProposto] = useState("185000");

  const existentes = useMemo(() => {
    return MOCK_CONTRATOS.filter((c) => (c.servicoDescricao || "").toUpperCase().includes(servico.toUpperCase()));
  }, [servico]);

  const panorama = useMemo(() => {
    const orcado = 188000;
    const incc = 201500;
    const cat = 215000;
    const incorrido = existentes.reduce((s, c) => s + c.valorPago + c.valorAPagar, 0);
    const novo = parseBRL(valorProposto);
    const total = incorrido + novo;
    const desvio = total - incc;
    return { orcado, incc, cat, incorrido, novo, total, desvio };
  }, [existentes, valorProposto]);

  const tone = panorama.desvio <= 0 ? "ok" : "warn";

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <Select
              value={modo}
              onChange={(v) => setModo(v as "NOVO" | "ADITIVO")}
              options={[
                { value: "NOVO", label: "Análise: Novo contrato" },
                { value: "ADITIVO", label: "Análise: Aditivo" },
              ]}
            />
            <Select
              value={servico}
              onChange={setServico}
              options={[
                { value: "REVESTIMENTOS", label: "Serviço/Categoria: Revestimentos" },
                { value: "ESTRUTURA", label: "Serviço/Categoria: Estrutura" },
                { value: "ADMIN/GERAL", label: "Serviço/Categoria: Admin/Geral" },
              ]}
            />
            <Select
              value={fornecedor}
              onChange={setFornecedor}
              options={[
                { value: "0042 · ROMILTON", label: "Fornecedor: 0042 · ROMILTON" },
                { value: "0077 · CONCRETEIRA", label: "Fornecedor: 0077 · CONCRETEIRA" },
                { value: "0031 · LOCADORA", label: "Fornecedor: 0031 · LOCADORA" },
              ]}
            />
            <div className="w-full md:max-w-[220px]">
              <input
                value={valorProposto}
                onChange={(e) => setValorProposto(e.target.value)}
                placeholder="Valor proposto"
                className="h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </>
        }
        right={
          <>
            <IconButton title="Exportar" onClick={() => alert("Protótipo: exportar relatório")}>
              <FileDown className="h-4 w-4" /> Exportar
            </IconButton>
            <PrimaryButton onClick={() => alert("Protótipo: gerar parecer")}>
              {modo === "NOVO" ? <Plus className="h-4 w-4" /> : <GitBranch className="h-4 w-4" />}
              Gerar parecer
            </PrimaryButton>
          </>
        }
      />

      <ReportPreview
        title={`Parecer — ${modo === "NOVO" ? "Novo contrato" : "Aditivo"} · ${servico}`}
        subtitle={`Fornecedor: ${fornecedor} · Base: contratos vigentes/finalizados do serviço + INCC/CAT (mock)`}
        blocks={[
          { label: "Orçado", value: brl(panorama.orcado) },
          { label: "Orçado INCC", value: brl(panorama.incc) },
          { label: "CAT", value: brl(panorama.cat) },
          { label: "Incorrido atual", value: brl(panorama.incorrido) },
          { label: "Proposto", value: brl(panorama.novo) },
          { label: "Total após", value: brl(panorama.total) },
        ]}
      />

      <Card
        title="Conclusão"
        subtitle="Recomendação com base no desvio vs INCC"
        right={
          <StatusPill
            tone={tone}
            text={panorama.desvio <= 0 ? "Dentro do INCC" : "Acima do INCC"}
          />
        }
      >
        <div className="space-y-3 text-sm text-zinc-700">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-center gap-2 font-semibold">
              {panorama.desvio <= 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              Desvio vs INCC: <span className="ml-1">{brl(panorama.desvio)}</span>
            </div>
            <div className="mt-2 text-xs text-zinc-600">
              Critério do protótipo: total (incorrido + proposto) deve ficar ≤ Orçado INCC (col P). Caso contrário, exigir justificativa/escopo/prazo.
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-3">
            <div className="text-xs font-semibold text-zinc-600">Contratos existentes no serviço</div>
            <div className="mt-2 space-y-2">
              {existentes.map((c) => (
                <div key={c.numero} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3">
                  <div>
                    <div className="text-sm font-semibold">{c.numero} · {c.fornecedorNome}</div>
                    <div className="text-xs text-zinc-500">{c.objeto}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-500">Incorrido</div>
                    <div className="text-sm font-semibold">{brl(c.valorPago + c.valorAPagar)}</div>
                  </div>
                </div>
              ))}
              {existentes.length === 0 ? <div className="text-sm text-zinc-500">Nenhum contrato no serviço selecionado.</div> : null}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
