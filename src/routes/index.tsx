import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import Dashboard from '../pages/Dashboard';
import DadosUpload from '../pages/DadosUpload';
import Obras from '../pages/Obras';
import AnaliseNovo from '../pages/Contratos/AnaliseNovo';
import AnaliseAditivo from '../pages/Contratos/AnaliseAditivo';
import Distrato from '../pages/Contratos/Distrato';
import Consulta from '../pages/Contratos/Consulta';
import Equalizacao from '../pages/Contratos/Equalizacao';
import NovoPedido from '../pages/Suprimentos/NovoPedido';
import ConsultaInsumos from '../pages/Suprimentos/ConsultaInsumos';
import Historico from '../pages/Historico';
import Auth from '../pages/Auth';
import { paths } from './paths';

const router = createBrowserRouter([
  {
    path: paths.auth,
    element: <Auth />
  },
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: paths.suprimentos.dados, element: <DadosUpload /> },
      { path: paths.suprimentos.obras, element: <Obras /> },
      { path: paths.suprimentos.novoPedido, element: <NovoPedido /> },
      { path: paths.suprimentos.consultaInsumos, element: <ConsultaInsumos /> },
      { path: paths.contratos.analiseNovo, element: <AnaliseNovo /> },
      { path: paths.contratos.analiseAditivo, element: <AnaliseAditivo /> },
      { path: paths.contratos.distrato, element: <Distrato /> },
      { path: paths.contratos.consulta, element: <Consulta /> },
      { path: paths.contratos.equalizacao, element: <Equalizacao /> },
      { path: paths.historico, element: <Historico /> }
    ]
  }
]);

export default router;
