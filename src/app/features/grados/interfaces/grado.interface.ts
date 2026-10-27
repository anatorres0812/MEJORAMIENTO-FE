import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

export interface Grado {
  id: number;
  nombre: string;
  nivel: NivelEducativo;
  orden: number;
  descripcion?: string;
  estado: EstadoRegistro;
}

export interface Seccion {
  id: number;
  nombre: string;
  gradoId: number;
  gradoNombre?: string;
  nivel?: NivelEducativo;
  capacidad: number;
  turno: 'MANANA' | 'TARDE' | 'NOCHE';
  estado: EstadoRegistro;
}

// Grados predefinidos por nivel (configurables por la institución):
// INICIAL: 3 años, 4 años, 5 años
// PRIMARIA: 1° a 6° grado
// SECUNDARIA: 1° a 5° grado
