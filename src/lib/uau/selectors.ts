import { CanonicalData } from './canonicalize';

export function contratosPorFornecedor(data: CanonicalData, fornecedorId: string) {
  return Object.entries(data.contratos)
    .filter(([, contrato]) => contrato.fornecedor === fornecedorId)
    .map(([id, contrato]) => ({ id, ...contrato }));
}

export function processosPorContrato(data: CanonicalData, contratoId: string) {
  return data.processos.filter((p) => p.contrato && String(p.contrato) === contratoId);
}
