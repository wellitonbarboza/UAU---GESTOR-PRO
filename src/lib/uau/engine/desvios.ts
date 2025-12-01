export function simularDesvio(orçado: number, incorrido: number, novoCenario: number) {
  const total = incorrido + novoCenario;
  return {
    total,
    desvio_vs_orcado: total - orçado
  };
}
