import KPI from '../ui/KPI';
import Card from '../ui/Card';
import Table from '../ui/Table';
import { useImportStore } from '../store/useImportStore';
import { processosSemContrato } from '../lib/uau/engine/semContrato';
import { calcularIncorrido } from '../lib/uau/engine/incorrido';

function Dashboard() {
  const { canonical } = useImportStore();
  const processos = canonical?.processos || [];
  const semContrato = processosSemContrato(processos).slice(0, 10);
  const incorrido = calcularIncorrido(processos);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <KPI label="Orçado" value="DE-PARA / CAT" helper="Use o upload para popular" />
        <KPI label="Orçado INCC" value="CAT col P" />
        <KPI label="CAT" value="col AD" />
        <KPI label="Incorrido" value={`R$ ${incorrido.toLocaleString('pt-BR')}`} />
        <KPI label="Desvio" value="Incorrido vs INCC/CAT" />
      </div>

      <Card title="Pagos sem contrato" description="Top 10 por valor">
        <Table
          columns={[
            { key: 'processo', header: 'Processo' },
            { key: 'fornecedor', header: 'Fornecedor' },
            { key: 'valor', header: 'Valor' }
          ]}
          data={semContrato}
        />
      </Card>
    </div>
  );
}

export default Dashboard;
