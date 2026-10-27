import { EstadoRegistro } from '../../../shared/interfaces';

export interface Periodo {
  id: number;
  nombre: string;
  anioAcademico: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  estado: EstadoRegistro;
}

export interface PeriodoForm {
  nombre: string;
  anioAcademico: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

// Contrato backend: PATCH /api/periodos/{id}/activar
// Solo un periodo puede estar activo a la vez
