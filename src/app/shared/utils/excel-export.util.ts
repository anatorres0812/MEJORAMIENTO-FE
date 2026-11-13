import ExcelJS from 'exceljs';
import { EstadoNota, EstadoSiagie } from '../../core/models/nota.model';
export interface FilaAsistencia {
  estudiante: string;
  dni: string;
  estado: 'F' | 'A' | 'T' | '';
}

// Colores de fondo por estado (formato ARGB que usa ExcelJS)
const COLORES_ESTADO: Record<string, string> = {
  F: 'FFF87171', // rojo — Falta
  A: 'FF60A5FA', // azul — Presente
  T: 'FF4ADE80', // verde — Tardanza
};

// Genera un archivo Excel (.xlsx) real, con las celdas de "Estado" coloreadas según F/A/T
export async function exportarAsistenciaXlsx(
  nombreArchivo: string,
  cursoNombre: string,
  fecha: string,
  filas: FilaAsistencia[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet('Asistencia');

  hoja.columns = [
    { header: 'Estudiante', key: 'estudiante', width: 30 },
    { header: 'DNI', key: 'dni', width: 14 },
    { header: 'Estado', key: 'estado', width: 12 },
  ];

  filas.forEach(fila => {
    const fileAgregada = hoja.addRow(fila);
    const celdaEstado = fileAgregada.getCell('estado');
    const color = COLORES_ESTADO[fila.estado];
    if (color) {
      celdaEstado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      celdaEstado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      celdaEstado.alignment = { horizontal: 'center' };
    }
  });

  // Fila de título arriba de la tabla
  hoja.insertRow(1, [`Asistencia — ${cursoNombre} — ${fecha}`]);
  hoja.mergeCells('A1:C1');
  hoja.getRow(1).font = { bold: true, size: 13 };
  hoja.getRow(2).font = { bold: true };
  hoja.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}

export interface FilaNota {
  estado?: EstadoNota | EstadoSiagie;  // Opcional: se omite en "Mis notas" del alumno, donde no aplica
  estudiante?: string;
  curso: string;
  docente?: string;
  nota: number | string;
  
}

const COLORES_ESTADO_NOTA: Record<string, string> = {
  Aprobado: 'FF86EFAC',    // verde claro
  Desaprobado: 'FFFCA5A5', // rojo claro
};

// Genera un Excel (.xlsx) con la columna "Estado" coloreada según Aprobado/Desaprobado.
// Si las filas no traen "estudiante" (ej. boleta de un solo alumno), esa columna se omite.
export async function exportarNotasXlsx(
  nombreArchivo: string,
  titulo: string,
  filas: FilaNota[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet('Notas');

  const incluyeEstudiante = filas.some(f => f.estudiante !== undefined);
  const incluyeDocente = filas.some(f => f.docente !== undefined);

  const columnas: Partial<ExcelJS.Column>[] = [];
  if (incluyeEstudiante) columnas.push({ header: 'Estudiante', key: 'estudiante', width: 28 });
  columnas.push({ header: 'Curso', key: 'curso', width: 24 });
  if (incluyeDocente) columnas.push({ header: 'Docente', key: 'docente', width: 24 });
  columnas.push({ header: 'Nota', key: 'nota', width: 10 });
  columnas.push({ header: 'Estado', key: 'estado', width: 14 });

  hoja.columns = columnas;

  filas.forEach(fila => {
    const filaAgregada = hoja.addRow(fila);
    const celdaEstado = filaAgregada.getCell('estado');
    const color = fila.estado
  ? COLORES_ESTADO_NOTA[fila.estado]
  : undefined;
    if (color) {
      celdaEstado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
      celdaEstado.font = { bold: true };
      celdaEstado.alignment = { horizontal: 'center' };
    }
    filaAgregada.getCell('nota').alignment = { horizontal: 'center' };
  });

  const totalColumnas = columnas.length;
  hoja.insertRow(1, [titulo]);
  hoja.mergeCells(1, 1, 1, totalColumnas);
  hoja.getRow(1).font = { bold: true, size: 13 };
  hoja.getRow(2).font = { bold: true };
  hoja.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo.endsWith('.xlsx') ? nombreArchivo : `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}