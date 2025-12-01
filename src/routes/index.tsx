// src/routes/index.tsx
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "../layout/AppShell";
import RouteError from "./RouteError";
import { paths } from "./paths";

const lazyPage = (loader: () => Promise<any>) => ({
  async lazy() {
    const mod = await loader();
    return { Component: mod.default };
  },
});

const router = createBrowserRouter([
  {
    path: paths.auth,
    errorElement: <RouteError />,
    ...lazyPage(() => import("../pages/Auth")),
  },
  {
    path: "/",
    Component: AppShell,
    errorElement: <RouteError />,
    children: [
      { index: true, ...lazyPage(() => import("../pages/Dashboard")) },

      // Suprimentos
      { path: paths.suprimentos.dados, ...lazyPage(() => import("../pages/DadosUpload")) },
      { path: paths.suprimentos.obras, ...lazyPage(() => import("../pages/Obras")) },
      { path: paths.suprimentos.novoPedido, ...lazyPage(() => import("../pages/Suprimentos/NovoPedido")) },
      { path: paths.suprimentos.consultaInsumos, ...lazyPage(() => import("../pages/Suprimentos/ConsultaInsumos")) },

      // Contratos
      { path: paths.contratos.analiseNovo, ...lazyPage(() => import("../pages/Contratos/AnaliseNovo")) },
      { path: paths.contratos.analiseAditivo, ...lazyPage(() => import("../pages/Contratos/AnaliseAditivo")) },
      { path: paths.contratos.distrato, ...lazyPage(() => import("../pages/Contratos/Distrato")) },
      { path: paths.contratos.consulta, ...lazyPage(() => import("../pages/Contratos/Consulta")) },
      { path: paths.contratos.equalizacao, ...lazyPage(() => import("../pages/Contratos/Equalizacao")) },

      // Histórico
      { path: paths.historico, ...lazyPage(() => import("../pages/Historico")) },
    ],
  },
]);

export default router;
