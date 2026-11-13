import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { environment } from '../../../environments/environment';

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly apiUrl = environment.apiUrl;

  async exportarExcel(filename: string, sheetName: string, columns: ExportColumn[], data: Record<string, any>[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    sheet.columns = columns.map(c => ({ header: c.header, key: c.key, width: c.width || 20 }));

    // Estilo de encabezado
    const headerRow = sheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'thin' } };
    });
    headerRow.height = 20;

    // Datos
    data.forEach((row, index) => {
      const dataRow = sheet.addRow(row);
      if (index % 2 === 0) {
        dataRow.eachCell(cell => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
        });
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}.xlsx`);
  }

  exportarCSV(filename: string, columns: ExportColumn[], data: Record<string, any>[]): void {
    const BOM = '\uFEFF'; // Para compatibilidad con Excel en español
    const headers = columns.map(c => `"${c.header}"`).join(';');
    const rows = data.map(row =>
      columns.map(c => {
        const val = row[c.key] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(';')
    );
    const csv = BOM + [headers, ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }

  imprimirReporte(contenidoHtml: string, titulo: string): void {
    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) return;
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${titulo}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          h1 { font-size: 18px; color: #1E3A5F; border-bottom: 2px solid #1E3A5F; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
          th { background: #1E3A5F; color: white; padding: 8px 6px; text-align: left; }
          td { padding: 6px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) td { background: #f5f5f5; }
          .info { margin-bottom: 12px; font-size: 13px; }
          .info span { font-weight: bold; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <h1>${titulo}</h1>
        ${contenidoHtml}
        <script>window.onload = () => { window.print(); }<\/script>
      </body>
      </html>
    `);
    ventana.document.close();
  }
}
