import Card from '../ui/Card';
import Table from '../ui/Table';

const historicoMock = [
  { id: 1, tipo: 'novo', created_at: new Date().toISOString(), resumo: 'Contrato simulado' },
  { id: 2, tipo: 'aditivo', created_at: new Date().toISOString(), resumo: 'Aditivo revisado' }
];

function Historico() {
  return (
    <Card title="Histórico de análises" description="Abra ou exporte novamente os relatórios">
      <Table
        columns={[
          { key: 'id', header: '#' },
          { key: 'tipo', header: 'Tipo' },
          { key: 'created_at', header: 'Data' },
          { key: 'resumo', header: 'Resumo' }
        ]}
        data={historicoMock}
      />
    </Card>
  );
}

export default Historico;
