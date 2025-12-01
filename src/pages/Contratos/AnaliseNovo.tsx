import { useMemo, useRef, useState } from 'react';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { useImportStore } from '../../store/useImportStore';
import { processosSemContrato } from '../../lib/uau/engine/semContrato';
import { calcularIncorrido } from '../../lib/uau/engine/incorrido';
import { exportPdf } from '../../lib/export/exportPdf';
import { exportPng } from '../../lib/export/exportPng';
import { exportXlsx } from '../../lib/export/exportXlsx';
import { simularDesvio } from '../../lib/uau/engine/desvios';

function AnaliseNovo() {
  const ref = useRef<HTMLDivElement>(null);
  const { canonical } = useImportStore();
  const [novoContratoValor, setNovoContratoValor] = useState(0);

  const incorridoAtual = useMemo(() => calcularIncorrido(canonical?.processos || []), [canonical]);
  const semContrato = useMemo(() => processosSemContrato(canonical?.processos || []), [canonical]);
  const resultado = simularDesvio(0, incorridoAtual, novoContratoValor);

  const exportar = async (type: 'png' | 'pdf' | 'xlsx') => {
    if (!ref.current) return;
    if (type === 'png') await exportPng(ref.current);
    if (type === 'pdf') await exportPdf(ref.current);
    if (type === 'xlsx') exportXlsx(semContrato as any[]);
  };

  return (
    <div className="space-y-4">
      <Card title="Contexto" description="Selecione serviço/categoria e compare contratos vigentes.">
        <div className="text-sm text-slate-600">Use a base CANÔNICA para filtrar serviços.</div>
      </Card>

      <Card title="Incorrido" description="Inclui pagamentos com e sem contrato">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-slate-500 text-sm">Incorrido atual</div>
            <div className="text-xl font-semibold">R$ {incorridoAtual.toLocaleString('pt-BR')}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-slate-500 text-sm">Processos sem contrato</div>
            <div className="text-xl font-semibold">{semContrato.length}</div>
          </div>
          <div className="p-3 bg-slate-50 rounded border">
            <div className="text-slate-500 text-sm">Desvio simulado</div>
            <div className="text-xl font-semibold">R$ {resultado.desvio_vs_orcado.toLocaleString('pt-BR')}</div>
          </div>
        </div>
      </Card>

      <Card title="Novo contrato" description="Adicione itens e simule o cenário">
        <div className="space-y-2 text-sm">
          <label className="block text-slate-600">Valor total do novo contrato</label>
          <input
            type="number"
            value={novoContratoValor}
            onChange={(e) => setNovoContratoValor(Number(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>
      </Card>

      <Card title="Confronto" description="Comparação contra orçado/INCC/CAT">
        <div ref={ref} className="space-y-3">
          <div className="text-sm text-slate-600">
            Incorrido atual + novo contrato = R$ {resultado.total.toLocaleString('pt-BR')} (desvio vs orçado: R$
            {resultado.desvio_vs_orcado.toLocaleString('pt-BR')})
          </div>
          <Table
            columns={[
              { key: 'processo', header: 'Processo' },
              { key: 'fornecedor', header: 'Fornecedor' },
              { key: 'valor', header: 'Valor' }
            ]}
            data={semContrato}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportar('png')}>
            Exportar PNG
          </button>
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportar('pdf')}>
            Exportar PDF
          </button>
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportar('xlsx')}>
            Exportar XLSX
          </button>
        </div>
      </Card>
    </div>
  );
}

export default AnaliseNovo;
