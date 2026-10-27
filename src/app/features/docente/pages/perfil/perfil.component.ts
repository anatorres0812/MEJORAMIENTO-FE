import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { NotaService } from '../../../../core/services/nota.service';
import { AsistenciaService } from '../../../../core/services/asistencia.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';

import { Calificacion } from '../../../../core/models/nota.model';

interface ItemActividad {
  texto: string;
  fecha: string;
}

@Component({
  selector: 'app-docente-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilDocenteComponent {
  private authService = inject(AuthService);
  private docenteService = inject(DocenteService);
  private notaService = inject(NotaService);
  private asistenciaService = inject(AsistenciaService);
  private estudianteService = inject(EstudianteService);

  // Convierte la calificación al valor numérico usado para estadísticas.
  private convertirNota(nota: Calificacion): number {
    const equivalencias: Record<Calificacion, number> = {
      AD: 4,
      A: 3,
      B: 2,
      C: 1
    };

    return equivalencias[nota] ?? 0;
  }

  // Información del docente autenticado.
  docenteId = computed(
    () => String(this.authService.usuario()?.referenciaId ?? '')
  );

  docente = computed(
    () => this.docenteService.getPorId(this.docenteId())
  );

  iniciales = computed(() => {
    const doc = this.docente();

    if (!doc) return '';

    return `${doc.nombres.charAt(0)}${doc.apellidos.charAt(0)}`
      .toUpperCase();
  });

  cursos = computed(() => {
    const id = this.docenteId();

    return id
      ? this.docenteService.getCursosDelDocente(id)
      : [];
  });

  // Estadísticas reales.
  private notasRegistradas = computed(
    () => this.notaService.getPorDocenteDetallada(this.docenteId())
  );

  private asistenciaRegistrada = computed(
    () => this.asistenciaService.getPorDocente(this.docenteId())
  );

  totalNotasRegistradas = computed(
    () => this.notasRegistradas().length
  );

  totalEstudiantesAtendidos = computed(() => {
    const idsUnicos = new Set(
      this.notasRegistradas().map(n => n.estudianteId)
    );

    return idsUnicos.size;
  });

  totalRegistrosAsistencia = computed(
    () => this.asistenciaRegistrada().length
  );

  // Promedio general en escala interna de 1 a 4.
  promedioGeneralDeSusCursos = computed(() => {
    const notas = this.notasRegistradas();

    if (notas.length === 0) return 0;

    const suma = notas.reduce(
      (acc, n) => acc + this.convertirNota(n.nota),
      0
    );

    return Math.round((suma / notas.length) * 100) / 100;
  });

  // Rendimiento por curso.
  rendimientoPorCurso = computed(() => {
    return this.cursos().map(curso => {
      const notasDelCurso = this.notasRegistradas().filter(
        n => n.cursoId === curso.id
      );

      const promedio = notasDelCurso.length === 0
        ? 0
        : Math.round(
            (
              notasDelCurso.reduce(
                (acc, n) => acc + this.convertirNota(n.nota),
                0
              ) / notasDelCurso.length
            ) * 100
          ) / 100;

      return {
        nombre: curso.nombre,
        estudiantesEvaluados: notasDelCurso.length,
        promedio
      };
    });
  });

  // Actividad reciente registrada por el docente.
  actividadReciente = computed<ItemActividad[]>(() => {
    const deNotas: ItemActividad[] = this.notasRegistradas().map(n => ({
      texto: `Registraste la nota de ${n.cursoNombre} a ${n.estudianteNombre}: ${n.nota}.`,
      fecha: n.fecha
    }));

    const deAsistencia: ItemActividad[] =
      this.asistenciaRegistrada().map(a => ({
        texto: `Marcaste asistencia (${a.estado}) en ${a.cursoNombre} a ${a.estudianteNombre}.`,
        fecha: a.fecha
      }));

    return [...deNotas, ...deAsistencia]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 6);
  });

  // Edición del perfil.
  editando = signal(false);

  nombres = signal('');
  apellidos = signal('');
  correo = signal('');
  especialidad = signal('');
  telefono = signal('');
  fotoUrl = signal<string | undefined>(undefined);

  mensajeError = signal('');
  mensajeExito = signal('');

  activarEdicion(): void {
    const doc = this.docente();

    if (!doc) return;

    this.nombres.set(doc.nombres);
    this.apellidos.set(doc.apellidos);
    this.correo.set(doc.correo);
    this.especialidad.set(doc.especialidad);
    this.telefono.set(doc.telefono ?? '');
    this.fotoUrl.set(doc.fotoUrl);

    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.mensajeError.set('');
  }

  onFotoSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    if (archivo.size > 1.5 * 1024 * 1024) {
      this.mensajeError.set(
        'La imagen es muy pesada. Usa una de menos de 1.5 MB.'
      );

      input.value = '';
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.mensajeError.set('Selecciona un archivo de imagen válido.');
      input.value = '';
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {
      this.fotoUrl.set(lector.result as string);
      this.mensajeError.set('');
    };

    lector.onerror = () => {
      this.mensajeError.set('No se pudo cargar la imagen.');
    };

    lector.readAsDataURL(archivo);
  }

  guardar(): void {
    const nombres = this.nombres().trim();
    const apellidos = this.apellidos().trim();
    const correo = this.correo().trim();
    const especialidad = this.especialidad().trim();
    const telefono = this.telefono().trim();

    if (!nombres || !apellidos || !correo || !especialidad) {
      this.mensajeError.set(
        'Completa todos los campos obligatorios.'
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.mensajeError.set('Ingresa un correo válido.');
      return;
    }

    const doc = this.docente();

    if (!doc) {
      this.mensajeError.set(
        'No se encontró la información del docente.'
      );
      return;
    }

    const id = this.docenteId();

    this.docenteService.actualizar(id, {
      nombres,
      apellidos,
      correo,
      especialidad,
      telefono,
      fotoUrl: this.fotoUrl(),
      nivel: doc.nivel,
      cursosAsignados: doc.cursosAsignados
    });

    this.authService.actualizarUsuarioSesion({
      nombreCompleto: `${nombres} ${apellidos}`,
    });

    this.editando.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('Expediente actualizado correctamente.');

    setTimeout(() => {
      this.mensajeExito.set('');
    }, 3000);
  }
}