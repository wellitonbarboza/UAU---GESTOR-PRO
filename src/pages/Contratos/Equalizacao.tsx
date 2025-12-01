import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { exportPdf } from '../../lib/export/exportPdf';
import { exportXlsx } from '../../lib/export/exportXlsx';

const mockItens = [
  { item: 'Serviço 1', fornecedorA: 'R$ 10.000', fornecedorB: 'R$ 12.000' },
  { item: 'Serviço 2', fornecedorA: 'R$ 8.000', fornecedorB: 'R$ 7.500' }
];

function Equalizacao() {
  return (
    <div className="space-y-4">
      <Card title="Equalização" description="Tabela de comparação entre fornecedores">
        <Table
          columns={[
            { key: 'item', header: 'Item' },
            { key: 'fornecedorA', header: 'Fornecedor A' },
            { key: 'fornecedorB', header: 'Fornecedor B' }
          ]}
          data={mockItens}
        />
        <div className="flex gap-2 mt-3">
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportXlsx(mockItens)}>
            Exportar XLSX
          </button>
          <button className="px-3 py-2 bg-primary text-white rounded" onClick={() => exportPdf(document.body)}>
            Exportar PDF
          </button>
        </div>
      </Card>
    </div>
  );
}

export default Equalizacao;
