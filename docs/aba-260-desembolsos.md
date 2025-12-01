# Referência da Aba 260 - Desembolso Detalhado do Produto

Este documento descreve como interpretar a aba **260 (Desembolso detalhado do PRODUTO)** das planilhas utilizadas para controle financeiro, servindo de referência para cadastro e importação dos dados no sistema.

## Estrutura das Colunas
- **C-D**: Identificação da empresa.
- **F-H-G**: Informações da obra (identificação e descrição do centro de custo).
- **N-O-Q**: Dados de insumos e composições.
  - **Q**: Código da composição ou insumo, correspondente ao planejamento e utilizado na comparação com o custo alternativo.
  - **O** e **R**: Descrição desses códigos.
- **T**: Datas de pagamento.
- **U-V**: Fornecedores (código e descrição). Use as colunas **U** e **V** como referência para cadastro e importação de fornecedores.
- **X**: Identificação do processo e parcela, no formato `processo/parcela` (ex.: `45/1` indica a parcela 1 do processo 45).
- **Y**: Valores a pagar.
- **Z**: Valores pagos.
- **AF-AG**: Itens (códigos e descrições) de insumos e composições presentes nos processos pagos. Esses códigos devem ser conferidos para garantir que já estão cadastrados e refletir exatamente o que está na planilha.

## Uso como Referência
Utilize sempre esta aba como base para:
- Conferir valores **pagos** e **a pagar**.
- Relacionar processos e parcelas a seus respectivos insumos/composições.
- Validar códigos e descrições de fornecedores e insumos/composições antes da importação.
