export interface ProcessoFinanceiro {
  processo?: string | number;
  fornecedor?: string;
  valor?: number;
  contrato?: string | number;
}

export function calcularIncorrido(processos: ProcessoFinanceiro[]) {
  return processos.reduce((sum, p) => sum + (p.valor || 0), 0);
}
