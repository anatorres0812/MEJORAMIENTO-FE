import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

// La escala de evaluación es configurable según el nivel y la institución.
// No se impone una escala única. Los valores son strings para soportar
// escalas numéricas (0-20), literales (AD, A, B, C) u otras configuraciones.
export interface Nota {
  id: number;
  matriculaId: number;
  estudianteId: number;
  estudianteNombre?: string;
  estudianteCodigo?: string;
  competenciaId: number;
  competenciaNombre?: string;
  cursoId: number;
  cursoNombre?: string;
  nivelEducativo: NivelEducativo;
  gradoId: number;
  seccionId: number;
  periodoId: number;
  periodoNombre?: string;
  profesorId?: number;
  calificacion: string;   // Configurable: '15', 'A', 'AD', etc.
  observacion?: string;
  fechaRegistro: string;
  estado: EstadoRegistro;
}

export interface NotaForm {
  matriculaId: number;
  estudianteId: number;
  competenciaId: number;
  cursoId: number;
  nivelEducativo: NivelEducativo;
  gradoId: number;
  seccionId: number;
  periodoId: number;
  profesorId?: number;
  calificacion: string;
  observacion?: string;
}

export interface FiltroNotas {
  nivelEducativo?: NivelEducativo;
  gradoId?: number;
  seccionId?: number;
  cursoId?: number;
  periodoId?: number;
  estudianteId?: number;
}

export interface NotaEstudiante {
  estudianteId: number;
  estudianteNombre: string;
  estudianteCodigo: string;
  competencias: { competenciaId: number; competenciaNombre: string; calificacion: string; notaId?: number }[];
}

// Contrato backend:
// GET    /api/notas?matriculaId=&cursoId=&periodoId=&competenciaId=
// POST   /api/notas/lote  (registro masivo)
// PUT    /api/notas/{id}
// DELETE /api/notas/{id} (lógica)
// PATCH  /api/notas/{id}/restaurar
