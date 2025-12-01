export type SheetKey =
  | '787-INSUMOS COMPRADOS'
  | '223-PLANEJ.CONTRA.INSUMOS'
  | '334-ITENS INSUMOS PROCESSOS'
  | '384-MEDICOES DE CONTRATOS'
  | '549-ITENS DOS CONTRATOS'
  | '260-DESEMBOLSO DET. PRODUTO'
  | 'CUSTO AO TERMINO'
  | 'INCC'
  | 'DE-PARA ORÇAMENTO';

export const sheetColumns: Record<SheetKey, Record<string, string>> = {
  '787-INSUMOS COMPRADOS': {
    F: 'fornecedor',
    H: 'obra',
    J: 'codigo_categoria',
    K: 'categoria',
    L: 'codigo_insumo',
    M: 'descricao'
  },
  '223-PLANEJ.CONTRA.INSUMOS': {
    B: 'codigo_empresa',
    C: 'descricao_empresa',
    D: 'codigo_obra',
    E: 'centro_custos',
    G: 'codigo_servico',
    H: 'descricao',
    I: 'valor_contrato',
    J: 'aprovado_medido',
    K: 'saldo',
    N: 'objeto',
    O: 'contrato',
    P: 'codigo_fornecedor',
    Q: 'nome_fornecedor',
    R: 'codigo_item',
    S: 'descricao_item',
    T: 'status_contrato'
  },
  '334-ITENS INSUMOS PROCESSOS': {
    K: 'processo',
    L: 'parcela',
    N: 'data',
    P: 'valor_pago',
    F: 'codigo_fornecedor',
    AG: 'nome_fornecedor',
    X: 'codigo_item',
    Y: 'descricao',
    Z: 'und',
    AA: 'quantidade',
    AB: 'unitario',
    AC: 'total'
  },
  '384-MEDICOES DE CONTRATOS': {
    C: 'contrato',
    E: 'medicao',
    J: 'codigo_fornecedor',
    K: 'nome_fornecedor',
    L: 'subtotal_medido',
    P: 'total_contrato',
    Q: 'saldo',
    T: 'processo',
    V: 'data_pagamento',
    W: 'codigo_item',
    X: 'descricao_item',
    Y: 'quantidade',
    Z: 'unitario',
    AA: 'total'
  },
  '549-ITENS DOS CONTRATOS': {
    E: 'contrato',
    F: 'objeto',
    K: 'codigo_fornecedor',
    L: 'nome_fornecedor',
    N: 'codigo_item',
    O: 'descricao',
    P: 'und',
    Q: 'quantidade',
    R: 'unitario',
    S: 'subtotal',
    X: 'quantidade_medida',
    Y: 'valor_medido',
    Z: 'quantidade_a_medir',
    AA: 'valor_a_medir',
    AB: 'status',
    AC: 'situacao',
    AD: 'valor_total_contrato'
  },
  '260-DESEMBOLSO DET. PRODUTO': {
    C: 'codigo_empresa',
    D: 'descricao_empresa',
    F: 'codigo_obra',
    G: 'centro_custos',
    H: 'obra_detalhada',
    N: 'codigo_insumo',
    O: 'descricao_insumo',
    Q: 'codigo_planejamento',
    R: 'descricao_planejamento',
    T: 'data',
    U: 'codigo_fornecedor',
    V: 'nome_fornecedor',
    X: 'processo_parcela',
    Y: 'a_pagar',
    Z: 'pagos',
    AF: 'codigo_item',
    AG: 'descricao_item'
  },
  'CUSTO AO TERMINO': {
    D: 'item_planejamento',
    E: 'codigo_servico',
    F: 'descricao',
    O: 'orcado',
    P: 'orcado_incc',
    AD: 'custo_termino'
  },
  INCC: {
    B: 'descricao',
    C: 'und',
    D: 'quantidade',
    E: 'unitario',
    F: 'total',
    G: 'tipo',
    H: 'etapa'
  },
  'DE-PARA ORÇAMENTO': {
    B: 'descricao',
    C: 'und',
    D: 'quantidade',
    E: 'unitario',
    F: 'total',
    G: 'tipo',
    H: 'etapa'
  }
};

export const requiredSheets = Object.keys(sheetColumns) as SheetKey[];
