import { ProcessoFinanceiro } from './incorrido';

export function processosSemContrato(processos: ProcessoFinanceiro[]) {
  return processos.filter((p) => !p.contrato);
}
