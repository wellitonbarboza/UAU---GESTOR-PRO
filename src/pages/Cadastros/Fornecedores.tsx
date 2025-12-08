import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";
import { useAppStore } from "../../store/useAppStore";
import { useCatalogStore } from "../../store/useCatalogStore";

export default function Fornecedores() {
  const { companyId } = useAppStore();
  const { fornecedores, carregandoFornecedores, fornecedoresErro, loadFornecedores } = useCatalogStore();
  const [q, setQ] = useState("");

  useEffect(() => {
    loadFornecedores(companyId);
  }, [companyId, loadFornecedores]);

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
          {fornecedoresErro ? <div className="text-sm text-amber-700">{fornecedoresErro}</div> : null}
        </div>
      </div>

      <Card
        title="Fornecedores"
        subtitle="Cadastro vindo do UAU (CodFornProc/Nome_Pes)"
        right={carregandoFornecedores ? <div className="text-xs text-zinc-500">Carregando...</div> : null}
      >
        <Table
          columns={[
            { key: "codigo", header: "Código" },
            { key: "nome", header: "Nome" }
          ]}
          rows={list.map((f) => ({ codigo: f.codigo, nome: f.nome }))}
          emptyMessage={
            carregandoFornecedores
              ? "Carregando fornecedores..."
              : fornecedoresErro
              ? "Não foi possível carregar os fornecedores."
              : "Nenhum fornecedor encontrado."
          }
        />
      </Card>
    </div>
  );
}
