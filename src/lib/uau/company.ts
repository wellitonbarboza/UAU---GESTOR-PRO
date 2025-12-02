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

export function buildCompanyId(metadata?: CompanyMetadata | null): string {
  if (!metadata) return '';

  const parts = [metadata.codigo_empresa, metadata.codigo_obra]
    .map((value) => normalize(value))
    .filter(Boolean) as string[];

  if (parts.length > 0) {
    return parts.join('-');
  }

  return generateCompanyId();
}

export function generateCompanyId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  return template.replace(/[xy]/g, (char) => {
    const rand = (Math.random() * 16) | 0;
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function extractCompanyMetadata(importResult: ImportResult): CompanyMetadata {
  const sheetEntries = Object.values(importResult.sheets || {});
  const metadata: CompanyMetadata = {};

  for (const rows of sheetEntries) {
    for (const row of rows) {
      const values = row.values as Record<string, unknown>;
      const codigo_empresa = normalize(values.codigo_empresa);
      const descricao_empresa = normalize(values.descricao_empresa);
      const codigo_obra = normalize(values.codigo_obra);
      const centro_custos = normalize(values.centro_custos);

      if (!metadata.codigo_empresa && codigo_empresa) metadata.codigo_empresa = codigo_empresa;
      if (!metadata.descricao_empresa && descricao_empresa) metadata.descricao_empresa = descricao_empresa;
      if (!metadata.codigo_obra && codigo_obra) metadata.codigo_obra = codigo_obra;
      if (!metadata.centro_custos && centro_custos) metadata.centro_custos = centro_custos;

      const hasAll = metadata.codigo_empresa && metadata.descricao_empresa && metadata.codigo_obra && metadata.centro_custos;
      if (hasAll) {
        break;
      }
    }
  }

  if (!metadata.codigo_empresa) {
    metadata.codigo_empresa = generateCompanyId();
  }

  return metadata;
}
