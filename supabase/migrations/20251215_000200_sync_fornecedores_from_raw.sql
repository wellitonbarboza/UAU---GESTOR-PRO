begin;

-- Extrai fornecedores das linhas cruas importadas do UAU
create or replace function public.sync_fornecedores_from_raw(p_batch_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
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
    and (p_batch_id is null or r.batch_id = p_batch_id)
  on conflict (company_id, codigo) do update
    set nome = excluded.nome;
end;
$$;

grant execute on function public.sync_fornecedores_from_raw(uuid) to authenticated, service_role;

commit;
