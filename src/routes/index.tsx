import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppShell from '../layout/AppShell';
import { paths } from './paths';
import RouteError from './RouteError';

function ScreenLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-slate-600">
      Carregando...
    </div>
  );
}

function withSuspense(element: React.ReactElement) {
  return <Suspense fallback={<ScreenLoader />}>{element}</Suspense>;
}

const Dashboard = lazy(() => import('../pages/Dashboard'));
const DadosUpload = lazy(() => import('../pages/DadosUpload'));
const Obras = lazy(() => import('../pages/Obras'));

const AnaliseNovo = lazy(() => import('../pages/Contratos/AnaliseNovo'));
const AnaliseAditivo = lazy(() => import('../pages/Contratos/AnaliseAditivo'));
const Distrato = lazy(() => import('../pages/Contratos/Distrato'));
const Consulta = lazy(() => import('../pages/Contratos/Consulta'));
const Equalizacao = lazy(() => import('../pages/Contratos/Equalizacao'));

const NovoPedido = lazy(() => import('../pages/Suprimentos/NovoPedido'));
const ConsultaInsumos = lazy(() => import('../pages/Suprimentos/ConsultaInsumos'));

const Historico = lazy(() => import('../pages/Historico'));
const Auth = lazy(() => import('../pages/Auth'));

const router = createBrowserRouter([
  {
    path: paths.auth,
    element: withSuspense(<Auth />),
    errorElement: <RouteError />
  },
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: withSuspense(<Dashboard />) },

      { path: paths.suprimentos.dados, element: withSuspense(<DadosUpload />) },
      { path: paths.suprimentos.obras, element: withSuspense(<Obras />) },
      { path: paths.suprimentos.novoPedido, element: withSuspense(<NovoPedido />) },
      { path: paths.suprimentos.consultaInsumos, element: withSuspense(<ConsultaInsumos />) },

      { path: paths.contratos.analiseNovo, element: withSuspense(<AnaliseNovo />) },
      { path: paths.contratos.analiseAditivo, element: withSuspense(<AnaliseAditivo />) },
      { path: paths.contratos.distrato, element: withSuspense(<Distrato />) },
      { path: paths.contratos.consulta, element: withSuspense(<Consulta />) },
      { path: paths.contratos.equalizacao, element: withSuspense(<Equalizacao />) },

      { path: paths.historico, element: withSuspense(<Historico />) }
    ]
  }
]);

export default router;
