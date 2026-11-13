import { Nivel } from './nivel.model';

export type EstadoEstudiante = 'Activo' | 'Inactivo' | 'Eliminado';

// Representa un estudiante matriculado en el sistema.
export interface Estudiante {
  // Identificador interno del sistema: no es el DNI ni el código SIAGIE.
  id: string | number;

  // Código del estudiante registrado en el sistema académico.
  codigoEstudiante: string;

  nombres: string;
  apellidos: string;
  dni: string;

  apoderado: string;
  telefonoApoderado?: string;
  fotoUrl?: string;

  nivel: Nivel;
  gradoId: string;
  seccionId: string;

  estado: EstadoEstudiante;

  fechaCreacion?: string;
  fechaEdicion?: string;
  fechaEliminacion?: string;
  fechaRestauracion?: string;
}
