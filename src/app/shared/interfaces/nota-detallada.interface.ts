import { Nota, EstadoNota } from '../../core/models/nota.model';

export interface NotaDetallada extends Nota {
  cursoNombre: string;
  docenteNombre: string;
  estudianteNombre: string;
  estado: EstadoNota;
}
