begin;

-- Utiliza o último batch processado por obra ao sincronizar fornecedores e insumos de catálogo
create or replace function public.sync_fornecedores_from_raw(p_batch_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with latest_batches as (
    select distinct on (company_id, obra_id) id
    from public.uau_import_batches
    where processed_at is not null
    order by company_id, obra_id, processed_at desc
  )
  insert into public.fornecedores (company_id, codigo, nome)
  select distinct
    b.company_id,
    trim(r.data->>'CodFornProc') as codigo,
    trim(r.data->>'Nome_Pes') as nome
  from public.uau_raw_rows r
  join public.uau_import_batches b on b.id = r.batch_id
  where r.sheet_name = '334-Itens Insumos Processos'
    and nullif(trim(r.data->>'CodFornProc'), '') is not null
    and nullif(trim(r.data->>'Nome_Pes'), '') is not null
    and (
      (p_batch_id is not null and r.batch_id = p_batch_id)
      or (p_batch_id is null and r.batch_id in (select id from latest_batches))
    )
  on conflict (company_id, codigo) do update
    set nome = excluded.nome;
end;
$$;

create or replace function public.sync_insumos_catalog_from_raw(p_batch_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with latest_batches as (
    select distinct on (company_id, obra_id) id
    from public.uau_import_batches
    where processed_at is not null
    order by company_id, obra_id, processed_at desc
  )
  insert into public.insumos (company_id, codigo, descricao, un, cod_cat, desc_cat)
  select distinct
    b.company_id,
    trim(r.data->>'CodInsProcItem') as codigo,
    trim(r.data->>'DescrItens') as descricao,
    nullif(trim(r.data->>'UnidProcItem'), '') as un,
    nullif(trim(r.data->>'CategItens'), '') as cod_cat,
    nullif(trim(r.data->>'Desc_CGer'), '') as desc_cat
  from public.uau_raw_rows r
  join public.uau_import_batches b on b.id = r.batch_id
  where r.sheet_name = '334-Itens Insumos Processos'
    and nullif(trim(r.data->>'CodInsProcItem'), '') is not null
    and nullif(trim(r.data->>'DescrItens'), '') is not null
    and (
      (p_batch_id is not null and r.batch_id = p_batch_id)
      or (p_batch_id is null and r.batch_id in (select id from latest_batches))
    )
  on conflict (company_id, codigo) do update
    set descricao = excluded.descricao,
        un = excluded.un,
        cod_cat = excluded.cod_cat,
        desc_cat = excluded.desc_cat;
end;
$$;

grant execute on function public.sync_fornecedores_from_raw(uuid) to authenticated, service_role;
grant execute on function public.sync_insumos_catalog_from_raw(uuid) to authenticated, service_role;

commit;
