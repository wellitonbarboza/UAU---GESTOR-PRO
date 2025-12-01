import { useEffect, useMemo, useState } from 'react';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { requiredSheets } from '../lib/uau/sheetMap';
import { canonicalize } from '../lib/uau/canonicalize';
import { readWorkbook } from '../lib/uau/importer';
import { useImportStore } from '../store/useImportStore';
import { persistBatch } from '../lib/uau/persist';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { CompanyMetadata, extractCompanyMetadata } from '../lib/uau/company';

function DadosUpload() {
  const {
    importResult,
    setImportResult,
    canonical,
    setCanonical,
    loadFromSupabase,
    loadingSupabase,
    supabaseError,
    supabaseBatchId
  } = useImportStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyMetadata, setCompanyMetadata] = useState<CompanyMetadata | null>(null);
  const [persisting, setPersisting] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [persistMessage, setPersistMessage] = useState<string | null>(null);

  const totaisDesembolso = useMemo(() => {
    const desembolsos = canonical?.desembolsos || [];
    return desembolsos.reduce(
      (acc, item) => ({
        pagos: acc.pagos + (item.pagos || 0),
        aPagar: acc.aPagar + (item.a_pagar || 0)
      }),
      { pagos: 0, aPagar: 0 }
    );
  }, [canonical]);

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

  useEffect(() => {
    if (!importResult) {
      setCompanyMetadata(null);
      return;
    }

    const metadata = extractCompanyMetadata(importResult);
    setCompanyMetadata(metadata);
  }, [importResult]);

  const inferredCompanyId = useMemo(
    () => companyMetadata?.codigo_empresa || '',
    [companyMetadata]
  );

  const processar = () => {
    if (!importResult) return;
    const canonicalized = canonicalize(importResult);
    setCanonical(canonicalized);
  };

  const persistirSupabase = async () => {
    if (!importResult) return;
    if (!inferredCompanyId) {
      setPersistError('Não foi possível identificar o company_id na planilha.');
      return;
    }

    const canonicalized = canonical || canonicalize(importResult);
    setCanonical(canonicalized);
    setPersisting(true);
    setPersistError(null);
    setPersistMessage(null);

    try {
      const batch = await persistBatch(inferredCompanyId, importResult, canonicalized);
      setPersistMessage(`Importado com sucesso (batch ${batch.id}).`);
    } catch (err) {
      setPersistError((err as Error).message);
    } finally {
      setPersisting(false);
    }
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
        description="Processa localmente para gravar no Supabase (fonte principal das demais telas)."
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
            <div>Desembolsos (aba 260): {canonical.desembolsos.length}</div>
            <div>Total pagos: R$ {totaisDesembolso.pagos.toLocaleString('pt-BR')}</div>
            <div>Total a pagar: R$ {totaisDesembolso.aPagar.toLocaleString('pt-BR')}</div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Nenhum canônico gerado.</div>
        )}
      </Card>

      <Card
        title="Salvar no Supabase"
        description={
          isSupabaseEnabled
            ? 'Importa todas as abas para as tabelas do Supabase e vincula ao company_id detectado.'
            : 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar a persistência.'
        }
        actions={
          <div className="flex gap-2 items-center">
            <button
              onClick={persistirSupabase}
              disabled={!importResult || !isSupabaseEnabled || persisting || !inferredCompanyId}
              className="px-3 py-2 rounded bg-emerald-600 text-white disabled:opacity-40"
            >
              {persisting ? 'Salvando...' : 'Salvar no Supabase'}
            </button>
          </div>
        }
      >
        <div className="text-sm text-slate-700 space-y-2">
          <div className="text-slate-600">O arquivo completo (todas as abas) será inserido no Supabase.</div>
          {companyMetadata && (
            <div className="text-slate-700">
              Empresa detectada: {companyMetadata.codigo_empresa || 'N/A'} -{' '}
              {companyMetadata.descricao_empresa || 'Sem descrição'}
              {companyMetadata.codigo_obra ? ` | Obra: ${companyMetadata.codigo_obra}` : ''}
              {companyMetadata.centro_custos ? ` | Centro de custos: ${companyMetadata.centro_custos}` : ''}
            </div>
          )}
          {!companyMetadata && importResult && (
            <div className="text-amber-600">Não foi possível identificar os dados da empresa.</div>
          )}
          {persistMessage && <div className="text-emerald-700">{persistMessage}</div>}
          {persistError && <div className="text-rose-600">{persistError}</div>}
          {!isSupabaseEnabled && (
            <div className="text-slate-600">Defina as variáveis de ambiente para ativar a persistência.</div>
          )}
        </div>
      </Card>

      <Card
        title="Carregar base do Supabase"
        description={
          isSupabaseEnabled
            ? 'Busca o canônico diretamente das tabelas do Supabase para uso nas demais telas.'
            : 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar a leitura.'
        }
        actions={
          <button
            onClick={() => loadFromSupabase(companyId.trim())}
            disabled={!companyId.trim() || !isSupabaseEnabled || loadingSupabase}
            className="px-3 py-2 rounded bg-primary text-white disabled:opacity-40"
          >
            {loadingSupabase ? 'Buscando...' : 'Usar Supabase como fonte'}
          </button>
        }
      >
        <div className="text-sm text-slate-700 space-y-2">
          <p className="text-slate-600">
            As demais telas passam a ler apenas os dados armazenados no Supabase. Informe o mesmo company_id
            utilizado no upload para sincronizar.
          </p>
          {supabaseBatchId && (
            <div className="text-emerald-700">Canônico carregado do Supabase (batch {supabaseBatchId}).</div>
          )}
          {supabaseError && <div className="text-rose-600">{supabaseError}</div>}
        </div>
      </Card>
    </div>
  );
}

export default DadosUpload;
