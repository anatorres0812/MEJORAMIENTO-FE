
import ExcelJS from 'exceljs';

export interface EstudianteSiagie {
  id: string | number;
  dni: string;
  nombres: string;
  apellidos: string;
  codigoEstudiante?: string;
  idRegistroSiagie?: string;
  codigoSiagie?: string;
}

const URL_PLANTILLA_SIAGIE =
  '/assets/plantillas/plantilla-siagie.xlsx';

const NOMBRE_HOJA_SIAGIE = '0010-';

const FILA_ENCABEZADOS = 1;
const FILA_INICIAL_DATOS = 2;

const TIPO_EXCEL =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Convierte cualquier valor a texto y elimina espacios
 * innecesarios.
 */
function normalizarTexto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return '';
  }

  return String(valor).trim();
}

/**
 * Normaliza encabezados para comparar textos sin distinguir
 * mayúsculas, tildes ni espacios repetidos.
 */
function normalizarEncabezado(valor: unknown): string {
  return normalizarTexto(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Obtiene el texto visible de una celda de ExcelJS.
 * Contempla texto enriquecido, hipervínculos y fórmulas.
 */
function obtenerTextoCelda(celda: ExcelJS.Cell): string {
  const valor = celda.value;

  if (valor === null || valor === undefined) {
    return '';
  }

  if (valor instanceof Date) {
    return valor.toISOString();
  }

  if (typeof valor === 'object') {
    if ('richText' in valor && Array.isArray(valor.richText)) {
      return valor.richText
        .map((fragmento) => fragmento.text)
        .join('')
        .trim();
    }

    if ('text' in valor) {
      return normalizarTexto(valor.text);
    }

    if ('result' in valor) {
      return normalizarTexto(valor.result);
    }

    return '';
  }

  return normalizarTexto(valor);
}

/**
 * Busca una columna por cualquiera de los encabezados aceptados.
 * Devuelve -1 si no encuentra coincidencias.
 */
function buscarColumna(
  hoja: ExcelJS.Worksheet,
  encabezados: string[]
): number {
  const encabezadosBuscados = encabezados.map(
    normalizarEncabezado
  );

  const filaEncabezados = hoja.getRow(FILA_ENCABEZADOS);

  for (
    let columna = 1;
    columna <= hoja.columnCount;
    columna++
  ) {
    const texto = normalizarEncabezado(
      obtenerTextoCelda(filaEncabezados.getCell(columna))
    );

    if (encabezadosBuscados.includes(texto)) {
      return columna;
    }
  }

  return -1;
}

/**
 * Busca la fila que contiene la sección LEYENDA.
 * Si no existe, considera que no hay un límite definido
 * por esa sección.
 */
function buscarFilaLeyenda(
  hoja: ExcelJS.Worksheet
): number {
  for (let numeroFila = 1; numeroFila <= hoja.rowCount; numeroFila++) {
    const fila = hoja.getRow(numeroFila);

    for (
      let columna = 1;
      columna <= hoja.columnCount;
      columna++
    ) {
      const texto = normalizarEncabezado(
        obtenerTextoCelda(fila.getCell(columna))
      );

      if (texto.includes('leyenda')) {
        return numeroFila;
      }
    }
  }

  return hoja.rowCount + 1;
}

/**
 * Comprueba que la lista tenga datos válidos antes de exportar.
 */
function validarEstudiantes(
  estudiantes: EstudianteSiagie[]
): void {
  if (!Array.isArray(estudiantes) || estudiantes.length === 0) {
    throw new Error('No hay estudiantes para exportar.');
  }

  const dnisRegistrados = new Set<string>();

  for (const estudiante of estudiantes) {
    if (!estudiante) {
      throw new Error(
        'La lista contiene un registro de estudiante vacío.'
      );
    }

    const dni = normalizarTexto(estudiante.dni);
    const nombres = normalizarTexto(estudiante.nombres);
    const apellidos = normalizarTexto(estudiante.apellidos);

    if (!dni) {
      throw new Error(
        `El estudiante ${estudiante.id} no tiene DNI registrado.`
      );
    }

    if (!/^\d{8}$/.test(dni)) {
      throw new Error(
        `El DNI ${dni} debe contener exactamente 8 dígitos.`
      );
    }

    if (dnisRegistrados.has(dni)) {
      throw new Error(
        `El DNI ${dni} está duplicado en la lista.`
      );
    }

    dnisRegistrados.add(dni);

    if (!nombres || !apellidos) {
      throw new Error(
        `El estudiante con DNI ${dni} debe tener nombres y apellidos registrados.`
      );
    }
  }
}

/**
 * Busca la plantilla oficial en assets y carga el libro Excel.
 */
async function cargarPlantillaSiagie(): Promise<ExcelJS.Workbook> {
  let respuesta: Response;

  try {
    respuesta = await fetch(URL_PLANTILLA_SIAGIE);
  } catch {
    throw new Error(
      'No se pudo acceder a la plantilla SIAGIE. ' +
      'Verifica tu conexión y la ruta del archivo.'
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      `No se encontró la plantilla Excel (${respuesta.status}). ` +
      'Verifica que exista en assets/plantillas/plantilla-siagie.xlsx.'
    );
  }

  const archivo = await respuesta.arrayBuffer();
  const libro = new ExcelJS.Workbook();

  try {
    await libro.xlsx.load(archivo);
  } catch {
    throw new Error(
      'No se pudo leer la plantilla. Verifica que sea un archivo Excel válido.'
    );
  }

  return libro;
}

/**
 * Genera y descarga un Excel con los estudiantes usando
 * la plantilla SIAGIE existente.
 */
export async function exportarPlantillaSiagie(
  estudiantes: EstudianteSiagie[],
  nombreArchivo = 'SIAGIE-Estudiantes'
): Promise<void> {
  validarEstudiantes(estudiantes);

  const libro = await cargarPlantillaSiagie();

  const hoja = libro.getWorksheet(NOMBRE_HOJA_SIAGIE);

  if (!hoja) {
    const hojasDisponibles = libro.worksheets
      .map((worksheet) => worksheet.name)
      .join(', ');

    throw new Error(
      `La plantilla no contiene la hoja "${NOMBRE_HOJA_SIAGIE}". ` +
      `Hojas disponibles: ${hojasDisponibles || 'ninguna'}.`
    );
  }

  // Identificar las columnas de la plantilla.
  const columnaId = buscarColumna(hoja, [
    'ID',
    'DNI'
  ]);

  const columnaCodigo = buscarColumna(hoja, [
    'Cód. Estudiante',
    'Cod. Estudiante',
    'Código Estudiante',
    'Codigo Estudiante'
  ]);

  const columnaNombres = buscarColumna(hoja, [
    'Nombres',
    'Nombre completo',
    'Apellidos y nombres'
  ]);

  if (columnaId === -1) {
    throw new Error(
      'No se encontró la columna ID o DNI en la primera fila de la plantilla SIAGIE.'
    );
  }

  if (columnaCodigo === -1) {
    throw new Error(
      'No se encontró la columna Cód. Estudiante en la primera fila de la plantilla SIAGIE.'
    );
  }

  if (columnaNombres === -1) {
    throw new Error(
      'No se encontró la columna Nombres en la primera fila de la plantilla SIAGIE.'
    );
  }

  // Comprobar el espacio disponible.
  const filaLeyenda = buscarFilaLeyenda(hoja);

  const filaFinalDatos =
    FILA_INICIAL_DATOS + estudiantes.length - 1;

  if (filaFinalDatos >= filaLeyenda) {
    throw new Error(
      'La cantidad de estudiantes supera el espacio disponible ' +
      'antes de la sección LEYENDA de la plantilla.'
    );
  }

  // Completar la plantilla sin cambiar su estructura.
  estudiantes.forEach((estudiante, indice) => {
    const numeroFila = FILA_INICIAL_DATOS + indice;
    const fila = hoja.getRow(numeroFila);

    const dni = normalizarTexto(estudiante.dni);

    const codigo =
      normalizarTexto(estudiante.codigoEstudiante) ||
      normalizarTexto(estudiante.codigoSiagie) ||
      normalizarTexto(estudiante.idRegistroSiagie);

    const nombreCompleto =
      `${normalizarTexto(estudiante.nombres)} ` +
      `${normalizarTexto(estudiante.apellidos)}`.trim();

    // El DNI se guarda como texto para conservar sus ceros iniciales.
    const celdaId = fila.getCell(columnaId);
    celdaId.value = dni;
    celdaId.numFmt = '@';

    // Código del estudiante.
    const celdaCodigo = fila.getCell(columnaCodigo);
    celdaCodigo.value = codigo;
    celdaCodigo.numFmt = '@';

    // Nombre completo.
    fila.getCell(columnaNombres).value = nombreCompleto;

    fila.commit();
  });

  // Eliminar únicamente los datos de ejemplo de las tres
  // columnas utilizadas, sin alterar el resto de la plantilla.
  for (
    let numeroFila = filaFinalDatos + 1;
    numeroFila < filaLeyenda;
    numeroFila++
  ) {
    const fila = hoja.getRow(numeroFila);

    fila.getCell(columnaId).value = null;
    fila.getCell(columnaCodigo).value = null;
    fila.getCell(columnaNombres).value = null;

    fila.commit();
  }

  // Generar el archivo Excel.
  const contenido = await libro.xlsx.writeBuffer();

  const blob = new Blob(
    [contenido as BlobPart],
    { type: TIPO_EXCEL }
  );

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  const nombreSeguro =
    normalizarTexto(nombreArchivo)
      .replace(/[\\/:*?"<>|]/g, '-') || 'SIAGIE-Estudiantes';

  enlace.href = url;
  enlace.download = `${nombreSeguro}.xlsx`;
  enlace.style.display = 'none';

  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  // Liberar la URL después de iniciar la descarga.
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
