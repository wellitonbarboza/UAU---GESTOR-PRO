import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import StatusPill from "../../components/ui/Status";
import { PrimaryButton, Input } from "../../components/ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";
import { isSupabaseEnabled, supabase } from "../../lib/supabaseClient";
import { fetchAllSupabasePages } from "../../lib/supabasePagination";
import { useAppStore } from "../../store/useAppStore";

type PlanejamentoRow = {
  ItemPl: string | null;
  "ServiçoPl": string | null;
  "DescriçãoItem": string | null;
};

type InsumoOption = { codigo: string; descricao: string };

type ProposalItem = {
  id: string;
  insumo: string;
  quantidade: string;
  valorUnitario: string;
};

type Proposal = {
  id: string;
  fornecedor: string;
  items: ProposalItem[];
};

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function AnaliseNovo() {
  const { companyId, obraId } = useAppStore();
  const [servicoBusca, setServicoBusca] = useState("");
  const [servicosPlanejados, setServicosPlanejados] = useState<PlanejamentoRow[]>([]);
  const [servicosErro, setServicosErro] = useState<string | null>(null);
  const [carregandoServicos, setCarregandoServicos] = useState(false);
  const [insumos, setInsumos] = useState<InsumoOption[]>([]);
  const [insumosErro, setInsumosErro] = useState<string | null>(null);
  const [carregandoInsumos, setCarregandoInsumos] = useState(false);
  const [propostas, setPropostas] = useState<Proposal[]>([
    { id: uid(), fornecedor: "", items: [{ id: uid(), insumo: "", quantidade: "", valorUnitario: "" }] }
  ]);

  const existentes = useMemo(() => {
    return MOCK_CONTRATOS.filter((c) => (c.servicoDescricao || "").toUpperCase().includes(servicoBusca.toUpperCase()));
  }, [servicoBusca]);

  useEffect(() => {
    async function carregarServicos() {
      if (!isSupabaseEnabled || !supabase) {
        setServicosErro("Configure o Supabase para pesquisar serviços reais.");
        return;
      }

      if (!companyId) {
        setServicosErro("Empresa não encontrada na sessão. Faça login novamente.");
        return;
      }

      setCarregandoServicos(true);
      setServicosErro(null);

      try {
        const rows = await fetchAllSupabasePages<PlanejamentoRow & { uau_import_batches: { company_id: string } }>((from, to) => {
          const query = supabase
            .from("223-PLANEJ.CONTRA.INSUMOS")
            .select('"ItemPl", "ServiçoPl", "DescriçãoItem", uau_import_batches!inner(company_id)')
            .eq("uau_import_batches.company_id", companyId)
            .range(from, to);

          if (obraId) {
            query.eq("obra_id", obraId);
          }

          return query;
        });

        const unique = new Map<string, PlanejamentoRow>();

        rows.forEach((row) => {
          const key = `${row.ItemPl ?? ""}|${row["ServiçoPl"] ?? ""}|${row["DescriçãoItem"] ?? ""}`.trim();
          if (!key) return;
          if (unique.has(key)) return;
          unique.set(key, row);
        });

        setServicosPlanejados(Array.from(unique.values()));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Não foi possível carregar os serviços.";
        setServicosErro(msg);
      }

      setCarregandoServicos(false);
    }

    carregarServicos();
  }, [companyId, obraId]);

  useEffect(() => {
    async function carregarInsumos() {
      if (!isSupabaseEnabled || !supabase) {
        setInsumosErro("Configure o Supabase para consultar o catálogo de insumos.");
        return;
      }

      if (!companyId) {
        setInsumosErro("Empresa não encontrada na sessão. Faça login novamente.");
        return;
      }

      setCarregandoInsumos(true);
      setInsumosErro(null);

      try {
        const catalogRows = await fetchAllSupabasePages<{ codigo: string; descricao: string; uau_import_batches?: { company_id: string } }>(
          (from, to) =>
            supabase
              .from("insumos")
              .select("codigo, descricao, uau_import_batches!inner(company_id)")
              .eq("uau_import_batches.company_id", companyId)
              .order("codigo", { ascending: true })
              .range(from, to)
        );

        const unique = new Map<string, InsumoOption>();

        catalogRows.forEach((item) => {
          const codigo = item.codigo?.trim();
          if (!codigo || unique.has(codigo)) return;
          unique.set(codigo, { codigo, descricao: item.descricao });
        });

        if (unique.size === 0 && obraId) {
          const legacyRows = await fetchAllSupabasePages<
            { "CodInsProcItem": string; "DescrItens": string; uau_import_batches: { company_id: string } }
          >((from, to) =>
            supabase
              .from("334-ITENS INSUMOS PROCESSOS")
              .select('"CodInsProcItem", "DescrItens", uau_import_batches!inner(company_id)')
              .eq("uau_import_batches.company_id", companyId)
              .eq("obra_id", obraId)
              .order("CodInsProcItem", { ascending: true })
              .range(from, to)
          );

          legacyRows.forEach((item) => {
            const codigo = item["CodInsProcItem"]?.trim();
            if (!codigo || unique.has(codigo)) return;
            unique.set(codigo, { codigo, descricao: item["DescrItens"] });
          });
        }

        if (unique.size === 0) {
          setInsumosErro("Nenhum insumo encontrado para pesquisar.");
        }

        setInsumos(Array.from(unique.values()));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Não foi possível carregar os insumos.";
        setInsumosErro(msg);
      }

      setCarregandoInsumos(false);
    }

    carregarInsumos();
  }, [companyId, obraId]);

  const sugestoesServico = useMemo(() => {
    const termo = servicoBusca.trim().toLowerCase();
    const base = servicosPlanejados.map((row) => ({
      label: [row.ItemPl, row["ServiçoPl"], row["DescriçãoItem"]].filter(Boolean).join(" · "),
      texto: `${row.ItemPl ?? ""} ${row["ServiçoPl"] ?? ""} ${row["DescriçãoItem"] ?? ""}`.toLowerCase()
    }));

    if (!termo) return base.slice(0, 20);

    return base.filter((r) => r.texto.includes(termo)).slice(0, 20);
  }, [servicoBusca, servicosPlanejados]);

  const propostaTotais = useMemo(() => {
    return propostas.map((p) =>
      p.items.reduce((total, item) => total + calcularTotalItem(item.quantidade, item.valorUnitario), 0)
    );
  }, [propostas]);

  const panorama = useMemo(() => {
    const orcado = 188000;
    const incc = 201500;
    const cat = 215000;

    const incorridoExistente = existentes.reduce((s, c) => s + c.valorPago + c.valorAPagar, 0);
    const novo = propostaTotais.reduce((s, t) => s + t, 0);

    const total = incorridoExistente + novo;
    const desvio = total - incc;

    return { orcado, incc, cat, incorridoExistente, novo, total, desvio };
  }, [existentes, propostaTotais]);

  return (
    <div className="space-y-4">
      <Card title="Análise — Novo contrato" subtitle="Comparar com contratos existentes, incorrido e orçamento (INCC/CAT)">
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="w-full md:max-w-2xl">
                <label className="text-sm font-semibold text-zinc-900">Serviço / Categoria</label>
                <input
                  value={servicoBusca}
                  onChange={(e) => setServicoBusca(e.target.value)}
                  list="servicos-planejamento"
                  placeholder="Pesquise por ItemPl, ServiçoPl ou Descrição do item"
                  className="mt-1 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                />
                <datalist id="servicos-planejamento">
                  {sugestoesServico.map((s, idx) => (
                    <option key={`${s.label}-${idx}`} value={s.label} />
                  ))}
                </datalist>
              </div>
              <div className="text-xs text-zinc-500">
                {carregandoServicos
                  ? "Carregando serviços do Supabase..."
                  : servicosErro
                  ? servicosErro
                  : servicosPlanejados.length > 0
                  ? `${servicosPlanejados.length} itens disponíveis para busca.`
                  : "Nenhum serviço encontrado."}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-900">Propostas e fornecedores</div>
                <div className="text-xs text-zinc-500">
                  Cadastre cada fornecedor e inclua os itens/insumos cotados. Use a busca por código ou descrição para vincular ao
                  catálogo de insumos.
                </div>
              </div>
              <PrimaryButton onClick={() => adicionarFornecedor(setPropostas)}>
                Adicionar fornecedor
              </PrimaryButton>
            </div>

            <div className="space-y-4">
              {propostas.map((proposta, idx) => (
                <div key={proposta.id} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <label className="text-sm font-semibold text-zinc-900">Fornecedor</label>
                      <Input
                        value={proposta.fornecedor}
                        onChange={(v) => atualizarFornecedor(setPropostas, proposta.id, v)}
                        placeholder="Nome do fornecedor da proposta"
                      />
                    </div>
                    <div className="text-sm font-semibold text-zinc-800">
                      Total da proposta: {brl(propostaTotais[idx] ?? 0)}
                    </div>
                  </div>

                  <div className="mt-3 space-y-3">
                    {proposta.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 md:grid-cols-5 md:items-end"
                      >
                        <div className="md:col-span-2">
                          <label className="text-xs font-semibold text-zinc-700">Item/insumo cotado</label>
                          <input
                            value={item.insumo}
                            onChange={(e) => atualizarItem(setPropostas, proposta.id, item.id, { insumo: e.target.value })}
                            list="insumos-catalogo"
                            placeholder="Busque pelo nome ou código"
                            className="mt-1 h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Quantidade</label>
                          <Input
                            value={item.quantidade}
                            onChange={(v) => atualizarItem(setPropostas, proposta.id, item.id, { quantidade: v })}
                            placeholder="0"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Valor unitário</label>
                          <Input
                            value={item.valorUnitario}
                            onChange={(v) => atualizarItem(setPropostas, proposta.id, item.id, { valorUnitario: v })}
                            placeholder="0,00"
                            type="number"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-zinc-700">Subtotal</label>
                          <div className="mt-1 h-10 rounded-2xl border border-zinc-200 bg-zinc-100 px-3 text-sm leading-10 text-zinc-900">
                            {brl(calcularTotalItem(item.quantidade, item.valorUnitario))}
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => adicionarItem(setPropostas, proposta.id)}
                      className="inline-flex items-center rounded-2xl border border-dashed border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 hover:border-zinc-400"
                    >
                      + Adicionar item
                    </button>
                  </div>
                </div>
              ))}

              <datalist id="insumos-catalogo">
                {insumos.slice(0, 200).map((i) => (
                  <option key={i.codigo} value={`${i.codigo} · ${i.descricao}`} />
                ))}
              </datalist>

              <div className="text-xs text-zinc-500">
                {carregandoInsumos
                  ? "Carregando insumos para vincular..."
                  : insumosErro
                  ? insumosErro
                  : insumos.length > 0
                  ? `${insumos.length} insumos disponíveis para seleção.`
                  : "Nenhum insumo encontrado."}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-6">
            <Resumo label="Orçado" value={brl(panorama.orcado)} />
            <Resumo label="Orçado INCC" value={brl(panorama.incc)} />
            <Resumo label="CAT" value={brl(panorama.cat)} />
            <Resumo label="Incorrido existente" value={brl(panorama.incorridoExistente)} />
            <Resumo label="Novo contrato" value={brl(panorama.novo)} />
            <Resumo
              label="Desvio vs INCC"
              value={brl(panorama.desvio)}
              tone={panorama.desvio <= 0 ? "ok" : "warn"}
            />
          </div>

          <div className="mt-4 flex justify-end">
            <PrimaryButton onClick={() => alert("Protótipo: salvar análise no histórico")}>Salvar análise</PrimaryButton>
          </div>
        </div>
      </Card>

      <Card title="Contratos existentes na categoria" subtitle="O que já está vigente/finalizado (para evitar duplicidade e enxergar incorrido)">
        <Table
          columns={[
            { key: "numero", header: "Contrato" },
            { key: "fornecedor", header: "Fornecedor" },
            { key: "status", header: "Status" },
            { key: "total", header: "Total", align: "right" },
            { key: "medido", header: "Medido", align: "right" },
            { key: "incorrido", header: "Incorrido", align: "right" }
          ]}
          rows={existentes.map((c) => ({
            numero: c.numero,
            fornecedor: `${c.fornecedorCodigo} · ${c.fornecedorNome}`,
            status: <StatusPill tone={c.status === "VIGENTE" ? "ok" : "muted"} text={c.status} />,
            total: brl(c.valorTotal),
            medido: brl(c.valorMedido),
            incorrido: brl(c.valorPago + c.valorAPagar)
          }))}
        />
      </Card>
    </div>
  );
}

function Resumo({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${tone === "warn" ? "text-amber-900" : tone === "ok" ? "text-emerald-800" : "text-zinc-900"}`}>
        {value}
      </div>
    </div>
  );
}

function adicionarFornecedor(setPropostas: React.Dispatch<React.SetStateAction<Proposal[]>>) {
  setPropostas((prev) => [...prev, { id: uid(), fornecedor: "", items: [{ id: uid(), insumo: "", quantidade: "", valorUnitario: "" }] }]);
}

function atualizarFornecedor(
  setPropostas: React.Dispatch<React.SetStateAction<Proposal[]>>,
  id: string,
  fornecedor: string
) {
  setPropostas((prev) => prev.map((p) => (p.id === id ? { ...p, fornecedor } : p)));
}

function adicionarItem(setPropostas: React.Dispatch<React.SetStateAction<Proposal[]>>, propostaId: string) {
  setPropostas((prev) =>
    prev.map((p) =>
      p.id === propostaId
        ? { ...p, items: [...p.items, { id: uid(), insumo: "", quantidade: "", valorUnitario: "" }] }
        : p
    )
  );
}

function atualizarItem(
  setPropostas: React.Dispatch<React.SetStateAction<Proposal[]>>,
  propostaId: string,
  itemId: string,
  patch: Partial<ProposalItem>
) {
  setPropostas((prev) =>
    prev.map((p) =>
      p.id === propostaId
        ? { ...p, items: p.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)) }
        : p
    )
  );
}

function calcularTotalItem(quantidade: string, valorUnitario: string) {
  const q = parseNumero(quantidade);
  const v = parseNumero(valorUnitario);
  return q * v;
}

function parseNumero(valor: string) {
  if (!valor) return 0;
  const normalizado = valor.replace(/\./g, "").replace(/,/g, ".");
  const n = Number(normalizado);
  return Number.isFinite(n) ? n : 0;
}
