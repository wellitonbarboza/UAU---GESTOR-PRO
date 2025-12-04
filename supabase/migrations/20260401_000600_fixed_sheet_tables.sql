begin;

-- Remove previous dynamic/import helper functions
drop function if exists public.dynamic_import_workbook(uuid, uuid, jsonb);
drop function if exists public.sync_fornecedores_from_raw(uuid);
drop function if exists public.sync_insumos_catalog_from_raw(uuid);

do $$
begin
  -- Drop any dynamically created tables that followed the old pattern
  perform
    format('drop table if exists %I cascade', tablename)
  from pg_tables
  where schemaname = 'public'
    and tablename like 'uau_sheet_%';
end$$;

-- Helper to create consistent policy expression tied to uau_import_batches
create or replace function public._can_access_batch(p_batch_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.uau_import_batches b
    join public.profiles p on p.user_id = auth.uid()
    where b.id = p_batch_id
      and p.company_id = b.company_id
  );
$$;

do $$
begin
  execute 'drop policy if exists "787_insumos_comprados_rw" on public."787-Insumos Comprados"';
  execute 'drop policy if exists "223_planej_contra_insumos_rw" on public."223-PLANEJ.CONTRA.INSUMOS"';
  execute 'drop policy if exists "334_itens_insumos_processos_rw" on public."334-ITENS INSUMOS PROCESSOS"';
  execute 'drop policy if exists "384_medicoes_contratos_rw" on public."384-MEDICOES DE CONTRATOS"';
end$$;

-- 787-Insumos Comprados
create table if not exists public."787-Insumos Comprados" (
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
  "Valor" text null
);

create index if not exists "787_insumos_comprados_obra_idx" on public."787-Insumos Comprados"(obra_id);

alter table public."787-Insumos Comprados" enable row level security;
create policy "787_insumos_comprados_rw" on public."787-Insumos Comprados"
for all
to authenticated
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- 223-PLANEJ.CONTRA.INSUMOS
create table if not exists public."223-PLANEJ.CONTRA.INSUMOS" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "CodEmpresa" text null,
  "DescEmpresa" text null,
  "CodObra" text null,
  "DescObra" text null,
  "ItemPl" text null,
  "ServiçoPl" text null,
  "DescriçãoItem" text null,
  "Vinculado" text null,
  "Aprovado" text null,
  "Saldo" text null,
  "ContratoPl" text null,
  "ProdPl" text null,
  "Objeto" text null,
  "Contrato" text null,
  "CodContratado" text null,
  "Contratado" text null,
  "Cod_ins" text null,
  "Descr_ins" text null,
  "Situacao_cont" text null
);

create index if not exists "223_planej_contra_insumos_obra_idx" on public."223-PLANEJ.CONTRA.INSUMOS"(obra_id);

alter table public."223-PLANEJ.CONTRA.INSUMOS" enable row level security;
create policy "223_planej_contra_insumos_rw" on public."223-PLANEJ.CONTRA.INSUMOS"
for all
to authenticated
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- 334-ITENS INSUMOS PROCESSOS
create table if not exists public."334-ITENS INSUMOS PROCESSOS" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "EmpresaProc" text null,
  "NomeEmpresa" text null,
  "ObraProc" text null,
  "NomeObra" text null,
  "NumProc" text null,
  "CodFornProc" text null,
  "DescObraProc" text null,
  "DescEmpresaProc" text null,
  "EmpresaParc" text null,
  "ObraParc" text null,
  "NumProcParc" text null,
  "NumParcParc" text null,
  "DocFiscalParc" text null,
  "DtPagParcParc" text null,
  "DtVencParcParc" text null,
  "ValLiquidoParc" text null,
  "AcrescParc" text null,
  "DescParc" text null,
  "ValorParc" text null,
  "StatusParc" text null,
  "EmpresaItem" text null,
  "ObraProcItem" text null,
  "NumProcItem" text null,
  "CodInsProcItem" text null,
  "DescrItens" text null,
  "UnidProcItem" text null,
  "QtdeProcItem" text null,
  "ValUnitProcItem" text null,
  "TotalItem" text null,
  "CapInsProcItem" text null,
  "CategItens" text null,
  "Desc_CGer" text null,
  "Nome_Pes" text null,
  "Chave" text null,
  "DtIni" text null,
  "DtFim" text null,
  "Status" text null,
  "TotalPagBruto" text null,
  "TotalPagLiquido" text null,
  "DtPagVenc" text null,
  "DataPedido" text null,
  "DataEntrega" text null
);

create index if not exists "334_itens_insumos_processos_obra_idx" on public."334-ITENS INSUMOS PROCESSOS"(obra_id);

alter table public."334-ITENS INSUMOS PROCESSOS" enable row level security;
create policy "334_itens_insumos_processos_rw" on public."334-ITENS INSUMOS PROCESSOS"
for all
to authenticated
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- 384-MEDICOES DE CONTRATOS
create table if not exists public."384-MEDICOES DE CONTRATOS" (
  id bigserial primary key,
  obra_id uuid not null references public.uau_import_batches(id) on delete cascade,
  "Empresa" text null,
  "DescEmpresa" text null,
  "Contrato" text null,
  "Objeto" text null,
  "Medicao" text null,
  "Obra" text null,
  "DescObra" text null,
  "ObservacaoMedicao" text null,
  "Status_Med" text null,
  "Contratado" text null,
  "NomeContratado" text null,
  "SubTotal" text null,
  "AcrescimoMed" text null,
  "DescontoMed" text null,
  "TotalMed" text null,
  "TotalContrato" text null,
  "SaldoContrato" text null,
  "DataAprovacao" text null,
  "DataCriacaoMed" text null,
  "Processo" text null,
  "ParcelaProc" text null,
  "DataPagamento" text null,
  "Item" text null,
  "Descr_Itens" text null,
  "Qtde_Item" text null,
  "PrecoUnit_Item" text null,
  "Total" text null,
  "Tipo" text null,
  "CHAVE" text null,
  "TotalMedAnterior" text null,
  "AcumuladoMedicao" text null,
  "Historico" text null,
  "DataInicio" text null,
  "DataTermino" text null
);

create index if not exists "384_medicoes_contratos_obra_idx" on public."384-MEDICOES DE CONTRATOS"(obra_id);

alter table public."384-MEDICOES DE CONTRATOS" enable row level security;
create policy "384_medicoes_contratos_rw" on public."384-MEDICOES DE CONTRATOS"
for all
to authenticated
using (public._can_access_batch(obra_id))
with check (public._can_access_batch(obra_id));

-- Helper to insert mapped rows into the fixed tables
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
begin
  column_list := array_to_string(array(select format('%I', col) from unnest(p_columns) col), ', ');
  value_list := array_to_string(
    array(select format(''nullif(trim($2->>''''%s''''), '''''' )'', col) from unnest(p_columns) col),
    ', '
  );

  execute format(
    'insert into %s (obra_id%s%s) values ($1%s%s)',
    p_table,
    case when column_list <> '' then ', ' else '' end,
    column_list,
    case when value_list <> '' then ', ' else '' end,
    value_list
  ) using p_batch_id, p_data;
end;
$$;

grant execute on function public.insert_uau_sheet_row(text, text[], jsonb, uuid) to authenticated;
grant execute on function public.insert_uau_sheet_row(text, text[], jsonb, uuid) to service_role;

-- Main dispatcher that routes rows to the matching sheet tables
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
      when '787-Insumos Comprados' then
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
