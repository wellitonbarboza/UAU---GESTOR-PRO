import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileDown, Search } from "lucide-react";
import { FilterBar } from "../components/layout/FilterBar";
import { Card } from "../components/ui/Card";
import { IconButton, PrimaryButton } from "../components/ui/Buttons";
import { Select } from "../components/ui/Select";
import { StatusPill } from "../components/ui/StatusPill";
import { ProgressBar } from "../components/ui/ProgressBar";
import { Input } from "../components/ui/Input";
import Table from "../components/ui/Table";
import { brl, pct } from "../utils/format";
import { MOCK_CONTRATOS } from "../data/mock";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import { useAppStore } from "../store/useAppStore";
import type { Contrato, ContratoItem } from "../types/domain";

type Contrato549Row = {
  id: number;
  obra_id: string;
  Cod_cont: string | null;
  Objeto_cont: string | null;
  CodPes_cont: string | null;
  Nome_pes: string | null;
  StatusCont: string | null;
  SituacaoCont: string | null;
  Total: string | null;
  ValorMedido: string | null;
  TotalContrato: string | null;
  TotalContrato2: string | null;
  APag: string | null;
  APagar: string | null;
  Serv_itens: string | null;
  Descr_itens: string | null;
  Unid_itens: string | null;
  Qtde_itens: string | null;
  Preco_itens: string | null;
  SubTotal: string | null;
  Cod_DescI: string | null;
  Descr_DescCon: string | null;
  Taxa_DescI: string | null;
  TaxaTot: string | null;
  QtdeAcomp: string | null;
  ValorAcomp: string | null;
  QtdeAAcomp: string | null;
  ValorAAcomp: string | null;
  Item_itens: string | null;
  CHAVECONTRATO: string | null;
  batch?: { company_id: string; obra_id: string | null };
};

function parseNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const normalized = String(value)
    .replace(/[^0-9,-\.]/g, "")
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeStatus(raw: string | null): Contrato["status"] {
  const value = (raw ?? "").toUpperCase();
  if (value.startsWith("FINAL")) return "FINALIZADO";
  if (value.startsWith("SUSP")) return "SUSPENSO";
  return "VIGENTE";
}

function normalizeSituacao(raw: string | null): Contrato["situacao"] {
  const value = (raw ?? "").toUpperCase();
  if (value.includes("ENCERR")) return "ENCERRADO";
  if (value.includes("BLOQ")) return "BLOQUEADO";
  return "ATIVO";
}

function mapRowsToContratos(rows: Contrato549Row[]): Contrato[] {
  const grouped = new Map<string, Contrato>();

  rows.forEach((row) => {
    const numero = row.Cod_cont ?? row.CHAVECONTRATO ?? `CONTRATO-${row.id}`;
    const existing = grouped.get(numero);

    const contratoBase: Contrato = existing ?? {
      numero,
      objeto: row.Objeto_cont ?? "",
      fornecedorCodigo: row.CodPes_cont ?? "",
      fornecedorNome: row.Nome_pes ?? "",
      status: normalizeStatus(row.StatusCont),
      situacao: normalizeSituacao(row.SituacaoCont),
      valorTotal: parseNumber(row.TotalContrato ?? row.TotalContrato2 ?? row.SubTotal ?? 0),
      valorMedido: parseNumber(row.ValorMedido ?? row.ValorAcomp ?? 0),
      valorPago: parseNumber(row.Total ?? row.APag ?? 0),
      valorAPagar: parseNumber(row.APagar ?? row.ValorAAcomp ?? 0),
      servicoCodigo: row.Cod_DescI ?? row.Serv_itens ?? undefined,
      servicoDescricao: row.Descr_DescCon ?? row.Descr_itens ?? undefined,
      itens: [],
    };

    const item: ContratoItem = {
      item: row.Item_itens ?? "",
      planejamentoItem: row.Cod_DescI ?? undefined,
      servicoCodigo: row.Serv_itens ?? row.Cod_DescI ?? "",
      servicoDescricao: row.Descr_itens ?? row.Descr_DescCon ?? "",
      unidade: row.Unid_itens ?? "",
      quantidade: parseNumber(row.Qtde_itens),
      precoUnitario: parseNumber(row.Preco_itens),
      quantidadeMedida: parseNumber(row.QtdeAcomp),
      quantidadeAMedir: parseNumber(row.QtdeAAcomp),
    };

    contratoBase.itens.push(item);
    grouped.set(numero, contratoBase);
  });

  return Array.from(grouped.values());
}

export default function PageContratoConsulta() {
  const { companyId, obraId } = useAppStore();
  const [q, setQ] = useState("");
  const [codigoContrato, setCodigoContrato] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [servico, setServico] = useState("TODOS");
  const [planejamento, setPlanejamento] = useState("TODOS");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [contratos, setContratos] = useState<Contrato[]>(isSupabaseEnabled ? [] : MOCK_CONTRATOS);
  const [dataSource, setDataSource] = useState<"supabase" | "mock">(isSupabaseEnabled ? "supabase" : "mock");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchContratos() {
      if (!isSupabaseEnabled || !supabase || !companyId) {
        setDataSource("mock");
        setContratos(MOCK_CONTRATOS);
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("549-ITENS DOS CONTRATOS")
        .select(
          [
            "id",
            "obra_id",
            '"Cod_cont"',
            '"Objeto_cont"',
            '"CodPes_cont"',
            '"Nome_pes"',
            '"StatusCont"',
            '"SituacaoCont"',
            '"Total"',
            '"ValorMedido"',
            '"TotalContrato"',
            '"TotalContrato2"',
            '"APag"',
            '"APagar"',
            '"Serv_itens"',
            '"Descr_itens"',
            '"Unid_itens"',
            '"Qtde_itens"',
            '"Preco_itens"',
            '"SubTotal"',
            '"Cod_DescI"',
            '"Descr_DescCon"',
            '"Taxa_DescI"',
            '"TaxaTot"',
            '"QtdeAcomp"',
            '"ValorAcomp"',
            '"QtdeAAcomp"',
            '"ValorAAcomp"',
            '"Item_itens"',
            '"CHAVECONTRATO"',
            "batch:uau_import_batches!inner(company_id, obra_id)",
          ].join(", ")
        )
        .eq("batch.company_id", companyId)
        .order("Cod_cont", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const rows = Array.isArray(data) ? (data as unknown as Contrato549Row[]) : [];
      const filtered = rows.filter((row) => {
        if (!obraId) return true;
        return row.batch?.obra_id === obraId;
      });

      const mapped = mapRowsToContratos(filtered ?? []);
      setContratos(mapped);
      setDataSource("supabase");
      setLoading(false);
    }

    fetchContratos();
  }, [companyId, obraId]);

  const servicoOptions = useMemo(() => {
    const map = new Map<string, string>();

    contratos.forEach((c) => {
      if (c.servicoCodigo) {
        map.set(c.servicoCodigo, c.servicoDescricao ?? c.servicoCodigo);
      }

      c.itens.forEach((i) => {
        map.set(i.servicoCodigo, i.servicoDescricao);
      });
    });

    return [
      { value: "TODOS", label: "Tipo de serviço: todos" },
      ...Array.from(map.entries()).map(([value, label]) => ({ value, label: `${value} · ${label}` }))
    ];
  }, [contratos]);

  const planejamentoOptions = useMemo(() => {
    const set = new Set<string>();

    contratos.forEach((c) => {
      c.itens.forEach((i) => {
        if (i.planejamentoItem) {
          set.add(i.planejamentoItem);
        }
      });
    });

    return [
      { value: "TODOS", label: "Item do planejamento: todos" },
      ...Array.from(set.values()).map((value) => ({ value, label: value }))
    ];
  }, [contratos]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const codigo = codigoContrato.trim().toLowerCase();

    return contratos.filter((c) => {
      const okTexto =
        !t ||
        `${c.numero} ${c.fornecedorNome} ${c.fornecedorCodigo} ${c.objeto} ${c.servicoCodigo ?? ""} ${c.servicoDescricao ?? ""}`
          .toLowerCase()
          .includes(t);

      const okCodigo = !codigo || c.numero.toLowerCase().includes(codigo) || c.fornecedorCodigo.toLowerCase().includes(codigo);
      const okStatus = status === "TODOS" || c.status === status;
      const okServico =
        servico === "TODOS" || c.servicoCodigo === servico || c.itens.some((i) => i.servicoCodigo === servico);
      const okPlanejamento = planejamento === "TODOS" || c.itens.some((i) => i.planejamentoItem === planejamento);

      return okTexto && okCodigo && okStatus && okServico && okPlanejamento;
    });
  }, [codigoContrato, planejamento, q, servico, status, contratos]);

  const toggleExpanded = (numero: string) => {
    setExpanded((prev) => ({ ...prev, [numero]: !prev[numero] }));
  };

  const formatQtd = (n: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-4">
      <FilterBar
        left={
          <>
            <div className="grid w-full grid-cols-1 gap-2 md:grid-cols-5">
              <div className="relative md:col-span-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Search className="h-4 w-4" />
                </span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Fornecedor, contrato, objeto ou serviço"
                  className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
              </div>

              <Input value={codigoContrato} onChange={(e) => setCodigoContrato(e.target.value)} placeholder="Código/contrato" />

              <Select
                value={status}
                onChange={setStatus}
                options={[
                  { value: "TODOS", label: "Status: todos" },
                  { value: "VIGENTE", label: "Vigente" },
                  { value: "FINALIZADO", label: "Finalizado" },
                  { value: "SUSPENSO", label: "Suspenso" },
                ]}
              />

              <Select value={servico} onChange={setServico} options={servicoOptions} />
              <Select value={planejamento} onChange={setPlanejamento} options={planejamentoOptions} />
            </div>
          </>
        }
        right={
          <IconButton title="Exportar" onClick={() => alert("Protótipo: exportar relatório")}>
            <FileDown className="h-4 w-4" /> Exportar
          </IconButton>
        }
      />

      <Card title="Contratos" subtitle="Consulta detalhada com cabeçalho e itens (tabela 549 + medições)">
        {dataSource === "mock" ? (
          <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Exibindo dados de exemplo. Configure o Supabase para ver os valores reais da tabela 549.
          </div>
        ) : null}

        {error ? (
          <div className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>
        ) : null}

        <div className="space-y-3">
          {list.map((c) => {
            const perc = c.valorTotal ? c.valorMedido / c.valorTotal : 0;
            const saldo = c.valorTotal - c.valorMedido;
            return (
              <div key={c.numero} className="rounded-2xl border border-zinc-200 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold">
                      {c.fornecedorCodigo} · {c.fornecedorNome}
                    </div>
                    <div className="text-xs text-zinc-500">Contrato {c.numero}</div>
                    <div className="text-xs text-zinc-500">{c.objeto}</div>
                    <div className="text-xs text-zinc-500">
                      Serviço {c.servicoCodigo} · {c.servicoDescricao}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} />
                      <StatusPill tone="muted" text={c.situacao} />
                    </div>
                  </div>

                  <div className="w-full max-w-lg">
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>% medido</span>
                      <span className="font-semibold text-zinc-800">{pct(perc)}</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={perc} />
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Total contrato</div>
                        <div className="font-semibold">{brl(c.valorTotal)}</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Valor medido</div>
                        <div className="font-semibold">{brl(c.valorMedido)}</div>
                      </div>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-2">
                        <div className="text-zinc-500">Saldo do contrato</div>
                        <div className="font-semibold">{brl(saldo)}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <PrimaryButton onClick={() => alert("Protótipo: abrir detalhes do contrato")}>Abrir contrato</PrimaryButton>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 rounded-2xl border border-zinc-100 bg-zinc-50 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">Itens do contrato — tabela 549</div>
                      <div className="text-xs text-zinc-500">Código, insumo/serviço, quantidades, medições e saldos</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpanded(c.numero)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-white/70"
                    >
                      {expanded[c.numero] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {expanded[c.numero] ? "Ocultar itens" : "Ver itens"}
                      <span className="text-xs text-zinc-500">({c.itens.length})</span>
                    </button>
                  </div>

                  {expanded[c.numero] ? (
                    <Table
                      columns={[
                        { key: "item", header: "Item" },
                        { key: "servico", header: "Serv./insumo" },
                        { key: "descricao", header: "Descrição" },
                        { key: "unidade", header: "Un." },
                        { key: "quantidade", header: "Qtd contratada", align: "right" },
                        { key: "preco", header: "Preço unit.", align: "right" },
                        { key: "subtotal", header: "Subtotal", align: "right" },
                        { key: "qtdMedida", header: "Qtd medida", align: "right" },
                        { key: "valorMedido", header: "Valor medido", align: "right" },
                        { key: "qtdAMedir", header: "Qtd a medir", align: "right" },
                        { key: "valorAMedir", header: "Valor a medir", align: "right" },
                      ]}
                      rows={c.itens.map((i) => {
                        const subtotal = i.quantidade * i.precoUnitario;
                        const valorMedidoItem = i.quantidadeMedida * i.precoUnitario;
                        const valorAMedirItem = i.quantidadeAMedir * i.precoUnitario;

                        return {
                          item: (
                            <div className="text-sm font-semibold">
                              {i.item}
                              {i.planejamentoItem ? (
                                <div className="text-[11px] font-normal text-zinc-500">Item planejamento {i.planejamentoItem}</div>
                              ) : null}
                            </div>
                          ),
                          servico: (
                            <div>
                              <div className="text-sm font-semibold">{i.servicoCodigo}</div>
                              <div className="text-xs text-zinc-500">{i.servicoDescricao}</div>
                            </div>
                          ),
                          descricao: i.servicoDescricao,
                          unidade: i.unidade,
                          quantidade: formatQtd(i.quantidade),
                          preco: brl(i.precoUnitario),
                          subtotal: brl(subtotal),
                          qtdMedida: formatQtd(i.quantidadeMedida),
                          valorMedido: brl(valorMedidoItem),
                          qtdAMedir: formatQtd(i.quantidadeAMedir),
                          valorAMedir: brl(valorAMedirItem),
                        };
                      })}
                      emptyMessage="Contrato sem itens cadastrados na 549"
                    />
                  ) : null}
                </div>
              </div>
            );
          })}

          {list.length === 0 ? (
            <div className="text-sm text-zinc-500">{loading ? "Carregando dados..." : "Nenhum contrato encontrado."}</div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
