import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

export type EstadoAsistencia = 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADO';

export interface Asistencia {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudianteNombre?: string;
  estudianteCodigo?: string;
  nivelEducativo: NivelEducativo;
  gradoId: number;
  seccionId: number;
  cursoId?: number;
  cursoNombre?: string;
  periodoId: number;
  fecha: string;
  estadoAsistencia: EstadoAsistencia;
  observacion?: string;
  profesorId?: number;
  estado: EstadoRegistro;
}

export interface AsistenciaForm {
  estudianteId: number;
  matriculaId: number;
  nivelEducativo: NivelEducativo;
  gradoId: number;
  seccionId: number;
  cursoId?: number;
  periodoId: number;
  fecha: string;
  estadoAsistencia: EstadoAsistencia;
  observacion?: string;
}

export interface FiltroAsistencia {
  nivelEducativo?: NivelEducativo;
  gradoId?: number;
  seccionId?: number;
  cursoId?: number;
  periodoId?: number;
  fecha?: string;
  estudianteId?: number;
}

// Contrato backend: GET /api/asistencias?seccionId=&cursoId=&fecha=&periodoId=
// Restricción: No duplicar asistencia por (estudiante, curso, fecha)
