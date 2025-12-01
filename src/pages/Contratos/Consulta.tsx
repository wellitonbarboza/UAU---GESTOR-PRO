import { useState } from 'react';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { useImportStore } from '../../store/useImportStore';
import { percentualMedido, saldoContrato } from '../../lib/uau/engine/contratos';

function Consulta() {
  const { canonical } = useImportStore();
  const [filtroFornecedor, setFiltroFornecedor] = useState('');
  const contratos = Object.entries(canonical?.contratos || {}).map(([id, data]) => ({ id, ...data }));
  const filtrados = contratos.filter((c) => !filtroFornecedor || c.fornecedor === filtroFornecedor);

  const tabela = filtrados.map((c) => ({
    ...c,
    percentual: percentualMedido({ contrato: c.id, valor_total: c.total || 0, valor_medido: (c.total || 0) - (c.saldo || 0) }),
    saldo: saldoContrato({ contrato: c.id, valor_total: c.total || 0, valor_medido: (c.total || 0) - (c.saldo || 0) })
  }));

  return (
    <div className="space-y-4">
      <Card title="Filtro">
        <div className="flex items-center gap-3">
          <input
            placeholder="Fornecedor"
            className="border rounded px-2 py-1"
            value={filtroFornecedor}
            onChange={(e) => setFiltroFornecedor(e.target.value)}
          />
        </div>
      </Card>
      <Card title="Contratos" description="Itens, saldo e % medido">
        <Table
          columns={[
            { key: 'id', header: 'Contrato' },
            { key: 'fornecedor', header: 'Fornecedor' },
            { key: 'percentual', header: '% medido', render: (row) => `${Math.round((row as any).percentual * 100)}%` },
            { key: 'saldo', header: 'Saldo' }
          ]}
          data={tabela}
        />
      </Card>
    </div>
  );
}

export default Consulta;
