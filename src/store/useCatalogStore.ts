import { create } from "zustand";
import { isSupabaseEnabled, supabase } from "../lib/supabaseClient";
import { fetchAllSupabasePages } from "../lib/supabasePagination";
import { MOCK_CONTRATOS, MOCK_INSUMOS } from "../data/mock";

export type FornecedorCadastro = { codigo: string; nome: string };

export type InsumoCadastro = {
  codigo: string;
  descricao: string;
  un: string | null;
  cod_cat: string | null;
  desc_cat: string | null;
};

export type ServicoPlanejado = {
  item: string | null;
  servico: string | null;
  descricao: string | null;
};

type CatalogState = {
  fornecedores: FornecedorCadastro[];
  insumos: InsumoCadastro[];
  servicos: ServicoPlanejado[];
  carregandoFornecedores: boolean;
  carregandoInsumos: boolean;
  carregandoServicos: boolean;
  fornecedoresErro: string | null;
  insumosErro: string | null;
  servicosErro: string | null;
  loadFornecedores: (companyId: string | null) => Promise<void>;
  loadInsumos: (companyId: string | null, obraId: string | null) => Promise<void>;
  loadServicos: (companyId: string | null, obraId: string | null) => Promise<void>;
};

export const useCatalogStore = create<CatalogState>((set) => ({
  fornecedores: [],
  insumos: [],
  servicos: [],
  carregandoFornecedores: false,
  carregandoInsumos: false,
  carregandoServicos: false,
  fornecedoresErro: null,
  insumosErro: null,
  servicosErro: null,

  async loadFornecedores(companyId) {
    set({ carregandoFornecedores: true, fornecedoresErro: null });

    if (!companyId) {
      set({ fornecedoresErro: "Empresa não encontrada na sessão.", carregandoFornecedores: false, fornecedores: [] });
      return;
    }

    if (!isSupabaseEnabled || !supabase) {
      const unique = new Map<string, FornecedorCadastro>();

      MOCK_CONTRATOS.forEach((c) => {
        const key = `${c.fornecedorCodigo}|${c.fornecedorNome}`;
        if (!unique.has(key)) {
          unique.set(key, { codigo: c.fornecedorCodigo, nome: c.fornecedorNome });
        }
      });

      set({ fornecedores: Array.from(unique.values()), carregandoFornecedores: false });
      return;
    }

    const client = supabase!;

    try {
      const data = await fetchAllSupabasePages<{ CodFornProc: string; Nome_Pes: string }>((from, to) =>
        client
          .from("334-ITENS INSUMOS PROCESSOS")
          .select('\"CodFornProc\", \"Nome_Pes\", uau_import_batches!inner(company_id)')
          .eq("uau_import_batches.company_id", companyId)
          .order("CodFornProc", { ascending: true })
          .range(from, to)
      );

      const unique = new Map<string, FornecedorCadastro>();
      const seenCodes = new Set<string>();
      const seenNames = new Set<string>();

      (data ?? []).forEach((row) => {
        const codigo = (row.CodFornProc ?? "").trim();
        const nome = (row.Nome_Pes ?? "").trim();

        if (!codigo || !nome) return;
        if (seenCodes.has(codigo) || seenNames.has(nome)) return;

        seenCodes.add(codigo);
        seenNames.add(nome);
        unique.set(`${codigo}|${nome}`, { codigo, nome });
      });

      set({ fornecedores: Array.from(unique.values()).sort((a, b) => a.codigo.localeCompare(b.codigo)) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao carregar fornecedores.";
      set({ fornecedoresErro: msg });
    }

    set({ carregandoFornecedores: false });
  },

  async loadInsumos(companyId, obraId) {
    set({ carregandoInsumos: true, insumosErro: null });

    if (!companyId) {
      set({ insumosErro: "Empresa não encontrada na sessão.", carregandoInsumos: false, insumos: [] });
      return;
    }

    if (!isSupabaseEnabled || !supabase) {
      set({ insumos: MOCK_INSUMOS.map((i) => ({
        codigo: i.codigo,
        descricao: i.descricao,
        un: i.und ?? null,
        cod_cat: i.categoria ?? null,
        desc_cat: i.categoria ?? null,
      })), carregandoInsumos: false });
      return;
    }

    const client = supabase!;

    try {
      const catalogRows = await fetchAllSupabasePages<
        { codigo: string; descricao: string; un: string | null; cod_cat: string | null; desc_cat: string | null }
      >((from, to) =>
        client
          .from("insumos")
          .select("codigo, descricao, un, cod_cat, desc_cat")
          .eq("company_id", companyId)
          .order("codigo", { ascending: true })
          .range(from, to)
      );

      const unique = new Map<string, InsumoCadastro>();

      catalogRows.forEach((item) => {
        const codigo = item.codigo?.trim();
        if (!codigo || unique.has(codigo)) return;
        unique.set(codigo, {
          codigo,
          descricao: item.descricao,
          un: item.un,
          cod_cat: item.cod_cat,
          desc_cat: item.desc_cat,
        });
      });

      let mapped = Array.from(unique.values());

      if (mapped.length === 0 && obraId) {
        const legacyRows = await fetchAllSupabasePages<
          { "CodInsProcItem": string; "DescrItens": string; "UnidProcItem": string | null; "CategItens": string | null; "Desc_CGer": string | null; uau_import_batches: { company_id: string }[] }
        >((from, to) =>
          client
            .from("334-ITENS INSUMOS PROCESSOS")
            .select('\"CodInsProcItem\", \"DescrItens\", \"UnidProcItem\", \"CategItens\", \"Desc_CGer\", uau_import_batches!inner(company_id)')
            .eq("uau_import_batches.company_id", companyId)
            .eq("uau_import_batches.obra_id", obraId)
            .order("CodInsProcItem", { ascending: true })
            .range(from, to)
        );

        const legacyUnique = new Map<string, InsumoCadastro>();

        legacyRows.forEach((item) => {
          const codigo = item["CodInsProcItem"]?.trim();
          if (!codigo || legacyUnique.has(codigo)) return;
          legacyUnique.set(codigo, {
            codigo,
            descricao: item["DescrItens"],
            un: item["UnidProcItem"],
            cod_cat: item["CategItens"],
            desc_cat: item["Desc_CGer"],
          });
        });

        mapped = Array.from(legacyUnique.values());
      }

      if (mapped.length === 0) {
        set({ insumosErro: "Nenhum insumo encontrado no catálogo ou na importação desta obra." });
      }

      set({ insumos: mapped });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao carregar insumos.";
      set({ insumosErro: msg });
    }

    set({ carregandoInsumos: false });
  },

  async loadServicos(companyId, obraId) {
    set({ carregandoServicos: true, servicosErro: null });

    if (!companyId) {
      set({ servicosErro: "Empresa não encontrada na sessão.", carregandoServicos: false, servicos: [] });
      return;
    }

    if (!isSupabaseEnabled || !supabase) {
      const unique = new Map<string, ServicoPlanejado>();

      MOCK_CONTRATOS.forEach((c) => {
        const key = `${c.servicoCodigo ?? ""}|${c.servicoDescricao ?? ""}`;
        if (!unique.has(key)) {
          unique.set(key, {
            item: c.servicoCodigo ?? null,
            servico: c.servicoDescricao ?? null,
            descricao: c.objeto ?? c.servicoDescricao ?? null,
          });
        }
      });

      set({ servicos: Array.from(unique.values()), carregandoServicos: false });
      return;
    }

    const client = supabase!;

    try {
      const rows = await fetchAllSupabasePages<
        { ItemPl: string | null; "ServiçoPl": string | null; "DescriçãoItem": string | null; uau_import_batches: { company_id: string }[] }
      >((from, to) => {
        const query = client
          .from("223-PLANEJ.CONTRA.INSUMOS")
          .select('\"ItemPl\", \"ServiçoPl\", \"DescriçãoItem\", uau_import_batches!inner(company_id)')
          .eq("uau_import_batches.company_id", companyId)
          .range(from, to);

        if (obraId) {
          query.eq("obra_id", obraId);
        }

        return query;
      });

      const unique = new Map<string, ServicoPlanejado>();

      rows.forEach((row) => {
        const key = `${row.ItemPl ?? ""}|${row["ServiçoPl"] ?? ""}|${row["DescriçãoItem"] ?? ""}`.trim();
        if (!key || unique.has(key)) return;

        unique.set(key, { item: row.ItemPl, servico: row["ServiçoPl"], descricao: row["DescriçãoItem"] });
      });

      set({ servicos: Array.from(unique.values()) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível carregar os serviços.";
      set({ servicosErro: msg });
    }

    set({ carregandoServicos: false });
  },
}));
