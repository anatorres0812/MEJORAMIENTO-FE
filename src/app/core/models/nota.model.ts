export type EstadoNota = 'Aprobado' | 'Desaprobado';

export type EstadoSiagie =
  | 'Logro destacado'
  | 'Logro esperado'
  | 'En proceso'
  | 'En inicio';
export type Periodo =
  | 'I Bimestre'
  | 'II Bimestre'
  | 'III Bimestre'
  | 'IV Bimestre';

export type Calificacion = 'AD' | 'A' | 'B' | 'C';

// Representa la calificación de un estudiante en un curso y bimestre.
export interface Nota {
  id: string;
  estudianteId: string;
  cursoId: string;
  docenteId: string;
  nota: Calificacion;
  periodo: Periodo;
  fecha: string;
}
