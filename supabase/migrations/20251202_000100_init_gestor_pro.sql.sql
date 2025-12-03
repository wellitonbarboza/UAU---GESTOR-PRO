begin;

-- Extensions
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- Enums
create type public.app_role as enum ('admin', 'operacional', 'viewer');
create type public.obra_status as enum ('ATIVA', 'PAUSADA', 'CONCLUIDA');

create type public.contrato_status as enum ('VIGENTE', 'FINALIZADO', 'SUSPENSO');
create type public.contrato_situacao as enum ('ATIVO', 'ENCERRADO', 'BLOQUEADO');

create type public.analise_tipo as enum ('CONTRATO_NOVO', 'CONTRATO_ADITIVO', 'DISTRATO', 'COMPRAS', 'CONSULTA');
create type public.import_status as enum ('uploaded', 'processed', 'persisted', 'failed');

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core tables
create table public.companies (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid null references public.companies(id) on delete set null,
  role public.app_role not null default 'admin',
  full_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table public.login_allowed_users (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique,
  full_name text null,
  password text null,
  company_id uuid null references public.companies(id) on delete set null,
  role public.app_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_login_allowed_users_updated_at
before update on public.login_allowed_users
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create table public.obras (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  centro_custo text not null,
  sigla text not null,
  nome text not null,
  status public.obra_status not null default 'ATIVA',
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint obras_company_cc_unique unique(company_id, centro_custo)
);

create index obras_company_idx on public.obras(company_id);

create trigger trg_obras_updated_at
before update on public.obras
for each row execute function public.set_updated_at();

-- Import batches + RAW rows
create table public.uau_import_batches (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  original_filename text null,
  storage_bucket text not null default 'uau-imports',
  storage_path text null,
  status public.import_status not null default 'uploaded',
  stats jsonb not null default '{}'::jsonb,
  logs jsonb not null default '[]'::jsonb,
  error text null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  processed_at timestamptz null,
  persisted_at timestamptz null
);

create index uau_import_batches_company_idx on public.uau_import_batches(company_id);
create index uau_import_batches_obra_idx on public.uau_import_batches(obra_id);

create table public.uau_raw_rows (
  id bigserial primary key,
  batch_id uuid not null references public.uau_import_batches(id) on delete cascade,
  sheet_name text not null,
  row_index int not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index uau_raw_rows_batch_sheet_idx on public.uau_raw_rows(batch_id, sheet_name);

-- Canonical domain tables
create table public.fornecedores (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  codigo text not null,
  nome text not null,
  cnpj text null,
  created_at timestamptz not null default now(),
  constraint fornecedores_company_codigo_unique unique(company_id, codigo)
);

create index fornecedores_company_idx on public.fornecedores(company_id);

create table public.contratos (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  numero text not null,
  fornecedor_id uuid null references public.fornecedores(id) on delete set null,
  objeto text null,
  status public.contrato_status not null default 'VIGENTE',
  situacao public.contrato_situacao not null default 'ATIVO',
  valor_total numeric(14,2) not null default 0,
  valor_medido numeric(14,2) not null default 0,
  valor_pago numeric(14,2) not null default 0,
  valor_a_pagar numeric(14,2) not null default 0,
  servico_codigo text null,
  servico_descricao text null,
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contratos_company_obra_num_unique unique(company_id, obra_id, numero)
);

create index contratos_company_idx on public.contratos(company_id);
create index contratos_obra_idx on public.contratos(obra_id);
create index contratos_fornecedor_idx on public.contratos(fornecedor_id);

create trigger trg_contratos_updated_at
before update on public.contratos
for each row execute function public.set_updated_at();

create table public.contrato_itens (
  id bigserial primary key,
  contrato_id uuid not null references public.contratos(id) on delete cascade,
  codigo text null,
  descricao text null,
  und text null,
  qtd numeric(14,4) not null default 0,
  valor_unit numeric(14,4) not null default 0,
  valor_total numeric(14,2) not null default 0,
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index contrato_itens_contrato_idx on public.contrato_itens(contrato_id);

create table public.processos_pagamento (
  id bigserial primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  processo text not null,
  parcela text not null,
  fornecedor_id uuid null references public.fornecedores(id) on delete set null,
  contrato_id uuid null references public.contratos(id) on delete set null,
  valor_pago numeric(14,2) not null default 0,
  valor_a_pagar numeric(14,2) not null default 0,
  competencia date null,
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index processos_pagamento_company_idx on public.processos_pagamento(company_id);
create index processos_pagamento_obra_idx on public.processos_pagamento(obra_id);
create index processos_pagamento_contrato_idx on public.processos_pagamento(contrato_id);

create table public.insumos (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  codigo text not null,
  descricao text not null,
  categoria text null,
  tipo text null,
  und text null,
  orcado_qtd numeric(14,4) not null default 0,
  orcado_valor numeric(14,2) not null default 0,
  incorrido_qtd numeric(14,4) not null default 0,
  incorrido_valor numeric(14,2) not null default 0,
  origem jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint insumos_company_obra_codigo_unique unique(company_id, obra_id, codigo)
);

create index insumos_company_idx on public.insumos(company_id);
create index insumos_obra_idx on public.insumos(obra_id);

create trigger trg_insumos_updated_at
before update on public.insumos
for each row execute function public.set_updated_at();

create table public.analises (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  tipo public.analise_tipo not null,
  titulo text not null,
  resumo text null,
  payload jsonb not null default '{}'::jsonb,
  impacto jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index analises_company_idx on public.analises(company_id);
create index analises_obra_idx on public.analises(obra_id);

create table public.depara_macros (
  id bigserial primary key,
  company_id uuid not null references public.companies(id) on delete cascade,
  obra_id uuid null references public.obras(id) on delete set null,
  chave_uau text not null,
  macro_etapa text not null,
  sub_etapa text null,
  observacao text null,
  created_at timestamptz not null default now(),
  constraint depara_unique unique(company_id, obra_id, chave_uau)
);

create index depara_company_idx on public.depara_macros(company_id);

-- RLS enabled
alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.login_allowed_users enable row level security;
alter table public.obras enable row level security;
alter table public.uau_import_batches enable row level security;
alter table public.uau_raw_rows enable row level security;
alter table public.fornecedores enable row level security;
alter table public.contratos enable row level security;
alter table public.contrato_itens enable row level security;
alter table public.processos_pagamento enable row level security;
alter table public.insumos enable row level security;
alter table public.analises enable row level security;
alter table public.depara_macros enable row level security;

-- Policies
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.company_id = companies.id
  )
  or created_by = auth.uid()
);

drop policy if exists companies_insert on public.companies;
create policy companies_insert on public.companies
for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists companies_update on public.companies;
create policy companies_update on public.companies
for update
to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists login_allowed_select on public.login_allowed_users;
create policy login_allowed_select on public.login_allowed_users
for select
to authenticated
using (
  exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = lower(login_allowed_users.email)
  )
  or exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists login_allowed_admin on public.login_allowed_users;
create policy login_allowed_admin on public.login_allowed_users
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  )
);

drop policy if exists obras_select on public.obras;
create policy obras_select on public.obras
for select
to authenticated
using (
  company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid())
);

drop policy if exists obras_write on public.obras;
create policy obras_write on public.obras
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.company_id = obras.company_id
      and p.role in ('admin','operacional')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.company_id = obras.company_id
      and p.role in ('admin','operacional')
  )
);

drop policy if exists import_batches_select on public.uau_import_batches;
create policy import_batches_select on public.uau_import_batches
for select
to authenticated
using (
  company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid())
);

drop policy if exists import_batches_write on public.uau_import_batches;
create policy import_batches_write on public.uau_import_batches
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.company_id = uau_import_batches.company_id
      and p.role in ('admin','operacional')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.company_id = uau_import_batches.company_id
      and p.role in ('admin','operacional')
  )
);

drop policy if exists raw_rows_select on public.uau_raw_rows;
create policy raw_rows_select on public.uau_raw_rows
for select
to authenticated
using (
  exists (
    select 1
    from public.uau_import_batches b
    join public.profiles p on p.user_id = auth.uid()
    where b.id = uau_raw_rows.batch_id and b.company_id = p.company_id
  )
);

drop policy if exists raw_rows_write on public.uau_raw_rows;
create policy raw_rows_write on public.uau_raw_rows
for all
to authenticated
using (
  exists (
    select 1
    from public.uau_import_batches b
    join public.profiles p on p.user_id = auth.uid()
    where b.id = uau_raw_rows.batch_id and b.company_id = p.company_id and p.role in ('admin','operacional')
  )
)
with check (
  exists (
    select 1
    from public.uau_import_batches b
    join public.profiles p on p.user_id = auth.uid()
    where b.id = uau_raw_rows.batch_id and b.company_id = p.company_id and p.role in ('admin','operacional')
  )
);

-- “Canonical” tables: regra padrão por company_id
drop policy if exists fornecedores_rw on public.fornecedores;
create policy fornecedores_rw on public.fornecedores
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

drop policy if exists contratos_rw on public.contratos;
create policy contratos_rw on public.contratos
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

drop policy if exists contrato_itens_rw on public.contrato_itens;
create policy contrato_itens_rw on public.contrato_itens
for all
to authenticated
using (
  exists (
    select 1 from public.contratos c
    join public.profiles p on p.user_id = auth.uid()
    where c.id = contrato_itens.contrato_id and c.company_id = p.company_id
  )
)
with check (
  exists (
    select 1 from public.contratos c
    join public.profiles p on p.user_id = auth.uid()
    where c.id = contrato_itens.contrato_id and c.company_id = p.company_id
  )
);

drop policy if exists processos_pagamento_rw on public.processos_pagamento;
create policy processos_pagamento_rw on public.processos_pagamento
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

drop policy if exists insumos_rw on public.insumos;
create policy insumos_rw on public.insumos
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

drop policy if exists analises_rw on public.analises;
create policy analises_rw on public.analises
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

drop policy if exists depara_rw on public.depara_macros;
create policy depara_rw on public.depara_macros
for all
to authenticated
using (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()))
with check (company_id = (select p.company_id from public.profiles p where p.user_id = auth.uid()));

insert into public.login_allowed_users (email, full_name, password, role, is_active)
values ('welliton.barboza@trinusco.com.br', 'Administrador', '123456', 'admin', true)
on conflict (email) do update set
  full_name = excluded.full_name,
  password = excluded.password,
  role = excluded.role,
  is_active = excluded.is_active;

-- Cria usuário padrão diretamente no Auth com a senha definida
insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  extensions.gen_random_uuid(),
  'authenticated',
  'authenticated',
  'welliton.barboza@trinusco.com.br',
  extensions.crypt('123456', extensions.gen_salt('bf')),
  now(),
  '{"provider": "email"}',
  '{}',
  now(),
  now()
)
on conflict (email) do update set
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = excluded.updated_at;

-- Storage bucket (para XLSX)
insert into storage.buckets (id, name, public)
values ('uau-imports', 'uau-imports', false)
on conflict (id) do nothing;

-- Storage policies (bucket uau-imports)
do $$
begin
  execute 'drop policy if exists "uau-imports select" on storage.objects';
  execute 'drop policy if exists "uau-imports insert" on storage.objects';
  execute 'drop policy if exists "uau-imports delete" on storage.objects';
exception when undefined_object then
  null;
end $$;

create policy "uau-imports select" on storage.objects
for select
to authenticated
using (
  bucket_id = 'uau-imports'
  and split_part(name, '/', 1) = (
    select p.company_id::text from public.profiles p where p.user_id = auth.uid()
  )
);

create policy "uau-imports insert" on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'uau-imports'
  and split_part(name, '/', 1) = (
    select p.company_id::text from public.profiles p where p.user_id = auth.uid()
  )
);

create policy "uau-imports delete" on storage.objects
for delete
to authenticated
using (
  bucket_id = 'uau-imports'
  and split_part(name, '/', 1) = (
    select p.company_id::text from public.profiles p where p.user_id = auth.uid()
  )
);

commit;
