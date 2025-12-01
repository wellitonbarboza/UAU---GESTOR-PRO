import * as XLSX from 'xlsx';
import { requiredSheets, sheetColumns, SheetKey } from './sheetMap';
import { normalizeRow } from './normalize';

export interface RawSheetRow {
  sheet: SheetKey;
  values: Record<string, unknown>;
}

export interface ImportResult {
  workbookName: string;
  sheets: Record<SheetKey, RawSheetRow[]>;
  missingSheets: SheetKey[];
}

export function readWorkbook(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const missingSheets = requiredSheets.filter((sheet) => !workbook.Sheets[sheet]);
      const sheets = {} as Record<SheetKey, RawSheetRow[]>;

      requiredSheets.forEach((sheet) => {
        const ws = workbook.Sheets[sheet];
        if (!ws) return;
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { header: 'A', range: 1 });
        const mapped = json.map((row) => normalizeRow(sheet, row));
        sheets[sheet] = mapped.map((values) => ({ sheet, values }));
      });

      resolve({
        workbookName: workbook.Props?.Title || file.name,
        sheets,
        missingSheets
      });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function mapColumns(sheet: SheetKey, row: Record<string, unknown>) {
  const columnMap = sheetColumns[sheet];
  return Object.entries(columnMap).reduce<Record<string, unknown>>((acc, [letter, key]) => {
    const value = row[letter];
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {});
}
