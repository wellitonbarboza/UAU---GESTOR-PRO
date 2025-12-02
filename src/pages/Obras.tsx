import React from "react";
import Card from "../ui/Card";
import Table from "../ui/Table";
import { PrimaryButton, Input } from "../ui/Controls";
import { useAppStore } from "../store/useAppStore";
import { MOCK_OBRAS } from "../mock/data";
import { cx } from "../lib/format";
import { ArrowRight } from "lucide-react";

export default function Obras() {
  const { obraId, setObraId } = useAppStore();

  return (
    <div className="space-y-4">
      <Card title="Obras cadastradas" subtitle="Cada obra pode ter um arquivo (upload) com as abas exportadas do UAU">
        <Table
          columns={[
            { key: "cc", header: "Centro de custo" },
            { key: "sigla", header: "Sigla" },
            { key: "nome", header: "Obra" },
            { key: "empresa", header: "Empresa" },
            { key: "atualizado", header: "Atualizado" },
            { key: "acao", header: "Ação" }
          ]}
          rows={MOCK_OBRAS.map((o) => ({
            cc: o.centroCusto,
            sigla: o.sigla,
            nome: o.nome,
            empresa: o.empresa ?? "-",
            atualizado: o.atualizadoEm,
            acao: (
              <button
                onClick={() => setObraId(o.id)}
                className={cx(
                  "inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50",
                  o.id === obraId ? "border-zinc-900" : ""
                )}
              >
                Abrir <ArrowRight className="h-4 w-4" />
              </button>
            )
          }))}
        />
      </Card>

      <Card title="Cadastro" subtitle="No app real: cadastro de nova obra e vínculo do upload">
        <div className="grid gap-3 md:grid-cols-4">
          <Input value={""} onChange={() => {}} placeholder="Centro de custo (ex.: 310)" />
          <Input value={""} onChange={() => {}} placeholder="Sigla (ex.: OBR)" />
          <Input value={""} onChange={() => {}} placeholder="Nome da obra" />
          <PrimaryButton onClick={() => alert("Protótipo: salvar obra")}>Salvar</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}
