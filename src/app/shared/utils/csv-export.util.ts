// Convierte un array de objetos en un archivo CSV y dispara su descarga en el navegador.
// No requiere librerías externas: CSV es texto plano separado por comas.
export function exportarCsv(nombreArchivo: string, encabezados: string[], filas: (string | number)[][]): void {
  const escapar = (valor: string | number): string => {
    const texto = String(valor ?? '');
    // Si el valor tiene comas, comillas o saltos de línea, se envuelve en comillas dobles
    if (/[",\n]/.test(texto)) {
      return `"${texto.replace(/"/g, '""')}"`;
    }
    return texto;
  };

  const lineas = [
    encabezados.map(escapar).join(','),
    ...filas.map(fila => fila.map(escapar).join(',')),
  ];

  // El BOM (\uFEFF) al inicio evita que Excel muestre mal los acentos/ñ al abrir el archivo
  const contenido = '\uFEFF' + lineas.join('\n');
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });

  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(blob);
  enlace.download = nombreArchivo.endsWith('.csv') ? nombreArchivo : `${nombreArchivo}.csv`;
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}