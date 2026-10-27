import { TipoDocumento, EstadoRegistro, NivelEducativo } from '../../../shared/interfaces';

export interface Estudiante {
  id: number;
  codigo?: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F';
  // Apoderado
  nombreApoderado: string;
  telefonoApoderado: string;
  relacionApoderado: string;
  // Asignación académica
  nivelEducativo?: NivelEducativo;
  gradoId?: number | null;
  seccionId?: number | null;
  // Campos calculados (para mostrar en tabla)
  gradoNombre?: string;
  seccionNombre?: string;
  estado: EstadoRegistro;
}

export interface EstudianteForm {
  codigoEstudiante?: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  genero: 'M' | 'F';
  nombreApoderado: string;
  telefonoApoderado: string;
  relacionApoderado: string;
  nivelEducativo?: NivelEducativo | null;
  gradoId?: number | null;
  seccionId?: number | null;
}
