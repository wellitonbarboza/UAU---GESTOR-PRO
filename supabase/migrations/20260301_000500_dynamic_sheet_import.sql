begin;

create or replace function public.dynamic_import_workbook(
  p_company_id uuid,
  p_obra_id uuid,
  p_rows jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sheet record;
  column_name text;
  ddl text;
  row_item jsonb;
  row_data jsonb;
  target_table text;
  row_hash text;
  kv record;
  column_list text;
  value_list text;
begin
  if p_rows is null or jsonb_typeof(p_rows) <> 'array' then
    raise exception 'p_rows must be an array of rows';
  end if;

  for sheet in
    select sheet_name, array_agg(distinct column_name) as columns
    from (
      select (elem->>'sheet')::text as sheet_name, key as column_name
      from jsonb_array_elements(p_rows) elem
      cross join jsonb_object_keys(coalesce(elem->'data', '{}'::jsonb)) as key
    ) s
    group by sheet_name
  loop
    target_table := format(
      'uau_sheet_%s',
      regexp_replace(lower(sheet.sheet_name), '[^a-z0-9_]+', '_', 'g')
    );

    ddl := format(
      'create table if not exists %I (
        id bigserial primary key,
        company_id uuid not null references public.companies(id) on delete cascade,
        obra_id uuid not null references public.obras(id) on delete cascade,
        row_hash text not null,
        created_at timestamptz not null default now()
      )',
      target_table
    );
    execute ddl;

    foreach column_name in array sheet.columns loop
      if column_name is null or column_name = '' then
        continue;
      end if;
      ddl := format('alter table %I add column if not exists %I text null', target_table, column_name);
      execute ddl;
    end loop;

    ddl := format('create unique index if not exists %I on %I (obra_id, row_hash)', target_table || '_obra_hash_idx', target_table);
    execute ddl;
  end loop;

  for row_item in select * from jsonb_array_elements(p_rows) loop
    target_table := format(
      'uau_sheet_%s',
      regexp_replace(lower(row_item->>'sheet'), '[^a-z0-9_]+', '_', 'g')
    );

    row_data := coalesce(row_item->'data', '{}'::jsonb);
    row_hash := encode(digest(row_data::text, 'sha256'), 'hex');

    column_list := '';
    value_list := '';

    for kv in select key, value from jsonb_each(row_data) loop
      column_list := column_list || format(', %I', kv.key);
      value_list := value_list || ', ' || quote_nullable(kv.value::text);
    end loop;

    execute format(
      'insert into %I (company_id, obra_id, row_hash%s) values ($1, $2, $3%s) on conflict (obra_id, row_hash) do nothing',
      target_table,
      column_list,
      value_list
    ) using p_company_id, p_obra_id, row_hash;
  end loop;
end;
$$;

grant execute on function public.dynamic_import_workbook(uuid, uuid, jsonb) to authenticated;
grant execute on function public.dynamic_import_workbook(uuid, uuid, jsonb) to service_role;

commit;
