import { ImportResult } from './importer';
import { SheetKey } from './sheetMap';

export interface CanonicalData {
  fornecedores: Record<string, string>;
  contratos: Record<string, { fornecedor?: string; total?: number; saldo?: number }>;
  processos: Array<ProcessoFinanceiro>;
  desembolsos: DesembolsoDetalhado[];
  contratoItens: Record<string, ContratoItem[]>;
}

export interface ProcessoFinanceiro {
  processo?: string | number;
  parcela?: string | number;
  contrato?: string | number;
  fornecedor?: string;
  valor?: number;
  data?: string;
  codigo_item?: string;
  descricao_item?: string;
  origem?: '334' | '384' | '260';
}

export interface DesembolsoDetalhado {
  codigo_empresa?: string;
  descricao_empresa?: string;
  codigo_obra?: string;
  centro_custos?: string;
  obra_detalhada?: string;
  codigo_insumo?: string | number;
  descricao_insumo?: string;
  codigo_planejamento?: string | number;
  descricao_planejamento?: string;
  data?: string;
  codigo_fornecedor?: string;
  nome_fornecedor?: string;
  processo?: string;
  parcela?: string;
  a_pagar?: number;
  pagos?: number;
  codigo_item?: string;
  descricao_item?: string;
}

export interface ContratoItem {
  contrato: string;
  objeto?: string;
  numero_item?: string;
  codigo_item?: string;
  descricao_item?: string;
  und?: string;
  quantidade?: number;
  unitario?: number;
  subtotal?: number;
  quantidade_medida?: number;
  valor_medido?: number;
  quantidade_a_medir?: number;
  valor_a_medir?: number;
}

function parseProcessoParcela(raw?: string | number) {
  if (!raw) return { processo: undefined, parcela: undefined };

  const [processoRaw, parcelaRaw] = String(raw).split(/[\\/]/);
  return {
    processo: processoRaw?.trim() || undefined,
    parcela: parcelaRaw?.trim() || undefined
  };
}

function numericOrUndefined(value: unknown) {
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function canonicalize(importResult: ImportResult): CanonicalData {
  const fornecedores: Record<string, string> = {};
  const contratos: CanonicalData['contratos'] = {};
  const processos: CanonicalData['processos'] = [];
  const desembolsos: CanonicalData['desembolsos'] = [];
  const contratoItens: CanonicalData['contratoItens'] = {};
  const contratoTotais: Record<string, { total: number; medido: number; saldo: number; fornecedor?: string }> = {};

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

    const totais = contratoTotais[contratoId] || { total: 0, medido: 0, saldo: 0 };
    totais.fornecedor ||= values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined;

    const subtotalLinha =
      numericOrUndefined(values.valor_total_contrato) ||
      numericOrUndefined(values.valor_total_item) ||
      numericOrUndefined(values.subtotal);
    const valorMedido = numericOrUndefined(values.valor_medido);
    const valorSaldo = numericOrUndefined(values.valor_a_medir);

    if (subtotalLinha) totais.total += subtotalLinha;
    if (valorMedido) totais.medido += valorMedido;
    if (valorSaldo) totais.saldo += valorSaldo;

    contratoTotais[contratoId] = totais;
    contratos[contratoId] = contractsMerge(contratos[contratoId], {
      fornecedor: totais.fornecedor
    });

    const item: ContratoItem = {
      contrato: contratoId,
      objeto: values.objeto as string | undefined,
      numero_item: values.numero_item ? String(values.numero_item) : undefined,
      codigo_item: values.codigo_item ? String(values.codigo_item) : undefined,
      descricao_item: values.descricao_item as string | undefined,
      und: values.und as string | undefined,
      quantidade: numericOrUndefined(values.quantidade_contratada),
      unitario: numericOrUndefined(values.unitario),
      subtotal: subtotalLinha,
      quantidade_medida: numericOrUndefined(values.quantidade_medida),
      valor_medido: valorMedido,
      quantidade_a_medir: numericOrUndefined(values.quantidade_a_medir),
      valor_a_medir: valorSaldo
    };

    contratoItens[contratoId] = [...(contratoItens[contratoId] || []), item];
  });

  Object.entries(contratoTotais).forEach(([contratoId, totais]) => {
    const saldoFallback =
      totais.saldo || (totais.total && totais.medido ? Math.max(0, totais.total - totais.medido) : undefined);

    contratos[contratoId] = contractsMerge(contratos[contratoId], {
      fornecedor: totais.fornecedor,
      total: contratos[contratoId]?.total || (totais.total ? totais.total : undefined),
      saldo: contratos[contratoId]?.saldo || saldoFallback
    });
  });

  sheet('334-ITENS INSUMOS PROCESSOS').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);
    processos.push({
      processo: values.processo,
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      valor: Number(values.total) || Number(values.valor_pago) || undefined,
      data: values.data as string | undefined,
      codigo_item: values.codigo_item ? String(values.codigo_item) : undefined,
      descricao_item: values.descricao as string | undefined,
      origem: '334'
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
      data: values.data_pagamento as string | undefined,
      codigo_item: values.codigo_item ? String(values.codigo_item) : undefined,
      descricao_item: values.descricao_item as string | undefined,
      origem: '384'
    });
  });

  sheet('260-DESEMBOLSO DET. PRODUTO').forEach((row) => {
    const values = row.values as any;
    addFornecedor(values.codigo_fornecedor, values.nome_fornecedor);

    const { processo, parcela } = parseProcessoParcela(values.processo_parcela);
    const a_pagar = numericOrUndefined(values.a_pagar);
    const pagos = numericOrUndefined(values.pagos);
    const totalValor = (a_pagar ?? 0) + (pagos ?? 0);
    const valor = totalValor === 0 ? undefined : totalValor;

    desembolsos.push({
      codigo_empresa: values.codigo_empresa ? String(values.codigo_empresa) : undefined,
      descricao_empresa: values.descricao_empresa as string | undefined,
      codigo_obra: values.codigo_obra ? String(values.codigo_obra) : undefined,
      centro_custos: values.centro_custos as string | undefined,
      obra_detalhada: values.obra_detalhada as string | undefined,
      codigo_insumo: values.codigo_insumo,
      descricao_insumo: values.descricao_insumo as string | undefined,
      codigo_planejamento: values.codigo_planejamento,
      descricao_planejamento: values.descricao_planejamento as string | undefined,
      data: values.data as string | undefined,
      codigo_fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      nome_fornecedor: values.nome_fornecedor as string | undefined,
      processo,
      parcela,
      a_pagar,
      pagos,
      codigo_item: values.codigo_item ? String(values.codigo_item) : undefined,
      descricao_item: values.descricao_item as string | undefined
    });

    processos.push({
      processo: processo || values.processo_parcela,
      parcela,
      fornecedor: values.codigo_fornecedor ? String(values.codigo_fornecedor) : undefined,
      valor,
      data: values.data as string | undefined,
      codigo_item: values.codigo_item ? String(values.codigo_item) : undefined,
      descricao_item: values.descricao_item as string | undefined,
      origem: '260'
    });
  });

  return { fornecedores, contratos, processos, desembolsos, contratoItens };
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
