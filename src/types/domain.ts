export type Obra = {
  id: string;
  centroCusto: string;
  sigla: string;
  nome: string;
  empresa?: string;
  status?: "ATIVA" | "PAUSADA" | "CONCLUIDA";
  atualizadoEm: string;
};

export type ContratoItem = {
  item: string;
  planejamentoItem?: string;
  servicoCodigo: string;
  servicoDescricao: string;
  unidade: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  quantidadeMedida: number;
  valorMedido: number;
  quantidadeAMedir: number;
  valorAMedir: number;
};

export type Contrato = {
  numero: string;
  objeto: string;
  fornecedorCodigo: string;
  fornecedorNome: string;
  status: string;
  situacao: string;
  valorTotal: number;
  valorMedido: number;
  valorAPagar: number;
  valorPago: number;
  servicoCodigo?: string;
  servicoDescricao?: string;
  itens: ContratoItem[];
};

export type ProcessoSemContrato = {
  processo: string;
  parcela: string;
  fornecedor: string;
  pago: number;
  aPagar: number;
};

export type Insumo = {
  codigo: string;
  descricao: string;
  categoria: string;
  tipo: "MAT" | "MO" | "MAT+MO" | "COMPOSIÇÃO";
  und: string;
  orcadoQtd: number;
  orcadoValor: number;
  incorridoQtd: number;
  incorridoValor: number;
};

export type HistoricoItem = {
  id: string;
  obraId: string;
  tipo: "CONTRATO_NOVO" | "CONTRATO_ADITIVO" | "DISTRATO" | "COMPRAS" | "CONSULTA";
  titulo: string;
  criadoEm: string;
  resumo: string;
  impacto: { incorridoAtual: number; incorridoNovo: number; desvio: number };
};

