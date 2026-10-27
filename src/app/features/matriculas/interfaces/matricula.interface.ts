import { NivelEducativo, EstadoRegistro } from '../../../shared/interfaces';

export type EstadoMatricula = 'PENDIENTE' | 'MATRICULADO' | 'TRASLADADO' | 'RETIRADO' | 'ELIMINADO';

export interface Matricula {
  id: number;
  // Estudiante
  estudianteId: number;
  estudianteNombres?: string;
  estudianteApellidos?: string;
  estudianteDni?: string;
  estudianteCodigo?: string;
  estudianteFechaNacimiento?: string;
  estudianteGenero?: string;
  // Asignación
  nivelEducativo: NivelEducativo;
  gradoId: number;
  gradoNombre?: string;
  seccionId: number;
  seccionNombre?: string;
  periodoId: number;
  periodoNombre?: string;
  anioAcademico: number;
  fechaMatricula: string;
  estado: EstadoMatricula;
  // Apoderado
  dniApoderado?: string;
  nombresApoderado?: string;
  apellidosApoderado?: string;
  parentescoApoderado?: string;
  telefonoApoderado?: string;
}

export interface MatriculaForm {
  estudianteId: number;
  nivelEducativo: NivelEducativo;
  gradoId: number;
  seccionId: number;
  periodoId: number;
  anioAcademico: number;
  fechaMatricula: string;
  estado: EstadoMatricula;
  dniApoderado?: string;
  nombresApoderado?: string;
  apellidosApoderado?: string;
  parentescoApoderado?: string;
  telefonoApoderado?: string;
}
