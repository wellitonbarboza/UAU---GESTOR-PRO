import { requireSupabaseClient } from '../supabaseClient';
import { CanonicalData } from './canonicalize';
import { ImportResult } from './importer';

export async function persistBatch(companyId: string, importResult: ImportResult, canonical: CanonicalData) {
  const supabase = requireSupabaseClient();

  const { data: batch, error } = await supabase
    .from('uau_import_batches')
    .insert({ company_id: companyId, workbook_name: importResult.workbookName })
    .select('*')
    .single();

  if (error) throw error;

  const rowsPayload = Object.values(importResult.sheets).flat().map((row) => ({
    company_id: companyId,
    batch_id: batch.id,
    sheet: row.sheet,
    payload: row.values
  }));
  await supabase.from('uau_import_rows').insert(rowsPayload);

  await supabase.from('uau_analises').insert({
    company_id: companyId,
    batch_id: batch.id,
    tipo: 'import',
    payload: canonical
  });

  return batch;
}
