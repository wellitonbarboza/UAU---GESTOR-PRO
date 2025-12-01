import { ProcessoFinanceiro } from '../canonicalize';

export type { ProcessoFinanceiro };

export function calcularIncorrido(processos: ProcessoFinanceiro[]) {
  return processos.reduce((sum, p) => sum + (p.valor || 0), 0);
}
