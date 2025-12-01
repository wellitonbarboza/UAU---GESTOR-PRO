import html2canvas from 'html2canvas';

export async function exportPng(element: HTMLElement, filename = 'relatorio.png') {
  const canvas = await html2canvas(element);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
