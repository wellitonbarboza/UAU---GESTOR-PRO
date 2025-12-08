import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { useAppStore } from "../../store/useAppStore";
import { isSupabaseEnabled, supabase } from "../../lib/supabaseClient";

export default function Fornecedores() {
  const { companyId } = useAppStore();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fornecedores, setFornecedores] = useState<{ codigo: string; nome: string }[]>([]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseEnabled || !supabase) {
        setError("Configure o Supabase para carregar os fornecedores reais.");
        return;
      }

      if (!companyId) {
        setError("Empresa não encontrada na sessão. Faça login novamente.");
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: supaError } = await supabase
        .from("334-ITENS INSUMOS PROCESSOS")
        .select('"CodFornProc", "Nome_Pes", uau_import_batches!inner(company_id)', { distinct: true })
        .eq("uau_import_batches.company_id", companyId)
        .order("CodFornProc", { ascending: true });

      if (supaError) {
        setError(supaError.message);
        setLoading(false);
        return;
      }

      const unique = new Map<string, { codigo: string; nome: string }>();

      (data ?? []).forEach((row) => {
        const codigo = (row.CodFornProc ?? "").trim();
        const nome = (row.Nome_Pes ?? "").trim();

        if (!codigo || !nome) return;
        if (!unique.has(codigo)) {
          unique.set(codigo, { codigo, nome });
        }
      });

      setFornecedores(Array.from(unique.values()).sort((a, b) => a.codigo.localeCompare(b.codigo)));
      setLoading(false);
    }

    load();
  }, [companyId]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return fornecedores.filter((f) => {
      if (!t) return true;
      return f.codigo.toLowerCase().includes(t) || f.nome.toLowerCase().includes(t);
    });
  }, [fornecedores, q]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
              <Search className="h-4 w-4" />
            </span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código ou nome do fornecedor..."
              className="h-10 w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          {error ? <div className="text-sm text-amber-700">{error}</div> : null}
        </div>
      </div>

      <Card
        title="Fornecedores"
        subtitle="Cadastro vindo do UAU (CodFornProc/Nome_Pes)"
        right={loading ? <div className="text-xs text-zinc-500">Carregando...</div> : null}
      >
        <Table
          columns={[
            { key: "codigo", header: "Código" },
            { key: "nome", header: "Nome" }
          ]}
          rows={list.map((f) => ({ codigo: f.codigo, nome: f.nome }))}
          emptyMessage={
            loading ? "Carregando fornecedores..." : error ? "Não foi possível carregar os fornecedores." : "Nenhum fornecedor encontrado."
          }
        />
      </Card>
    </div>
  );
}
