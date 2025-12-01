import * as XLSX from 'xlsx';

export function exportXlsx<T extends Record<string, unknown>>(rows: T[], filename = 'relatorio.xlsx') {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorio');
  XLSX.writeFile(workbook, filename);
}
