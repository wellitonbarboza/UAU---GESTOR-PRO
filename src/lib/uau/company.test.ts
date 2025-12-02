import { describe, expect, it, vi, afterEach } from 'vitest';
import { extractCompanyMetadata, generateCompanyId, CompanyMetadata, buildCompanyId } from './company';
import { ImportResult, RawSheetRow } from './importer';
import { SheetKey } from './sheetMap';

function buildImportResult(rows: RawSheetRow[]): ImportResult {
  const grouped = rows.reduce<Record<SheetKey, RawSheetRow[]>>((acc, row) => {
    acc[row.sheet] = acc[row.sheet] || [];
    acc[row.sheet].push(row);
    return acc;
  }, {} as Record<SheetKey, RawSheetRow[]>);

  return {
    workbookName: 'teste.xlsx',
    sheets: grouped,
    missingSheets: []
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('generateCompanyId', () => {
  it('produces a UUID when crypto.randomUUID is available', () => {
    vi.stubGlobal('crypto', { randomUUID: () => '123e4567-e89b-12d3-a456-426614174000' });

    const companyId = generateCompanyId();

    expect(companyId).toBe('123e4567-e89b-12d3-a456-426614174000');
  });

  it('falls back to a UUID-like format without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', undefined as unknown as Crypto);

    const companyId = generateCompanyId();

    expect(companyId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('extractCompanyMetadata', () => {
  it('prefers values extracted from the spreadsheet', () => {
    const importResult = buildImportResult([
      {
        sheet: '223-PLANEJ.CONTRA.INSUMOS',
        values: {
          codigo_empresa: ' 42 ',
          descricao_empresa: 'Empresa XPTO',
          codigo_obra: 'OB-99',
          centro_custos: 'CC-10'
        }
      }
    ]);

    const metadata = extractCompanyMetadata(importResult);

    expect(metadata).toEqual<CompanyMetadata>({
      codigo_empresa: '42',
      descricao_empresa: 'Empresa XPTO',
      codigo_obra: 'OB-99',
      centro_custos: 'CC-10'
    });
  });

  it('generates a company id when codigo_empresa is missing', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-company-id' });

    const importResult = buildImportResult([
      {
        sheet: '260-DESEMBOLSO DET. PRODUTO',
        values: {
          descricao_empresa: 'Empresa sem codigo',
          codigo_obra: 'OB-01'
        }
      }
    ]);

    const metadata = extractCompanyMetadata(importResult);

    expect(metadata.codigo_empresa).toBe('generated-company-id');
    expect(metadata.descricao_empresa).toBe('Empresa sem codigo');
    expect(metadata.codigo_obra).toBe('OB-01');
  });
});

describe('buildCompanyId', () => {
  it('concatenates company and obra codes when available', () => {
    const companyId = buildCompanyId({ codigo_empresa: '42', codigo_obra: 'OB-01' });

    expect(companyId).toBe('42-OB-01');
  });

  it('falls back to a generated id when nothing is provided', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });

    const companyId = buildCompanyId();

    expect(companyId).toBe('generated-id');
  });
});
