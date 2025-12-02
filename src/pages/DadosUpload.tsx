import React, { useState } from "react";
import { CheckCircle2, FileUp, Filter } from "lucide-react";
import type { Obra } from "../types/domain";
import { Card } from "../components/ui/Card";
import { PrimaryButton } from "../components/ui/Buttons";
import { StatusPill } from "../components/ui/StatusPill";
import { DatabaseIcon } from "../components/icons/DatabaseIcon";

export default function PageDadosUpload({ obra }: { obra: Obra }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "validado" | "processado" | "persistido">("idle");
  const [log, setLog] = useState<string[]>([]);

  const step = (s: string) => setLog((p) => [...p, s]);

  return (
    <div className="space-y-4">
      <Card title="Upload do XLSX (UAU)" subtitle="Enviar o arquivo exportado com todas as abas necessárias">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Arquivo</div>
                <div className="text-xs text-zinc-500">
                  Obra: {obra.centroCusto} · {obra.sigla}
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-2">
                <FileUp className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setFileName(f.name);
                  setStage("idle");
                  setLog([`Selecionado: ${f.name}`]);
                }}
              />
            </div>

            <div className="mt-3 text-xs text-zinc-600">
              {fileName ? (
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3">
                  <span className="font-medium">{fileName}</span>
                  <StatusPill tone="muted" text="Pronto" />
                </div>
              ) : (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3">Nenhum arquivo selecionado.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="text-sm font-semibold">Fluxo</div>
            <div className="mt-2 grid gap-2 text-sm">
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <span>1) Validar abas</span>
                <StatusPill tone={stage !== "idle" ? "ok" : "muted"} text={stage !== "idle" ? "OK" : "—"} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <span>2) Processar (RAW + Canônico)</span>
                <StatusPill tone={stage === "processado" || stage === "persistido" ? "ok" : "muted"} text={stage === "processado" || stage === "persistido" ? "OK" : "—"} />
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                <span>3) Persistir no banco</span>
                <StatusPill tone={stage === "persistido" ? "ok" : "muted"} text={stage === "persistido" ? "OK" : "—"} />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton
                disabled={!fileName}
                onClick={() => {
                  setStage("validado");
                  step("Validação OK: 9 abas obrigatórias encontradas.");
                }}
              >
                <CheckCircle2 className="h-4 w-4" /> Validar
              </PrimaryButton>

              <PrimaryButton
                disabled={!fileName || (stage !== "validado" && stage !== "processado")}
                onClick={() => {
                  setStage("processado");
                  step("Processamento OK: RAW=4.328 linhas; Canônico=contratos/processos/itens.");
                  step("Alertas: 5 processos com incorrido sem contrato.");
                }}
              >
                <Filter className="h-4 w-4" /> Processar
              </PrimaryButton>

              <PrimaryButton
                disabled={stage !== "processado"}
                onClick={() => {
                  setStage("persistido");
                  step("Persistência OK: batch salvo, histórico liberado.");
                }}
              >
                <DatabaseIcon /> Persistir
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Log" subtitle="Prévia do que o app registra durante importação">
        <div className="space-y-2">
          {log.map((l, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
              {l}
            </div>
          ))}
          {log.length === 0 ? <div className="text-sm text-zinc-500">Sem eventos.</div> : null}
        </div>
      </Card>
    </div>
  );
}
