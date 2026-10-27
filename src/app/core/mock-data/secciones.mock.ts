import { Seccion } from '../models/seccion.model';

// Por simplicidad académica, generamos secciones A, B y C para cada grado
const LETRAS = ['A', 'B', 'C'];

function generarSecciones(gradoIds: string[]): Seccion[] {
  const secciones: Seccion[] = [];
  for (const gradoId of gradoIds) {
    for (const letra of LETRAS) {
      secciones.push({
        id: `${gradoId}-${letra}`,
        nombre: `Sección ${letra}`,
        gradoId,
      });
    }
  }
  return secciones;
}

export const SECCIONES: Seccion[] = generarSecciones([
  'i-3', 'i-4', 'i-5',
  'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6',
  's-1', 's-2', 's-3', 's-4', 's-5',
]);