import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: NivelEducativo;
  horasSemanales?: number;
  profesorId?: number;
  profesorNombre?: string;
  gradoIds: number[];
  gradoNombres?: string[];
  estado: EstadoRegistro;
}

export interface CursoForm {
  codigo: string;
  nombre: string;
  descripcion?: string;
  nivel: NivelEducativo;
  horasSemanales?: number;
  profesorId?: number | null;
  gradoIds: number[];
}
