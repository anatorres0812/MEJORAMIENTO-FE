
import {
  Component,
  inject,
  signal,
  computed
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AsistenciaService } from '../../../../core/services/asistencia.service';
import { EstadoAsistencia } from '../../../../core/models/asistencia.model';
import {
  exportarAsistenciaXlsx,
  FilaAsistencia
} from '../../../../shared/utils/excel-export.util';

@Component({
  selector: 'app-docente-asistencia',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './asistencia.component.html',
  styleUrl: './asistencia.component.css'
})
export class AsistenciaComponent {
  private readonly authService = inject(AuthService);
  private readonly docenteService = inject(DocenteService);
  private readonly academicoService = inject(AcademicoService);
  private readonly estudianteService = inject(EstudianteService);
  private readonly asistenciaService = inject(AsistenciaService);

  readonly estados: EstadoAsistencia[] = ['A', 'T', 'F'];

  readonly mensaje = signal('');
  readonly guardando = signal(false);

  private readonly estadosTemporales =
    signal<Record<string, EstadoAsistencia>>({});

docente = computed(() => {
  const usuario = this.authService.usuario();

  if (!usuario) {
    return undefined;
  }

  const docenteId = String(usuario.referenciaId)
    .replace(/^sesion-/, '');

  return this.docenteService.getPorIdBackend(docenteId);
});

  nivelDocente = computed(() => this.docente()?.nivel);

cursosDelDocente = computed(() => {
  const docente = this.docente();

  return docente
    ? this.docenteService.getCursosBackendDelDocente(docente.id)
    : [];
});

  grados = computed(() => {
    const nivel = this.nivelDocente();

    return nivel
      ? this.academicoService.getGradosPorNivel(nivel)
      : [];
  });

  gradoSeleccionado = signal('');
  seccionSeleccionado = signal('');
  cursoSeleccionado = signal('');
  fecha = signal(new Date().toISOString().slice(0, 10));

  secciones = computed(() => {
    const gradoId = this.gradoSeleccionado();

    return gradoId
      ? this.academicoService.getSeccionesPorGrado(gradoId)
      : [];
  });

  filtroCompleto = computed(() =>
    !!this.gradoSeleccionado() &&
    !!this.seccionSeleccionado() &&
    !!this.cursoSeleccionado()
  );

estudiantes = computed(() => {
  const nivel = this.nivelDocente();

  if (!this.filtroCompleto() || !nivel) {
    return [];
  }

  return this.estudianteService.getPorNivelGradoSeccion(
    nivel,
    this.gradoSeleccionado(),
    this.seccionSeleccionado()
  );
});


onCambioGrado(gradoId: string): void {
  console.log('Grado seleccionado:', gradoId);

  this.gradoSeleccionado.set(gradoId);
  this.seccionSeleccionado.set('');
  this.limpiarMensaje();
}

cambiarSeccion(seccionId: string): void {
  console.log('Sección seleccionada:', seccionId);

  this.seccionSeleccionado.set(seccionId);
  this.limpiarMensaje();
}

  cambiarCurso(cursoId: string): void {
    this.cursoSeleccionado.set(cursoId);
    this.limpiarMensaje();
  }

  cambiarFecha(fecha: string): void {
    this.fecha.set(fecha);
    this.limpiarMensaje();
  }

  private claveEstado(estudianteId: string | number): string {
    return [
      String(estudianteId),
      this.cursoSeleccionado(),
      this.fecha()
    ].join('|');
  }

  estadoDe(
    estudianteId: string | number
  ): EstadoAsistencia | undefined {
    const temporal =
      this.estadosTemporales()[this.claveEstado(estudianteId)];

    return temporal ??
      this.asistenciaService.obtenerEstado(
        estudianteId,
        this.cursoSeleccionado(),
        this.fecha()
      );
  }

  
  marcar(
    estudianteId: string | number,
    estado: EstadoAsistencia
  ): void {
    const docente = this.docente();

    if (!docente) {
      this.mensaje.set('No se encontró el docente de la sesión.');
      return;
    }

    if (!this.filtroCompleto()) {
      this.mensaje.set('Selecciona grado, sección y curso.');
      return;
    }

    if (this.guardando()) {
      return;
    }

    const estudiante = Number(estudianteId);
    const cursoId = Number(this.cursoSeleccionado());

    // El ID de la sesión puede ser d1, d2, etc.
    // Para guardar, necesitamos el ID numérico del backend.
    const docenteId = Number(
      (docente as any).idBackend ?? docente.id
    );

    if (
      !Number.isSafeInteger(estudiante) || estudiante <= 0 ||
      !Number.isSafeInteger(cursoId) || cursoId <= 0 ||
      !Number.isSafeInteger(docenteId) || docenteId <= 0
    ) {
      this.mensaje.set(
        'No se guardó: falta un ID numérico real de estudiante, curso o docente.'
      );

      console.error('IDs de asistencia:', {
        estudianteId,
        cursoId: this.cursoSeleccionado(),
        docenteId: docente.id,
        idBackend: (docente as any).idBackend
      });

      return;
    }

    this.guardando.set(true);
    this.mensaje.set('Guardando asistencia...');

    const clave = this.claveEstado(estudianteId);
    const estadoAnterior = this.estadoDe(estudianteId);

    this.asistenciaService.marcar(
      estudiante,
      String(cursoId),
      String(docenteId),
      this.fecha(),
      estado
    ).subscribe({
      next: () => {
        this.estadosTemporales.update(actual => ({
          ...actual,
          [clave]: estado
        }));

        this.mensaje.set('Asistencia guardada correctamente.');
      },
      error: error => {
        console.error('Error al guardar asistencia:', error);

        this.mensaje.set(
          'No se pudo guardar la asistencia. Revisa el backend y los IDs.'
        );

        // No dejar un estado provisional si el servidor falla.
        this.estadosTemporales.update(actual => {
          const copia = { ...actual };

          if (estadoAnterior === undefined) {
            delete copia[clave];
          } else {
            copia[clave] = estadoAnterior;
          }

          return copia;
        });
      },
      complete: () => {
        this.guardando.set(false);
      }
    });
  }

  limpiarMensaje(): void {
    this.mensaje.set('');
  }

  async exportar(): Promise<void> {
    const cursoNombre =
      this.cursosDelDocente().find(
        c => c.id === this.cursoSeleccionado()
      )?.nombre ?? 'Curso';

    const filas: FilaAsistencia[] = this.estudiantes().map(est => ({
      estudiante: `${est.nombres} ${est.apellidos}`,
      dni: String(est.dni ?? ''),
      estado: this.estadoDe(est.id) ?? ''
    }));

    await exportarAsistenciaXlsx(
      `asistencia-${cursoNombre}-${this.fecha()}`,
      cursoNombre,
      this.fecha(),
      filas
    );
  }
}
