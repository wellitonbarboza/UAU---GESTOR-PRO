import { useState } from 'react';
import Card from '../../ui/Card';
import StatusPill from '../../ui/StatusPill';
import { exportPdf } from '../../lib/export/exportPdf';

function Distrato() {
  const [documentacaoEmpresa, setDocumentacaoEmpresa] = useState<'ok' | 'pendente'>('pendente');
  const [documentacaoFuncionarios, setDocumentacaoFuncionarios] = useState<'ok' | 'pendente'>('pendente');
  const [observacoes, setObservacoes] = useState('');

  const pendencias: string[] = [];
  if (documentacaoEmpresa === 'pendente') pendencias.push('Documentação da empresa');
  if (documentacaoFuncionarios === 'pendente') pendencias.push('Documentação de funcionários');

  return (
    <div className="space-y-4">
      <Card title="Checklist" description="Regras de distrato">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={documentacaoEmpresa === 'ok'} onChange={(e) => setDocumentacaoEmpresa(e.target.checked ? 'ok' : 'pendente')} />
            Documentação da empresa
            <StatusPill status={documentacaoEmpresa === 'ok' ? 'ok' : 'pendente'} />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={documentacaoFuncionarios === 'ok'}
              onChange={(e) => setDocumentacaoFuncionarios(e.target.checked ? 'ok' : 'pendente')}
            />
            Documentação de funcionários
            <StatusPill status={documentacaoFuncionarios === 'ok' ? 'ok' : 'pendente'} />
          </label>
        </div>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Observações"
          className="w-full border rounded mt-3 p-2 text-sm"
        />
        {pendencias.length > 0 && (
          <div className="mt-2 text-sm text-amber-700">
            Pendências: {pendencias.join(', ')}
          </div>
        )}
        <button className="mt-3 px-3 py-2 bg-primary text-white rounded" onClick={() => exportPdf(document.body)}>
          Exportar relatório
        </button>
      </Card>
    </div>
  );
}

export default Distrato;
