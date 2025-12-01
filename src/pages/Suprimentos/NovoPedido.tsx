import { useState } from 'react';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { useImportStore } from '../../store/useImportStore';

function NovoPedido() {
  const { importResult } = useImportStore();
  const [codigoBusca, setCodigoBusca] = useState('');

  const itensComprados = importResult?.sheets['787-INSUMOS COMPRADOS'] || [];
  const filtrados = itensComprados.filter((row) => !codigoBusca || String((row.values as any).codigo_insumo).includes(codigoBusca));

  return (
    <div className="space-y-4">
      <Card title="Novo pedido" description="Simule compra e desvio por item">
        <div className="flex items-center gap-3">
          <input
            placeholder="Código do item"
            className="border rounded px-2 py-1"
            value={codigoBusca}
            onChange={(e) => setCodigoBusca(e.target.value)}
          />
        </div>
      </Card>
      <Card title="Itens encontrados">
        <Table
          columns={[
            { key: 'codigo_insumo', header: 'Código' },
            { key: 'descricao', header: 'Descrição' },
            { key: 'fornecedor', header: 'Fornecedor' },
            { key: 'categoria', header: 'Categoria' }
          ]}
          data={filtrados.map((r) => r.values as any)}
        />
      </Card>
    </div>
  );
}

export default NovoPedido;
