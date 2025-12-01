import { useState } from 'react';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { useImportStore } from '../../store/useImportStore';
import { exportPdf } from '../../lib/export/exportPdf';
import { exportXlsx } from '../../lib/export/exportXlsx';

function AnaliseAditivo() {
  const [contratoSelecionado, setContratoSelecionado] = useState('');
  const [valorAditivo, setValorAditivo] = useState(0);
  const { canonical } = useImportStore();
  const contratos = Object.entries(canonical?.contratos || {}).map(([id, data]) => ({ id, ...data }));
  const contrato = contratos.find((c) => c.id === contratoSelecionado);
  const valorTotal = (contrato?.total || 0) + valorAditivo;
  const saldo = (contrato?.saldo || 0) + valorAditivo;

  return (
    <div className="space-y-4">
      <Card title="Selecionar contrato" description="Visualize panorama do contrato">
        <div className="flex gap-3 items-center">
          <select
            value={contratoSelecionado}
            onChange={(e) => setContratoSelecionado(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">Selecione</option>
            {contratos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.fornecedor}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={valorAditivo}
            onChange={(e) => setValorAditivo(Number(e.target.value))}
            placeholder="Valor aditivo"
            className="border rounded px-2 py-1"
          />
        </div>
        {contrato && (
          <div className="mt-3 text-sm text-slate-700">
            <div>Total atual: R$ {Number(contrato.total || 0).toLocaleString('pt-BR')}</div>
            <div>Saldo: R$ {Number(contrato.saldo || 0).toLocaleString('pt-BR')}</div>
            <div>Novo total: R$ {valorTotal.toLocaleString('pt-BR')}</div>
            <div>Novo saldo: R$ {saldo.toLocaleString('pt-BR')}</div>
          </div>
        )}
      </Card>

      <Card title="Itens do contrato" description="% medido e saldo">
        <Table
          columns={[
            { key: 'id', header: 'Contrato' },
            { key: 'fornecedor', header: 'Fornecedor' },
            { key: 'total', header: 'Total' },
            { key: 'saldo', header: 'Saldo' }
          ]}
          data={contratos}
        />
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => contrato && exportPdf(document.body)}>
            Exportar PDF
          </button>
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportXlsx(contratos)}>
            Exportar XLSX
          </button>
        </div>
      </Card>
    </div>
  );
}

export default AnaliseAditivo;
