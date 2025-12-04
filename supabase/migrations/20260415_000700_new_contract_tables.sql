begin;

-- Ensure deduplication support on existing sheet tables
alter table if exists public."787-Insumos Comprados" add column if not exists row_hash text;
create unique index if not exists "787_insumos_comprados_row_hash_idx" on public."787-Insumos Comprados"(obra_id, row_hash) where row_hash is not null;

alter table if exists public."223-PLANEJ.CONTRA.INSUMOS" add column if not exists row_hash text;
create unique index if not exists "223_planej_contra_insumos_row_hash_idx" on public."223-PLANEJ.CONTRA.INSUMOS"(obra_id, row_hash) where row_hash is not null;

alter table if exists public."334-ITENS INSUMOS PROCESSOS" add column if not exists row_hash text;
create unique index if not exists "334_itens_insumos_processos_row_hash_idx" on public."334-ITENS INSUMOS PROCESSOS"(obra_id, row_hash) where row_hash is not null;

alter table if exists public."384-MEDICOES DE CONTRATOS" add column if not exists row_hash text;
create unique index if not exists "384_medicoes_contratos_row_hash_idx" on public."384-MEDICOES DE CONTRATOS"(obra_id, row_hash) where row_hash is not null;

-- 787-INSUMOS COMPRADOS (alias for existing table)
create table if not exists public."787-INSUMOS COMPRADOS" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "DataInicio" text null,
  "DataTermino" text null,
  "EmpresaObra" text null,
  "Empresa_Proc" text null,
  "Obra_Proc" text null,
  "Empresa" text null,
  "Obra_Proc2" text null,
  "Obra" text null,
  "DataPagamento" text null,
  "CodCatIns" text null,
  "CategoriaInsumo" text null,
  "CodInsProc_Item" text null,
  "Insumo" text null,
  "Valor" text null,
  row_hash text null
);

create index if not exists "787_insumos_comprados_alias_obra_idx" on public."787-INSUMOS COMPRADOS"(obra_id);
create unique index if not exists "787_insumos_comprados_alias_row_hash_idx" on public."787-INSUMOS COMPRADOS"(obra_id, row_hash) where row_hash is not null;

alter table public."787-INSUMOS COMPRADOS" enable row level security;
create policy if not exists "787_insumos_comprados_alias_rw" on public."787-INSUMOS COMPRADOS"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- 549-ITENS DOS CONTRATOS
create table if not exists public."549-ITENS DOS CONTRATOS" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "Empresa_cont" text null,
  "Desc_emp" text null,
  "Obra_cont" text null,
  "Descr_obr" text null,
  "Cod_cont" text null,
  "Objeto_cont" text null,
  "Total" text null,
  "ValorMedido" text null,
  "TotalContrato" text null,
  "SaldoContrato" text null,
  "CodPes_cont" text null,
  "Nome_pes" text null,
  "Item_itens" text null,
  "Serv_itens" text null,
  "Descr_itens" text null,
  "Unid_itens" text null,
  "Qtde_itens" text null,
  "Preco_itens" text null,
  "SubTotal" text null,
  "Cod_DescI" text null,
  "Descr_DescCon" text null,
  "Taxa_DescI" text null,
  "TaxaTot" text null,
  "QtdeAcomp" text null,
  "ValorAcomp" text null,
  "QtdeAAcomp" text null,
  "ValorAAcomp" text null,
  "StatusCont" text null,
  "SituacaoCont" text null,
  "TotalContrato2" text null,
  "Retido" text null,
  "APag" text null,
  "RetPag" text null,
  "APagar" text null,
  "CHAVECONTRATO" text null,
  row_hash text null
);

create index if not exists "549_itens_contratos_obra_idx" on public."549-ITENS DOS CONTRATOS"(obra_id);
create unique index if not exists "549_itens_contratos_row_hash_idx" on public."549-ITENS DOS CONTRATOS"(obra_id, row_hash) where row_hash is not null;

alter table public."549-ITENS DOS CONTRATOS" enable row level security;
create policy if not exists "549_itens_contratos_rw" on public."549-ITENS DOS CONTRATOS"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- 260-DESEMBOLSO DET. PRODUTO
create table if not exists public."260-DESEMBOLSO DET. PRODUTO" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "DataInicio" text null,
  "DataTermino" text null,
  "Empresa_Des" text null,
  "DescEmp_Des" text null,
  "Empresa" text null,
  "Obra_Des" text null,
  "DescObra_Des" text null,
  "Obra" text null,
  "ItemPl_Des" text null,
  "ContratoPl_Des" text null,
  "ProdutoPl_Des" text null,
  "DescProdPl_Des" text null,
  "Produto" text null,
  "CompPl_Des" text null,
  "DescCompPl_Des" text null,
  "Servico" text null,
  "InsumoPl_Des" text null,
  "DescInsPl_Des" text null,
  "Insumo" text null,
  "DtPgto_Des" text null,
  "CodForn_Des" text null,
  "DescForn_Des" text null,
  "Fornecedor" text null,
  "Proc/Parc" text null,
  "APagar" text null,
  "Pago" text null,
  "Projetado" text null,
  "ItemPai" text null,
  "DescrItemPai" text null,
  "Banco_Des" text null,
  "ContaCorr_Des" text null,
  "ItemProc_Des" text null,
  "InsumoComprado" text null,
  row_hash text null
);

create index if not exists "260_desembolso_produto_obra_idx" on public."260-DESEMBOLSO DET. PRODUTO"(obra_id);
create unique index if not exists "260_desembolso_produto_row_hash_idx" on public."260-DESEMBOLSO DET. PRODUTO"(obra_id, row_hash) where row_hash is not null;

alter table public."260-DESEMBOLSO DET. PRODUTO" enable row level security;
create policy if not exists "260_desembolso_produto_rw" on public."260-DESEMBOLSO DET. PRODUTO"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- CUSTO AO TERMINO
create table if not exists public."CUSTO AO TERMINO" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "EMPRESA OBRA" text null,
  "ITEM_PL" text null,
  "COD_SERVICO" text null,
  "DESCRICAO" text null,
  "UND" text null,
  "TIPO_HIERARQUICO" text null,
  "NIVEL" text null,
  "ITEM" text null,
  "CONCAT" text null,
  "NIVEL 2" text null,
  "NIVEL 3" text null,
  "NIVEL 4" text null,
  "VALOR ORCADO" text null,
  "VALOR ATUALIZADO" text null,
  "PAGO - ATE SET/25" text null,
  "PAGO - A PARTIR DE SET/25" text null,
  "A PAGAR" text null,
  "SALDO DE CONTRATO" text null,
  "COMPROMETIDO" text null,
  "QUANT." text null,
  "UND2" text null,
  "CUSTO UNT." text null,
  "TOTAL" text null,
  "CUSTO AO TERMINO" text null,
  "DESVIO NOMINAL" text null,
  "DESVIO ATUALIZADO" text null,
  row_hash text null
);

create index if not exists "custo_ao_termino_obra_idx" on public."CUSTO AO TERMINO"(obra_id);
create unique index if not exists "custo_ao_termino_row_hash_idx" on public."CUSTO AO TERMINO"(obra_id, row_hash) where row_hash is not null;

alter table public."CUSTO AO TERMINO" enable row level security;
create policy if not exists "custo_ao_termino_rw" on public."CUSTO AO TERMINO"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- INCC
create table if not exists public."INCC" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "MES INCORRIDO" text null,
  "INCORRIDO ACUM." text null,
  "INCORRIDO EM INCC" text null,
  "SALDO EM INCC" text null,
  "INDICE" text null,
  "SALDO ATUALIZADO" text null,
  "ORCAMENTO ATUALIZADO" text null,
  "VALOR ATUALIZADO" text null,
  "% ATUALIZADO" text null,
  row_hash text null
);

create index if not exists "incc_obra_idx" on public."INCC"(obra_id);
create unique index if not exists "incc_row_hash_idx" on public."INCC"(obra_id, row_hash) where row_hash is not null;

alter table public."INCC" enable row level security;
create policy if not exists "incc_rw" on public."INCC"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- DE-PARA ORCAMENTO
create table if not exists public."DE-PARA ORCAMENTO" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "Descrição" text null,
  "Un." text null,
  "Quantidade orçada" text null,
  "Preço unitário" text null,
  "Preço total" text null,
  "DESCRIÇÃO" text null,
  "ETAPA" text null,
  "CONF MFO" text null,
  "CONF DE-PARA" text null,
  row_hash text null
);

create index if not exists "de_para_orcamento_obra_idx" on public."DE-PARA ORCAMENTO"(obra_id);
create unique index if not exists "de_para_orcamento_row_hash_idx" on public."DE-PARA ORCAMENTO"(obra_id, row_hash) where row_hash is not null;

alter table public."DE-PARA ORCAMENTO" enable row level security;
create policy if not exists "de_para_orcamento_rw" on public."DE-PARA ORCAMENTO"
for all
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- Update insert helper to support deduplication
create or replace function public.insert_uau_sheet_row(
  p_table text,
  p_columns text[],
  p_data jsonb,
  p_batch_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  column_list text;
  value_list text;
  row_hash_value text;
begin
  row_hash_value := case when p_data is null then null else md5(p_data::text) end;

  column_list := array_to_string(array(select format('%I', col) from unnest(p_columns) col), ', ');
  if column_list <> '' then
    column_list := column_list || ', row_hash';
  else
    column_list := 'row_hash';
  end if;

  value_list := array_to_string(
    array(select format('nullif(trim($2->>''%s''), '''')', col) from unnest(p_columns) col),
    ', '
  );
  if value_list <> '' then
    value_list := value_list || ', $3';
  else
    value_list := '$3';
  end if;

  execute format(
    'insert into %s (obra_id, %s) values ($1, %s) on conflict (obra_id, row_hash) do nothing',
    p_table,
    column_list,
    value_list
  ) using p_batch_id, p_data, row_hash_value;
end;
$$;

grant execute on function public.insert_uau_sheet_row(text, text[], jsonb, uuid) to authenticated;
grant execute on function public.insert_uau_sheet_row(text, text[], jsonb, uuid) to service_role;

-- Extend dispatcher with new sheets and aliases
create or replace function public.import_uau_sheets(
  p_batch_id uuid,
  p_rows jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  row_item jsonb;
  sheet_name text;
  table_name text;
  columns text[];
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows deve ser um array de linhas';
  end if;

  if not exists (select 1 from public.uau_import_batches where id = p_batch_id) then
    raise exception 'Lote de importação não encontrado';
  end if;

  for row_item in select * from jsonb_array_elements(p_rows) loop
    sheet_name := row_item->>'sheet';
    table_name := null;
    columns := null;

    case sheet_name
      when '787-Insumos Comprados', '787-INSUMOS COMPRADOS' then
        table_name := 'public."787-Insumos Comprados"';
        columns := array[
          'DataInicio','DataTermino','EmpresaObra','Empresa_Proc','Obra_Proc','Empresa','Obra_Proc2','Obra',
          'DataPagamento','CodCatIns','CategoriaInsumo','CodInsProc_Item','Insumo','Valor'
        ];
      when '223-PLANEJ.CONTRA.INSUMOS' then
        table_name := 'public."223-PLANEJ.CONTRA.INSUMOS"';
        columns := array[
          'CodEmpresa','DescEmpresa','CodObra','DescObra','ItemPl','ServiçoPl','DescriçãoItem','Vinculado','Aprovado','Saldo',
          'ContratoPl','ProdPl','Objeto','Contrato','CodContratado','Contratado','Cod_ins','Descr_ins','Situacao_cont'
        ];
      when '334-Itens Insumos Processos', '334-ITENS INSUMOS PROCESSOS' then
        table_name := 'public."334-ITENS INSUMOS PROCESSOS"';
        columns := array[
          'EmpresaProc','NomeEmpresa','ObraProc','NomeObra','NumProc','CodFornProc','DescObraProc','DescEmpresaProc',
          'EmpresaParc','ObraParc','NumProcParc','NumParcParc','DocFiscalParc','DtPagParcParc','DtVencParcParc','ValLiquidoParc',
          'AcrescParc','DescParc','ValorParc','StatusParc','EmpresaItem','ObraProcItem','NumProcItem','CodInsProcItem','DescrItens',
          'UnidProcItem','QtdeProcItem','ValUnitProcItem','TotalItem','CapInsProcItem','CategItens','Desc_CGer','Nome_Pes','Chave',
          'DtIni','DtFim','Status','TotalPagBruto','TotalPagLiquido','DtPagVenc','DataPedido','DataEntrega'
        ];
      when '384-Medicoes de Contratos', '384-MEDICOES DE CONTRATOS' then
        table_name := 'public."384-MEDICOES DE CONTRATOS"';
        columns := array[
          'Empresa','DescEmpresa','Contrato','Objeto','Medicao','Obra','DescObra','ObservacaoMedicao','Status_Med','Contratado',
          'NomeContratado','SubTotal','AcrescimoMed','DescontoMed','TotalMed','TotalContrato','SaldoContrato','DataAprovacao',
          'DataCriacaoMed','Processo','ParcelaProc','DataPagamento','Item','Descr_Itens','Qtde_Item','PrecoUnit_Item','Total','Tipo',
          'CHAVE','TotalMedAnterior','AcumuladoMedicao','Historico','DataInicio','DataTermino'
        ];
      when '549-ITENS DOS CONTRATOS' then
        table_name := 'public."549-ITENS DOS CONTRATOS"';
        columns := array[
          'Empresa_cont','Desc_emp','Obra_cont','Descr_obr','Cod_cont','Objeto_cont','Total','ValorMedido','TotalContrato','SaldoContrato',
          'CodPes_cont','Nome_pes','Item_itens','Serv_itens','Descr_itens','Unid_itens','Qtde_itens','Preco_itens','SubTotal','Cod_DescI',
          'Descr_DescCon','Taxa_DescI','TaxaTot','QtdeAcomp','ValorAcomp','QtdeAAcomp','ValorAAcomp','StatusCont','SituacaoCont',
          'TotalContrato2','Retido','APag','RetPag','APagar','CHAVECONTRATO'
        ];
      when '260-DESEMBOLSO DET. PRODUTO' then
        table_name := 'public."260-DESEMBOLSO DET. PRODUTO"';
        columns := array[
          'DataInicio','DataTermino','Empresa_Des','DescEmp_Des','Empresa','Obra_Des','DescObra_Des','Obra','ItemPl_Des','ContratoPl_Des',
          'ProdutoPl_Des','DescProdPl_Des','Produto','CompPl_Des','DescCompPl_Des','Servico','InsumoPl_Des','DescInsPl_Des','Insumo',
          'DtPgto_Des','CodForn_Des','DescForn_Des','Fornecedor','Proc/Parc','APagar','Pago','Projetado','ItemPai','DescrItemPai',
          'Banco_Des','ContaCorr_Des','ItemProc_Des','InsumoComprado'
        ];
      when 'CUSTO AO TERMINO' then
        table_name := 'public."CUSTO AO TERMINO"';
        columns := array[
          'EMPRESA OBRA','ITEM_PL','COD_SERVICO','DESCRICAO','UND','TIPO_HIERARQUICO','NIVEL','ITEM','CONCAT','NIVEL 2','NIVEL 3',
          'NIVEL 4','VALOR ORCADO','VALOR ATUALIZADO','PAGO - ATE SET/25','PAGO - A PARTIR DE SET/25','A PAGAR','SALDO DE CONTRATO',
          'COMPROMETIDO','QUANT.','UND2','CUSTO UNT.','TOTAL','CUSTO AO TERMINO','DESVIO NOMINAL','DESVIO ATUALIZADO'
        ];
      when 'INCC' then
        table_name := 'public."INCC"';
        columns := array[
          'MES INCORRIDO','INCORRIDO ACUM.','INCORRIDO EM INCC','SALDO EM INCC','INDICE','SALDO ATUALIZADO','ORCAMENTO ATUALIZADO',
          'VALOR ATUALIZADO','% ATUALIZADO'
        ];
      when 'DE-PARA ORÇAMENTO', 'DE-PARA ORCAMENTO' then
        table_name := 'public."DE-PARA ORCAMENTO"';
        columns := array[
          'Descrição','Un.','Quantidade orçada','Preço unitário','Preço total','DESCRIÇÃO','ETAPA','CONF MFO','CONF DE-PARA'
        ];
      else
        continue;
    end case;

    perform public.insert_uau_sheet_row(
      table_name,
      columns,
      coalesce(row_item->'data', '{}'::jsonb),
      p_batch_id
    );
  end loop;
end;
$$;

grant execute on function public.import_uau_sheets(uuid, jsonb) to authenticated;
grant execute on function public.import_uau_sheets(uuid, jsonb) to service_role;

commit;
