create table if not exists public.uau_import_batches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  workbook_name text,
  created_at timestamptz default now()
);

create table if not exists public.uau_import_rows (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  batch_id uuid references public.uau_import_batches(id),
  sheet text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.uau_obras (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  nome text,
  created_at timestamptz default now()
);

create table if not exists public.uau_fornecedores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  codigo text,
  nome text,
  created_at timestamptz default now()
);

create table if not exists public.uau_catalogo_itens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  codigo text,
  descricao text,
  unidade text
);

create table if not exists public.uau_contratos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  codigo text,
  fornecedor_id uuid references public.uau_fornecedores(id),
  obra_id uuid references public.uau_obras(id),
  total numeric,
  saldo numeric,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.uau_contrato_itens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  contrato_id uuid references public.uau_contratos(id),
  item_id uuid references public.uau_catalogo_itens(id),
  quantidade numeric,
  unitario numeric,
  valor_medido numeric,
  valor_a_medir numeric,
  status text
);

create table if not exists public.uau_medicoes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  contrato_id uuid references public.uau_contratos(id),
  numero text,
  total numeric,
  data_pagamento date
);

create table if not exists public.uau_medicao_itens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  medicao_id uuid references public.uau_medicoes(id),
  item_id uuid references public.uau_catalogo_itens(id),
  quantidade numeric,
  valor numeric
);

create table if not exists public.uau_processos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  codigo text,
  contrato_id uuid references public.uau_contratos(id),
  fornecedor_id uuid references public.uau_fornecedores(id),
  valor numeric,
  data date
);

create table if not exists public.uau_processo_itens (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  processo_id uuid references public.uau_processos(id),
  item_id uuid references public.uau_catalogo_itens(id),
  quantidade numeric,
  valor numeric
);

create table if not exists public.uau_planej_contra_insumos (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  contrato text,
  codigo_servico text,
  descricao text,
  valor_contrato numeric,
  aprovado_medido numeric,
  saldo numeric,
  objeto text,
  codigo_fornecedor text,
  nome_fornecedor text,
  codigo_item text,
  descricao_item text,
  status_contrato text
);

create table if not exists public.uau_insumos_comprados (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  fornecedor text,
  obra text,
  codigo_categoria text,
  categoria text,
  codigo_insumo text,
  descricao text
);

create table if not exists public.uau_orcamento_depara (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  descricao text,
  und text,
  quantidade numeric,
  unitario numeric,
  total numeric,
  tipo text,
  etapa text
);

create table if not exists public.uau_cat (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  item_planejamento text,
  codigo_servico text,
  descricao text,
  orcado numeric,
  orcado_incc numeric,
  custo_termino numeric
);

create table if not exists public.uau_analises (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  batch_id uuid references public.uau_import_batches(id),
  tipo text,
  payload jsonb,
  created_at timestamptz default now()
);

create or replace function current_company_id() returns uuid as $$
  select null::uuid; -- implemente via sessão/autenticação
$$ language sql stable;

alter table public.uau_import_batches enable row level security;
alter table public.uau_import_rows enable row level security;
alter table public.uau_obras enable row level security;
alter table public.uau_fornecedores enable row level security;
alter table public.uau_catalogo_itens enable row level security;
alter table public.uau_contratos enable row level security;
alter table public.uau_contrato_itens enable row level security;
alter table public.uau_medicoes enable row level security;
alter table public.uau_medicao_itens enable row level security;
alter table public.uau_processos enable row level security;
alter table public.uau_processo_itens enable row level security;
alter table public.uau_planej_contra_insumos enable row level security;
alter table public.uau_insumos_comprados enable row level security;
alter table public.uau_orcamento_depara enable row level security;
alter table public.uau_cat enable row level security;
alter table public.uau_analises enable row level security;

create policy "company access" on public.uau_import_batches using (company_id = current_company_id());
create policy "company access" on public.uau_import_rows using (company_id = current_company_id());
create policy "company access" on public.uau_obras using (company_id = current_company_id());
create policy "company access" on public.uau_fornecedores using (company_id = current_company_id());
create policy "company access" on public.uau_catalogo_itens using (company_id = current_company_id());
create policy "company access" on public.uau_contratos using (company_id = current_company_id());
create policy "company access" on public.uau_contrato_itens using (company_id = current_company_id());
create policy "company access" on public.uau_medicoes using (company_id = current_company_id());
create policy "company access" on public.uau_medicao_itens using (company_id = current_company_id());
create policy "company access" on public.uau_processos using (company_id = current_company_id());
create policy "company access" on public.uau_processo_itens using (company_id = current_company_id());
create policy "company access" on public.uau_planej_contra_insumos using (company_id = current_company_id());
create policy "company access" on public.uau_insumos_comprados using (company_id = current_company_id());
create policy "company access" on public.uau_orcamento_depara using (company_id = current_company_id());
create policy "company access" on public.uau_cat using (company_id = current_company_id());
create policy "company access" on public.uau_analises using (company_id = current_company_id());
