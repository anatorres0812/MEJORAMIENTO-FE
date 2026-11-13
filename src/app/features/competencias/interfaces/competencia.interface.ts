import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

export interface Competencia {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  cursoId: number;
  cursoNombre?: string;
  nivel: NivelEducativo;
  gradoIds: number[];
  estado: EstadoRegistro;
}

export interface CompetenciaForm {
  codigo: string;
  nombre: string;
  descripcion?: string;
  cursoId: number;
  nivel: NivelEducativo;
  gradoIds: number[];
}

// IMPORTANTE: Las competencias NO se generan automáticamente.
// La institución debe ingresarlas según su currículo.
// Contrato backend: GET /api/competencias?cursoId=&nivel=&gradoId=
