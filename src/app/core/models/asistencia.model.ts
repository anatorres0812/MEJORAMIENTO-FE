export type EstadoAsistencia = 'F' | 'A' | 'T';

// Representa la asistencia de un estudiante a un curso en una fecha específica
export interface Asistencia {
  id: string;
  estudianteId: string;
  cursoId: string;
  docenteId: string;
  fecha: string; // YYYY-MM-DD
  estado: EstadoAsistencia;
}