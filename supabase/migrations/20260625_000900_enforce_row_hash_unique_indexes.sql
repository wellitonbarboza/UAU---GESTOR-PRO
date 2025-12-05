begin;

-- Recreate deduplication indexes required by insert_uau_sheet_row and dynamic imports
create unique index if not exists "787_insumos_comprados_row_hash_full_idx" on public."787-Insumos Comprados"(obra_id, row_hash);
create unique index if not exists "223_planej_contra_insumos_row_hash_full_idx" on public."223-PLANEJ.CONTRA.INSUMOS"(obra_id, row_hash);
create unique index if not exists "334_itens_insumos_processos_row_hash_full_idx" on public."334-ITENS INSUMOS PROCESSOS"(obra_id, row_hash);
create unique index if not exists "384_medicoes_contratos_row_hash_full_idx" on public."384-MEDICOES DE CONTRATOS"(obra_id, row_hash);
create unique index if not exists "787_insumos_comprados_alias_row_hash_full_idx" on public."787-INSUMOS COMPRADOS"(obra_id, row_hash);
create unique index if not exists "549_itens_contratos_row_hash_full_idx" on public."549-ITENS DOS CONTRATOS"(obra_id, row_hash);
create unique index if not exists "260_desembolso_produto_row_hash_full_idx" on public."260-DESEMBOLSO DET. PRODUTO"(obra_id, row_hash);
create unique index if not exists "custo_ao_termino_row_hash_full_idx" on public."CUSTO AO TERMINO"(obra_id, row_hash);
create unique index if not exists "incc_row_hash_full_idx" on public."INCC"(obra_id, row_hash);
create unique index if not exists "de_para_orcamento_row_hash_full_idx" on public."DE-PARA ORCAMENTO"(obra_id, row_hash);

commit;
