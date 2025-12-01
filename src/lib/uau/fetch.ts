import { CanonicalData } from './canonicalize';
import { requireSupabaseClient } from '../supabaseClient';

interface SupabaseAnalysis {
  batch_id: string;
  created_at: string;
  payload: CanonicalData;
}

export async function fetchLatestCanonical(companyId: string): Promise<SupabaseAnalysis | null> {
  const supabase = requireSupabaseClient();

  const { data, error } = await supabase
    .from('uau_analises')
    .select('payload, batch_id, created_at')
    .eq('company_id', companyId)
    .eq('tipo', 'import')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return data as SupabaseAnalysis;
}
