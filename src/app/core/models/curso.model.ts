import { Nivel } from './nivel.model';

export interface Curso {
  id: string;
  nombre: string;
  nivel: Nivel;
  descripcion?: string;
  horasSemanales?: number;
  profesorId?: number | null;
  estado?: string;
}