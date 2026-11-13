import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicoService } from '../../../../core/services/academico.service';
import { CursoService } from '../../../../core/services/curso.service';
import { NivelAdminService } from '../../../../core/services/nivel-admin.service';
import { Nivel } from '../../../../core/models/nivel.model';

type TabAcademico = 'grados' | 'secciones' | 'cursos';

@Component({
  selector: 'app-admin-academico',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './academico.component.html',
  styleUrl: './academico.component.css'
})
export class AcademicoComponent {
  private academicoService = inject(AcademicoService);
  private cursoService = inject(CursoService);
  private nivelAdminService = inject(NivelAdminService);

  readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];
  nivelActivo = this.nivelAdminService.nivelSeleccionado;

  tabActiva = signal<TabAcademico>('grados');

  mensajeExito = signal('');

  cambiarNivel(nivel: Nivel): void {
    this.nivelAdminService.seleccionar(nivel);
  }

  cambiarTab(tab: TabAcademico): void {
    this.tabActiva.set(tab);
  }

  // ── Datos por nivel ─────────────────────────────────────────
  grados = computed(() => this.academicoService.getGradosPorNivel(this.nivelActivo()));

  secciones = computed(() =>
    this.grados().flatMap(g =>
      this.academicoService.getSeccionesPorGrado(g.id).map(s => ({ ...s, gradoNombre: g.nombre }))
    )
  );

  cursos = computed(() => this.cursoService.getPorNivel(this.nivelActivo()));

  // ── Formulario: Grado ───────────────────────────────────────
  mostrarFormGrado = signal(false);
  editandoGradoId = signal<string | null>(null);
  nombreGrado = signal('');
  errorGrado = signal('');

  abrirFormGrado(): void {
    this.editandoGradoId.set(null);
    this.nombreGrado.set('');
    this.errorGrado.set('');
    this.mostrarFormGrado.set(true);
  }

  abrirEdicionGrado(gradoId: string): void {
    const grado = this.academicoService.getGradoPorId(gradoId);
    if (!grado) return;
    this.editandoGradoId.set(gradoId);
    this.nombreGrado.set(grado.nombre);
    this.errorGrado.set('');
    this.mostrarFormGrado.set(true);
  }

  cancelarFormGrado(): void {
    this.mostrarFormGrado.set(false);
    this.editandoGradoId.set(null);
    this.errorGrado.set('');
  }

  guardarGrado(): void {
    const nombre = this.nombreGrado().trim();
    if (!nombre) {
      this.errorGrado.set('Ingresa un nombre para el grado.');
      return;
    }

    const idEnEdicion = this.editandoGradoId();
    if (idEnEdicion) {
      this.academicoService.actualizarGrado(idEnEdicion, nombre);
    } else {
      this.academicoService.crearGrado(nombre, this.nivelActivo());
    }

    this.cancelarFormGrado();
    this.mostrarExito(idEnEdicion ? 'Grado actualizado correctamente.' : 'Grado creado correctamente.');
  }

  // ── Formulario: Sección ─────────────────────────────────────
  mostrarFormSeccion = signal(false);
  editandoSeccionId = signal<string | null>(null);
  nombreSeccion = signal('');
  gradoParaSeccion = signal('');
  errorSeccion = signal('');

  abrirFormSeccion(): void {
    this.editandoSeccionId.set(null);
    this.nombreSeccion.set('');
    this.gradoParaSeccion.set('');
    this.errorSeccion.set('');
    this.mostrarFormSeccion.set(true);
  }

  abrirEdicionSeccion(seccionId: string): void {
    const seccion = this.academicoService.getSeccionPorId(seccionId);
    if (!seccion) return;
    this.editandoSeccionId.set(seccionId);
    this.nombreSeccion.set(seccion.nombre);
    this.gradoParaSeccion.set(seccion.gradoId);
    this.errorSeccion.set('');
    this.mostrarFormSeccion.set(true);
  }

  cancelarFormSeccion(): void {
    this.mostrarFormSeccion.set(false);
    this.editandoSeccionId.set(null);
    this.errorSeccion.set('');
  }

  guardarSeccion(): void {
    const nombre = this.nombreSeccion().trim();
    const gradoId = this.gradoParaSeccion();

    if (!nombre) {
      this.errorSeccion.set('Ingresa un nombre para la sección.');
      return;
    }

    const idEnEdicion = this.editandoSeccionId();

    if (idEnEdicion) {
      this.academicoService.actualizarSeccion(idEnEdicion, nombre);
    } else {
      if (!gradoId) {
        this.errorSeccion.set('Selecciona un grado.');
        return;
      }
      this.academicoService.crearSeccion(nombre, gradoId);
    }

    this.cancelarFormSeccion();
    this.mostrarExito(idEnEdicion ? 'Sección actualizada correctamente.' : 'Sección creada correctamente.');
  }

  // ── Formulario: Curso ───────────────────────────────────────
  mostrarFormCurso = signal(false);
  editandoCursoId = signal<string | null>(null);
  nombreCurso = signal('');
  errorCurso = signal('');

  abrirFormCurso(): void {
    this.editandoCursoId.set(null);
    this.nombreCurso.set('');
    this.errorCurso.set('');
    this.mostrarFormCurso.set(true);
  }

  abrirEdicionCurso(cursoId: string): void {
    const curso = this.cursoService.getPorId(cursoId);
    if (!curso) return;
    this.editandoCursoId.set(cursoId);
    this.nombreCurso.set(curso.nombre);
    this.errorCurso.set('');
    this.mostrarFormCurso.set(true);
  }

  cancelarFormCurso(): void {
    this.mostrarFormCurso.set(false);
    this.editandoCursoId.set(null);
    this.errorCurso.set('');
  }

  guardarCurso(): void {
    const nombre = this.nombreCurso().trim();
    if (!nombre) {
      this.errorCurso.set('Ingresa un nombre para el curso.');
      return;
    }

    const idEnEdicion = this.editandoCursoId();
    if (idEnEdicion) {
      this.cursoService.actualizar(idEnEdicion, nombre);
    } else {
      this.cursoService.crear(nombre, this.nivelActivo());
    }

    this.cancelarFormCurso();
    this.mostrarExito(idEnEdicion ? 'Curso actualizado correctamente.' : 'Curso creado correctamente.');
  }

  private mostrarExito(texto: string): void {
    this.mensajeExito.set(texto);
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }
}
