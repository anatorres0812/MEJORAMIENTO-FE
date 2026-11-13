import { TipoDocumento, EstadoRegistro, NivelEducativo } from '../../../shared/interfaces';

export interface Profesor {
  id: number;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  nivel?: NivelEducativo;
  telefono: string;
  correo: string;
  fechaContratacion: string;
  estado: EstadoRegistro;
}

export interface ProfesorForm {
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  especialidad: string;
  nivel?: NivelEducativo;
  telefono: string;
  correo: string;
  fechaContratacion: string;
}
