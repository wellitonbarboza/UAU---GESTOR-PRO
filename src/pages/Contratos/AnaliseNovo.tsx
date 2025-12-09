import React, { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import StatusPill from "../../components/ui/Status";
import { PrimaryButton, Input } from "../../components/ui/Controls";
import { brl } from "../../lib/format";
import { MOCK_CONTRATOS } from "../../mock/data";
import { useAppStore } from "../../store/useAppStore";
import { useCatalogStore } from "../../store/useCatalogStore";

type InsumoOption = { codigo: string; descricao: string };

type ProposalItem = {
  id: string;
  insumo: string;
  unidadeMedida: string;
  quantidade: string;
  valorUnitario: string;
};

type Proposal = {
  id: string;
  fornecedor: string;
  items: ProposalItem[];
};

type EqualizacaoSalva = {
  id: string;
  servico: string;
  criadoEm: string;
  fornecedorSelecionado: { id: string; nome: string; total: number };
  propostas: { id: string; nome: string; total: number; itens: number; items: ProposalItem[] }[];
};

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function AnaliseNovo() {
  const { companyId, obraId } = useAppStore();
  const {
    servicos,
    carregandoServicos,
    servicosErro,
    loadServicos,
    insumos: insumosCadastro,
    carregandoInsumos,
    insumosErro,
    loadInsumos,
  } = useCatalogStore();
  const [servicoBusca, setServicoBusca] = useState("");
  const [insumos, setInsumos] = useState<InsumoOption[]>([]);
  const [propostas, setPropostas] = useState<Proposal[]>([
    {
      id: uid(),
      fornecedor: "",
      items: [{ id: uid(), insumo: "", unidadeMedida: "", quantidade: "", valorUnitario: "" }]
    }
  ]);
  const [analiseSalva, setAnaliseSalva] = useState(false);
  const [resumoVisivel, setResumoVisivel] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<string | null>(null);
  const [selecaoConfirmada, setSelecaoConfirmada] = useState(false);
  const [equalizacoes, setEqualizacoes] = useState<EqualizacaoSalva[]>([]);
  const [visualizacaoCompacta, setVisualizacaoCompacta] = useState(false);
  const [ultimaEqualizacaoId, setUltimaEqualizacaoId] = useState<string | null>(null);
  const [equalizacaoEditandoId, setEqualizacaoEditandoId] = useState<string | null>(null);

  const existentes = useMemo(() => {
    return MOCK_CONTRATOS.filter((c) => (c.servicoDescricao || "").toUpperCase().includes(servicoBusca.toUpperCase()));
  }, [servicoBusca]);

  useEffect(() => {
    loadServicos(companyId, obraId || null);
  }, [companyId, obraId, loadServicos]);

  useEffect(() => {
    loadInsumos(companyId, obraId || null);
  }, [companyId, obraId, loadInsumos]);

  useEffect(() => {
    const unique = new Map<string, InsumoOption>();

    insumosCadastro.forEach((item) => {
      const codigo = item.codigo?.trim();
      if (!codigo || unique.has(codigo)) return;
      unique.set(codigo, { codigo, descricao: item.descricao });
    });

    setInsumos(Array.from(unique.values()));
  }, [insumosCadastro]);

  const sugestoesServico = useMemo(() => {
    const termo = servicoBusca.trim().toLowerCase();
    const base = servicos.map((row) => ({
      label: [row.item, row.servico, row.descricao].filter(Boolean).join(" · "),
      texto: `${row.item ?? ""} ${row.servico ?? ""} ${row.descricao ?? ""}`.toLowerCase()
    }));

    if (!termo) return base.slice(0, 20);

    return base.filter((r) => r.texto.includes(termo)).slice(0, 20);
  }, [servicoBusca, servicos]);

  const propostaTotais = useMemo(() => {
    return propostas.map((p) =>
      p.items.reduce((total, item) => total + calcularTotalItem(item.quantidade, item.valorUnitario), 0)
    );
  }, [propostas]);

  const resumoFornecedores = useMemo(
    () => propostas.map((p, idx) => ({ ...p, total: propostaTotais[idx] ?? 0 })),
    [propostaTotais, propostas]
  );

  useEffect(() => {
    if (!analiseSalva || fornecedorSelecionado) return;

    const menor = resumoFornecedores.reduce<{ id: string; total: number } | null>((prev, curr) => {
      if (!prev) return { id: curr.id, total: curr.total };
      return curr.total < prev.total ? { id: curr.id, total: curr.total } : prev;
    }, null);

    if (menor) setFornecedorSelecionado(menor.id);
  }, [analiseSalva, fornecedorSelecionado, resumoFornecedores]);

  const handleSalvarAnalise = () => {
    if (analiseSalva && selecaoConfirmada && fornecedorSelecionado) {
      const fornecedorAtual = resumoFornecedores.find((p) => p.id === fornecedorSelecionado);

      if (fornecedorAtual) {
        const propostasSnapshot = propostas.map((p, idx) => ({
          id: p.id,
          nome: p.fornecedor?.trim() || `Fornecedor ${idx + 1}`,
          total: propostaTotais[idx] ?? 0,
          itens: p.items.length,
          items: p.items.map((item) => ({ ...item }))
        }));

        const novaEqualizacao: EqualizacaoSalva = {
          id: equalizacaoEditandoId ?? uid(),
          servico: servicoBusca?.trim() || "Serviço sem título",
          criadoEm: new Date().toISOString(),
          fornecedorSelecionado: {
            id: fornecedorAtual.id,
            nome: rotuloFornecedor(resumoFornecedores, fornecedorAtual.id),
            total: fornecedorAtual.total
          },
          propostas: propostasSnapshot
        };

        setEqualizacoes((prev) => {
          if (equalizacaoEditandoId) {
            return prev.map((eq) => (eq.id === equalizacaoEditandoId ? novaEqualizacao : eq));
          }
          return [novaEqualizacao, ...prev];
        });

        setUltimaEqualizacaoId(novaEqualizacao.id);
        setVisualizacaoCompacta(true);
        setEqualizacaoEditandoId(null);
      }
    } else {
      setVisualizacaoCompacta(false);
    }

    setAnaliseSalva(true);
    setResumoVisivel(true);
    setSelecaoConfirmada(false);
  };

  const handleEditarAnalise = () => {
    setAnaliseSalva(false);
    setResumoVisivel(false);
    setSelecaoConfirmada(false);
    setVisualizacaoCompacta(false);
    setEqualizacaoEditandoId(null);
  };

  const handleSalvarSelecao = () => {
    setSelecaoConfirmada(true);
  };

  const handleEditarEqualizacao = (eq: EqualizacaoSalva) => {
    setServicoBusca(eq.servico);
    setPropostas(
      eq.propostas.map((p) => ({
        id: p.id,
        fornecedor: p.nome,
        items: p.items.map((item) => ({ ...item }))
      }))
    );
    setAnaliseSalva(true);
    setResumoVisivel(true);
    setFornecedorSelecionado(eq.fornecedorSelecionado.id);
    setSelecaoConfirmada(true);
    setVisualizacaoCompacta(false);
    setEqualizacaoEditandoId(eq.id);
    setUltimaEqualizacaoId(eq.id);
  };

  const handleExcluirEqualizacao = (id: string) => {
    setEqualizacoes((prev) => prev.filter((eq) => eq.id !== id));

    if (ultimaEqualizacaoId === id) {
      setUltimaEqualizacaoId(null);
      setVisualizacaoCompacta(false);
      setAnaliseSalva(false);
      setResumoVisivel(false);
      setSelecaoConfirmada(false);
      setFornecedorSelecionado(null);
      setEqualizacaoEditandoId(null);
    }
  };

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
                  : servicos.length > 0
                  ? `${servicos.length} itens disponíveis para busca.`
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
              {!visualizacaoCompacta ? (
                <PrimaryButton onClick={() => adicionarFornecedor(setPropostas)}>
                  Adicionar fornecedor
                </PrimaryButton>
              ) : null}
            </div>

            {visualizacaoCompacta ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-zinc-900">Propostas salvas</div>
                    <div className="text-xs text-zinc-600">
                      As informações de fornecedores e itens foram recolhidas. Use o card de equalização abaixo para revisar ou
                      editar a seleção.
                    </div>
                  </div>
                  <PrimaryButton onClick={() => setVisualizacaoCompacta(false)}>Reabrir propostas</PrimaryButton>
                </div>
              </div>
            ) : (
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
                          className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-3 md:grid-cols-6 md:items-end"
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
                            <label className="text-xs font-semibold text-zinc-700">Unidade de medida</label>
                            <Input
                              value={item.unidadeMedida}
                              onChange={(v) =>
                                atualizarItem(setPropostas, proposta.id, item.id, { unidadeMedida: v })
                              }
                              placeholder="m², un, kg..."
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
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-3">
            {analiseSalva ? (
              <button
                type="button"
                onClick={handleEditarAnalise}
                className="h-10 rounded-2xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
              >
                Editar análise
              </button>
            ) : null}
            <PrimaryButton onClick={handleSalvarAnalise}>
              {analiseSalva ? "Salvar novamente" : "Salvar análise"}
            </PrimaryButton>
            {analiseSalva ? (
              <button
                type="button"
                onClick={() => setResumoVisivel((prev) => !prev)}
                className="h-10 rounded-2xl border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 hover:border-zinc-400"
              >
                {resumoVisivel ? "Ocultar resumo" : "Resumir análise"}
              </button>
            ) : null}
          </div>

          {resumoVisivel ? (
            <div className="mt-4 space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">Resumo dos fornecedores</div>
                  <div className="text-xs text-zinc-600">
                    Revise cada proposta, escolha o fornecedor e salve essa seleção na análise.
                  </div>
                </div>
                {selecaoConfirmada && fornecedorSelecionado ? (
                  <div className="text-xs font-semibold text-emerald-700">
                    Seleção salva: {rotuloFornecedor(resumoFornecedores, fornecedorSelecionado)}
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                {resumoFornecedores.map((p) => (
                  <label
                    key={p.id}
                    className="flex flex-col gap-1 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 hover:border-zinc-300 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex flex-1 items-start gap-3">
                      <input
                        type="radio"
                        className="mt-1 h-4 w-4 border-zinc-300 text-zinc-900 focus:ring-zinc-400"
                        checked={fornecedorSelecionado === p.id}
                        onChange={() => {
                          setFornecedorSelecionado(p.id);
                          setSelecaoConfirmada(false);
                        }}
                      />
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-zinc-900">
                          {p.fornecedor?.trim() || "Fornecedor sem identificação"}
                        </div>
                        <div className="text-xs text-zinc-600">
                          {p.items.length} item(s) orçados · Total da proposta {brl(p.total)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-zinc-800">{brl(p.total)}</div>
                  </label>
                ))}
              </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-zinc-600">
                {fornecedorSelecionado
                  ? `O fornecedor selecionado será salvo na proposta criada.`
                  : "Escolha um fornecedor para registrar na proposta."}
              </div>
              <PrimaryButton disabled={!fornecedorSelecionado} onClick={handleSalvarSelecao}>
                Salvar seleção do fornecedor
              </PrimaryButton>
            </div>
          </div>
        ) : null}
      </div>
    </Card>

    <Card
      title="Equalização"
      subtitle="Histórico das opções salvas na análise, mostrando o fornecedor escolhido e os totais das propostas"
    >
      {equalizacoes.length === 0 ? (
        <div className="text-sm text-zinc-600">
          Após selecionar o fornecedor e salvar novamente a análise, a equalização ficará registrada aqui como um card.
        </div>
      ) : (
        <div className="space-y-3">
          {equalizacoes.map((eq) => (
            <div key={eq.id} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm font-semibold text-zinc-900">{eq.servico}</div>
                  <div className="text-xs text-zinc-500">Equalização salva em {formatarData(eq.criadoEm)}</div>
                </div>
                <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
                    {eq.fornecedorSelecionado.nome} — {brl(eq.fornecedorSelecionado.total)} (selecionado)
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditarEqualizacao(eq)}
                      className="h-9 rounded-2xl border border-zinc-300 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Editar equalização
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExcluirEqualizacao(eq.id)}
                      className="h-9 rounded-2xl border border-red-200 px-3 text-xs font-semibold text-red-700 hover:bg-red-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {eq.propostas.map((p) => {
                  const selecionado = p.id === eq.fornecedorSelecionado.id;
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-3 ${
                        selecionado ? "border-emerald-300 bg-emerald-50" : "border-zinc-200 bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-zinc-900">{p.nome}</div>
                          <div className="text-xs text-zinc-600">{p.itens} item(s) · {brl(p.total)}</div>
                        </div>
                        {selecionado ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                            Escolhido
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
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

function adicionarFornecedor(setPropostas: React.Dispatch<React.SetStateAction<Proposal[]>>) {
  setPropostas((prev) => [
    ...prev,
    { id: uid(), fornecedor: "", items: [{ id: uid(), insumo: "", unidadeMedida: "", quantidade: "", valorUnitario: "" }] }
  ]);
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
        ? { ...p, items: [...p.items, { id: uid(), insumo: "", unidadeMedida: "", quantidade: "", valorUnitario: "" }] }
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

function rotuloFornecedor(propostas: { id: string; fornecedor: string; total: number }[], id: string) {
  const alvo = propostas.find((p) => p.id === id);
  if (!alvo) return "Fornecedor selecionado";
  return alvo.fornecedor?.trim() || `Fornecedor ${propostas.indexOf(alvo) + 1}`;
}

function formatarData(valor: string) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
