import { useState } from 'react';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { useImportStore } from '../../store/useImportStore';

function ConsultaInsumos() {
  const { importResult } = useImportStore();
  const [busca, setBusca] = useState('');

  const itens = importResult?.sheets['787-INSUMOS COMPRADOS'] || [];
  const filtrados = itens.filter((row) => {
    const values = row.values as any;
    return (
      !busca ||
      String(values.codigo_insumo).includes(busca) ||
      String(values.descricao).toLowerCase().includes(busca.toLowerCase()) ||
      String(values.categoria).toLowerCase().includes(busca.toLowerCase())
    );
  });

  return (
    <div className="space-y-4">
      <Card title="Consulta de insumos" description="Busque por código/nome/categoria">
        <input
          className="border rounded px-2 py-1"
          placeholder="Digite o código ou nome"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Card>
      <Card title="Resultados" description="Totais comprados/incorridos por período/fornecedor">
        <Table
          columns={[
            { key: 'codigo_insumo', header: 'Código' },
            { key: 'descricao', header: 'Descrição' },
            { key: 'fornecedor', header: 'Fornecedor' },
            { key: 'categoria', header: 'Categoria' }
          ]}
          data={filtrados.map((row) => row.values as any)}
        />
      </Card>
    </div>
  );
}

export default ConsultaInsumos;
