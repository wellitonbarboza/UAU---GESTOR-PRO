import { ImportResult } from './importer';

export interface CompanyMetadata {
  codigo_empresa?: string;
  descricao_empresa?: string;
  codigo_obra?: string;
  centro_custos?: string;
}

function normalize(value: unknown) {
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

export function extractCompanyMetadata(importResult: ImportResult): CompanyMetadata | null {
  const sheetEntries = Object.values(importResult.sheets || {});

  for (const rows of sheetEntries) {
    for (const row of rows) {
      const values = row.values as Record<string, unknown>;
      const codigo_empresa = normalize(values.codigo_empresa);
      const descricao_empresa = normalize(values.descricao_empresa);
      const codigo_obra = normalize(values.codigo_obra);
      const centro_custos = normalize(values.centro_custos);

      if (codigo_empresa || descricao_empresa || codigo_obra || centro_custos) {
        return { codigo_empresa, descricao_empresa, codigo_obra, centro_custos };
      }
    }
  }

  return null;
}
