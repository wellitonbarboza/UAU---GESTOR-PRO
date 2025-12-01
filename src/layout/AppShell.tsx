import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppStore } from '../store/useAppStore';
import { paths } from '../routes/paths';

const reportPages = new Set([
  paths.contratos.analiseNovo,
  paths.contratos.analiseAditivo,
  paths.contratos.distrato,
  paths.contratos.equalizacao,
  paths.historico
]);

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedObra, period, setPeriod } = useAppStore();
  const showExport = reportPages.has(location.pathname);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar
          selectedObra={selectedObra}
          period={period}
          onPeriodChange={setPeriod}
          onExport={() => navigate(paths.historico)}
          showExport={showExport}
        />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
