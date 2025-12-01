import { ImportResult } from './importer';
import { SheetKey } from './sheetMap';

export interface CanonicalData {
  fornecedores: Record<string, string>;
  contratos: Record<string, { fornecedor?: string; total?: number; saldo?: number }>;
  processos: Array<{ processo?: string | number; contrato?: string | number; fornecedor?: string; valor?: number; data?: string }>;
}

export function canonicalize(importResult: ImportResult): CanonicalData {
  const fornecedores: Record<string, string> = {};
  const contratos: CanonicalData['contratos'] = {};
  const processos: CanonicalData['processos'] = [];

  const addFornecedor = (codigo?: string | number, nome?: string) => {
    if (!codigo || !nome) return;
    fornecedores[String(codigo)] = nome;
  };

  const sheet = (key: SheetKey) => importResult.sheets[key] || [];

  sheet('223-PLANEJ.CONTRA.INSUMOS').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);
    contratos[String(values.contrato)] = {
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      total: Number(values.valor_contrato) || undefined,
      saldo: Number(values.saldo) || undefined
    };
  });

  sheet('549-ITENS DOS CONTRATOS').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);
    const contratoId = String(values.contrato);
    contratos[contratoId] = contractsMerge(contratos[contratoId], {
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      total: Number(values.valor_total_contrato) || undefined,
      saldo: Number(values.saldo) || undefined
    });
  });

  sheet('334-ITENS INSUMOS PROCESSOS').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);
    processos.push({
      processo: values.processo,
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      valor: Number(values.total) || Number(values.valor_pago) || undefined,
      data: values.data as string | undefined
    });
  });

  sheet('384-MEDICOES DE CONTRATOS').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);
    processos.push({
      processo: values.processo,
      contrato: values.contrato,
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      valor: Number(values.total) || Number(values.subtotal_medido) || undefined,
      data: values.data_pagamento as string | undefined
    });
  });

  return { fornecedores, contratos, processos };
}

function contractsMerge(
  current: { fornecedor?: string; total?: number; saldo?: number } | undefined,
  next: { fornecedor?: string; total?: number; saldo?: number }
) {
  return {
    fornecedor: next.fornecedor || current?.fornecedor,
    total: next.total || current?.total,
    saldo: next.saldo || current?.saldo
  };
}
