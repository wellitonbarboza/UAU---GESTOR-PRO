import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, FileUp, Loader2 } from "lucide-react";
import Card from "../components/ui/Card";
import StatusPill from "../components/ui/Status";
import { PrimaryButton } from "../components/ui/Controls";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import { useAppStore } from "../store/useAppStore";

type UploadStage = "idle" | "reading" | "saving" | "done" | "error";

type ParsedRow = { sheet: string; rowIndex: number; data: Record<string, unknown> };

type ImportHistory = {
  id: string;
  obraId: string | null;
  filename: string | null;
  status: string;
  createdAt: string;
  rows?: number;
};

export default function DadosUpload() {
  const { obraId, companyId, obras } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ sheets: number; rows: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [history, setHistory] = useState<ImportHistory[]>([]);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const supabaseClient = useMemo(() => (isSupabaseEnabled ? supabase : null), []);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      if (!supabaseClient || !companyId) return;

      setLoadingHistory(true);
      setHistoryError(null);

      const query = supabaseClient
        .from("uau_import_batches")
        .select("id, obra_id, original_filename, status, created_at, stats")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (obraId) {
        query.eq("obra_id", obraId);
      }

      const { data, error: fetchError } = await query;

      if (!active) return;

      if (fetchError) {
        setHistoryError(fetchError.message);
        setHistory([]);
      } else {
        const mapped: ImportHistory[] = (data ?? []).map((item) => ({
          id: item.id,
          obraId: item.obra_id,
          filename: item.original_filename,
          status: item.status,
          createdAt: item.created_at,
          rows: typeof item.stats?.rows === "number" ? item.stats.rows : undefined,
        }));
        setHistory(mapped);
      }

      setLoadingHistory(false);
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [companyId, obraId, supabaseClient]);

  function addLog(message: string) {
    setLog((prev) => [message, ...prev]);
  }

  async function parseWorkbook(buffer: ArrayBuffer) {
    const XLSX = (await import(
      /* @vite-ignore */ "https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs"
    )) as any;
    const workbook = XLSX.read(buffer, { type: "array" });

    const rows: ParsedRow[] = [];
    (workbook.SheetNames as string[]).forEach((sheetName: string) => {
      const sheet = workbook.Sheets[sheetName];
      const sheetRows = XLSX.utils.sheet_to_json(sheet, { defval: null }) as Record<string, unknown>[];
      sheetRows.forEach((row: Record<string, unknown>, idx: number) =>
        rows.push({ sheet: sheetName, rowIndex: idx + 1, data: row })
      );
    });

    return { workbook, rows };
  }

  async function persistRows(batchId: string, rows: ParsedRow[]) {
    if (!supabaseClient) return;
    const payload = rows.map((row) => ({
      batch_id: batchId,
      sheet_name: row.sheet,
      row_index: row.rowIndex,
      data: row.data,
    }));

    const chunkSize = 400;
    for (let i = 0; i < payload.length; i += chunkSize) {
      const chunk = payload.slice(i, i + chunkSize);
      const { error: chunkError } = await supabaseClient.from("uau_raw_rows").insert(chunk);
      if (chunkError) throw chunkError;
    }
  }

  async function process() {
    setError(null);

    if (!file) {
      setError("Selecione um arquivo XLSX exportado do UAU.");
      return;
    }

    if (!supabaseClient) {
      setError("Supabase não configurado. Defina as variáveis de ambiente e refaça o login.");
      return;
    }

    if (!companyId) {
      setError("Usuário sem empresa vinculada. Entre novamente após vincular um perfil.");
      return;
    }

    setProcessing(true);
    setStage("reading");
    addLog(`Lendo ${file.name}...`);

    try {
      const buffer = await file.arrayBuffer();
      const { workbook, rows } = await parseWorkbook(buffer);

      setStats({ sheets: workbook.SheetNames.length, rows: rows.length });
      addLog(`Encontradas ${workbook.SheetNames.length} abas e ${rows.length} linhas.`);

      setStage("saving");

      const { data: batch, error: batchError } = await supabaseClient
        .from("uau_import_batches")
        .insert({
          company_id: companyId,
          obra_id: obraId || null,
          original_filename: file.name,
          status: "processed",
          stats: { sheets: workbook.SheetNames.length, rows: rows.length },
        })
        .select("id")
        .maybeSingle();

      if (batchError || !batch) {
        throw batchError ?? new Error("Não foi possível criar o lote de importação.");
      }

      const storagePath = `${companyId}/${batch.id}/${file.name}`;
      const { error: storageError } = await supabaseClient.storage
        .from("uau-imports")
        .upload(storagePath, file, { upsert: true });

      if (storageError) {
        throw storageError;
      }

      await persistRows(batch.id, rows);

      const now = new Date().toISOString();
      const { error: updateError } = await supabaseClient
        .from("uau_import_batches")
        .update({
          status: "persisted",
          processed_at: now,
          persisted_at: now,
          storage_path: storagePath,
          logs: [
            `Arquivo ${file.name} lido com ${rows.length} linhas`,
            `Abas processadas: ${workbook.SheetNames.join(", ")}`,
          ],
        })
        .eq("id", batch.id);

      if (updateError) {
        throw updateError;
      }

      setStage("done");
      addLog(`Lote ${batch.id} salvo no banco e no bucket uau-imports.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro inesperado ao processar a planilha.";
      setError(msg);
      setStage("error");
      addLog(msg);
    }

    setProcessing(false);
  }

  return (
    <div className="space-y-4">
      <Card title="Upload do XLSX (UAU)" subtitle="Ler o arquivo e salvar os dados base para análises por obra">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Arquivo</div>
                <div className="text-xs text-zinc-500">UAU exportado</div>
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
                  setFile(f);
                  setStage("idle");
                  setStats(null);
                  setLog([`Selecionado: ${f.name}`]);
                }}
              />
            </div>

            <div className="mt-3 text-xs text-zinc-600">
              {file ? (
                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-3">
                  <div>
                    <div className="font-medium">{file.name}</div>
                    {stats ? (
                      <div className="text-xs text-zinc-500">{stats.sheets} abas · {stats.rows} linhas</div>
                    ) : null}
                  </div>
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
              {["Seleção", "Leitura", "Persistência"].map((label, idx) => {
                const active =
                  (idx === 0 && stage !== "idle") ||
                  (idx === 1 && (stage === "reading" || stage === "saving" || stage === "done")) ||
                  (idx === 2 && (stage === "saving" || stage === "done"));

                const isOk = stage === "done" || (idx === 1 && (stage === "reading" || stage === "saving"));

                return (
                  <div key={label} className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                    <span>{idx + 1}) {label}</span>
                    <StatusPill tone={isOk ? "ok" : active ? "muted" : "muted"} text={active ? "Em andamento" : "—"} />
                  </div>
                );
              })}
            </div>

            {error ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <PrimaryButton disabled={!file || processing} onClick={process}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} Processar e salvar
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Histórico de uploads" subtitle="Últimos arquivos importados por obra">
        {historyError ? (
          <div className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            <AlertCircle className="h-4 w-4" /> {historyError}
          </div>
        ) : null}

        <div className="mt-3 space-y-2">
          {loadingHistory ? (
            <div className="text-sm text-zinc-500">Carregando histórico...</div>
          ) : history.length === 0 ? (
            <div className="text-sm text-zinc-500">Nenhum upload registrado para esta obra ainda.</div>
          ) : (
            history.map((item) => {
              const obraNome = obras.find((o) => o.id === item.obraId)?.nome ?? "Obra não definida";
              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white p-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{item.filename ?? "Arquivo sem nome"}</div>
                    <div className="text-xs text-zinc-500">
                      {obraNome} · {new Date(item.createdAt).toLocaleString("pt-BR")} ·
                      {" "}
                      {item.rows ? `${item.rows} linhas` : "linhas não registradas"}
                    </div>
                  </div>
                  <StatusPill tone="muted" text={item.status} />
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card title="Log" subtitle="Eventos registrados durante importação">
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
