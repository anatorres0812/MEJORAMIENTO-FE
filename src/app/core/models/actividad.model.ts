import { Nivel } from './nivel.model';

export interface Actividad {
  id: string;
  texto: string;
  nivel: Nivel;
  fecha: string;
  timestamp: number;
}