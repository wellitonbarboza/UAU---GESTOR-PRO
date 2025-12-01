import { create } from 'zustand';
import { CanonicalData } from '../lib/uau/canonicalize';
import { ImportResult } from '../lib/uau/importer';
import { fetchLatestCanonical } from '../lib/uau/fetch';

interface ImportState {
  importResult?: ImportResult;
  canonical?: CanonicalData;
  status: 'idle' | 'imported' | 'canonicalized';
  loadingSupabase: boolean;
  supabaseError?: string | null;
  supabaseBatchId?: string;
  setImportResult: (result?: ImportResult) => void;
  setCanonical: (canonical?: CanonicalData) => void;
  setStatus: (status: ImportState['status']) => void;
  loadFromSupabase: (companyId: string) => Promise<void>;
}

export const useImportStore = create<ImportState>((set) => ({
  importResult: undefined,
  canonical: undefined,
  status: 'idle',
  loadingSupabase: false,
  supabaseError: null,
  supabaseBatchId: undefined,
  setImportResult: (importResult) => set({ importResult, status: importResult ? 'imported' : 'idle' }),
  setCanonical: (canonical) => set({ canonical, status: canonical ? 'canonicalized' : 'imported' }),
  setStatus: (status) => set({ status }),
  loadFromSupabase: async (companyId: string) => {
    set({ loadingSupabase: true, supabaseError: null });
    try {
      const latest = await fetchLatestCanonical(companyId);
      if (!latest) {
        set({
          supabaseError: 'Nenhuma análise encontrada para este company_id.',
          loadingSupabase: false
        });
        return;
      }

      set({
        canonical: latest.payload,
        status: 'canonicalized',
        importResult: undefined,
        supabaseBatchId: latest.batch_id,
        loadingSupabase: false
      });
    } catch (err) {
      set({ supabaseError: (err as Error).message, loadingSupabase: false });
    }
  }
}));
