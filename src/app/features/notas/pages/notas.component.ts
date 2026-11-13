
import {
  Component,
  inject,
  signal,
  computed,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';

import { NotasService } from '../services/notas.service';
import { MatriculasService } from '../../matriculas/services/matriculas.service';
import { GradosService } from '../../grados/services/grados.service';
import { CursosService } from '../../cursos/services/cursos.service';
import { CompetenciasService } from '../../competencias/services/competencias.service';
import { PeriodosService } from '../../periodos/services/periodos.service';
import { ProfesoresService } from '../../profesores/services/profesores.service';

import { ExportService } from '../../../core/services/export.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

import { Nota, NotaForm } from '../interfaces/nota.interface';
import { Matricula } from '../../matriculas/interfaces/matricula.interface';
import { Grado, Seccion } from '../../grados/interfaces/grado.interface';
import { Curso } from '../../cursos/interfaces/curso.interface';
import { Competencia } from '../../competencias/interfaces/competencia.interface';
import { Periodo } from '../../periodos/interfaces/periodo.interface';
import { Profesor } from '../../profesores/interfaces/profesor.interface';
import { NivelEducativo } from '../../../shared/interfaces';

interface NotaFila {
  calificacion: string;
  notaId?: number;
  obs?: string;
}

interface FilaEstudiante {
  matriculaId: number;
  estudianteId: number;
  nombre: string;
  codigo: string;
  documento: string;
  notas: { [competenciaId: number]: NotaFila };
}

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h2>📝 Registro de Notas</h2>
      <p>Calificaciones por nivel, grado, sección, curso y periodo</p>
    </div>
  </div>

  <div class="card" style="margin-bottom:16px">
    <h4 style="margin-bottom:14px;color:#1E3A5F">
      🔍 Seleccionar contexto de evaluación
    </h4>

    <div class="form-grid form-grid-3" style="gap:12px">
      <div class="form-group">
        <label>Nivel Educativo *</label>
        <select
          class="form-control"
          [(ngModel)]="selNivelValue"
          (change)="onNivelChange()">
          <option value="">— Seleccionar —</option>
          <option value="INICIAL">Inicial</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
        </select>
      </div>

      <div class="form-group">
        <label>Grado *</label>
        <select
          class="form-control"
          [(ngModel)]="selGradoIdValue"
          (change)="onGradoChange()"
          [disabled]="!selNivel()">
          <option value="">— Seleccionar —</option>
          @for (g of gradosFiltrados(); track g.id) {
            <option [value]="g.id">{{ g.nombre }}</option>
          }
        </select>
      </div>

      <div class="form-group">
        <label>Sección *</label>
        <select
          class="form-control"
          [(ngModel)]="selSeccionIdValue"
          (change)="onSeccionChange()"
          [disabled]="!selGradoId()">
          <option value="">— Seleccionar —</option>
          @for (s of seccionesFiltradas(); track s.id) {
            <option [value]="s.id">{{ s.nombre }} ({{ s.turno }})</option>
          }
        </select>
      </div>

      <div class="form-group">
        <label>Curso / Área Curricular *</label>
        <select
          class="form-control"
          [(ngModel)]="selCursoIdValue"
          (change)="onCursoChange()"
          [disabled]="!selNivel()">
          <option value="">— Seleccionar —</option>
          @for (c of cursosFiltrados(); track c.id) {
            <option [value]="c.id">{{ c.nombre }}</option>
          }
        </select>
      </div>

      <div class="form-group">
        <label>Periodo Académico *</label>
        <select
          class="form-control"
          [(ngModel)]="selPeriodoIdValue"
          (change)="onPeriodoChange()"
          [disabled]="!selNivel()">
          <option value="">— Seleccionar —</option>
          @for (p of periodos(); track p.id) {
            <option [value]="p.id">
              {{ p.nombre }} {{ p.anioAcademico }}{{ p.activo ? ' ✅' : '' }}
            </option>
          }
        </select>
      </div>

      <div class="form-group">
        <label>Profesor Responsable</label>
        <select class="form-control" [(ngModel)]="selProfesorIdValue">
          <option value="">— Sin asignar —</option>
          @for (p of profesores(); track p.id) {
            <option [value]="p.id">{{ p.apellidos }}, {{ p.nombres }}</option>
          }
        </select>
      </div>

      <div class="form-group" style="align-self:flex-end">
        <button
          class="btn btn-primary w-full"
          (click)="cargarTabla()"
          [disabled]="!puedeCargar() || cargando()">
          {{ cargando() ? 'Cargando...' : 'Cargar Lista de Estudiantes' }}
        </button>
      </div>
    </div>
  </div>

  @if (tablaVisible()) {
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <h4 style="margin:0;color:#1E3A5F">{{ encabezadoTabla() }}</h4>
          <p class="text-muted text-sm">
            {{ filas().length }} estudiante(s) ·
            {{ competenciasActuales().length }} competencia(s)
          </p>
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <button
            class="btn btn-success btn-sm"
            (click)="guardarTodas()"
            [disabled]="guardando() || cargando()">
            💾 {{ guardando() ? 'Guardando...' : 'Guardar Notas' }}
          </button>

          <button class="btn btn-outline btn-sm" (click)="exportarExcel()">
            📊 Excel
          </button>

          <button class="btn btn-outline btn-sm" (click)="exportarCSV()">
            📄 CSV
          </button>

          <button class="btn btn-outline btn-sm" (click)="imprimir()">
            🖨️ Imprimir
          </button>
        </div>
      </div>

      @if (cargando()) {
        <div class="loading-wrap">
          <div class="spinner-md"></div>
          Cargando...
        </div>
      } @else if (filas().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <p>No hay estudiantes matriculados en esta sección y periodo</p>
        </div>
      } @else {
        <div class="table-wrap" id="tabla-notas">
          <table class="table" style="min-width:700px">
            <thead>
              <tr>
                <th style="min-width:50px">#</th>
                <th style="min-width:60px">Código</th>
                <th style="min-width:200px">Apellidos y Nombres</th>

                @for (comp of competenciasActuales(); track comp.id) {
                  <th style="min-width:140px;font-size:12px" [title]="comp.nombre">
                    {{ comp.codigo }}<br>
                    <span class="text-muted" style="font-weight:400;font-size:11px">
                      {{ comp.nombre | slice:0:30 }}...
                    </span>
                  </th>
                }

                <th style="min-width:80px">Acciones</th>
              </tr>
            </thead>

            <tbody>
              @for (fila of filas(); track fila.matriculaId; let i = $index) {
                <tr>
                  <td class="text-muted text-sm">{{ i + 1 }}</td>
                  <td><code style="font-size:12px">{{ fila.codigo }}</code></td>
                  <td>
                    <strong>{{ fila.nombre }}</strong><br>
                    <span class="text-muted text-sm">{{ fila.documento }}</span>
                  </td>

                  @for (comp of competenciasActuales(); track comp.id) {
                    <td>
                      <input
                        class="form-control"
                        style="width:100%;padding:6px 8px;font-size:14px;text-align:center"
                        [(ngModel)]="fila.notas[comp.id].calificacion"
                        [placeholder]="escalaSugerida()"
                        [title]="'Calificación de ' + fila.nombre + ' en ' + comp.nombre"
                      />
                    </td>
                  }

                  <td>
                    <button
                      class="btn btn-outline btn-sm btn-icon"
                      title="Ver detalle"
                      (click)="verDetalle(fila)">
                      👁️
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <p style="font-size:12px;color:#a0aec0;margin-top:10px;text-align:right">
          Escala sugerida para {{ selNivel() }}:
          <strong>{{ escalaSugerida() }}</strong>
          — configurable según la institución
        </p>
      }
    </div>

    <div class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:#1E3A5F">📚 Historial de Notas Registradas</h4>
        <button class="btn btn-outline btn-sm" (click)="toggleEliminadas()">
          {{ verEliminadas() ? 'Ver activas' : '🗑️ Ver eliminadas' }}
        </button>
      </div>

      @if (notasFiltradas().length === 0) {
        <p class="text-muted text-sm">
          No hay notas registradas para esta selección.
        </p>
      } @else {
        <div class="table-wrap">
          <table class="table" style="font-size:13px">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Competencia</th>
                <th>Calificación</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              @for (n of notasFiltradas(); track n.id) {
                <tr>
                  <td>
                    {{ n.estudianteNombre }}<br>
                    <span class="text-muted text-sm">{{ n.estudianteCodigo }}</span>
                  </td>
                  <td class="text-sm">{{ n.competenciaNombre }}</td>
                  <td>
                    <strong style="font-size:16px;color:#1E3A5F">
                      {{ n.calificacion }}
                    </strong>
                  </td>
                  <td class="text-sm text-muted">{{ n.fechaRegistro }}</td>
                  <td>
                    <span class="badge badge-{{ n.estado.toLowerCase() }}">
                      {{ n.estado }}
                    </span>
                  </td>
                  <td>
                    <div class="acciones">
                      @if (n.estado !== 'ELIMINADO') {
                        <button
                          class="btn btn-danger btn-sm btn-icon"
                          (click)="confirmarEliminarNota(n)">
                          🗑️
                        </button>
                      } @else {
                        <button
                          class="btn btn-success btn-sm"
                          (click)="restaurarNota(n)">
                          ↩️
                        </button>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  }

  @if (!tablaVisible() && !puedeCargar()) {
    <div class="empty-state" style="padding:60px 20px">
      <div class="empty-icon">📝</div>
      <p>
        Selecciona nivel, grado, sección, curso y periodo
        para cargar la lista de estudiantes
      </p>
    </div>
  }
</div>

@if (detalleVisible()) {
  <div class="modal-overlay" (click)="detalleVisible.set(false)">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>📄 Detalle: {{ filaDetalle()?.nombre }}</h3>
        <button
          class="btn-close-modal"
          (click)="detalleVisible.set(false)">
          ×
        </button>
      </div>

      <div class="modal-body">
        <p class="text-muted text-sm" style="margin-bottom:14px">
          Código: {{ filaDetalle()?.codigo }}
        </p>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Competencia</th><th>Calificación</th></tr>
            </thead>
            <tbody>
              @for (comp of competenciasActuales(); track comp.id) {
                <tr>
                  <td>{{ comp.nombre }}</td>
                  <td>
                    <strong>
                      {{ filaDetalle()?.notas?.[comp.id]?.calificacion || '—' }}
                    </strong>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="btn btn-outline"
          (click)="detalleVisible.set(false)">
          Cerrar
        </button>
      </div>
    </div>
  </div>
}

<app-confirm-dialog
  [visible]="confirmVisible()"
  titulo="Eliminar Nota"
  [mensaje]="'¿Eliminar esta calificación? Se puede restaurar después.'"
  tipo="danger"
  (confirmado)="eliminarNota()"
  (cancelado)="confirmVisible.set(false)"
/>
  `
})
export class NotasComponent implements OnInit {
  private notasSvc = inject(NotasService);
  private matriculasSvc = inject(MatriculasService);
  private gradosSvc = inject(GradosService);
  private cursosSvc = inject(CursosService);
  private competenciasSvc = inject(CompetenciasService);
  private periodosSvc = inject(PeriodosService);
  private profesoresSvc = inject(ProfesoresService);
  private exportSvc = inject(ExportService);
  private notif = inject(NotificationService);
  private auth = inject(AuthService);

  cargando = signal(false);
  guardando = signal(false);
  tablaVisible = signal(false);
  detalleVisible = signal(false);
  confirmVisible = signal(false);
  verEliminadas = signal(false);

  notaSeleccionada = signal<Nota | null>(null);
  filaDetalle = signal<FilaEstudiante | null>(null);

  selNivel = signal<NivelEducativo | ''>('');
  selGradoId = signal<number | ''>('');
  selSeccionId = signal<number | ''>('');
  selCursoId = signal<number | ''>('');
  selPeriodoId = signal<number | ''>('');
  selProfesorId = signal<number | ''>('');

  get selNivelValue() { return this.selNivel(); }
  set selNivelValue(v: any) { this.selNivel.set(v || ''); }

  get selGradoIdValue() { return this.selGradoId(); }
  set selGradoIdValue(v: any) {
    this.selGradoId.set(v ? Number(v) : '');
  }

  get selSeccionIdValue() { return this.selSeccionId(); }
  set selSeccionIdValue(v: any) {
    this.selSeccionId.set(v ? Number(v) : '');
  }

  get selCursoIdValue() { return this.selCursoId(); }
  set selCursoIdValue(v: any) {
    this.selCursoId.set(v ? Number(v) : '');
  }

  get selPeriodoIdValue() { return this.selPeriodoId(); }
  set selPeriodoIdValue(v: any) {
    this.selPeriodoId.set(v ? Number(v) : '');
  }

  get selProfesorIdValue() { return this.selProfesorId(); }
  set selProfesorIdValue(v: any) {
    this.selProfesorId.set(v ? Number(v) : '');
  }

  grados = signal<Grado[]>([]);
  secciones = signal<Seccion[]>([]);
  cursos = signal<Curso[]>([]);
  competencias = signal<Competencia[]>([]);
  periodos = signal<Periodo[]>([]);
  profesores = signal<Profesor[]>([]);
  matriculas = signal<Matricula[]>([]);
  notas = signal<Nota[]>([]);
  filas = signal<FilaEstudiante[]>([]);

  gradosFiltrados = computed(() =>
    this.grados().filter(g =>
      g.nivel === this.selNivel() && g.estado === 'ACTIVO'
    )
  );

  seccionesFiltradas = computed(() => {
    const gradoId = this.selGradoId();

    if (!gradoId) return [];

    return this.secciones().filter(s =>
      s.gradoId === gradoId && s.estado === 'ACTIVO'
    );
  });

  cursosFiltrados = computed(() =>
    this.cursos().filter(c =>
      c.nivel === this.selNivel() && c.estado !== 'ELIMINADO'
    )
  );

  competenciasActuales = computed(() =>
    this.competencias().filter(c =>
      c.cursoId === Number(this.selCursoId()) &&
      c.estado === 'ACTIVO'
    )
  );

  notasFiltradas = computed(() => {
    const notas = this.notas();

    return this.verEliminadas()
      ? notas.filter(n => n.estado === 'ELIMINADO')
      : notas.filter(n => n.estado !== 'ELIMINADO');
  });

  puedeCargar = computed(() =>
    !!this.selNivel() &&
    !!this.selGradoId() &&
    !!this.selSeccionId() &&
    !!this.selCursoId() &&
    !!this.selPeriodoId()
  );

  encabezadoTabla = computed(() => {
    const grado = this.grados().find(
      g => g.id === Number(this.selGradoId())
    );
    const seccion = this.secciones().find(
      s => s.id === Number(this.selSeccionId())
    );
    const curso = this.cursos().find(
      c => c.id === Number(this.selCursoId())
    );
    const periodo = this.periodos().find(
      p => p.id === Number(this.selPeriodoId())
    );

    return `${this.selNivel()} · ${grado?.nombre ?? ''} · Sección ${seccion?.nombre ?? ''} · ${curso?.nombre ?? ''} · ${periodo?.nombre ?? ''}`;
  });

  escalaSugerida = computed(() => {
    switch (this.selNivel()) {
      case 'INICIAL':
      case 'PRIMARIA':
        return 'AD / A / B / C';
      case 'SECUNDARIA':
        return '0 – 20';
      default:
        return '—';
    }
  });

  ngOnInit(): void {
    this.gradosSvc.listarGrados().subscribe({
      next: datos => this.grados.set(datos),
      error: error => {
        console.error('Error al cargar grados:', error);
        this.notif.error('No se pudieron cargar los grados.');
      }
    });

    this.gradosSvc.listarSecciones().subscribe({
      next: datos => this.secciones.set(datos),
      error: error => {
        console.error('Error al cargar secciones:', error);
        this.notif.error('No se pudieron cargar las secciones.');
      }
    });

    this.cursosSvc.listar().subscribe({
      next: datos => this.cursos.set(datos),
      error: error => {
        console.error('Error al cargar cursos:', error);
        this.notif.error('No se pudieron cargar los cursos.');
      }
    });

    this.periodosSvc.listar().subscribe({
      next: datos => this.periodos.set(datos),
      error: error => {
        console.error('Error al cargar periodos:', error);
        this.notif.error('No se pudieron cargar los periodos.');
      }
    });

    this.profesoresSvc.listar().subscribe({
      next: datos =>
        this.profesores.set(
          datos.filter((profesor: Profesor) =>
            profesor.estado === 'ACTIVO'
          )
        ),
      error: error => {
        console.error('Error al cargar profesores:', error);
        this.notif.error('No se pudieron cargar los profesores.');
      }
    });
  }

  onNivelChange(): void {
    this.selGradoId.set('');
    this.selSeccionId.set('');
    this.selCursoId.set('');
    this.competencias.set([]);
    this.matriculas.set([]);
    this.filas.set([]);
    this.notas.set([]);
    this.tablaVisible.set(false);
  }

  onGradoChange(): void {
    this.selSeccionId.set('');
    this.matriculas.set([]);
    this.filas.set([]);
    this.tablaVisible.set(false);
  }

  onSeccionChange(): void {
    this.filas.set([]);
    this.tablaVisible.set(false);
  }

  onCursoChange(): void {
    this.competencias.set([]);
    this.notas.set([]);
    this.filas.set([]);
    this.tablaVisible.set(false);

    if (!this.selCursoId() || !this.selNivel()) return;

    this.competenciasSvc.listar({
      cursoId: Number(this.selCursoId()),
      nivel: this.selNivel() as NivelEducativo
    }).subscribe({
      next: datos => {
        this.competencias.set(datos);
      },
      error: error => {
        console.error('Error al cargar competencias:', error);
        this.notif.error('No se pudieron cargar las competencias.');
      }
    });
  }

  onPeriodoChange(): void {
    this.filas.set([]);
    this.notas.set([]);
    this.tablaVisible.set(false);
  }

  cargarTabla(): void {
    if (!this.puedeCargar() || this.cargando()) return;

    this.cargando.set(true);
    this.tablaVisible.set(false);

    this.matriculasSvc.listar({
      periodoId: Number(this.selPeriodoId())
    }).subscribe({
      next: matriculas => {
        const filtradas = matriculas.filter(m =>
          m.estado !== 'ELIMINADO' &&
          m.nivelEducativo === this.selNivel() &&
          m.gradoId === Number(this.selGradoId()) &&
          m.seccionId === Number(this.selSeccionId())
        );

        this.matriculas.set(filtradas);

        this.notasSvc.listar({
          cursoId: Number(this.selCursoId()),
          periodoId: Number(this.selPeriodoId())
        }).subscribe({
          next: notas => {
            this.notas.set(notas);
            this.construirFilas();
            this.tablaVisible.set(true);
            this.cargando.set(false);
          },
          error: error => {
            console.error('Error al cargar notas:', error);
            this.notif.error('No se pudieron cargar las notas.');
            this.cargando.set(false);
          }
        });
      },
      error: error => {
        console.error('Error al cargar matrículas:', error);
        this.notif.error('No se pudieron cargar las matrículas.');
        this.cargando.set(false);
      }
    });
  }

  construirFilas(): void {
    const competencias = this.competenciasActuales();
    const notas = this.notas();

    const filas: FilaEstudiante[] = this.matriculas().map(matricula => {
      const notasEst: {
        [id: number]: NotaFila;
      } = {};

      competencias.forEach(competencia => {
        const nota = notas.find(n =>
          n.matriculaId === matricula.id &&
          n.competenciaId === competencia.id &&
          n.cursoId === Number(this.selCursoId()) &&
          n.periodoId === Number(this.selPeriodoId()) &&
          n.estado !== 'ELIMINADO'
        );

        notasEst[competencia.id] = {
          calificacion: nota?.calificacion ?? '',
          notaId: nota?.id,
          obs: nota?.observacion
        };
      });

      return {
        matriculaId: matricula.id,
        estudianteId: matricula.estudianteId,
        nombre: `${matricula.estudianteNombres ?? ''} ${matricula.estudianteApellidos ?? ''}`.trim(),
        codigo: matricula.estudianteCodigo ?? '',
        documento: matricula.estudianteDni ?? '',
        notas: notasEst
      };
    });

    this.filas.set(filas);
  }

  guardarTodas(): void {
    if (this.guardando()) return;

    const competencias = this.competenciasActuales();
    const usuario = this.auth.usuarioActual();
    const operaciones: Observable<Nota>[] = [];

    this.filas().forEach(fila => {
      competencias.forEach(competencia => {
        const calificacion =
          fila.notas[competencia.id]?.calificacion?.trim();

        if (!calificacion) return;

        const notaId = fila.notas[competencia.id]?.notaId;

        if (notaId) {
          operaciones.push(
            this.notasSvc.editar(notaId, {
              calificacion
            })
          );
        } else {
          const formulario: NotaForm = {
            matriculaId: fila.matriculaId,
            estudianteId: fila.estudianteId,
            competenciaId: competencia.id,
            cursoId: Number(this.selCursoId()),
            nivelEducativo: this.selNivel() as NivelEducativo,
            gradoId: Number(this.selGradoId()),
            seccionId: Number(this.selSeccionId()),
            periodoId: Number(this.selPeriodoId()),
            profesorId: this.selProfesorId() || usuario?.id,
            calificacion
          };

          operaciones.push(this.notasSvc.crear(formulario));
        }
      });
    });

    if (operaciones.length === 0) {
      this.notif.info('No hay calificaciones para guardar.');
      return;
    }

    this.guardando.set(true);

    forkJoin(operaciones).subscribe({
      next: () => {
        this.finGuardar();
      },
      error: error => {
        console.error('Error al guardar las calificaciones:', error);
        this.guardando.set(false);
        this.notif.error(
          'No se pudieron guardar todas las calificaciones. Recarga la tabla y verifica los datos.'
        );
      }
    });
  }

  finGuardar(): void {
    this.notasSvc.listar({
      cursoId: Number(this.selCursoId()),
      periodoId: Number(this.selPeriodoId())
    }).subscribe({
      next: notas => {
        this.notas.set(notas);
        this.construirFilas();
        this.notif.success('Calificaciones guardadas correctamente.');
        this.guardando.set(false);
      },
      error: error => {
        console.error('Error al recargar las calificaciones:', error);
        this.notif.error(
          'Las calificaciones se procesaron, pero no se pudo actualizar la tabla.'
        );
        this.guardando.set(false);
      }
    });
  }

  async exportarExcel(): Promise<void> {
    const competencias = this.competenciasActuales();

    const columnas = [
      { key: 'codigo', header: 'Código', width: 12 },
      { key: 'nombre', header: 'Apellidos y Nombres', width: 30 },
      ...competencias.map(c => ({
        key: `comp_${c.id}`,
        header: c.codigo,
        width: 14
      }))
    ];

    const datos = this.filas().map(fila => {
      const filaExportacion: Record<string, string> = {
        codigo: fila.codigo,
        nombre: fila.nombre
      };

      competencias.forEach(competencia => {
        filaExportacion[`comp_${competencia.id}`] =
          fila.notas[competencia.id]?.calificacion ?? '';
      });

      return filaExportacion;
    });

    try {
      await this.exportSvc.exportarExcel(
        `notas_${this.encabezadoTabla().replace(/·/g, '_')}`,
        'Notas',
        columnas,
        datos
      );

      this.notif.success('Archivo Excel generado.');
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.notif.error('No se pudo generar el archivo Excel.');
    }
  }

  exportarCSV(): void {
    const competencias = this.competenciasActuales();

    const columnas = [
      { key: 'codigo', header: 'Código' },
      { key: 'nombre', header: 'Apellidos y Nombres' },
      ...competencias.map(c => ({
        key: `comp_${c.id}`,
        header: c.codigo
      }))
    ];

    const datos = this.filas().map(fila => {
      const filaExportacion: Record<string, string> = {
        codigo: fila.codigo,
        nombre: fila.nombre
      };

      competencias.forEach(competencia => {
        filaExportacion[`comp_${competencia.id}`] =
          fila.notas[competencia.id]?.calificacion ?? '';
      });

      return filaExportacion;
    });

    this.exportSvc.exportarCSV(
      `notas_${Date.now()}`,
      columnas,
      datos
    );

    this.notif.success('Archivo CSV generado.');
  }

  imprimir(): void {
    const competencias = this.competenciasActuales();

    const encabezados = competencias
      .map(c => `<th>${c.codigo}</th>`)
      .join('');

    const filasHtml = this.filas().map((fila, indice) => {
      const celdas = competencias
        .map(c =>
          `<td style="text-align:center">${fila.notas[c.id]?.calificacion ?? ''}</td>`
        )
        .join('');

      return `<tr><td>${indice + 1}</td><td>${fila.codigo}</td><td>${fila.nombre}</td>${celdas}</tr>`;
    }).join('');

    const curso = this.cursos().find(
      c => c.id === Number(this.selCursoId())
    )?.nombre ?? '';

    const periodo = this.periodos().find(
      p => p.id === Number(this.selPeriodoId())
    )?.nombre ?? '';

    const html = `
      <div class="info">
        <span>Nivel:</span> ${this.selNivel()}
        &nbsp; <span>Curso:</span> ${curso}
        &nbsp; <span>Periodo:</span> ${periodo}
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Código</th>
            <th>Apellidos y Nombres</th>
            ${encabezados}
          </tr>
        </thead>
        <tbody>${filasHtml}</tbody>
      </table>
    `;

    this.exportSvc.imprimirReporte(
      html,
      `Registro de Notas — ${this.encabezadoTabla()}`
    );
  }

  verDetalle(fila: FilaEstudiante): void {
    this.filaDetalle.set(fila);
    this.detalleVisible.set(true);
  }

  confirmarEliminarNota(nota: Nota): void {
    this.notaSeleccionada.set(nota);
    this.confirmVisible.set(true);
  }

  eliminarNota(): void {
    const nota = this.notaSeleccionada();

    if (!nota) {
      this.notif.error('No se ha seleccionado una nota.');
      return;
    }

    this.notasSvc.eliminar(nota.id).subscribe({
      next: () => {
        this.notif.success('Nota eliminada.');
        this.confirmVisible.set(false);
        this.notaSeleccionada.set(null);
        this.cargarTabla();
      },
      error: error => {
        console.error('Error al eliminar nota:', error);
        this.notif.error('No se pudo eliminar la nota.');
      }
    });
  }

  restaurarNota(nota: Nota): void {
    this.notasSvc.restaurar(nota.id).subscribe({
      next: () => {
        this.notif.success('Nota restaurada.');
        this.cargarTabla();
      },
      error: error => {
        console.error('Error al restaurar nota:', error);
        this.notif.error('No se pudo restaurar la nota.');
      }
    });
  }

  toggleEliminadas(): void {
    this.verEliminadas.update(valor => !valor);
    this.cargarTabla();
  }
}
