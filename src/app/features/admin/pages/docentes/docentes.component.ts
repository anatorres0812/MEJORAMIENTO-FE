import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocenteService } from '../../../../core/services/docente.service';
import { CursoService } from '../../../../core/services/curso.service';
import { NivelAdminService } from '../../../../core/services/nivel-admin.service';
import { Nivel } from '../../../../core/models/nivel.model';
import { exportarCsv } from '../../../../shared/utils/csv-export.util';
import { PaginadorComponent } from '../../../../shared/components/paginador/paginador.component';

@Component({
  selector: 'app-admin-docentes',
  standalone: true,
  imports: [FormsModule, PaginadorComponent],
  templateUrl: './docentes.component.html',
  styleUrl: './docentes.component.css'
})
export class DocentesAdminComponent {
  private docenteService = inject(DocenteService);
  private cursoService = inject(CursoService);
  private nivelAdminService = inject(NivelAdminService);

  readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];

  nivelActivo = this.nivelAdminService.nivelSeleccionado;

  docentes = computed(() =>
    this.docenteService.getTodos().filter(d => d.nivel === this.nivelActivo())
  );

  cambiarNivel(nivel: Nivel): void {
    this.nivelAdminService.seleccionar(nivel);
    this.paginaActual.set(1);
  }

  // ── Paginación ──────────────────────────────────────────────
  readonly docentesPorPagina = 10;
  paginaActual = signal(1);

  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.docentes().length / this.docentesPorPagina))
  );

  docentesPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.docentesPorPagina;
    return this.docentes().slice(inicio, inicio + this.docentesPorPagina);
  });

  cambiarPagina(pagina: number): void {
    this.paginaActual.set(pagina);
  }

  mostrarFormulario = signal(false);
  editandoId = signal<string | null>(null);

  nombres = signal('');
  apellidos = signal('');
  correo = signal('');
  especialidad = signal('');
  nivelSeleccionado = signal<Nivel | ''>('');
  cursosSeleccionados = signal<string[]>([]);

  mensajeError = signal('');
  mensajeExito = signal('');

  cursosDisponibles = computed(() => {
    const nivel = this.nivelSeleccionado();
    return nivel ? this.cursoService.getPorNivel(nivel) : [];
  });

  nombreCurso(cursoId: string): string {
    return this.cursoService.getPorId(cursoId)?.nombre ?? cursoId;
  }

  abrirFormulario(): void {
    this.editandoId.set(null);
    this.nombres.set('');
    this.apellidos.set('');
    this.correo.set('');
    this.especialidad.set('');
    this.nivelSeleccionado.set('');
    this.cursosSeleccionados.set([]);
    this.mensajeError.set('');
    this.mostrarFormulario.set(true);
  }

  abrirEdicion(docenteId: string): void {
    const doc = this.docenteService.getPorId(docenteId);
    if (!doc) return;

    this.editandoId.set(docenteId);
    this.nombres.set(doc.nombres);
    this.apellidos.set(doc.apellidos);
    this.correo.set(doc.correo);
    this.especialidad.set(doc.especialidad);
    this.nivelSeleccionado.set(doc.nivel);
    this.cursosSeleccionados.set([...doc.cursosAsignados]);
    this.mensajeError.set('');
    this.mostrarFormulario.set(true);
  }

  cancelar(): void {
    this.mostrarFormulario.set(false);
    this.editandoId.set(null);
    this.mensajeError.set('');
  }

  onCambioNivel(nivel: string): void {
    this.nivelSeleccionado.set(nivel as Nivel);
    this.cursosSeleccionados.set([]);
  }

  toggleCurso(cursoId: string, marcado: boolean): void {
    const actuales = this.cursosSeleccionados();
    this.cursosSeleccionados.set(
      marcado ? [...actuales, cursoId] : actuales.filter(id => id !== cursoId)
    );
  }

  estaMarcado(cursoId: string): boolean {
    return this.cursosSeleccionados().includes(cursoId);
  }

  guardar(): void {
    const nombres = this.nombres().trim();
    const apellidos = this.apellidos().trim();
    const correo = this.correo().trim();
    const especialidad = this.especialidad().trim();
    const nivel = this.nivelSeleccionado();
    const cursos = this.cursosSeleccionados();

    if (!nombres || !apellidos || !correo || !especialidad || !nivel) {
      this.mensajeError.set('Completa todos los campos.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.mensajeError.set('Ingresa un correo válido.');
      return;
    }

    if (cursos.length === 0) {
      this.mensajeError.set('Asigna al menos un curso.');
      return;
    }

    const idEnEdicion = this.editandoId();
    const datos = {
      nombres, apellidos, correo, especialidad,
      nivel: nivel as Nivel,
      cursosAsignados: cursos,
    };

    if (idEnEdicion) {
      this.docenteService.actualizar(idEnEdicion, datos);
    } else {
      this.docenteService.crear(datos);
    }

    this.cancelar();
    this.mensajeExito.set(
      idEnEdicion ? 'Docente actualizado correctamente.' : 'Docente registrado correctamente.'
    );
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }

  exportarDocentesCsv(): void {
    const filas = this.docentes().map(doc => [
      `${doc.nombres} ${doc.apellidos}`,
      doc.correo,
      doc.especialidad,
      doc.cursosAsignados.map(id => this.nombreCurso(id)).join(' | '),
    ]);

    exportarCsv(
      `docentes-${this.nivelActivo()}`,
      ['Docente', 'Correo', 'Especialidad', 'Cursos asignados'],
      filas
    );
  }
}
