import { Asistencia } from '../../core/models/asistencia.model';

export interface AsistenciaDetallada extends Asistencia {
  cursoNombre: string;
  estudianteNombre?: string;
}
