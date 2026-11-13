import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AsistenciaService } from '../../../../core/services/asistencia.service';

@Component({
  selector: 'app-alumno-mi-asistencia',
  standalone: true,
  templateUrl: './mi-asistencia.component.html',
  styleUrl: './mi-asistencia.component.css'
})
export class MiAsistenciaComponent {
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private asistenciaService = inject(AsistenciaService);

  private estudianteActual = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario?.referenciaId) return undefined;
    return this.estudianteService.getPorId(usuario.referenciaId);
  });

  historial = computed(() => {
    const est = this.estudianteActual();
    return est ? this.asistenciaService.getPorEstudiante(est.id) : [];
  });

  totalRegistros = computed(() => this.historial().length);

  totalPresentes = computed(() => this.historial().filter(h => h.estado === 'A').length);
  totalTardanzas = computed(() => this.historial().filter(h => h.estado === 'T').length);
  totalFaltas = computed(() => this.historial().filter(h => h.estado === 'F').length);

  // Presente y tardanza cuentan como asistencia efectiva; solo la falta resta
  porcentajeAsistencia = computed(() => {
    const total = this.totalRegistros();
    if (total === 0) return 0;
    const efectivas = this.totalPresentes() + this.totalTardanzas();
    return Math.round((efectivas / total) * 100);
  });

  etiquetaEstado(estado: string): string {
    if (estado === 'A') return 'Presente';
    if (estado === 'T') return 'Tardanza';
    return 'Falta';
  }
}
