import { useState } from 'react';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { requiredSheets } from '../lib/uau/sheetMap';
import { canonicalize } from '../lib/uau/canonicalize';
import { readWorkbook } from '../lib/uau/importer';
import { useImportStore } from '../store/useImportStore';

function DadosUpload() {
  const { importResult, setImportResult, canonical, setCanonical } = useImportStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const result = await readWorkbook(file);
      setImportResult(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const processar = () => {
    if (!importResult) return;
    const canonicalized = canonicalize(importResult);
    setCanonical(canonicalized);
  };

  return (
    <div className="space-y-4">
      <Card
        title="Upload do XLSX"
        description="Importe exatamente o arquivo exportado do UAU com as abas obrigatórias."
        actions={<input type="file" accept=".xlsx" onChange={(e) => handleFile(e.target.files?.[0])} />}
      >
        <div className="text-sm text-slate-600 space-y-2">
          <div>Abas obrigatórias: {requiredSheets.join(', ')}</div>
          {error && <div className="text-rose-600">{error}</div>}
          {loading && <div>Processando...</div>}
        </div>
      </Card>

      <Card title="Prévia" description="Linhas lidas por aba e faltantes">
        <Table
          columns={[
            { key: 'aba', header: 'Aba' },
            { key: 'lidas', header: 'Linhas lidas' },
            { key: 'status', header: 'Status' }
          ]}
          data={requiredSheets.map((sheet) => ({
            aba: sheet,
            lidas: importResult?.sheets[sheet]?.length || 0,
            status: importResult?.missingSheets.includes(sheet) ? 'Faltando' : 'OK'
          }))}
        />
      </Card>

      <Card
        title="Processar"
        description="Gera base RAW + canônica; a persistência no Supabase é feita via helpers."
        actions={
          <button
            onClick={processar}
            disabled={!importResult}
            className="px-3 py-2 rounded bg-primary text-white disabled:opacity-40"
          >
            Gerar Canônico
          </button>
        }
      >
        {canonical ? (
          <div className="text-sm text-slate-700 space-y-1">
            <div>Fornecedores: {Object.keys(canonical.fornecedores).length}</div>
            <div>Contratos: {Object.keys(canonical.contratos).length}</div>
            <div>Processos: {canonical.processos.length}</div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Nenhum canônico gerado.</div>
        )}
      </Card>
    </div>
  );
}

export default DadosUpload;
