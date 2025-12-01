import Card from '../ui/Card';
import Table from '../ui/Table';
import { useImportStore } from '../store/useImportStore';
import { useAppStore } from '../store/useAppStore';

function Obras() {
  const { importResult } = useImportStore();
  const { selectedObra, setObra } = useAppStore();

  const obras = Array.from(new Set(importResult?.sheets['787-INSUMOS COMPRADOS']?.map((row) => (row.values as any).obra))).filter(
    Boolean
  );

  return (
    <Card title="Obras importadas" description="Selecione qual obra deseja analisar.">
      <Table
        columns={[
          { key: 'obra', header: 'Obra' },
          {
            key: 'acao',
            header: 'Ação',
            render: (row) => (
              <button
                onClick={() => setObra((row as any).obra)}
                className={`px-2 py-1 rounded ${selectedObra === (row as any).obra ? 'bg-primary text-white' : 'bg-slate-100'}`}
              >
                Abrir
              </button>
            )
          }
        ]}
        data={obras.map((obra) => ({ obra }))}
        emptyMessage="Importe primeiro um arquivo com a aba 787"
      />
    </Card>
  );
}

export default Obras;
