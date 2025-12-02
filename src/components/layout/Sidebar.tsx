import React, { useMemo, useState } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Layers, LogOut, Package, FileSignature } from "lucide-react";
import { MENU } from "../../config/menu";
import type { MenuItem, PageKey } from "../../types/navigation";
import { cx } from "../../utils/cx";
import { StatusPill } from "../ui/StatusPill";

export function Sidebar({ current, setCurrent }: { current: PageKey; setCurrent: (k: PageKey) => void }) {
  const [openContratos, setOpenContratos] = useState(true);
  const [openSup, setOpenSup] = useState(true);

  const root = useMemo(() => MENU.filter((m) => m.group === "ROOT"), []);
  const contratos = useMemo(() => MENU.filter((m) => m.group === "CONTRATOS"), []);
  const sup = useMemo(() => MENU.filter((m) => m.group === "SUP"), []);

  const Item = ({ m }: { m: MenuItem }) => (
    <button
      onClick={() => setCurrent(m.key)}
      className={cx(
        "flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm",
        current === m.key ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
      )}
    >
      <span className="inline-flex items-center gap-2">
        {m.icon}
        {m.label}
      </span>
      {current === m.key ? <ArrowRight className="h-4 w-4" /> : null}
    </button>
  );

  return (
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
          {root.map((m) => (
            <Item key={m.key} m={m} />
          ))}
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
            {contratos.map((m) => (
              <Item key={m.key} m={m} />
            ))}
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
            {sup.map((m) => (
              <Item key={m.key} m={m} />
            ))}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-zinc-500">Sessão</div>
          <StatusPill tone="muted" text="Demo" />
        </div>
        <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50">
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </div>
    </aside>
  );
}
