export interface CatServico {
  codigo_servico?: string;
  orcado?: number;
  orcado_incc?: number;
  custo_termino?: number;
}

export function consolidarCat(cat: CatServico[]) {
  return cat.reduce(
    (acc, item) => {
      acc.orcado += item.orcado || 0;
      acc.orcado_incc += item.orcado_incc || 0;
      acc.custo_termino += item.custo_termino || 0;
      return acc;
    },
    { orcado: 0, orcado_incc: 0, custo_termino: 0 }
  );
}
