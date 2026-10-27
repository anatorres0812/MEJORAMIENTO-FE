import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { NotaService } from '../../../../core/services/nota.service';
import { BadgeEstadoComponent } from '../../../../shared/components/badge-estado/badge-estado.component';
import { exportarNotasXlsx } from '../../../../shared/utils/excel-export.util';
import { Calificacion } from '../../../../core/models/nota.model';

@Component({
  selector: 'app-alumno-mis-notas',
  standalone: true,
  imports: [BadgeEstadoComponent, RouterLink],
  templateUrl: './mis-notas.component.html',
  styleUrl: './mis-notas.component.css'
})
export class MisNotasComponent {
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private notaService = inject(NotaService);

  readonly coloresBarra = [
    '#2563eb',
    '#16a34a',
    '#7c3aed',
    '#f59e0b',
    '#dc2626',
    '#1d4ed8'
  ];

  valorGrafico(nota: Calificacion | null | undefined): number {
    const valores: Record<Calificacion, number> = {
      AD: 4,
      A: 3,
      B: 2,
      C: 1
    };

    return nota ? valores[nota] : 0;
  }

  private estudianteActual = computed(() => {
    const usuario = this.authService.usuario();

    if (!usuario?.referenciaId) return undefined;

    return this.estudianteService.getPorId(usuario.referenciaId);
  });

  notas = computed(() => {
    const est = this.estudianteActual();

    return est
      ? this.notaService.getPorEstudiante(est.id)
      : [];
  });

  promedio = computed(() => {
    const est = this.estudianteActual();

    return est
      ? this.notaService.calcularPromedio(est.id)
      : 0;
  });

  // IDs de los compañeros de la misma sección.
  private companerosSeccion = computed(() => {
    const est = this.estudianteActual();

    if (!est) return [];

    return this.estudianteService
      .getPorNivelGradoSeccion(
        est.nivel,
        est.gradoId,
        est.seccionId
      )
      .map(e => e.id);
  });

  // Comparativo: mi nota frente al promedio de la sección.
  rendimientoComparado = computed(() => {
    const companeros = this.companerosSeccion();

    return this.notas().map(n => ({
      curso: n.cursoNombre,
      miNota: n.nota,
      promedioSeccion: this.notaService.promedioPorCursoYEstudiantes(
        n.cursoId,
        companeros
      )
    }));
  });

  async exportarXlsx(): Promise<void> {
    const filas = this.notas().map(n => ({
      curso: n.cursoNombre,
      docente: n.docenteNombre,
      nota: this.valorGrafico(n.nota),
      estado: n.estado
    }));

    await exportarNotasXlsx(
      'mis-notas',
      'Mis Notas',
      filas
    );
  }
}
