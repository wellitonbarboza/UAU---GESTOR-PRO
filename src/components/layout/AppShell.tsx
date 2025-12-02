import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  Package,
  Building2,
  FileText,
  ClipboardList,
  BadgeCheck,
  FileSearch,
  Scale,
  History,
  LogOut,
  Layers,
  FileSignature,
  Calendar,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  FileDown
} from "lucide-react";

import { paths } from "../routes/paths";
import { useAppStore } from "../store/useAppStore";
import { MOCK_OBRAS } from "../mock/data";
import StatusPill from "../ui/Status";
import { PrimaryButton, Select } from "../ui/Controls";

export default function AppShell() {
  const nav = useNavigate();
  const { obraId, setObraId, periodo, setPeriodo, setUser } = useAppStore();
  const obra = useMemo(() => MOCK_OBRAS.find((o) => o.id === obraId) ?? MOCK_OBRAS[0], [obraId]);

  const [openContratos, setOpenContratos] = useState(true);
  const [openSup, setOpenSup] = useState(true);

  function exportar() {
    alert("Protótipo: exportar relatório/print (no app real: PDF/XLSX)");
  }

  function sair() {
    setUser(null);
    nav(paths.auth);
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-[1400px] gap-4 p-4">
        <aside className="hidden md:flex md:w-72 md:flex-col md:gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">UAU · Gestor Pro</div>
                <div className="text-xs text-zinc-500">Protótipo navegável</div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                <Layers className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <SideItem to={paths.dashboard} icon={<LayoutDashboard className="h-4 w-4" />} label="Início" />
              <SideItem to={paths.historico} icon={<History className="h-4 w-4" />} label="Histórico" />
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <button
              className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={() => setOpenContratos((v) => !v)}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <FileSignature className="h-4 w-4" /> Contratos
              </span>
              {openContratos ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
            </button>

            {openContratos ? (
              <div className="mt-2 grid gap-1">
                <SideItem to={paths.contratos.analiseNovo} icon={<FileText className="h-4 w-4" />} label="Análise — Novo" />
                <SideItem to={paths.contratos.analiseAditivo} icon={<ArrowRight className="h-4 w-4" />} label="Análise — Aditivo" />
                <SideItem to={paths.contratos.distrato} icon={<Scale className="h-4 w-4" />} label="Distrato" />
                <SideItem to={paths.contratos.consulta} icon={<FileSearch className="h-4 w-4" />} label="Consulta" />
                <SideItem to={paths.contratos.equalizacao} icon={<BadgeCheck className="h-4 w-4" />} label="Equalização" />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <button
              className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-sm text-zinc-800 hover:bg-zinc-50"
              onClick={() => setOpenSup((v) => !v)}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <Package className="h-4 w-4" /> Suprimentos
              </span>
              {openSup ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
            </button>

            {openSup ? (
              <div className="mt-2 grid gap-1">
                <SideItem to={paths.suprimentos.dados} icon={<FileUp className="h-4 w-4" />} label="Dados (Upload)" />
                <SideItem to={paths.suprimentos.obras} icon={<Building2 className="h-4 w-4" />} label="Obras" />
                <SideItem to={paths.suprimentos.novoPedido} icon={<ClipboardList className="h-4 w-4" />} label="Compras — Novo Pedido" />
                <SideItem to={paths.suprimentos.consultaInsumos} icon={<FileSearch className="h-4 w-4" />} label="Consulta — Insumos" />
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-zinc-500">Sessão</div>
              <StatusPill tone="muted" text="Demo" />
            </div>
            <button
              onClick={sair}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50"
            >
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </aside>

        <main className="flex-1 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xl font-semibold tracking-tight">{obra.nome}</div>
                <div className="mt-1 text-sm text-zinc-500">
                  Centro de custo: <span className="font-medium text-zinc-700">{obra.centroCusto}</span> · Sigla: {obra.sigla}
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="grid w-full grid-cols-1 gap-2 sm:w-auto sm:grid-cols-2">
                  <Select
                    value={obra.id}
                    onChange={setObraId}
                    options={MOCK_OBRAS.map((o) => ({ value: o.id, label: `${o.centroCusto} · ${o.sigla} · ${o.nome}` }))}
                  />
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Calendar className="h-4 w-4" />
                    </span>
                    <input
                      value={periodo}
                      onChange={(e) => setPeriodo(e.target.value)}
                      placeholder="Período (ex.: 01/2024–12/2024)"
                      className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                    />
                  </div>
                </div>

                <PrimaryButton onClick={exportar}>
                  <FileDown className="h-4 w-4" /> Exportar
                </PrimaryButton>
              </div>
            </div>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SideItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm ${
          isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
        }`
      }
    >
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <ArrowRight className="h-4 w-4 opacity-80" />
    </NavLink>
  );
}
