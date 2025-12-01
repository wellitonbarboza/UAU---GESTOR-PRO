import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportPdf(element: HTMLElement, filename = 'relatorio.pdf') {
  const canvas = await html2canvas(element);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}
