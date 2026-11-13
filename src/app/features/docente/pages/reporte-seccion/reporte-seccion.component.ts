import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { NotaService } from '../../../../core/services/nota.service';

import { ReporteSeccionService } from '../../services/reporte-seccion.service';
import { CURSOS } from '../../../../core/mock-data/cursos.mock';
import { exportarNotasXlsx } from '../../../../shared/utils/excel-export.util';

import { Calificacion } from '../../../../core/models/nota.model';

@Component({
  selector: 'app-docente-reporte-seccion',
  standalone: true,
  templateUrl: './reporte-seccion.component.html',
  styleUrl: './reporte-seccion.component.css'
})
export class ReporteSeccionComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private docenteService = inject(DocenteService);
  private estudianteService = inject(EstudianteService);
  private academicoService = inject(AcademicoService);
  private notaService = inject(NotaService);
  private contexto = inject(ReporteSeccionService);

  fechaEmision = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  /**
   * Equivalencias internas para ordenar y calcular promedios.
   * Las calificaciones visibles siguen siendo AD, A, B y C.
   */
  private convertirNota(nota: Calificacion | string | number | null | undefined): number {
    if (typeof nota === 'number') {
      return nota;
    }

    if (!nota) {
      return 0;
    }

    const equivalencias: Record<string, number> = {
      AD: 4,
      A: 3,
      B: 2,
      C: 1
    };

    return equivalencias[nota] ?? 0;
  }

  docente = computed(() => {
    const usuario = this.authService.usuario();

    return usuario?.referenciaId != null
      ? this.docenteService.getPorId(String(usuario.referenciaId))
      : undefined;
  });

  grado = computed(() =>
    this.academicoService.getGradoPorId(this.contexto.gradoId())
  );

  seccion = computed(() =>
    this.academicoService.getSeccionPorId(this.contexto.seccionId())
  );

  curso = computed(() =>
    CURSOS.find(c => c.id === this.contexto.cursoId())
  );

  /**
   * Estudiantes de la sección con su calificación del curso seleccionado.
   * Orden: AD, A, B, C y, al final, los estudiantes sin nota.
   */
  filas = computed(() => {
    const docente = this.docente();

    if (!docente) {
      return [];
    }

    const estudiantes = this.estudianteService.getPorNivelGradoSeccion(
      docente.nivel,
      this.contexto.gradoId(),
      this.contexto.seccionId()
    );

    return estudiantes
      .map(estudiante => {
        const registro = this.notaService.getPorEstudianteYCurso(
          estudiante.id,
          this.contexto.cursoId()
        );

        return {
          estudiante,
          nota: registro?.nota ?? null,
          estado: registro
            ? this.notaService.calcularEstado(registro.nota)
            : null
        };
      })
      .sort((a, b) => {
        // Los estudiantes sin calificación aparecen al final.
        if (a.nota === null && b.nota !== null) {
          return 1;
        }

        if (a.nota !== null && b.nota === null) {
          return -1;
        }

        return this.convertirNota(b.nota) - this.convertirNota(a.nota);
      });
  });

  /** Filas que sí tienen calificación registrada. */
  private filasConNota = computed(() =>
    this.filas().filter(fila => fila.nota !== null)
  );

  /**
   * Promedio de la sección en escala de 1 a 4:
   * AD = 4, A = 3, B = 2, C = 1.
   */
  promedioSeccion = computed(() => {
    const filas = this.filasConNota();

    if (filas.length === 0) {
      return 0;
    }

    const suma = filas.reduce(
      (acumulado, fila) => acumulado + this.convertirNota(fila.nota),
      0
    );

    return Math.round((suma / filas.length) * 100) / 100;
  });

  totalAprobados = computed(() =>
    this.filasConNota().filter(fila => fila.estado === 'Aprobado').length
  );

  totalDesaprobados = computed(() =>
    this.filasConNota().filter(fila => fila.estado === 'Desaprobado').length
  );

  imprimir(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/docente/estudiantes']);
  }

  async exportarXlsx(): Promise<void> {
    const filas = this.filas()
      .filter(
        fila => fila.nota !== null && fila.estado !== null
      )
      .map(fila => ({
        estudiante: `${fila.estudiante.nombres} ${fila.estudiante.apellidos}`,
        curso: this.curso()?.nombre ?? '',
        // Se convierte a número porque la utilidad de Excel
        // podría estar tipada para recibir notas numéricas.
        nota: this.convertirNota(fila.nota),
        estado: fila.estado as 'Aprobado' | 'Desaprobado'
      }));

    if (filas.length === 0) {
      alert('No hay calificaciones registradas para exportar.');
      return;
    }

    const titulo =
      `Reporte de sección — ${this.grado()?.nombre ?? ''} ` +
      `${this.seccion()?.nombre ?? ''} — ${this.curso()?.nombre ?? ''}`;

    const nombreArchivo =
      `reporte-seccion-${this.curso()?.nombre ?? 'curso'}`;

    await exportarNotasXlsx(nombreArchivo, titulo, filas);
  }
}
