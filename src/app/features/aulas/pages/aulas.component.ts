import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { GradosService } from '../../grados/services/grados.service';
import { ProfesoresService } from '../../profesores/services/profesores.service';
import { Grado, Seccion } from '../../grados/interfaces/grado.interface';
import { environment } from '../../../../environments/environment';

export interface Aula {
  id: number;
  codigo: string;
  nombre: string;
  nivelEducativo: string;
  gradoId: number;
  gradoNombre?: string;
  seccionId: number;
  seccionNombre?: string;
  anioAcademico: number;
  capacidad: number;
  profesorId?: number;
  profesorNombre?: string;
  profesorEspecialidad?: string;
  estado: string;
  totalMatriculados?: number;
}

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h2>🏛️ Aulas</h2>
      <p>Gestión de aulas por nivel, grado y sección</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">
        {{ verEliminados() ? '📋 Ver activas' : '🗑️ Eliminadas' }}
      </button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nueva Aula</button>
    </div>
  </div>

  <!-- Filtros -->
  <div class="filter-bar">
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
      <label>Año Académico</label>
      <select class="form-control" [(ngModel)]="filtro.anio" (change)="aplicarFiltros()">
        <option value="">Todos</option>
        @for (a of anios; track a) { <option [value]="a">{{ a }}</option> }
      </select>
    </div>
    <div class="form-group">
      <label>Buscar</label>
      <input class="form-control" [(ngModel)]="filtro.busqueda" placeholder="Código, nombre..." (input)="aplicarFiltros()" />
    </div>
    <button class="btn btn-outline btn-sm" style="align-self:flex-end" (click)="limpiarFiltros()">✕ Limpiar</button>
  </div>

  <div class="card">
    @if (cargando()) {
      <div class="loading-wrap"><div class="spinner-md"></div> Cargando aulas...</div>
    } @else if (datosFiltrados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🏛️</div>
        <p>No se encontraron aulas</p>
        <button class="btn btn-primary" (click)="abrirModal()">+ Registrar aula</button>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th><th>Código</th><th>Nombre</th><th>Nivel</th>
              <th>Grado / Sección</th><th>Año</th><th>Capacidad</th>
              <th>Matriculados</th><th>Profesor Tutor</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of datosPaginados(); track a.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ (paginaActual()-1)*pageSize+i+1 }}</td>
                <td><strong>{{ a.codigo }}</strong></td>
                <td>{{ a.nombre }}</td>
                <td><span class="badge badge-{{ a.nivelEducativo.toLowerCase() }}">{{ a.nivelEducativo }}</span></td>
                <td>{{ a.gradoNombre }} / <strong>{{ a.seccionNombre }}</strong></td>
                <td>{{ a.anioAcademico }}</td>
                <td>{{ a.capacidad }}</td>
                <td>
                  <span [class]="(a.totalMatriculados||0) >= a.capacidad ? 'badge badge-eliminado' : 'badge badge-activo'">
                    {{ a.totalMatriculados || 0 }} / {{ a.capacidad }}
                  </span>
                </td>
                <td class="text-sm">{{ a.profesorNombre || '—' }}<br>
                  @if (a.profesorEspecialidad) {
                    <span class="text-muted">{{ a.profesorEspecialidad }}</span>
                  }
                </td>
                <td><span class="badge badge-{{ a.estado.toLowerCase() }}">{{ a.estado }}</span></td>
                <td>
                  <div class="acciones">
                    @if (a.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" title="Editar" (click)="abrirModal(a)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" (click)="confirmarEliminar(a)">🗑️</button>
                    } @else {
                      <button class="btn btn-success btn-sm" (click)="restaurar(a)">↩️</button>
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
      <p class="text-muted text-sm mt-4" style="text-align:center">{{ datosFiltrados().length }} aula(s)</p>
    }
  </div>
</div>

@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? '✏️ Editar Aula' : '+ Nueva Aula' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Código *</label>
              <input class="form-control" formControlName="codigo" placeholder="Ej: AULA-P1A" />
              @if (form.get('codigo')?.invalid && form.get('codigo')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Nombre *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: Aula 1A Primaria" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
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
                @for (g of gradosFiltrados(); track g.id) {
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
                @for (s of seccionesFiltradas(); track s.id) {
                  <option [value]="s.id">{{ s.nombre }} ({{ s.turno }})</option>
                }
              </select>
              @if (form.get('seccionId')?.invalid && form.get('seccionId')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Año Académico *</label>
              <input class="form-control" type="number" formControlName="anioAcademico" />
              @if (form.get('anioAcademico')?.invalid && form.get('anioAcademico')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Capacidad máxima *</label>
              <input class="form-control" type="number" formControlName="capacidad" placeholder="Ej: 30" />
              @if (form.get('capacidad')?.invalid && form.get('capacidad')?.touched) {
                <span class="form-error">Requerido, mínimo 1</span>
              }
            </div>
            <div class="form-group">
              <label>Profesor Tutor (opcional)</label>
              <select class="form-control" formControlName="profesorId">
                <option value="">Sin asignar</option>
                @for (p of profesores(); track p.id) {
                  <option [value]="p.id">{{ p.apellidos }}, {{ p.nombres }}</option>
                }
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="guardando()">
            {{ guardando() ? 'Guardando...' : (editando ? 'Actualizar' : 'Guardar') }}
          </button>
        </div>
      </form>
    </div>
  </div>
}

<app-confirm-dialog
  [visible]="confirmVisible()"
  titulo="Eliminar Aula"
  [mensaje]="'¿Eliminar el aula ' + (sel()?.nombre||'') + '?'"
  tipo="danger"
  (confirmado)="eliminar()"
  (cancelado)="confirmVisible.set(false)" />
  `
})
export class AulasComponent implements OnInit {
  private http    = inject(HttpClient);
  private notif   = inject(NotificationService);
  private gradosSvc = inject(GradosService);
  private profSvc = inject(ProfesoresService);
  private fb      = inject(FormBuilder);
  private readonly url = `${environment.apiUrl}/classroom`;

  cargando      = signal(false);
  guardando     = signal(false);
  modalVisible  = signal(false);
  confirmVisible = signal(false);
  verEliminados = signal(false);
  editando      = false;
  sel           = signal<Aula|null>(null);
  paginaActual  = signal(1);
  pageSize      = 10;

  datos     = signal<Aula[]>([]);
  grados    = signal<Grado[]>([]);
  secciones = signal<Seccion[]>([]);
  profesores = computed(() => this.profSvc.getDatos()().filter(p => p.estado === 'ACTIVO'));

  nivelSeleccionado = signal<string>('PRIMARIA');
  gradoSeleccionado = signal<number|null>(null);

  anios = [new Date().getFullYear(), new Date().getFullYear()-1, new Date().getFullYear()+1];
  filtro = { nivel: '', anio: '', busqueda: '' };

  form = this.fb.group({
    codigo:          ['', Validators.required],
    nombre:          ['', Validators.required],
    nivelEducativo:  ['PRIMARIA', Validators.required],
    gradoId:         [null as number|null, Validators.required],
    seccionId:       [null as number|null, Validators.required],
    anioAcademico:   [new Date().getFullYear(), Validators.required],
    capacidad:       [30, [Validators.required, Validators.min(1)]],
    profesorId:      [null as number|null]
  });

  gradosFiltrados = computed(() =>
    this.grados().filter(g => g.nivel === this.nivelSeleccionado() && g.estado === 'ACTIVO')
  );
  seccionesFiltradas = computed(() => {
    const gId = this.gradoSeleccionado();
    return gId ? this.secciones().filter(s => s.gradoId === gId && s.estado === 'ACTIVO') : [];
  });

  datosFiltrados = computed(() => {
    let l = this.verEliminados()
      ? this.datos().filter(a => a.estado === 'ELIMINADO')
      : this.datos().filter(a => a.estado !== 'ELIMINADO');
    if (this.filtro.nivel) l = l.filter(a => a.nivelEducativo === this.filtro.nivel);
    if (this.filtro.anio)  l = l.filter(a => a.anioAcademico === Number(this.filtro.anio));
    const b = this.filtro.busqueda.toLowerCase();
    if (b) l = l.filter(a => a.codigo?.toLowerCase().includes(b) || a.nombre.toLowerCase().includes(b));
    return l;
  });

  totalPaginas  = computed(() => Math.max(1, Math.ceil(this.datosFiltrados().length / this.pageSize)));
  paginas       = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i+1));
  datosPaginados = computed(() => {
    const s = (this.paginaActual()-1) * this.pageSize;
    return this.datosFiltrados().slice(s, s+this.pageSize);
  });

  ngOnInit(): void {
    this.cargar();
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));
    this.gradosSvc.listarSecciones().subscribe(d => this.secciones.set(d));
    this.profSvc.listar().subscribe();

    this.form.get('nivelEducativo')!.valueChanges.subscribe(v => {
      this.nivelSeleccionado.set(v as string || 'PRIMARIA');
      this.gradoSeleccionado.set(null);
      this.form.patchValue({ gradoId: null, seccionId: null }, { emitEvent: false });
    });
    this.form.get('gradoId')!.valueChanges.subscribe(v => {
      this.gradoSeleccionado.set(v ? Number(v) : null);
      this.form.patchValue({ seccionId: null }, { emitEvent: false });
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.http.get<Aula[]>(this.url).subscribe({
      next: d => { this.datos.set(d); this.cargando.set(false); },
      error: () => { this.datos.set([]); this.cargando.set(false); }
    });
  }

  onNivelChange(): void {
    this.nivelSeleccionado.set(this.form.get('nivelEducativo')?.value ?? 'PRIMARIA');
    this.gradoSeleccionado.set(null);
    this.form.patchValue({ gradoId: null, seccionId: null });
  }
  onGradoChange(): void {
    this.gradoSeleccionado.set(Number(this.form.get('gradoId')?.value) || null);
    this.form.patchValue({ seccionId: null });
  }
  aplicarFiltros(): void { this.paginaActual.set(1); }
  limpiarFiltros(): void { this.filtro = { nivel: '', anio: '', busqueda: '' }; this.paginaActual.set(1); }

  abrirModal(a?: Aula): void {
    this.editando = !!a;
    this.sel.set(a || null);
    if (a) {
      this.form.patchValue({
        codigo: a.codigo, nombre: a.nombre,
        nivelEducativo: a.nivelEducativo,
        gradoId: a.gradoId, seccionId: a.seccionId,
        anioAcademico: a.anioAcademico, capacidad: a.capacidad,
        profesorId: a.profesorId ?? null
      });
      this.nivelSeleccionado.set(a.nivelEducativo ?? 'PRIMARIA');
      this.gradoSeleccionado.set(a.gradoId ?? null);
    } else {
      this.form.reset({ nivelEducativo: 'PRIMARIA', anioAcademico: new Date().getFullYear(), capacidad: 30 });
      this.nivelSeleccionado.set('PRIMARIA');
      this.gradoSeleccionado.set(null);
    }
    this.modalVisible.set(true);
  }

  cerrarModal(): void { this.modalVisible.set(false); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const body = {
      ...this.form.value,
      gradoId:    Number(this.form.value.gradoId),
      seccionId:  Number(this.form.value.seccionId),
      profesorId: this.form.value.profesorId ? Number(this.form.value.profesorId) : null
    };
    const op = this.editando
      ? this.http.put<Aula>(`${this.url}/${this.sel()!.id}`, body)
      : this.http.post<Aula>(this.url, body);
    op.subscribe({
      next: () => {
        this.notif.success(this.editando ? 'Aula actualizada' : 'Aula registrada');
        this.guardando.set(false); this.cerrarModal(); this.cargar();
      },
      error: (e: any) => {
        this.notif.error(e?.error?.message || 'Error al guardar');
        this.guardando.set(false);
      }
    });
  }

  confirmarEliminar(a: Aula): void { this.sel.set(a); this.confirmVisible.set(true); }

  eliminar(): void {
    this.http.delete<Aula>(`${this.url}/${this.sel()!.id}`).subscribe({
      next: () => { this.notif.success('Aula eliminada'); this.confirmVisible.set(false); this.cargar(); },
      error: (e: any) => { this.notif.error(e?.error?.message || 'Error'); this.confirmVisible.set(false); }
    });
  }

  restaurar(a: Aula): void {
    this.http.patch<Aula>(`${this.url}/${a.id}/restaurar`, {}).subscribe({
      next: () => {
        this.notif.success('Aula restaurada');
        if (this.verEliminados()) {
          this.http.get<Aula[]>(`${this.url}/eliminados`).subscribe(d => this.datos.set(d));
        } else {
          this.cargar();
        }
      },
      error: (e: any) => this.notif.error(e?.error?.message || 'Error')
    });
  }

  irPagina(p: number): void { if (p>=1 && p<=this.totalPaginas()) this.paginaActual.set(p); }
  toggleEliminados(): void {
    this.verEliminados.update(v => !v);
    this.paginaActual.set(1);
    if (this.verEliminados()) {
      this.cargando.set(true);
      this.http.get<Aula[]>(`${this.url}/eliminados`).subscribe({
        next: d => { this.datos.set(d); this.cargando.set(false); },
        error: () => this.cargando.set(false)
      });
    } else {
      this.cargar();
    }
  }
}
