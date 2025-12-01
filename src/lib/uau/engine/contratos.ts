interface ContratoItem {
  contrato: string;
  valor_total: number;
  valor_medido: number;
}

export function percentualMedido(item: ContratoItem) {
  if (!item.valor_total) return 0;
  return Math.min(1, item.valor_medido / item.valor_total);
}

export function saldoContrato(item: ContratoItem) {
  return Math.max(0, item.valor_total - item.valor_medido);
}
