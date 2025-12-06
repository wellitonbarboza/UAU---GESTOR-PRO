begin;

-- Renomeia a tabela anterior de insumos para manter o histórico das compras
alter table public.insumos rename to insumos_comprados;

-- Ajusta índices para evitar conflito com a nova tabela de insumos de catálogo
alter index if exists insumos_company_idx rename to insumos_comprados_company_idx;
alter index if exists insumos_obra_idx rename to insumos_comprados_obra_idx;

-- Reafirma RLS e política para a tabela renomeada
alter table public.insumos_comprados enable row level security;
drop policy if exists insumos_comprados_rw on public.insumos_comprados;
create policy insumos_comprados_rw on public.insumos_comprados
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

-- Nova tabela "insumos" para o cadastro base do catálogo
create table public.insumos (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  codigo text not null,
  descricao text not null,
  un text null,
  cod_cat text null,
  desc_cat text null,
  created_at timestamptz not null default now(),
  constraint insumos_company_codigo_unique unique(company_id, codigo)
);

create index insumos_company_idx on public.insumos(company_id);
create index insumos_codigo_idx on public.insumos(codigo);

alter table public.insumos enable row level security;
drop policy if exists insumos_rw on public.insumos;
create policy insumos_rw on public.insumos
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

-- Função para preencher o catálogo de insumos a partir da aba 334-Itens Insumos Processos
create or replace function public.sync_insumos_catalog_from_raw(p_batch_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
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
  where r.sheet_name = '334-ITENS INSUMOS PROCESSOS'
    and nullif(trim(r.data->>'CodInsProcItem'), '') is not null
    and nullif(trim(r.data->>'DescrItens'), '') is not null
    and (p_batch_id is null or r.batch_id = p_batch_id)
  on conflict (company_id, codigo) do update
    set descricao = excluded.descricao,
        un = excluded.un,
        cod_cat = excluded.cod_cat,
        desc_cat = excluded.desc_cat;
end;
$$;

grant execute on function public.sync_insumos_catalog_from_raw(uuid) to authenticated, service_role;

commit;
