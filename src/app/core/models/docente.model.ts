
import { Nivel } from './nivel.model';

export interface Docente {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  dni?: string;
  especialidad: string;
  telefono?: string;
  nivel: Nivel;
  cursosAsignados: string[];
  fotoUrl?: string;
}
