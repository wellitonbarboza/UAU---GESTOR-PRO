import { create } from 'zustand';
import { CanonicalData } from '../lib/uau/canonicalize';
import { ImportResult } from '../lib/uau/importer';

interface ImportState {
  importResult?: ImportResult;
  canonical?: CanonicalData;
  status: 'idle' | 'imported' | 'canonicalized';
  setImportResult: (result?: ImportResult) => void;
  setCanonical: (canonical?: CanonicalData) => void;
  setStatus: (status: ImportState['status']) => void;
}

export const useImportStore = create<ImportState>((set) => ({
  importResult: undefined,
  canonical: undefined,
  status: 'idle',
  setImportResult: (importResult) => set({ importResult, status: importResult ? 'imported' : 'idle' }),
  setCanonical: (canonical) => set({ canonical, status: canonical ? 'canonicalized' : 'imported' }),
  setStatus: (status) => set({ status })
}));
