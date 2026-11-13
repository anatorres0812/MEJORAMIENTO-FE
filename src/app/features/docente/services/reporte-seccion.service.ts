
import { Injectable, signal } from '@angular/core';
import { Periodo } from '../../../core/models/nota.model';

@Injectable({
  providedIn: 'root'
})
export class ReporteSeccionService {
  gradoId = signal('');
  seccionId = signal('');
  cursoId = signal('');
  periodo = signal<Periodo>('I Bimestre');

  establecer(
    gradoId: string,
    seccionId: string,
    cursoId: string,
    periodo: Periodo = 'I Bimestre'
  ): void {
    this.gradoId.set(gradoId);
    this.seccionId.set(seccionId);
    this.cursoId.set(cursoId);
    this.periodo.set(periodo);
  }
}
