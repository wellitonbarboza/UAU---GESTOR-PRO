import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  ClipboardCheck,
  FileDown,
  FileSpreadsheet,
  History,
  Home,
  Layers,
  Plus,
  Search,
  Settings,
  Upload,
  Wrench,
  Building2,
  ShoppingCart,
  FileText,
  BadgeCheck,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Filter,
  Copy,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
} from "recharts";

/**
 * Layouts (mock) para analisar UX/UI de todas as páginas do app.
 * - Sidebar + Topbar com seletor de Obra (Centro de Custo + abreviação)
 * - Páginas: Início (Dashboard), Contratos (Novo/Aditivo/Consulta/Equalização),
 *           Suprimentos (Novo pedido/Consulta/Dados Upload/Cadastro Obras), Histórico.
 *
 * Observação:
 * - Os dados abaixo são apenas placeholders para visualizar o layout.
 */

type Obra = {
  id: string;
  centroCusto: string; // ex: 310
  abreviacao: string; // ex: OBRWC
  nome: string;
  empresa: string; // ex: código+nome
};

type NavKey =
  | "inicio"
  | "contratos.novo"
  | "contratos.aditivo"
  | "contratos.consulta"
  | "contratos.equalizacao"
  | "suprimentos.novo"
  | "suprimentos.consulta"
  | "suprimentos.dados"
  | "suprimentos.obras"
  | "historico";

type HistoricoItem = {
  id: string;
  createdAt: string;
  obraId: string;
  tipo: "Equalização" | "Novo contrato" | "Aditivo" | "Novo pedido";
  titulo: string;
  referencia: string;
  status: "Rascunho" | "Finalizado" | "Aprovado" | "Cancelado";
  resultado: "OK" | "Atenção" | "Negativo";
  desvioResumo: string;
  arquivos: { label: string; type: "XLSX" | "PDF"; url?: string }[];
};

const ObrasMock: Obra[] = [
  {
    id: "obra-310-obr",
    centroCusto: "310",
    abreviacao: "OBR",
    nome: "Obra Residencial (Exemplo)",
    empresa: "001 - Gerenciadora X",
  },
  {
    id: "obra-310-obrwc",
    centroCusto: "310",
    abreviacao: "OBRWC",
    nome: "Obra WC (Exemplo)",
    empresa: "001 - Gerenciadora X",
  },
];

const kpisDashboard = {
  orcado: 12500000,
  orcadoINCC: 13650000,
  cat: 14200000,
  contratado: 10180000,
  pago: 7450000,
  apagar: 1820000,
  emitir: 260000,
};

const chartSeries = [
  { mes: "Jan", orcadoINCC: 1.0, incorrido: 0.52, contratado: 0.68 },
  { mes: "Fev", orcadoINCC: 1.0, incorrido: 0.58, contratado: 0.71 },
  { mes: "Mar", orcadoINCC: 1.0, incorrido: 0.62, contratado: 0.73 },
  { mes: "Abr", orcadoINCC: 1.0, incorrido: 0.66, contratado: 0.76 },
  { mes: "Mai", orcadoINCC: 1.0, incorrido: 0.70, contratado: 0.79 },
  { mes: "Jun", orcadoINCC: 1.0, incorrido: 0.74, contratado: 0.82 },
];

const topDesvios = [
  {
    nivel2: "ACABAMENTO",
    nivel3: "REVESTIMENTOS",
    nivel4: "PISO ÁREA COMUM",
    desvio: -185000,
  },
  { nivel2: "ESTRUTURA", nivel3: "LAJES", nivel4: "LAJE 3º PAV.", desvio: -92000 },
  { nivel2: "INSTALAÇÕES", nivel3: "HIDRÁULICA", nivel4: "PRUMADAS", desvio: 46000 },
];

const historicoMock: HistoricoItem[] = [
  {
    id: "h1",
    createdAt: "2025-11-22 10:14",
    obraId: "obra-310-obrwc",
    tipo: "Equalização",
    titulo: "Equalização | Revestimento (Romilton)",
    referencia: "Serviço PL: REV-012 | Nível 2: ACABAMENTO",
    status: "Finalizado",
    resultado: "Atenção",
    desvioResumo: "Desvio vs INCC: -R$ 38.400",
    arquivos: [
      { label: "Equalização_v1", type: "XLSX" },
      { label: "Equalização_v1", type: "PDF" },
    ],
  },
  {
    id: "h2",
    createdAt: "2025-11-28 16:03",
    obraId: "obra-310-obr",
    tipo: "Aditivo",
    titulo: "Aditivo | Contrato 000123",
    referencia: "Fornecedor: Empreiteira Y | Serviço PL: EST-004",
    status: "Aprovado",
    resultado: "OK",
    desvioResumo: "Dentro do CAT (+R$ 12.000)",
    arquivos: [{ label: "Aditivo_v3", type: "PDF" }],
  },
  {
    id: "h3",
    createdAt: "2025-12-01 09:01",
    obraId: "obra-310-obrwc",
    tipo: "Novo pedido",
    titulo: "Novo Pedido | Cimento CP-II",
    referencia: "Categoria: CIMENTO | Insumo: 12345",
    status: "Rascunho",
    resultado: "Negativo",
    desvioResumo: "Desvio QTDE: +18% | Desvio R$: -R$ 24.600",
    arquivos: [],
  },
];

function moneyBRL(n: number) {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function clampPct(p: number) {
  return Math.max(0, Math.min(100, p));
}

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.18 } },
};

const pageTitles: Record<NavKey, { title: string; subtitle?: string; icon: React.ReactNode }> = {
  inicio: { title: "Início", subtitle: "Dashboard da obra", icon: <Home className="h-4 w-4" /> },
  "contratos.novo": {
    title: "Análise de Contrato — Novo",
    subtitle: "Simulação + Equalização + Desvio vs Orçado/INCC/CAT",
    icon: <FileText className="h-4 w-4" />,
  },
  "contratos.aditivo": {
    title: "Análise de Contrato — Aditivo",
    subtitle: "Prévia do contrato + simulação do aditivo",
    icon: <Wrench className="h-4 w-4" />,
  },
  "contratos.consulta": {
    title: "Consulta de Contrato",
    subtitle: "Itens, % medido, a medir, evidências",
    icon: <Search className="h-4 w-4" />,
  },
  "contratos.equalizacao": {
    title: "Equalização",
    subtitle: "Modelo no padrão (capa + mapa de cotação)",
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  "suprimentos.novo": {
    title: "Análise de Compras — Novo Pedido",
    subtitle: "Orçado (MAT) × Incorrido × Simulação",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  "suprimentos.consulta": {
    title: "Consulta de Insumos",
    subtitle: "Histórico comprado/incorrido por insumo/categoria",
    icon: <Layers className="h-4 w-4" />,
  },
  "suprimentos.dados": {
    title: "Dados (UAU)",
    subtitle: "Upload e validação do Excel com abas padrão",
    icon: <Upload className="h-4 w-4" />,
  },
  "suprimentos.obras": {
    title: "Cadastro de Obras",
    subtitle: "Centro de custo, abreviação, descrição, logos",
    icon: <Building2 className="h-4 w-4" />,
  },
  historico: {
    title: "Histórico",
    subtitle: "Análises e exports salvos para consulta e reaproveitamento",
    icon: <History className="h-4 w-4" />,
  },
};

function Kpi({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  icon?: React.ReactNode;
}) {
  const toneBorder =
    tone === "good"
      ? "border-emerald-200/60"
      : tone === "warn"
        ? "border-amber-200/60"
        : tone === "bad"
          ? "border-rose-200/60"
          : "border-zinc-200/60";
  const toneBg =
    tone === "good"
      ? "bg-emerald-50/60"
      : tone === "warn"
        ? "bg-amber-50/70"
        : tone === "bad"
          ? "bg-rose-50/60"
          : "bg-white";
  return (
    <Card className={cx("rounded-2xl border shadow-sm", toneBorder, toneBg)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold tracking-tight">{value}</div>
            {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
          </div>
          {icon ? <div className="mt-0.5 text-muted-foreground">{icon}</div> : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Pill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "ok" | "warn" | "bad" | "muted";
}) {
  const cls =
    variant === "ok"
      ? "bg-emerald-100 text-emerald-900"
      : variant === "warn"
        ? "bg-amber-100 text-amber-900"
        : variant === "bad"
          ? "bg-rose-100 text-rose-900"
          : variant === "muted"
            ? "bg-zinc-100 text-zinc-800"
            : "bg-zinc-900 text-white";
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-xs", cls)}>{children}</span>;
}

function PageShell({
  title,
  subtitle,
  children,
  right,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" exit="exit" className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <div className="text-2xl font-semibold tracking-tight">{title}</div>
          {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </div>
      {children}
    </motion.div>
  );
}

function HeaderBar({
  obra,
  setObra,
  active,
}: {
  obra: Obra;
  setObra: (id: string) => void;
  active: NavKey;
}) {
  const meta = pageTitles[active];
  return (
    <div className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-white shadow-sm">
            {meta.icon}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium">{meta.title}</div>
            <div className="text-xs text-muted-foreground">{obra.centroCusto} — {obra.abreviacao} · {obra.nome}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border bg-white px-2 py-1 shadow-sm">
            <span className="text-xs text-muted-foreground">Obra</span>
            <Select value={obra.id} onValueChange={setObra}>
              <SelectTrigger className="h-8 w-[260px] border-0 shadow-none focus:ring-0">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ObrasMock.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.centroCusto} — {o.abreviacao} · {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-2xl">
                <Filter className="mr-2 h-4 w-4" /> Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Atalhos</DropdownMenuLabel>
              <DropdownMenuItem>
                <FileDown className="mr-2 h-4 w-4" /> Exportar (PDF)
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar (XLSX)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" /> Salvar no Histórico
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" /> Duplicar análise
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, setActive }: { active: NavKey; setActive: (k: NavKey) => void }) {
  const [openContratos, setOpenContratos] = useState(true);
  const [openSuprimentos, setOpenSuprimentos] = useState(true);

  const Item = ({ k, icon, label, badge }: { k: NavKey; icon: React.ReactNode; label: string; badge?: string }) => (
    <button
      onClick={() => setActive(k)}
      className={cx(
        "group flex w-full items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-sm transition",
        active === k ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
      )}
    >
      <span className="inline-flex items-center gap-2">
        <span className={cx("text-muted-foreground", active === k && "text-white/90")}>{icon}</span>
        <span className="font-medium">{label}</span>
      </span>
      {badge ? <Badge className={cx("rounded-full", active === k ? "bg-white text-zinc-900" : "bg-zinc-200 text-zinc-900")}>{badge}</Badge> : null}
    </button>
  );

  return (
    <aside className="sticky top-0 hidden h-screen w-[300px] flex-col border-r bg-white px-3 py-4 lg:flex">
      <div className="px-2">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">UAU · Análises</div>
            <div className="text-xs text-muted-foreground">Contratos · Suprimentos · Histórico</div>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      <nav className="flex-1 space-y-6 overflow-auto px-1 pb-4">
        <div className="space-y-1">
          <div className="px-2 text-xs font-semibold text-muted-foreground">Geral</div>
          <Item k="inicio" icon={<Home className="h-4 w-4" />} label="Início" />
          <Item k="historico" icon={<History className="h-4 w-4" />} label="Histórico" badge="3" />
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setOpenContratos((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-zinc-50"
          >
            <span className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" /> Contratos
            </span>
            {openContratos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <AnimatePresence initial={false}>
            {openContratos ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1 overflow-hidden">
                <Item k="contratos.novo" icon={<Plus className="h-4 w-4" />} label="Análise — Novo" />
                <Item k="contratos.aditivo" icon={<Wrench className="h-4 w-4" />} label="Análise — Aditivo" />
                <Item k="contratos.consulta" icon={<Search className="h-4 w-4" />} label="Consulta" />
                <Item k="contratos.equalizacao" icon={<ClipboardCheck className="h-4 w-4" />} label="Equalização" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => setOpenSuprimentos((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl px-2 py-2 text-xs font-semibold text-muted-foreground hover:bg-zinc-50"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Suprimentos
            </span>
            {openSuprimentos ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <AnimatePresence initial={false}>
            {openSuprimentos ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-1 overflow-hidden">
                <Item k="suprimentos.novo" icon={<Plus className="h-4 w-4" />} label="Compras — Novo pedido" />
                <Item k="suprimentos.consulta" icon={<Layers className="h-4 w-4" />} label="Consulta de insumos" />
                <Item k="suprimentos.dados" icon={<Upload className="h-4 w-4" />} label="Dados (Upload)" />
                <Item k="suprimentos.obras" icon={<Building2 className="h-4 w-4" />} label="Cadastro — Obras" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </nav>

      <div className="px-1">
        <Separator className="my-3" />
        <button className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-muted-foreground hover:bg-zinc-100">
          <Settings className="h-4 w-4" /> Configurações
        </button>
      </div>
    </aside>
  );
}

function TableShell({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle ? <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div> : null}
        </div>
        {right ? <div className="flex items-center gap-2">{right}</div> : null}
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function SoftTable({
  columns,
  rows,
}: {
  columns: { key: string; label: string; className?: string }[];
  rows: Array<Record<string, React.ReactNode>>;
}) {
  return (
    <div className="overflow-auto rounded-2xl border">
      <table className="min-w-full text-sm">
        <thead className="bg-zinc-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cx("whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-zinc-700", c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className={cx("border-t", idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40")}>
              {columns.map((c) => (
                <td key={c.key} className={cx("px-4 py-3 align-top", c.className)}>
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardPage() {
  const incorrido = kpisDashboard.pago + kpisDashboard.apagar + kpisDashboard.emitir;
  const desvioVsINCC = kpisDashboard.orcadoINCC - (incorrido + 2800000); // mock: considerar compromissos adicionais
  const desvioVsCAT = kpisDashboard.cat - (incorrido + 2800000);

  const pctIncorrido = (incorrido / kpisDashboard.orcadoINCC) * 100;
  const pctContratado = (kpisDashboard.contratado / kpisDashboard.orcadoINCC) * 100;

  const toneINCC = desvioVsINCC >= 0 ? "good" : "bad";
  const toneCAT = desvioVsCAT >= 0 ? "good" : "warn";

  return (
    <PageShell
      title="Dashboard da Obra"
      subtitle="Resumo: Orçado/INCC/CAT, Contratado, Incorrido e Desvios"
      right={
        <>
          <Button variant="outline" className="rounded-2xl">
            <FileDown className="mr-2 h-4 w-4" /> Exportar (PDF)
          </Button>
          <Button className="rounded-2xl">
            <BadgeCheck className="mr-2 h-4 w-4" /> Salvar Snapshot
          </Button>
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Orçado" value={moneyBRL(kpisDashboard.orcado)} icon={<Info className="h-4 w-4" />} />
        <Kpi label="Orçado (INCC)" value={moneyBRL(kpisDashboard.orcadoINCC)} icon={<BarChart3 className="h-4 w-4" />} />
        <Kpi label="Custo ao Término (CAT)" value={moneyBRL(kpisDashboard.cat)} icon={<Layers className="h-4 w-4" />} />
        <Kpi label="Contratado" value={moneyBRL(kpisDashboard.contratado)} hint={`${clampPct(pctContratado).toFixed(1)}% do INCC`} tone="neutral" icon={<FileText className="h-4 w-4" />} />
        <Kpi
          label="Incorrido (Pago + A pagar + Emitir)"
          value={moneyBRL(incorrido)}
          hint={`${clampPct(pctIncorrido).toFixed(1)}% do INCC`}
          tone={pctIncorrido < 75 ? "good" : pctIncorrido < 90 ? "warn" : "bad"}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <Kpi
          label="Desvio (vs INCC / vs CAT)"
          value={`${moneyBRL(desvioVsINCC)} / ${moneyBRL(desvioVsCAT)}`}
          tone={toneINCC as any}
          hint={desvioVsINCC >= 0 ? "Dentro do orçamento atualizado" : "Risco de estourar (negativo)"}
          icon={desvioVsINCC >= 0 ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tendência (normalizada vs INCC)</CardTitle>
            <div className="text-sm text-muted-foreground">Incorrido e Contratado ao longo do tempo (visão percentual)</div>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartSeries} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v) => `${Math.round(v * 100)}%`} domain={[0, 1]} />
                <Tooltip formatter={(v: any) => `${Math.round(Number(v) * 100)}%`} />
                <Legend />
                <Area type="monotone" dataKey="incorrido" name="Incorrido" fillOpacity={0.25} />
                <Area type="monotone" dataKey="contratado" name="Contratado" fillOpacity={0.18} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Alertas & Top Desvios</CardTitle>
            <div className="text-sm text-muted-foreground">Itens com maior impacto (níveis 2/3/4)</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border bg-amber-50/70 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">Incorrido sem contrato detectado</div>
                  <div className="text-xs text-muted-foreground">Revise processos soltos por fornecedor no serviço selecionado.</div>
                </div>
              </div>
            </div>

            <Separator />

            {topDesvios.map((d, i) => (
              <div key={i} className="rounded-2xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{d.nivel2} · {d.nivel3}</div>
                    <div className="truncate text-xs text-muted-foreground">{d.nivel4}</div>
                  </div>
                  <Pill variant={d.desvio < 0 ? "bad" : "ok"}>{moneyBRL(d.desvio)}</Pill>
                </div>
                <div className="mt-2">
                  <Progress value={clampPct(60 + i * 10)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function ContratosNovoPage({ onGoEqualizacao }: { onGoEqualizacao: () => void }) {
  const [modo, setModo] = useState<"novo" | "equalizacao">("novo");
  const [servico, setServico] = useState("REV-012");
  const [categoria, setCategoria] = useState("REVESTIMENTO");

  const incorrido = 420000 + 86000 + 14000;
  const orcado = 510000;
  const orcadoINCC = 548000;
  const cat = 565000;

  const novoContrato = 192000;
  const totalPos = incorrido + novoContrato;

  const desvioINCC = orcadoINCC - totalPos;
  const desvioCAT = cat - totalPos;

  const tone = desvioINCC >= 0 ? "good" : desvioINCC > -25000 ? "warn" : "bad";

  return (
    <PageShell
      title="Análise de Contrato — Novo"
      subtitle="Selecione serviço/categoria, veja panorama (contratos + incorrido) e simule o novo contrato"
      right={
        <>
          <Button variant="outline" className="rounded-2xl" onClick={onGoEqualizacao}>
            <ClipboardCheck className="mr-2 h-4 w-4" /> Abrir Equalização
          </Button>
          <Button className="rounded-2xl">
            <BadgeCheck className="mr-2 h-4 w-4" /> Salvar no Histórico
          </Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contexto da Análise</CardTitle>
            <div className="text-sm text-muted-foreground">Base: planejamento (Custo ao Término) + contratos + incorridos</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Serviço (Planejamento)</div>
              <Select value={servico} onValueChange={setServico}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REV-012">REV-012 · Revestimentos</SelectItem>
                  <SelectItem value="EST-004">EST-004 · Estrutura</SelectItem>
                  <SelectItem value="HID-010">HID-010 · Hidráulica</SelectItem>
                </SelectContent>
              </Select>
              <div className="rounded-2xl border bg-zinc-50 p-3 text-xs text-muted-foreground">
                Nível 2: <b>ACABAMENTO</b> · Nível 3: <b>REVESTIMENTOS</b> · Nível 4: <b>PISO ÁREA COMUM</b>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Categoria (opcional)</div>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REVESTIMENTO">REVESTIMENTO</SelectItem>
                  <SelectItem value="CIMENTO">CIMENTO</SelectItem>
                  <SelectItem value="AÇO">AÇO</SelectItem>
                  <SelectItem value="HIDRA">HIDRÁULICA</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Filtra itens do catálogo (insumos/composições) na simulação.</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Fornecedor (simulação)</div>
              <Input className="rounded-2xl" placeholder="Digite código ou nome (ex.: 0012 - Empreiteira X)" />
              <div className="text-xs text-muted-foreground">Você pode preencher depois da equalização.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Base Orçamentária</CardTitle>
            <div className="text-sm text-muted-foreground">Valores do item/serviço no Custo ao Término</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Orçado</span>
                <span className="font-medium">{moneyBRL(orcado)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Orçado (INCC)</span>
                <span className="font-medium">{moneyBRL(orcadoINCC)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CAT</span>
                <span className="font-medium">{moneyBRL(cat)}</span>
              </div>
            </div>
            <Separator />
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <div className="text-xs text-muted-foreground">Escolha padrão</div>
              <div className="mt-1 text-sm font-medium">Comparar vs Orçado (INCC)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-6">
        <Kpi label="Incorrido (até agora)" value={moneyBRL(incorrido)} hint="Pago + A pagar + Emitir" icon={<ClipboardCheck className="h-4 w-4" />} />
        <Kpi label="Simulação — Novo contrato" value={moneyBRL(novoContrato)} hint="Itens selecionados" icon={<Plus className="h-4 w-4" />} />
        <Kpi label="Total pós-contratação" value={moneyBRL(totalPos)} hint="Incorrido + novo" icon={<Layers className="h-4 w-4" />} />
        <Kpi label="Desvio vs INCC" value={moneyBRL(desvioINCC)} tone={tone as any} hint={desvioINCC >= 0 ? "Dentro" : "Negativo"} icon={desvioINCC >= 0 ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} />
        <Kpi label="Desvio vs CAT" value={moneyBRL(desvioCAT)} tone={desvioCAT >= 0 ? "good" : "warn"} hint={desvioCAT >= 0 ? "Dentro" : "Atenção"} icon={<BarChart3 className="h-4 w-4" />} />
        <Kpi label="Recomendação" value={desvioINCC >= 0 ? "OK" : "Rever"} tone={desvioINCC >= 0 ? "good" : "warn"} hint="Baseado em INCC" icon={<ClipboardCheck className="h-4 w-4" />} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TableShell
          title="Contratos do serviço (vigentes/finalizados)"
          subtitle="Visão rápida para evitar duplicidade de contratação"
          right={
            <Button variant="outline" className="rounded-2xl">
              <Search className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          }
        >
          <SoftTable
            columns={[
              { key: "contrato", label: "Contrato" },
              { key: "forn", label: "Fornecedor" },
              { key: "status", label: "Status" },
              { key: "vinc", label: "Vinculado" },
              { key: "aprov", label: "Aprovado/Medido" },
              { key: "saldo", label: "Saldo" },
            ]}
            rows={[
              {
                contrato: <span className="font-medium">000123</span>,
                forn: "0012 · Empreiteira Y",
                status: <Pill variant="ok">Vigente</Pill>,
                vinc: moneyBRL(280000),
                aprov: moneyBRL(240000),
                saldo: <Pill variant="warn">{moneyBRL(40000)}</Pill>,
              },
              {
                contrato: <span className="font-medium">000098</span>,
                forn: "0044 · Empreiteira Z",
                status: <Pill variant="muted">Finalizado</Pill>,
                vinc: moneyBRL(190000),
                aprov: moneyBRL(190000),
                saldo: <Pill variant="ok">{moneyBRL(0)}</Pill>,
              },
            ]}
          />
          <div className="mt-3 rounded-2xl border bg-amber-50/70 p-3 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <div className="font-medium">Alerta: Incorrido sem contrato</div>
                <div className="text-xs text-muted-foreground">Somatório por fornecedor/processo (sem numeração de contrato) aparece abaixo.</div>
              </div>
            </div>
          </div>
        </TableShell>

        <TableShell title="Incorridos (Pago + A pagar + Emitir)" subtitle="Separado por COM contrato vs SEM contrato">
          <Tabs defaultValue="com" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl">
              <TabsTrigger value="com" className="rounded-2xl">Com contrato</TabsTrigger>
              <TabsTrigger value="sem" className="rounded-2xl">Sem contrato</TabsTrigger>
            </TabsList>
            <TabsContent value="com" className="mt-3 space-y-3">
              <SoftTable
                columns={[
                  { key: "contrato", label: "Contrato" },
                  { key: "pago", label: "Pago" },
                  { key: "apagar", label: "A pagar" },
                  { key: "emitir", label: "Emitir" },
                  { key: "inc", label: "Incorrido" },
                ]}
                rows={[
                  {
                    contrato: <span className="font-medium">000123</span>,
                    pago: moneyBRL(210000),
                    apagar: moneyBRL(56000),
                    emitir: moneyBRL(12000),
                    inc: <span className="font-semibold">{moneyBRL(278000)}</span>,
                  },
                ]}
              />
            </TabsContent>
            <TabsContent value="sem" className="mt-3 space-y-3">
              <SoftTable
                columns={[
                  { key: "forn", label: "Fornecedor" },
                  { key: "pago", label: "Pago" },
                  { key: "apagar", label: "A pagar" },
                  { key: "emitir", label: "Emitir" },
                  { key: "inc", label: "Incorrido" },
                  { key: "evid", label: "Processos" },
                ]}
                rows={[
                  {
                    forn: "0012 · Empreiteira Y",
                    pago: moneyBRL(24000),
                    apagar: moneyBRL(18000),
                    emitir: moneyBRL(2000),
                    inc: <span className="font-semibold">{moneyBRL(44000)}</span>,
                    evid: <span className="text-xs text-muted-foreground">PROC 8921/2, 9012/1</span>,
                  },
                ]}
              />
            </TabsContent>
          </Tabs>
        </TableShell>
      </div>

      <TableShell
        title="Simulação do Novo Contrato (itens)"
        subtitle="Pesquise por código/nome, filtre por categoria, e preencha quantidades e preços"
        right={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="rounded-2xl">
                <Plus className="mr-2 h-4 w-4" /> Adicionar item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Adicionar item (insumo ou composição)</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Pesquisar (código ou nome)</div>
                  <Input className="rounded-2xl" placeholder="Ex.: 12345 (Cimento) ou 70001 (Composição)" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground">Filtro de tipo</div>
                  <Select defaultValue="todos">
                    <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="insumo">Insumo</SelectItem>
                      <SelectItem value="comp">Composição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-2 rounded-2xl border bg-zinc-50 p-3 text-sm">
                <div className="font-medium">Sugestões</div>
                <div className="mt-2 grid gap-2">
                  <button className="flex items-center justify-between rounded-2xl border bg-white p-3 text-left hover:bg-zinc-50">
                    <div>
                      <div className="text-sm font-medium">12345 · CIMENTO CP-II 32 (50kg)</div>
                      <div className="text-xs text-muted-foreground">Tipo: Insumo · Categoria: CIMENTO</div>
                    </div>
                    <Pill variant="muted">UND: SC</Pill>
                  </button>
                  <button className="flex items-center justify-between rounded-2xl border bg-white p-3 text-left hover:bg-zinc-50">
                    <div>
                      <div className="text-sm font-medium">70001 · REVESTIMENTO CERÂMICO (m²)</div>
                      <div className="text-xs text-muted-foreground">Tipo: Composição</div>
                    </div>
                    <Pill variant="muted">UND: m²</Pill>
                  </button>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" className="rounded-2xl">Cancelar</Button>
                <Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" />Inserir</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <SoftTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "desc", label: "Descrição" },
            { key: "tipo", label: "Tipo" },
            { key: "und", label: "UND" },
            { key: "qtde", label: "Qtde" },
            { key: "unit", label: "Unit." },
            { key: "total", label: "Total" },
          ]}
          rows={[
            {
              cod: <span className="font-medium">70001</span>,
              desc: "REVESTIMENTO CERÂMICO",
              tipo: <Pill variant="muted">COMPOSIÇÃO</Pill>,
              und: "m²",
              qtde: <Input className="h-9 w-24 rounded-2xl" defaultValue="120" />,
              unit: <Input className="h-9 w-28 rounded-2xl" defaultValue="85,00" />,
              total: <span className="font-semibold">{moneyBRL(10200)}</span>,
            },
            {
              cod: <span className="font-medium">12345</span>,
              desc: "CIMENTO CP-II 32 (50kg)",
              tipo: <Pill variant="muted">INSUMO</Pill>,
              und: "SC",
              qtde: <Input className="h-9 w-24 rounded-2xl" defaultValue="300" />,
              unit: <Input className="h-9 w-28 rounded-2xl" defaultValue="31,50" />,
              total: <span className="font-semibold">{moneyBRL(9450)}</span>,
            },
          ]}
        />
        <div className="mt-3 flex items-center justify-between rounded-2xl border bg-zinc-50 p-3">
          <div className="text-sm text-muted-foreground">Total simulado</div>
          <div className="text-base font-semibold">{moneyBRL(novoContrato)}</div>
        </div>
      </TableShell>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Comparação rápida</CardTitle>
            <div className="text-sm text-muted-foreground">Incorrido + novo contrato vs Orçado/INCC/CAT</div>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { k: "Orçado", v: orcado },
                  { k: "INCC", v: orcadoINCC },
                  { k: "CAT", v: cat },
                  { k: "Incorrido", v: incorrido },
                  { k: "Pós-novo", v: totalPos },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="k" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v: any) => moneyBRL(Number(v))} />
                <Bar dataKey="v" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Conclusão</CardTitle>
            <div className="text-sm text-muted-foreground">Explicação + valores considerados</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className={cx("rounded-2xl border p-3", desvioINCC >= 0 ? "bg-emerald-50/60" : "bg-amber-50/70")}>
              <div className="flex items-start gap-2">
                {desvioINCC >= 0 ? <BadgeCheck className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
                <div>
                  <div className="text-sm font-medium">
                    {desvioINCC >= 0 ? "Dentro do INCC" : "Atenção: risco de desvio negativo"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Orçado INCC: {moneyBRL(orcadoINCC)} · Incorrido: {moneyBRL(incorrido)} · Novo: {moneyBRL(novoContrato)}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border p-3">
              <div className="text-xs font-semibold text-muted-foreground">Observação / Justificativa</div>
              <textarea
                className="mt-2 h-28 w-full resize-none rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Descreva por que está sendo contratado, escopo, necessidade, impactos..."
                defaultValue="Regularização de escopo por aumento de área e replanejamento de prazo."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TableShell title="Checklist do fornecedor (pré-qualificação)" subtitle="Marque evidências e observações">
          <div className="grid gap-2 md:grid-cols-2">
            {[
              "Cadastro/Documentação",
              "Certidões",
              "Capacidade técnica",
              "Prazo/Equipe",
              "Condições comerciais",
              "Garantias/Qualidade",
            ].map((t) => (
              <label key={t} className="flex items-center justify-between rounded-2xl border bg-white p-3">
                <span className="text-sm">{t}</span>
                <input type="checkbox" className="h-4 w-4" defaultChecked={t !== "Condições comerciais"} />
              </label>
            ))}
          </div>
          <div className="mt-3 rounded-2xl border p-3">
            <div className="text-xs font-semibold text-muted-foreground">Observações do checklist</div>
            <textarea className="mt-2 h-24 w-full resize-none rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" placeholder="Anote pontos de risco, restrições, condições..." />
          </div>
        </TableShell>

        <TableShell title="Ações" subtitle="Salvar, exportar e registrar no histórico">
          <div className="grid gap-2">
            <Button className="rounded-2xl justify-start"><BadgeCheck className="mr-2 h-4 w-4" /> Salvar análise (snapshot)</Button>
            <Button variant="outline" className="rounded-2xl justify-start"><FileDown className="mr-2 h-4 w-4" /> Exportar PDF</Button>
            <Button variant="outline" className="rounded-2xl justify-start"><FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar XLSX</Button>
            <Button variant="outline" className="rounded-2xl justify-start" onClick={onGoEqualizacao}><ClipboardCheck className="mr-2 h-4 w-4" /> Gerar Equalização (modelo)</Button>
          </div>
        </TableShell>
      </div>
    </PageShell>
  );
}

function ContratosAditivoPage() {
  const [contrato, setContrato] = useState("000123");

  const total = 280000;
  const medido = 240000;
  const aMedir = 40000;

  const pctValor = (medido / total) * 100;
  const pctRestante = 100 - pctValor;

  const incorrido = 278000;

  const orcadoINCC = 548000;
  const cat = 565000;

  const aditivo = 46000;
  const pos = incorrido + aditivo;
  const desvioINCC = orcadoINCC - pos;

  return (
    <PageShell
      title="Análise de Contrato — Aditivo"
      subtitle="Selecione o contrato, veja consumo (% medido) e simule o aditivo"
      right={
        <>
          <Button variant="outline" className="rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
          <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" /> Salvar</Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Selecionar contrato</CardTitle>
            <div className="text-sm text-muted-foreground">Carrega panorama do contrato e do serviço do planejamento</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Contrato</div>
              <Select value={contrato} onValueChange={setContrato}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="000123">000123 · Empreiteira Y</SelectItem>
                  <SelectItem value="000098">000098 · Empreiteira Z</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Fornecedor: 0012 · Empreiteira Y</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Serviço (planejamento)</div>
              <div className="rounded-2xl border bg-zinc-50 p-3 text-sm">
                <div className="font-medium">REV-012 · Revestimentos</div>
                <div className="text-xs text-muted-foreground">N2: ACABAMENTO · N3: REVESTIMENTOS · N4: PISO ÁREA COMUM</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Status</div>
              <div className="flex gap-2">
                <Pill variant="ok">Vigente</Pill>
                <Pill variant={pctValor >= 85 ? "warn" : "muted"}>{pctValor.toFixed(1)}% medido</Pill>
              </div>
              <div className="text-xs text-muted-foreground">Use o % medido para decidir necessidade de aditivo.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Panorama do contrato</CardTitle>
            <div className="text-sm text-muted-foreground">Valores e percentuais</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-medium">{moneyBRL(total)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Medido</span><span className="font-medium">{moneyBRL(medido)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">A medir</span><span className="font-medium">{moneyBRL(aMedir)}</span></div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>% medido</span>
                <span className="font-medium text-zinc-900">{pctValor.toFixed(1)}%</span>
              </div>
              <Progress value={clampPct(pctValor)} />
              <div className="text-xs text-muted-foreground">Restante: {pctRestante.toFixed(1)}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-6">
        <Kpi label="Incorrido do serviço" value={moneyBRL(incorrido)} hint="Pago + A pagar + Emitir" icon={<ClipboardCheck className="h-4 w-4" />} />
        <Kpi label="Orçado (INCC)" value={moneyBRL(orcadoINCC)} icon={<BarChart3 className="h-4 w-4" />} />
        <Kpi label="CAT" value={moneyBRL(cat)} icon={<Layers className="h-4 w-4" />} />
        <Kpi label="Simulação — Aditivo" value={moneyBRL(aditivo)} icon={<Plus className="h-4 w-4" />} />
        <Kpi label="Pós-aditivo" value={moneyBRL(pos)} icon={<Layers className="h-4 w-4" />} />
        <Kpi label="Desvio vs INCC" value={moneyBRL(desvioINCC)} tone={desvioINCC >= 0 ? "good" : "warn"} icon={desvioINCC >= 0 ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />} />
      </div>

      <TableShell
        title="Itens do contrato (detalhado)"
        subtitle="Qtde/valor contratado × medido × a medir + % por item"
        right={<Button variant="outline" className="rounded-2xl"><Search className="mr-2 h-4 w-4" /> Buscar item</Button>}
      >
        <SoftTable
          columns={[
            { key: "item", label: "Item" },
            { key: "desc", label: "Descrição" },
            { key: "und", label: "UND" },
            { key: "qC", label: "Qtde" },
            { key: "vC", label: "Subt." },
            { key: "qM", label: "Med." },
            { key: "vM", label: "V. Med." },
            { key: "qA", label: "A medir" },
            { key: "pct", label: "%" },
          ]}
          rows={[
            {
              item: <span className="font-medium">70001</span>,
              desc: "REVESTIMENTO CERÂMICO",
              und: "m²",
              qC: "120",
              vC: moneyBRL(10200),
              qM: "102",
              vM: moneyBRL(8670),
              qA: "18",
              pct: <Pill variant={85 >= 85 ? "warn" : "muted"}>85%</Pill>,
            },
            {
              item: <span className="font-medium">70002</span>,
              desc: "REJUNTE",
              und: "kg",
              qC: "30",
              vC: moneyBRL(1800),
              qM: "28",
              vM: moneyBRL(1680),
              qA: "2",
              pct: <Pill variant="ok">93%</Pill>,
            },
          ]}
        />
      </TableShell>

      <TableShell title="Simulação de itens do aditivo" subtitle="Adicionar itens ou ajustar quantidades/valores">
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <Input className="rounded-2xl" placeholder="Pesquisar item (código ou nome)" />
          <Select defaultValue="todos">
            <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="insumo">Insumos</SelectItem>
              <SelectItem value="comp">Composições</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" /> Inserir item</Button>
        </div>
        <SoftTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "desc", label: "Descrição" },
            { key: "qtde", label: "Qtde" },
            { key: "unit", label: "Unit." },
            { key: "tot", label: "Total" },
          ]}
          rows={[
            {
              cod: <span className="font-medium">70003</span>,
              desc: "RODAPÉ",
              qtde: <Input className="h-9 w-24 rounded-2xl" defaultValue="40" />,
              unit: <Input className="h-9 w-28 rounded-2xl" defaultValue="25,00" />,
              tot: <span className="font-semibold">{moneyBRL(1000)}</span>,
            },
          ]}
        />
        <div className="mt-3 flex items-center justify-between rounded-2xl border bg-zinc-50 p-3">
          <div className="text-sm text-muted-foreground">Total do aditivo (simulado)</div>
          <div className="text-base font-semibold">{moneyBRL(aditivo)}</div>
        </div>
      </TableShell>

      <TableShell title="Conclusão (automática)" subtitle="Sinalização + justificativa">
        <div className={cx("rounded-2xl border p-3", desvioINCC >= 0 ? "bg-emerald-50/60" : "bg-amber-50/70")}>
          <div className="flex items-start gap-2">
            {desvioINCC >= 0 ? <BadgeCheck className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
            <div>
              <div className="text-sm font-medium">{desvioINCC >= 0 ? "Aditivo dentro do INCC" : "Atenção: pode gerar desvio negativo"}</div>
              <div className="mt-1 text-xs text-muted-foreground">INCC: {moneyBRL(orcadoINCC)} · Incorrido: {moneyBRL(incorrido)} · Aditivo: {moneyBRL(aditivo)}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 rounded-2xl border p-3">
          <div className="text-xs font-semibold text-muted-foreground">Observação</div>
          <textarea className="mt-2 h-24 w-full resize-none rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" placeholder="Explique motivo do aditivo, escopo, necessidade..." />
        </div>
      </TableShell>
    </PageShell>
  );
}

function ContratosConsultaPage() {
  const [q, setQ] = useState("000123");

  const total = 280000;
  const medido = 240000;
  const aMedir = 40000;

  const pct = (medido / total) * 100;

  return (
    <PageShell
      title="Consulta de Contrato"
      subtitle="Detalhe completo: itens, quantidades, % medido, a medir, status e evidências"
      right={
        <>
          <Button variant="outline" className="rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
          <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" /> Salvar no Histórico</Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pesquisar</CardTitle>
            <div className="text-sm text-muted-foreground">Por número do contrato ou fornecedor</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input className="rounded-2xl" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Digite o contrato (ex.: 000123)" />
            </div>
            <Button className="rounded-2xl"><Search className="mr-2 h-4 w-4" /> Consultar</Button>
            <div className="md:col-span-3 rounded-2xl border bg-zinc-50 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Pill variant="ok">Vigente</Pill>
                <Pill variant={pct >= 85 ? "warn" : "muted"}>{pct.toFixed(1)}% medido</Pill>
                <span className="text-xs text-muted-foreground">Fornecedor: 0012 · Empreiteira Y · Objeto: Revestimentos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Panorama</CardTitle>
            <div className="text-sm text-muted-foreground">Percentuais e saldo</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Total contrato</span><span className="font-medium">{moneyBRL(total)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Medido</span><span className="font-medium">{moneyBRL(medido)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">A medir</span><span className="font-medium">{moneyBRL(aMedir)}</span></div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>% medido (valor)</span>
                <span className="font-medium text-zinc-900">{pct.toFixed(1)}%</span>
              </div>
              <Progress value={clampPct(pct)} />
              <div className="text-xs text-muted-foreground">Se &gt; 85% e escopo em andamento, provável aditivo.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <TableShell title="Itens do contrato" subtitle="Consumo por item (quantidade e valor)">
        <SoftTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "desc", label: "Descrição" },
            { key: "und", label: "UND" },
            { key: "qC", label: "Qtde" },
            { key: "vC", label: "Subt." },
            { key: "qM", label: "Med." },
            { key: "vM", label: "V. Med." },
            { key: "qA", label: "A medir" },
            { key: "vA", label: "V. a medir" },
            { key: "pct", label: "%" },
          ]}
          rows={[
            {
              cod: <span className="font-medium">70001</span>,
              desc: "REVESTIMENTO CERÂMICO",
              und: "m²",
              qC: "120",
              vC: moneyBRL(10200),
              qM: "102",
              vM: moneyBRL(8670),
              qA: "18",
              vA: moneyBRL(1530),
              pct: <Pill variant="warn">85%</Pill>,
            },
            {
              cod: <span className="font-medium">70002</span>,
              desc: "REJUNTE",
              und: "kg",
              qC: "30",
              vC: moneyBRL(1800),
              qM: "28",
              vM: moneyBRL(1680),
              qA: "2",
              vA: moneyBRL(120),
              pct: <Pill variant="ok">93%</Pill>,
            },
          ]}
        />
      </TableShell>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="medicoes">
          <AccordionTrigger className="rounded-2xl border bg-white px-4">Medições e processos vinculados (evidências)</AccordionTrigger>
          <AccordionContent className="pt-3">
            <SoftTable
              columns={[
                { key: "med", label: "Medição" },
                { key: "proc", label: "Processo" },
                { key: "data", label: "Data" },
                { key: "sub", label: "Subtotal" },
                { key: "obs", label: "Obs" },
              ]}
              rows={[
                {
                  med: <span className="font-medium">M-0091</span>,
                  proc: "PROC 8921",
                  data: "2025-11-10",
                  sub: moneyBRL(42000),
                  obs: <span className="text-xs text-muted-foreground">Itens 70001/70002</span>,
                },
                {
                  med: <span className="font-medium">M-0092</span>,
                  proc: "PROC 9012",
                  data: "2025-11-22",
                  sub: moneyBRL(38000),
                  obs: <span className="text-xs text-muted-foreground">Itens 70001</span>,
                },
              ]}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <TableShell title="Conclusão" subtitle="Sinalização para decisão (necessita aditivo?)">
        <div className={cx("rounded-2xl border p-3", pct >= 85 ? "bg-amber-50/70" : "bg-emerald-50/60")}>
          <div className="flex items-start gap-2">
            {pct >= 85 ? <AlertTriangle className="mt-0.5 h-4 w-4" /> : <BadgeCheck className="mt-0.5 h-4 w-4" />}
            <div>
              <div className="text-sm font-medium">{pct >= 85 ? "Atenção: contrato próximo do limite" : "Contrato em andamento, dentro do planejado"}</div>
              <div className="mt-1 text-xs text-muted-foreground">% medido: {pct.toFixed(1)} · Restante: {(100 - pct).toFixed(1)}% · A medir: {moneyBRL(aMedir)}</div>
            </div>
          </div>
        </div>
      </TableShell>
    </PageShell>
  );
}

function EqualizacaoPage() {
  const [fornecedores, setFornecedores] = useState([
    { nome: "Empreiteira Y", rev0: true, rev1: true },
    { nome: "Empreiteira Z", rev0: true, rev1: false },
    { nome: "Empreiteira W", rev0: false, rev1: false },
  ]);

  return (
    <PageShell
      title="Equalização (modelo)"
      subtitle="Cabeçalho padrão + mapa de cotação por fornecedor — pronto para export XLSX/PDF"
      right={
        <>
          <Button variant="outline" className="rounded-2xl"><FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar XLSX</Button>
          <Button variant="outline" className="rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Exportar PDF</Button>
          <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" /> Salvar</Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Cabeçalho (padrão de export)</CardTitle>
            <div className="text-sm text-muted-foreground">2 logos (gerenciadora + obra) + identificação</div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border bg-zinc-50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Logo (gerenciadora)</div>
                <div className="mt-2 h-12 w-full rounded-xl border bg-white" />
              </div>
              <div className="rounded-2xl border bg-zinc-50 p-3 md:col-span-1">
                <div className="text-xs font-semibold text-muted-foreground">Obra</div>
                <div className="mt-1 text-sm font-medium">310 — OBRWC</div>
                <div className="text-xs text-muted-foreground">Obra WC (Exemplo)</div>
                <div className="mt-2 text-xs text-muted-foreground">Serviço: REV-012 · Revestimentos</div>
              </div>
              <div className="rounded-2xl border bg-zinc-50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Logo (obra)</div>
                <div className="mt-2 h-12 w-full rounded-xl border bg-white" />
              </div>
            </div>
            <div className="mt-3 rounded-2xl border p-3">
              <div className="text-xs font-semibold text-muted-foreground">Justificativa / Observações</div>
              <textarea
                className="mt-2 h-24 w-full resize-none rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Explique necessidade, escopo, motivo da contratação..."
                defaultValue="Equalização para contratação de revestimentos por replanejamento e adequação de escopo."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Resumo (base + incorrido)</CardTitle>
            <div className="text-sm text-muted-foreground">Saldo e sinalização</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Orçado (INCC)</span><span className="font-medium">{moneyBRL(548000)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Incorrido</span><span className="font-medium">{moneyBRL(420000)}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Saldo</span><span className="font-semibold">{moneyBRL(128000)}</span></div>
            </div>
            <Separator />
            <div className="rounded-2xl border bg-amber-50/70 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <div>
                  <div className="text-sm font-medium">Atenção</div>
                  <div className="text-xs text-muted-foreground">Alguns cenários de proposta podem ultrapassar o saldo.</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">O export manterá o cabeçalho e o layout do modelo.</div>
          </CardContent>
        </Card>
      </div>

      <TableShell
        title="Fornecedores"
        subtitle="Cadastro e revisões (RV00 / RV01) — + checklist"
        right={<Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" /> Adicionar fornecedor</Button>}
      >
        <SoftTable
          columns={[
            { key: "f", label: "Fornecedor" },
            { key: "rv0", label: "RV00" },
            { key: "rv1", label: "RV01" },
            { key: "chk", label: "Checklist" },
            { key: "obs", label: "Obs" },
          ]}
          rows={fornecedores.map((f) => ({
            f: <span className="font-medium">{f.nome}</span>,
            rv0: <input type="checkbox" defaultChecked={f.rev0} className="h-4 w-4" />,
            rv1: <input type="checkbox" defaultChecked={f.rev1} className="h-4 w-4" />,
            chk: <Pill variant="muted">OK parcial</Pill>,
            obs: <span className="text-xs text-muted-foreground">Prazo 45d · Condições</span>,
          }))}
        />
      </TableShell>

      <TableShell title="Mapa de Cotação (itens × fornecedores)" subtitle="Modelo no padrão: preços, mínimos e comparativo">
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <Input className="rounded-2xl" placeholder="Adicionar item (código ou nome)" />
          <Select defaultValue="todos">
            <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="insumo">Insumos</SelectItem>
              <SelectItem value="comp">Composições</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" /> Inserir item</Button>
        </div>

        <div className="overflow-auto rounded-2xl border">
          <table className="min-w-[980px] w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                {[
                  "Item",
                  "Descrição",
                  "UND",
                  "Qtde",
                  "Orç. Unit",
                  "Orç. INCC",
                  "Y RV00",
                  "Y RV01",
                  "Z RV00",
                  "Z RV01",
                  "Mínimo",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold text-zinc-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { cod: "70001", desc: "REVESTIMENTO CERÂMICO", und: "m²", qtde: 120, b: 86, incc: 90, y0: 92, y1: 89, z0: 95, z1: 94 },
                { cod: "70002", desc: "REJUNTE", und: "kg", qtde: 30, b: 60, incc: 64, y0: 62, y1: 61, z0: 68, z1: 67 },
              ].map((r, idx) => {
                const min = Math.min(r.y1, r.y0, r.z0, r.z1);
                return (
                  <tr key={idx} className={cx("border-t", idx % 2 === 0 ? "bg-white" : "bg-zinc-50/40")}>
                    <td className="px-4 py-3 font-medium">{r.cod}</td>
                    <td className="px-4 py-3">{r.desc}</td>
                    <td className="px-4 py-3">{r.und}</td>
                    <td className="px-4 py-3">{r.qtde}</td>
                    <td className="px-4 py-3">{moneyBRL(r.b)}</td>
                    <td className="px-4 py-3">{moneyBRL(r.incc)}</td>
                    <td className="px-4 py-3">{moneyBRL(r.y0)}</td>
                    <td className="px-4 py-3">{moneyBRL(r.y1)}</td>
                    <td className="px-4 py-3">{moneyBRL(r.z0)}</td>
                    <td className="px-4 py-3">{moneyBRL(r.z1)}</td>
                    <td className="px-4 py-3"><Pill variant="ok">{moneyBRL(min)}</Pill></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {["Empreiteira Y", "Empreiteira Z", "Empreiteira W"].map((n, i) => (
            <div key={i} className="rounded-2xl border bg-zinc-50 p-3">
              <div className="text-sm font-medium">{n}</div>
              <div className="mt-1 text-xs text-muted-foreground">Total (RV01)</div>
              <div className="mt-1 text-base font-semibold">{moneyBRL(185000 + i * 9000)}</div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Saldo pós-proposta</span>
                <Pill variant={i === 0 ? "warn" : i === 1 ? "bad" : "ok"}>{moneyBRL(128000 - (185000 + i * 9000))}</Pill>
              </div>
            </div>
          ))}
        </div>
      </TableShell>

      <TableShell title="Checklist e observações por fornecedor" subtitle="Campos para justificativas e requisitos">
        <div className="grid gap-3 lg:grid-cols-3">
          {["Empreiteira Y", "Empreiteira Z", "Empreiteira W"].map((n) => (
            <div key={n} className="rounded-2xl border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{n}</div>
                <Pill variant="muted">Checklist</Pill>
              </div>
              <div className="mt-3 grid gap-2">
                {["Documentação", "Capacidade", "Prazo", "Comercial", "Qualidade"].map((k) => (
                  <label key={k} className="flex items-center justify-between rounded-2xl border bg-white p-2">
                    <span className="text-xs">{k}</span>
                    <input type="checkbox" className="h-4 w-4" defaultChecked={k !== "Comercial"} />
                  </label>
                ))}
              </div>
              <div className="mt-3 text-xs font-semibold text-muted-foreground">Observações</div>
              <textarea className="mt-2 h-20 w-full resize-none rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" placeholder="Anote restrições, condições, motivo, riscos..." />
            </div>
          ))}
        </div>
      </TableShell>
    </PageShell>
  );
}

function SuprimentosNovoPedidoPage() {
  const [categoria, setCategoria] = useState("CIMENTO");
  const [insumo, setInsumo] = useState("12345");

  const orcadoQtde = 1200;
  const compradoQtde = 980;
  const novoQtde = 250;
  const posQtde = compradoQtde + novoQtde;

  const orcadoR = 380000;
  const incorridoR = 312000;
  const novoR = 82000;
  const posR = incorridoR + novoR;

  const desvioQtde = posQtde - orcadoQtde;
  const desvioR = posR - orcadoR;

  return (
    <PageShell
      title="Suprimentos — Novo Pedido"
      subtitle="Monte o pedido (MAT) e veja desvio em quantidade e valor vs orçamento"
      right={
        <>
          <Button variant="outline" className="rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>
          <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" /> Salvar</Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Contexto do pedido</CardTitle>
            <div className="text-sm text-muted-foreground">Categoria, insumo e (opcional) vínculo ao planejamento</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Categoria</div>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="CIMENTO">CIMENTO</SelectItem>
                  <SelectItem value="AÇO">AÇO</SelectItem>
                  <SelectItem value="HIDRA">HIDRÁULICA</SelectItem>
                  <SelectItem value="REV">REVESTIMENTO</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Filtra catálogo e histórico por família.</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Insumo</div>
              <Input className="rounded-2xl" value={insumo} onChange={(e) => setInsumo(e.target.value)} placeholder="Código ou nome" />
              <div className="text-xs text-muted-foreground">Ex.: 12345 · CIMENTO CP-II 32 (50kg)</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Alocação (opcional)</div>
              <Select defaultValue="REV-012">
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="REV-012">REV-012 · Revestimentos</SelectItem>
                  <SelectItem value="EST-004">EST-004 · Estrutura</SelectItem>
                  <SelectItem value="HID-010">HID-010 · Hidráulica</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Quando existir, melhora a análise por serviço/níveis.</div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Resumo do insumo</CardTitle>
            <div className="text-sm text-muted-foreground">Orçado × Incorrido × Simulação</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Orçado (qtde)</span><span className="font-medium">{orcadoQtde}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Comprado/incorrido</span><span className="font-medium">{compradoQtde}</span></div>
              <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Novo pedido</span><span className="font-medium">{novoQtde}</span></div>
            </div>
            <Separator />
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <div className="text-xs text-muted-foreground">Desvio (qtde)</div>
              <div className="mt-1 text-base font-semibold">{desvioQtde >= 0 ? "+" : ""}{desvioQtde}</div>
              <div className="mt-2"><Progress value={clampPct((posQtde / orcadoQtde) * 100)} /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-6">
        <Kpi label="Orçado (R$)" value={moneyBRL(orcadoR)} icon={<BarChart3 className="h-4 w-4" />} />
        <Kpi label="Incorrido (R$)" value={moneyBRL(incorridoR)} hint="Pago + A pagar + Emitir" icon={<ClipboardCheck className="h-4 w-4" />} />
        <Kpi label="Novo pedido (R$)" value={moneyBRL(novoR)} icon={<Plus className="h-4 w-4" />} />
        <Kpi label="Pós-pedido (R$)" value={moneyBRL(posR)} icon={<Layers className="h-4 w-4" />} />
        <Kpi
          label="Desvio (R$)"
          value={`${desvioR >= 0 ? "+" : ""}${moneyBRL(desvioR)}`}
          tone={desvioR <= 0 ? "good" : desvioR < 20000 ? "warn" : "bad"}
          icon={desvioR <= 0 ? <BadgeCheck className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        />
        <Kpi label="Status" value={desvioR <= 0 ? "OK" : "Rever"} tone={desvioR <= 0 ? "good" : "warn"} icon={<ClipboardCheck className="h-4 w-4" />} />
      </div>

      <TableShell title="Pedido (itens)" subtitle="Adicionar insumos e definir quantidades e preços">
        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <Input className="rounded-2xl md:col-span-2" placeholder="Pesquisar item (código ou nome)" />
          <Select defaultValue={categoria}>
            <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CIMENTO">CIMENTO</SelectItem>
              <SelectItem value="AÇO">AÇO</SelectItem>
              <SelectItem value="HIDRA">HIDRÁULICA</SelectItem>
              <SelectItem value="REV">REVESTIMENTO</SelectItem>
            </SelectContent>
          </Select>
          <Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" /> Inserir</Button>
        </div>
        <SoftTable
          columns={[
            { key: "cod", label: "Código" },
            { key: "desc", label: "Descrição" },
            { key: "und", label: "UND" },
            { key: "qtde", label: "Qtde" },
            { key: "unit", label: "Unit." },
            { key: "tot", label: "Total" },
          ]}
          rows={[
            {
              cod: <span className="font-medium">12345</span>,
              desc: "CIMENTO CP-II 32 (50kg)",
              und: "SC",
              qtde: <Input className="h-9 w-24 rounded-2xl" defaultValue={String(novoQtde)} />,
              unit: <Input className="h-9 w-28 rounded-2xl" defaultValue="328,00" />,
              tot: <span className="font-semibold">{moneyBRL(novoR)}</span>,
            },
          ]}
        />
        <div className="mt-3 rounded-2xl border bg-zinc-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Resumo do pedido</div>
            <div className="text-base font-semibold">{moneyBRL(novoR)}</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">O app deve evitar duplicações somando por processo/parcela no histórico.</div>
        </div>
      </TableShell>

      <TableShell title="Evidências (processos e itens)" subtitle="Base para auditoria e rastreabilidade">
        <SoftTable
          columns={[
            { key: "proc", label: "Processo/Parcela" },
            { key: "item", label: "Item" },
            { key: "qtde", label: "Qtde" },
            { key: "tot", label: "Total" },
            { key: "forn", label: "Fornecedor" },
          ]}
          rows={[
            {
              proc: "PROC 8123/1",
              item: "12345 · CIMENTO CP-II 32",
              qtde: "180",
              tot: moneyBRL(59040),
              forn: "Forn A",
            },
            {
              proc: "PROC 8330/2",
              item: "12345 · CIMENTO CP-II 32",
              qtde: "220",
              tot: moneyBRL(72160),
              forn: "Forn B",
            },
          ]}
        />
      </TableShell>
    </PageShell>
  );
}

function SuprimentosConsultaPage() {
  const [q, setQ] = useState("12345");
  return (
    <PageShell
      title="Suprimentos — Consulta de Insumos"
      subtitle="Pesquise por insumo/categoria e veja comprado/incorrido vs orçamento"
      right={<Button variant="outline" className="rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Exportar</Button>}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Pesquisar</CardTitle>
            <div className="text-sm text-muted-foreground">Código ou nome do insumo</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <Input className="rounded-2xl" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: 12345 ou CIMENTO" />
            </div>
            <Button className="rounded-2xl"><Search className="mr-2 h-4 w-4" /> Consultar</Button>
            <div className="md:col-span-3 flex flex-wrap items-center gap-2 rounded-2xl border bg-zinc-50 p-3 text-xs text-muted-foreground">
              <Pill variant="muted">Categoria: CIMENTO</Pill>
              <span>Insumo: 12345 · CIMENTO CP-II 32</span>
              <span>UND: SC</span>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Resumo</CardTitle>
            <div className="text-sm text-muted-foreground">Orçado × comprado</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <div className="text-xs text-muted-foreground">Desvio em quantidade</div>
              <div className="mt-1 text-base font-semibold">+30%</div>
              <div className="mt-2"><Progress value={78} /></div>
            </div>
            <div className="rounded-2xl border bg-zinc-50 p-3">
              <div className="text-xs text-muted-foreground">Desvio em valor</div>
              <div className="mt-1 text-base font-semibold">{moneyBRL(-24600)}</div>
              <div className="mt-1 text-xs text-muted-foreground">(negativo = estourou)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <TableShell title="Histórico de compra (por processo/parcela)" subtitle="Evita duplicação (base: processos)" right={<Button variant="outline" className="rounded-2xl"><History className="mr-2 h-4 w-4" /> Ver tudo</Button>}>
          <SoftTable
            columns={[
              { key: "proc", label: "Processo/Parcela" },
              { key: "data", label: "Data" },
              { key: "qtde", label: "Qtde" },
              { key: "tot", label: "Total" },
              { key: "forn", label: "Fornecedor" },
            ]}
            rows={[
              { proc: "PROC 8123/1", data: "2025-10-10", qtde: "180", tot: moneyBRL(59040), forn: "Forn A" },
              { proc: "PROC 8330/2", data: "2025-11-05", qtde: "220", tot: moneyBRL(72160), forn: "Forn B" },
            ]}
          />
        </TableShell>

        <TableShell title="Orçamento e referência" subtitle="Orçado (MAT) e atualização" right={<Button variant="outline" className="rounded-2xl"><Info className="mr-2 h-4 w-4" /> Detalhes</Button>}>
          <SoftTable
            columns={[
              { key: "ref", label: "Referência" },
              { key: "qtde", label: "Qtde" },
              { key: "unit", label: "Unit." },
              { key: "tot", label: "Total" },
              { key: "tipo", label: "Tipo" },
            ]}
            rows={[
              { ref: "DE-PARA (Orçamento)", qtde: "1200", unit: moneyBRL(290), tot: moneyBRL(348000), tipo: <Pill variant="muted">MAT</Pill> },
              { ref: "Orçado INCC (referência)", qtde: "—", unit: "—", tot: moneyBRL(380000), tipo: <Pill variant="muted">MAT</Pill> },
            ]}
          />
        </TableShell>
      </div>
    </PageShell>
  );
}

function DadosUploadPage() {
  return (
    <PageShell
      title="Dados (UAU) — Upload"
      subtitle="Carregue o Excel no formato padrão (abas 787, 223, 334, 384, 549, 260, CT, INCC, DE-PARA)"
      right={
        <>
          <Button variant="outline" className="rounded-2xl"><Upload className="mr-2 h-4 w-4" /> Selecionar arquivo</Button>
          <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" /> Importar</Button>
        </>
      }
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Upload do arquivo</CardTitle>
            <div className="text-sm text-muted-foreground">1 obra por arquivo (padrão operacional). O Excel pode ter várias abas.</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl border bg-zinc-50 p-4">
              <div className="flex items-start gap-3">
                <Upload className="mt-0.5 h-5 w-5" />
                <div>
                  <div className="text-sm font-medium">Arraste e solte ou clique para selecionar</div>
                  <div className="mt-1 text-xs text-muted-foreground">Aceita .xlsx no padrão. O sistema valida as abas automaticamente.</div>
                </div>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-2xl border p-3">
                <div className="text-xs font-semibold text-muted-foreground">Atribuir à obra</div>
                <Select defaultValue={ObrasMock[0].id}>
                  <SelectTrigger className="mt-2 rounded-2xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ObrasMock.map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.centroCusto} — {o.abreviacao} · {o.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 text-xs text-muted-foreground">Centro de custo e abreviação aparecem em todas as análises.</div>
              </div>

              <div className="rounded-2xl border p-3">
                <div className="text-xs font-semibold text-muted-foreground">Validação das abas</div>
                <div className="mt-2 space-y-2 text-sm">
                  {["787-INSUMOS COMPRADOS", "223-PLANEJ.CONTRA.INSUMOS", "334-ITENS INSUMOS PROCESSOS", "384-MEDIÇÕES DE CONTRATOS", "549-ITENS DOS CONTRATOS", "260-DESEMBOLSO DET. PRODUTO", "CUSTO AO TERMINO", "INCC", "DE-PARA ORÇAMENTO"].map((n) => (
                    <div key={n} className="flex items-center justify-between rounded-2xl border bg-white px-3 py-2">
                      <span className="truncate">{n}</span>
                      <Pill variant="ok">OK</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Últimos uploads</CardTitle>
            <div className="text-sm text-muted-foreground">Histórico de importações por obra</div>
          </CardHeader>
          <CardContent className="space-y-3">
            {["2025-11-28 08:12", "2025-11-15 09:40", "2025-10-30 18:05"].map((d, i) => (
              <div key={i} className="rounded-2xl border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Upload #{3 - i}</div>
                    <div className="text-xs text-muted-foreground">{d}</div>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-2xl">Abrir</Button>
                </div>
              </div>
            ))}
            <div className="rounded-2xl border bg-zinc-50 p-3 text-xs text-muted-foreground">
              Dica: manter 1 arquivo por obra evita mistura de bases e facilita auditoria.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function CadastroObrasPage() {
  return (
    <PageShell
      title="Cadastro de Obras"
      subtitle="Centro de custo, abreviação (OBR/OBRWC), descrição e logos para relatórios"
      right={<Button className="rounded-2xl"><Plus className="mr-2 h-4 w-4" /> Nova obra</Button>}
    >
      <TableShell
        title="Obras cadastradas"
        subtitle="Use o seletor de obra no topo para navegar com segurança entre análises"
      >
        <SoftTable
          columns={[
            { key: "cc", label: "Centro de custo" },
            { key: "ab", label: "Abreviação" },
            { key: "nome", label: "Descrição" },
            { key: "emp", label: "Empresa" },
            { key: "logos", label: "Logos" },
            { key: "acoes", label: "Ações" },
          ]}
          rows={ObrasMock.map((o) => ({
            cc: <span className="font-medium">{o.centroCusto}</span>,
            ab: <Pill variant="muted">{o.abreviacao}</Pill>,
            nome: o.nome,
            emp: <span className="text-xs text-muted-foreground">{o.empresa}</span>,
            logos: <span className="text-xs text-muted-foreground">Gerenciadora + Obra</span>,
            acoes: (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-2xl">Editar</Button>
                <Button variant="outline" size="sm" className="rounded-2xl">Logos</Button>
              </div>
            ),
          }))}
        />

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader><CardTitle className="text-base">Dados da obra</CardTitle></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Centro de custo</div>
                <Input className="rounded-2xl" placeholder="Ex.: 310" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Abreviação</div>
                <Input className="rounded-2xl" placeholder="Ex.: OBRWC" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground">Descrição</div>
                <Input className="rounded-2xl" placeholder="Nome da obra" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground">Empresa (código + nome)</div>
                <Input className="rounded-2xl" placeholder="Ex.: 001 - Gerenciadora X" />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2">
                <Button variant="outline" className="rounded-2xl">Cancelar</Button>
                <Button className="rounded-2xl"><BadgeCheck className="mr-2 h-4 w-4" />Salvar</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader><CardTitle className="text-base">Logos para export</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-2xl border bg-zinc-50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Logo da gerenciadora</div>
                <Button variant="outline" className="mt-2 w-full rounded-2xl"><Upload className="mr-2 h-4 w-4" />Enviar</Button>
              </div>
              <div className="rounded-2xl border bg-zinc-50 p-3">
                <div className="text-xs font-semibold text-muted-foreground">Logo da obra</div>
                <Button variant="outline" className="mt-2 w-full rounded-2xl"><Upload className="mr-2 h-4 w-4" />Enviar</Button>
              </div>
              <div className="rounded-2xl border p-3 text-xs text-muted-foreground">
                Essas logos aparecem no cabeçalho da Equalização, Aditivo e relatórios exportados.
              </div>
            </CardContent>
          </Card>
        </div>
      </TableShell>
    </PageShell>
  );
}

function HistoricoPage() {
  const [tipo, setTipo] = useState<string>("todos");

  const filtered = useMemo(() => {
    if (tipo === "todos") return historicoMock;
    return historicoMock.filter((h) => h.tipo === tipo);
  }, [tipo]);

  return (
    <PageShell
      title="Histórico"
      subtitle="Tudo que foi analisado e exportado — com snapshot para consulta e reaproveitamento"
      right={<Button className="rounded-2xl"><History className="mr-2 h-4 w-4" /> Atualizar</Button>}
    >
      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
            <div className="text-sm text-muted-foreground">Obra, tipo, período, fornecedor, contrato e serviço</div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Tipo</div>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Equalização">Equalização</SelectItem>
                  <SelectItem value="Novo contrato">Novo contrato</SelectItem>
                  <SelectItem value="Aditivo">Aditivo</SelectItem>
                  <SelectItem value="Novo pedido">Novo pedido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Pesquisar</div>
              <Input className="rounded-2xl" placeholder="Contrato, fornecedor, serviço, categoria..." />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground">Período</div>
              <Input className="rounded-2xl" placeholder="Ex.: 2025-11-01 a 2025-12-01" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Ações rápidas</CardTitle>
            <div className="text-sm text-muted-foreground">Reaproveitar e comparar</div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start rounded-2xl"><Copy className="mr-2 h-4 w-4" /> Duplicar análise selecionada</Button>
            <Button variant="outline" className="w-full justify-start rounded-2xl"><FileDown className="mr-2 h-4 w-4" /> Reexportar PDF</Button>
            <Button variant="outline" className="w-full justify-start rounded-2xl"><FileSpreadsheet className="mr-2 h-4 w-4" /> Reexportar XLSX</Button>
            <Button variant="outline" className="w-full justify-start rounded-2xl"><BarChart3 className="mr-2 h-4 w-4" /> Comparar versões</Button>
          </CardContent>
        </Card>
      </div>

      <TableShell title="Registros" subtitle="Clique para abrir, duplicar ou exportar novamente">
        <SoftTable
          columns={[
            { key: "dt", label: "Data" },
            { key: "tipo", label: "Tipo" },
            { key: "titulo", label: "Título" },
            { key: "ref", label: "Referência" },
            { key: "status", label: "Status" },
            { key: "res", label: "Resultado" },
            { key: "desvio", label: "Resumo" },
            { key: "acoes", label: "Ações" },
          ]}
          rows={filtered.map((h) => ({
            dt: <span className="text-xs text-muted-foreground">{h.createdAt}</span>,
            tipo: <Pill variant="muted">{h.tipo}</Pill>,
            titulo: <span className="font-medium">{h.titulo}</span>,
            ref: <span className="text-xs text-muted-foreground">{h.referencia}</span>,
            status: <Pill variant={h.status === "Aprovado" ? "ok" : h.status === "Rascunho" ? "muted" : h.status === "Finalizado" ? "warn" : "bad"}>{h.status}</Pill>,
            res: <Pill variant={h.resultado === "OK" ? "ok" : h.resultado === "Atenção" ? "warn" : "bad"}>{h.resultado}</Pill>,
            desvio: <span className="text-xs">{h.desvioResumo}</span>,
            acoes: (
              <div className="flex flex-wrap gap-2">
                <Button size="sm" className="rounded-2xl">Abrir</Button>
                <Button size="sm" variant="outline" className="rounded-2xl"><Copy className="mr-2 h-3.5 w-3.5" />Duplicar</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" className="rounded-2xl">Exportar</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><FileDown className="mr-2 h-4 w-4" /> PDF</DropdownMenuItem>
                    <DropdownMenuItem><FileSpreadsheet className="mr-2 h-4 w-4" /> XLSX</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
          }))}
        />
      </TableShell>
    </PageShell>
  );
}

function MobileNav({ active, setActive }: { active: NavKey; setActive: (k: NavKey) => void }) {
  // Minimal: atalho inferior para 4 áreas
  const items: Array<{ k: NavKey; icon: React.ReactNode; label: string }> = [
    { k: "inicio", icon: <Home className="h-4 w-4" />, label: "Início" },
    { k: "contratos.novo", icon: <FileText className="h-4 w-4" />, label: "Contratos" },
    { k: "suprimentos.novo", icon: <ShoppingCart className="h-4 w-4" />, label: "Compras" },
    { k: "historico", icon: <History className="h-4 w-4" />, label: "Histórico" },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white lg:hidden">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-4 gap-1 p-2">
        {items.map((it) => (
          <button
            key={it.k}
            onClick={() => setActive(it.k)}
            className={cx(
              "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs",
              active === it.k ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
            )}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState<NavKey>("inicio");
  const [obraId, setObraId] = useState<string>(ObrasMock[0].id);
  const obra = useMemo(() => ObrasMock.find((o) => o.id === obraId) || ObrasMock[0], [obraId]);

  const page = useMemo(() => {
    switch (active) {
      case "inicio":
        return <DashboardPage />;
      case "contratos.novo":
        return <ContratosNovoPage onGoEqualizacao={() => setActive("contratos.equalizacao")} />;
      case "contratos.aditivo":
        return <ContratosAditivoPage />;
      case "contratos.consulta":
        return <ContratosConsultaPage />;
      case "contratos.equalizacao":
        return <EqualizacaoPage />;
      case "suprimentos.novo":
        return <SuprimentosNovoPedidoPage />;
      case "suprimentos.consulta":
        return <SuprimentosConsultaPage />;
      case "suprimentos.dados":
        return <DadosUploadPage />;
      case "suprimentos.obras":
        return <CadastroObrasPage />;
      case "historico":
        return <HistoricoPage />;
      default:
        return <DashboardPage />;
    }
  }, [active]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <Sidebar active={active} setActive={setActive} />
        <div className="flex-1">
          <HeaderBar obra={obra} setObra={setObraId} active={active} />
          <main className="mx-auto max-w-screen-2xl px-4 pb-24 pt-4">
            <AnimatePresence mode="wait">{page}</AnimatePresence>
          </main>
        </div>
      </div>
      <MobileNav active={active} setActive={setActive} />
    </div>
  );
}
