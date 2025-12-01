import { mapColumns } from './importer';
import { SheetKey } from './sheetMap';

function normalizeValue(value: unknown) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const numeric = trimmed.replace(/\./g, '').replace(',', '.');
    if (!Number.isNaN(Number(numeric)) && numeric !== '') {
      return Number(numeric);
    }
    return trimmed;
  }
  return value;
}

export function normalizeRow(sheet: SheetKey, row: Record<string, unknown>) {
  const mapped = mapColumns(sheet, row);
  return Object.entries(mapped).reduce<Record<string, unknown>>((acc, [key, value]) => {
    const normalized = normalizeValue(value);
    acc[key] = normalized;
    return acc;
  }, {});
}
