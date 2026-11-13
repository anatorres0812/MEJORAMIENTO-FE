import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatriculasService } from '../services/matriculas.service';
import { Matricula, MatriculaForm, EstadoMatricula } from '../interfaces/matricula.interface';
import { EstudiantesService } from '../../estudiantes/services/estudiantes.service';
import { GradosService } from '../../grados/services/grados.service';
import { PeriodosService } from '../../periodos/services/periodos.service';
import { Estudiante } from '../../estudiantes/interfaces/estudiante.interface';
import { Grado, Seccion } from '../../grados/interfaces/grado.interface';
import { Periodo } from '../../periodos/interfaces/periodo.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { NivelEducativo } from '../../../shared/interfaces';

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h2>📋 Matrículas</h2>
      <p>Registro y gestión de matrículas de estudiantes</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">
        {{ verEliminados() ? '📋 Ver activas' : '🗑️ Eliminadas' }}
      </button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nueva Matrícula</button>
    </div>
  </div>

  <!-- Filtros -->
  <div class="filter-bar">
    <div class="form-group">
      <label>Buscar</label>
      <input class="form-control" [(ngModel)]="filtro.busqueda" placeholder="DNI, nombre, código..."
        (input)="aplicarFiltros()" />
    </div>
    <div class="form-group">
      <label>Año Académico</label>
      <select class="form-control" [(ngModel)]="filtro.anio" (change)="cargarPorFiltro()">
        <option value="">Todos</option>
        @for (a of aniosDisponibles(); track a) { <option [value]="a">{{ a }}</option> }
      </select>
    </div>
    <div class="form-group">
      <label>Nivel</label>
      <select class="form-control" [(ngModel)]="filtro.nivel" (change)="aplicarFiltros()">
        <option value="">Todos</option>
        <option value="INICIAL">Inicial</option>
        <option value="PRIMARIA">Primaria</option>
        <option value="SECUNDARIA">Secundaria</option>
      </select>
    </div>
    <div class="form-group">
      <label>Estado</label>
      <select class="form-control" [(ngModel)]="filtro.estado" (change)="aplicarFiltros()">
        <option value="">Todos</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="MATRICULADO">Matriculado</option>
        <option value="TRASLADADO">Trasladado</option>
        <option value="RETIRADO">Retirado</option>
      </select>
    </div>
    <button class="btn btn-outline btn-sm" style="align-self:flex-end" (click)="limpiarFiltros()">✕ Limpiar</button>
  </div>

  <div class="card">
    @if (cargando()) {
      <div class="loading-wrap"><div class="spinner-md"></div> Cargando matrículas...</div>
    } @else if (datosFiltrados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No se encontraron matrículas</p>
        <button class="btn btn-primary" (click)="abrirModal()">+ Nueva Matrícula</button>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th><th>Código</th><th>DNI</th><th>Apellidos y Nombres</th>
              <th>Nivel</th><th>Grado</th><th>Sección</th>
              <th>Año</th><th>Periodo</th><th>Apoderado</th>
              <th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (m of datosPaginados(); track m.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ (paginaActual()-1)*pageSize+i+1 }}</td>
                <td><strong>{{ m.estudianteCodigo || '—' }}</strong></td>
                <td class="text-sm">{{ m.estudianteDni }}</td>
                <td>
                  <strong>{{ m.estudianteApellidos }}</strong>, {{ m.estudianteNombres }}
                </td>
                <td><span class="badge badge-{{ m.nivelEducativo.toLowerCase() }}">{{ m.nivelEducativo }}</span></td>
                <td class="text-sm">{{ m.gradoNombre }}</td>
                <td><strong>{{ m.seccionNombre }}</strong></td>
                <td>{{ m.anioAcademico }}</td>
                <td class="text-sm text-muted">{{ m.periodoNombre }}</td>
                <td class="text-sm">
                  {{ m.nombresApoderado || '—' }}<br>
                  <span class="text-muted">{{ m.telefonoApoderado }}</span>
                </td>
                <td>
                  <span class="badge badge-{{ estadoBadge(m.estado) }}">{{ m.estado }}</span>
                </td>
                <td>
                  <div class="acciones">
                    @if (m.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" title="Editar" (click)="abrirModal(m)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" (click)="confirmarEliminar(m)">🗑️</button>
                    } @else {
                      <button class="btn btn-success btn-sm" (click)="restaurar(m)">↩️</button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (totalPaginas() > 1) {
        <div class="pagination">
          <button class="page-btn" (click)="irPagina(1)" [disabled]="paginaActual()===1">«</button>
          <button class="page-btn" (click)="irPagina(paginaActual()-1)" [disabled]="paginaActual()===1">‹</button>
          @for (p of paginas(); track p) {
            <button class="page-btn" [class.active]="p===paginaActual()" (click)="irPagina(p)">{{ p }}</button>
          }
          <button class="page-btn" (click)="irPagina(paginaActual()+1)" [disabled]="paginaActual()===totalPaginas()">›</button>
          <button class="page-btn" (click)="irPagina(totalPaginas())" [disabled]="paginaActual()===totalPaginas()">»</button>
        </div>
      }
      <p class="text-muted text-sm mt-4" style="text-align:center">{{ datosFiltrados().length }} matrícula(s)</p>
    }
  </div>
</div>

<!-- ══ MODAL ══ -->
@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal modal-lg" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? '✏️ Editar Matrícula' : '+ Nueva Matrícula' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <!-- TABS -->
          <div class="tabs">
            <button type="button" class="tab-btn" [class.active]="tab()==='estudiante'" (click)="tab.set('estudiante')">
              👨‍🎓 Datos del Estudiante
            </button>
            <button type="button" class="tab-btn" [class.active]="tab()==='matricula'" (click)="tab.set('matricula')">
              📋 Datos de Matrícula
            </button>
            <button type="button" class="tab-btn" [class.active]="tab()==='apoderado'" (click)="tab.set('apoderado')">
              👪 Apoderado
            </button>
          </div>

          <!-- TAB: ESTUDIANTE -->
          @if (tab() === 'estudiante') {
            <div class="form-grid form-grid-2">
              <div class="form-group" style="grid-column:1/-1">
                <label>Estudiante *</label>
                <select class="form-control" formControlName="estudianteId" (change)="onEstudianteChange()">
                  <option value="">Seleccionar estudiante</option>
                  @for (e of estudiantesActivos(); track e.id) {
                    <option [value]="e.id">
                      {{ e.apellidos }}, {{ e.nombres }} — {{ e.numeroDocumento }}
                    </option>
                  }
                </select>
                @if (form.get('estudianteId')?.invalid && form.get('estudianteId')?.touched) {
                  <span class="form-error">Seleccione un estudiante</span>
                }
              </div>
              @if (estudianteSeleccionado()) {
                <div class="info-preview">
                  <div class="info-row"><span class="info-lbl">DNI</span><span>{{ estudianteSeleccionado()!.numeroDocumento }}</span></div>
                  <div class="info-row"><span class="info-lbl">Fecha Nac.</span><span>{{ estudianteSeleccionado()!.fechaNacimiento }}</span></div>
                  <div class="info-row"><span class="info-lbl">Género</span><span>{{ estudianteSeleccionado()!.genero === 'M' ? 'Masculino' : 'Femenino' }}</span></div>
                  <div class="info-row"><span class="info-lbl">Estado</span><span><span class="badge badge-{{ estudianteSeleccionado()!.estado.toLowerCase() }}">{{ estudianteSeleccionado()!.estado }}</span></span></div>
                </div>
              }
            </div>
          }

          <!-- TAB: MATRÍCULA -->
          @if (tab() === 'matricula') {
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label>Nivel Educativo *</label>
                <select class="form-control" formControlName="nivelEducativo" (change)="onNivelChange()">
                  <option value="INICIAL">Inicial</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </div>
              <div class="form-group">
                <label>Grado *</label>
                <select class="form-control" formControlName="gradoId" (change)="onGradoChange()">
                  <option value="">Seleccionar grado</option>
                  @for (g of gradosPorNivel(); track g.id) {
                    <option [value]="g.id">{{ g.nombre }}</option>
                  }
                </select>
                @if (form.get('gradoId')?.invalid && form.get('gradoId')?.touched) {
                  <span class="form-error">Requerido</span>
                }
              </div>
              <div class="form-group">
                <label>Sección *</label>
                <select class="form-control" formControlName="seccionId">
                  <option value="">Seleccionar sección</option>
                  @for (s of seccionesPorGrado(); track s.id) {
                    <option [value]="s.id">{{ s.nombre }} ({{ s.turno }})</option>
                  }
                </select>
                @if (form.get('seccionId')?.invalid && form.get('seccionId')?.touched) {
                  <span class="form-error">Requerido</span>
                }
              </div>
              <div class="form-group">
                <label>Periodo Académico *</label>
                <select class="form-control" formControlName="periodoId">
                  <option value="">Seleccionar periodo</option>
                  @for (p of periodos(); track p.id) {
                    <option [value]="p.id">{{ p.nombre }} — {{ p.anioAcademico }}</option>
                  }
                </select>
                @if (form.get('periodoId')?.invalid && form.get('periodoId')?.touched) {
                  <span class="form-error">Requerido</span>
                }
              </div>
              <div class="form-group">
                <label>Año Académico *</label>
                <input class="form-control" type="number" formControlName="anioAcademico" />
              </div>
              <div class="form-group">
                <label>Fecha de Matrícula *</label>
                <input class="form-control" type="date" formControlName="fechaMatricula" />
              </div>
              <div class="form-group">
                <label>Estado de Matrícula *</label>
                <select class="form-control" formControlName="estado">
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="MATRICULADO">Matriculado</option>
                  <option value="TRASLADADO">Trasladado</option>
                  <option value="RETIRADO">Retirado</option>
                </select>
              </div>
            </div>
          }

          <!-- TAB: APODERADO -->
          @if (tab() === 'apoderado') {
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label>DNI del Apoderado</label>
                <input class="form-control" formControlName="dniApoderado" placeholder="Ej: 45678901" />
              </div>
              <div class="form-group">
                <label>Parentesco</label>
                <select class="form-control" formControlName="parentescoApoderado">
                  <option value="">Seleccionar</option>
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor/a</option>
                  <option value="Abuelo">Abuelo/a</option>
                  <option value="Tio">Tío/a</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Nombres del Apoderado</label>
                <input class="form-control" formControlName="nombresApoderado" placeholder="Nombres completos" />
              </div>
              <div class="form-group">
                <label>Apellidos del Apoderado</label>
                <input class="form-control" formControlName="apellidosApoderado" placeholder="Apellidos completos" />
              </div>
              <div class="form-group">
                <label>Teléfono</label>
                <input class="form-control" formControlName="telefonoApoderado" placeholder="Ej: 987654321" />
              </div>
            </div>
          }
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
          <button type="button" class="btn btn-outline" (click)="anteriorTab()">‹ Anterior</button>
          @if (tab() !== 'apoderado') {
            <button type="button" class="btn btn-primary" (click)="siguienteTab()">Siguiente ›</button>
          } @else {
            <button type="submit" class="btn btn-primary" [disabled]="guardando()">
              {{ guardando() ? 'Guardando...' : (editando ? 'Actualizar' : 'Matricular') }}
            </button>
          }
        </div>
      </form>
    </div>
  </div>
}

<app-confirm-dialog
  [visible]="confirmVisible()"
  titulo="Eliminar Matrícula"
  [mensaje]="'¿Eliminar la matrícula de ' + (sel()?.estudianteNombres||'') + ' ' + (sel()?.estudianteApellidos||'') + '?'"
  tipo="danger"
  (confirmado)="eliminar()"
  (cancelado)="confirmVisible.set(false)" />
  `,
  styles: [`
    .info-preview {
      grid-column: 1/-1;
      background: var(--bg-table-head); border: 1px solid var(--border);
      border-radius: 10px; padding: 14px; display: flex; flex-direction: column; gap: 8px;
    }
    .info-row { display: flex; justify-content: space-between; font-size: 13px;
      padding-bottom: 6px; border-bottom: 1px solid var(--border); }
    .info-row:last-child { border-bottom: none; padding-bottom: 0; }
    .info-lbl { color: var(--text-muted); font-weight: 600; font-size: 12px; text-transform: uppercase; }
  `]
})
export class MatriculasComponent implements OnInit {
  private svc       = inject(MatriculasService);
  private estSvc    = inject(EstudiantesService);
  private gradosSvc = inject(GradosService);
  private periSvc   = inject(PeriodosService);
  private notif     = inject(NotificationService);
  private fb        = inject(FormBuilder);

  cargando       = signal(false);
  guardando      = signal(false);
  modalVisible   = signal(false);
  confirmVisible = signal(false);
  verEliminados  = signal(false);
  editando       = false;
  sel            = signal<Matricula|null>(null);
  tab            = signal<'estudiante'|'matricula'|'apoderado'>('estudiante');
  paginaActual   = signal(1);
  pageSize       = 10;

  filtro = { busqueda: '', anio: '', nivel: '', estado: '' };

  datos       = signal<Matricula[]>([]);
  estudiantes = signal<Estudiante[]>([]);
  grados      = signal<Grado[]>([]);
  secciones   = signal<Seccion[]>([]);
  periodos    = signal<Periodo[]>([]);

  estudianteIdSel = signal<number|null>(null);
  nivelSeleccionado = signal<NivelEducativo>('PRIMARIA');
  gradoSeleccionado = signal<number|null>(null);

  form = this.fb.group({
    estudianteId:        [null as number|null, Validators.required],
    nivelEducativo:      ['PRIMARIA' as NivelEducativo, Validators.required],
    gradoId:             [null as number|null, Validators.required],
    seccionId:           [null as number|null, Validators.required],
    periodoId:           [null as number|null, Validators.required],
    anioAcademico:       [new Date().getFullYear(), Validators.required],
    fechaMatricula:      [new Date().toISOString().split('T')[0], Validators.required],
    estado:              ['MATRICULADO' as EstadoMatricula, Validators.required],
    dniApoderado:        [''],
    nombresApoderado:    [''],
    apellidosApoderado:  [''],
    parentescoApoderado: [''],
    telefonoApoderado:   ['']
  });

  estudiantesActivos = computed(() => this.estudiantes().filter(e => e.estado === 'ACTIVO'));

  estudianteSeleccionado = computed(() => {
    const id = this.estudianteIdSel();
    return id ? this.estudiantes().find(e => e.id === id) ?? null : null;
  });

  gradosPorNivel = computed(() =>
    this.grados().filter(g => g.nivel === this.nivelSeleccionado() && g.estado === 'ACTIVO')
  );

  seccionesPorGrado = computed(() => {
    const gId = this.gradoSeleccionado();
    return gId ? this.secciones().filter(s => s.gradoId === gId && s.estado === 'ACTIVO') : [];
  });

  aniosDisponibles = computed(() => {
    const set = new Set(this.datos().map(m => m.anioAcademico));
    const anio = new Date().getFullYear();
    [anio-1, anio, anio+1].forEach(a => set.add(a));
    return Array.from(set).sort((a,b) => b-a);
  });

  datosFiltrados = computed(() => {
    let l = this.verEliminados()
      ? this.datos().filter(m => m.estado === 'ELIMINADO')
      : this.datos().filter(m => m.estado !== 'ELIMINADO');
    if (this.filtro.nivel)  l = l.filter(m => m.nivelEducativo === this.filtro.nivel);
    if (!this.verEliminados() && this.filtro.estado) l = l.filter(m => m.estado === this.filtro.estado);
    const b = this.filtro.busqueda.toLowerCase();
    if (b) l = l.filter(m =>
      (m.estudianteDni ?? '').toLowerCase().includes(b) ||
      (m.estudianteNombres ?? '').toLowerCase().includes(b) ||
      (m.estudianteApellidos ?? '').toLowerCase().includes(b) ||
      (m.estudianteCodigo ?? '').toLowerCase().includes(b)
    );
    return l;
  });

  totalPaginas   = computed(() => Math.max(1, Math.ceil(this.datosFiltrados().length / this.pageSize)));
  paginas        = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i+1));
  datosPaginados = computed(() => {
    const s = (this.paginaActual()-1) * this.pageSize;
    return this.datosFiltrados().slice(s, s+this.pageSize);
  });

  ngOnInit(): void {
    this.cargar();
    this.estSvc.listar().subscribe(d => this.estudiantes.set(d));
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));
    this.gradosSvc.listarSecciones().subscribe(d => this.secciones.set(d));
    this.periSvc.listar('ACTIVO').subscribe(d => this.periodos.set(d));

    // Suscribir valueChanges para actualizar signals reactivos
    this.form.get('nivelEducativo')!.valueChanges.subscribe(v => {
      this.nivelSeleccionado.set(v as NivelEducativo || 'PRIMARIA');
      this.gradoSeleccionado.set(null);
      this.form.patchValue({ gradoId: null, seccionId: null }, { emitEvent: false });
    });
    this.form.get('gradoId')!.valueChanges.subscribe(v => {
      this.gradoSeleccionado.set(v ? Number(v) : null);
      this.form.patchValue({ seccionId: null }, { emitEvent: false });
    });
    this.form.get('estudianteId')!.valueChanges.subscribe(v => {
      this.estudianteIdSel.set(v ? Number(v) : null);
    });
  }

  cargar(): void {
    this.cargando.set(true);
    const filtros: any = {};
    if (this.filtro.anio) filtros.anio = Number(this.filtro.anio);
    this.svc.listar(filtros).subscribe({
      next: d => { this.datos.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  cargarPorFiltro(): void { this.paginaActual.set(1); this.cargar(); }
  aplicarFiltros(): void  { this.paginaActual.set(1); }
  limpiarFiltros(): void  { this.filtro = { busqueda: '', anio: '', nivel: '', estado: '' }; this.cargar(); }

  onEstudianteChange(): void {
    this.estudianteIdSel.set(Number(this.form.get('estudianteId')?.value) || null);
    const est = this.estudianteSeleccionado();
    if (est) {
      this.form.patchValue({
        nombresApoderado:    est.nombreApoderado || '',
        telefonoApoderado:   est.telefonoApoderado || '',
        parentescoApoderado: est.relacionApoderado || ''
      });
    }
  }
  onNivelChange(): void {
    this.nivelSeleccionado.set(this.form.get('nivelEducativo')?.value as NivelEducativo || 'PRIMARIA');
    this.gradoSeleccionado.set(null);
    this.form.patchValue({ gradoId: null, seccionId: null });
  }
  onGradoChange(): void {
    this.gradoSeleccionado.set(Number(this.form.get('gradoId')?.value) || null);
    this.form.patchValue({ seccionId: null });
  }

  siguienteTab(): void {
    if (this.tab() === 'estudiante') { this.tab.set('matricula'); }
    else if (this.tab() === 'matricula') { this.tab.set('apoderado'); }
  }
  anteriorTab(): void {
    if (this.tab() === 'apoderado') { this.tab.set('matricula'); }
    else if (this.tab() === 'matricula') { this.tab.set('estudiante'); }
  }

  abrirModal(m?: Matricula): void {
    this.editando = !!m;
    this.sel.set(m || null);
    this.tab.set('estudiante');
    if (m) {
      this.form.patchValue({
        estudianteId: m.estudianteId, nivelEducativo: m.nivelEducativo,
        gradoId: m.gradoId, seccionId: m.seccionId, periodoId: m.periodoId,
        anioAcademico: m.anioAcademico, fechaMatricula: m.fechaMatricula, estado: m.estado,
        dniApoderado: m.dniApoderado||'', nombresApoderado: m.nombresApoderado||'',
        apellidosApoderado: m.apellidosApoderado||'', parentescoApoderado: m.parentescoApoderado||'',
        telefonoApoderado: m.telefonoApoderado||''
      });
      this.estudianteIdSel.set(m.estudianteId);
      this.nivelSeleccionado.set(m.nivelEducativo as NivelEducativo || 'PRIMARIA');
      this.gradoSeleccionado.set(m.gradoId ?? null);
    } else {
      this.form.reset({
        nivelEducativo: 'PRIMARIA', anioAcademico: new Date().getFullYear(),
        fechaMatricula: new Date().toISOString().split('T')[0], estado: 'MATRICULADO'
      });
      this.estudianteIdSel.set(null);
      this.nivelSeleccionado.set('PRIMARIA');
      this.gradoSeleccionado.set(null);
    }
    this.modalVisible.set(true);
  }

  cerrarModal(): void { this.modalVisible.set(false); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.tab.set('estudiante'); return; }
    this.guardando.set(true);
    const v = this.form.value;
    const body: MatriculaForm = {
      estudianteId:        Number(v.estudianteId),
      nivelEducativo:      v.nivelEducativo as NivelEducativo,
      gradoId:             Number(v.gradoId),
      seccionId:           Number(v.seccionId),
      periodoId:           Number(v.periodoId),
      anioAcademico:       v.anioAcademico!,
      fechaMatricula:      v.fechaMatricula!,
      estado:              v.estado as EstadoMatricula,
      dniApoderado:        v.dniApoderado||undefined,
      nombresApoderado:    v.nombresApoderado||undefined,
      apellidosApoderado:  v.apellidosApoderado||undefined,
      parentescoApoderado: v.parentescoApoderado||undefined,
      telefonoApoderado:   v.telefonoApoderado||undefined
    };
    const op = this.editando ? this.svc.editar(this.sel()!.id, body) : this.svc.crear(body);
    op.subscribe({
      next: () => {
        this.notif.success(this.editando ? 'Matrícula actualizada' : 'Matrícula registrada');
        this.guardando.set(false); this.cerrarModal(); this.cargar();
      },
      error: (e: any) => {
        this.notif.error(e?.error?.error || e?.message || 'Error al guardar');
        this.guardando.set(false);
      }
    });
  }

  confirmarEliminar(m: Matricula): void { this.sel.set(m); this.confirmVisible.set(true); }

  eliminar(): void {
    this.svc.eliminar(this.sel()!.id).subscribe({
      next: () => { this.notif.success('Matrícula eliminada'); this.confirmVisible.set(false); this.cargar(); },
      error: (e: any) => { this.notif.error(e?.error?.error || 'Error'); this.confirmVisible.set(false); }
    });
  }

  restaurar(m: Matricula): void {
    this.svc.restaurar(m.id).subscribe({
      next: () => {
        this.notif.success('Matrícula restaurada');
        if (this.verEliminados()) {
          this.svc.listarEliminados().subscribe(d => this.datos.set(d));
        } else {
          this.cargar();
        }
      },
      error: (e: any) => this.notif.error(e?.error?.error || 'Error')
    });
  }

  estadoBadge(estado: string): string {
    const m: Record<string, string> = {
      MATRICULADO: 'activo', PENDIENTE: 'inactivo',
      TRASLADADO: 'secundaria', RETIRADO: 'eliminado', ELIMINADO: 'eliminado'
    };
    return m[estado] ?? 'inactivo';
  }

  irPagina(p: number): void { if (p>=1 && p<=this.totalPaginas()) this.paginaActual.set(p); }
  toggleEliminados(): void  {
    this.verEliminados.update(v => !v);
    this.paginaActual.set(1);
    if (this.verEliminados()) {
      this.filtro.estado = '';
      this.svc.listarEliminados().subscribe(d => this.datos.set(d));
    } else {
      this.cargar();
    }
  }
}
