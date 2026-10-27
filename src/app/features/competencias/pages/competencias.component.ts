import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CompetenciasService } from '../services/competencias.service';
import { Competencia, CompetenciaForm } from '../interfaces/competencia.interface';
import { CursosService } from '../../cursos/services/cursos.service';
import { GradosService } from '../../grados/services/grados.service';
import { Curso } from '../../cursos/interfaces/curso.interface';
import { Grado } from '../../grados/interfaces/grado.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { NivelEducativo } from '../../../shared/interfaces';

@Component({
  selector: 'app-competencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h2>🎯 Competencias</h2>
      <p>Asociadas a cursos por nivel y grado</p>
    </div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">
        {{ verEliminados() ? 'Ver activos' : '🗑️ Eliminados' }}
      </button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nueva Competencia</button>
    </div>
  </div>

  <div class="filter-bar">
    <div class="form-group">
      <label>Nivel</label>
      <select class="form-control" [(ngModel)]="filtro.nivel" (change)="onFiltroNivelChange()">
        <option value="">Todos</option>
        <option value="INICIAL">Inicial</option>
        <option value="PRIMARIA">Primaria</option>
        <option value="SECUNDARIA">Secundaria</option>
      </select>
    </div>
    <div class="form-group">
      <label>Curso</label>
      <select class="form-control" [(ngModel)]="filtro.cursoId" (change)="aplicarFiltros()">
        <option value="">Todos los cursos</option>
        @for (c of cursosParaFiltro(); track c.id) {
          <option [value]="c.id">{{ c.nombre }}</option>
        }
      </select>
    </div>
    <button class="btn btn-outline btn-sm" (click)="limpiarFiltros()">✕ Limpiar</button>
  </div>

  <div class="card">
    @if (datosFiltrados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">🎯</div>
        <p>No se encontraron competencias para los filtros seleccionados</p>
        <button class="btn btn-primary" (click)="abrirModal()" *ngIf="!verEliminados()">+ Registrar competencia</button>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>Código</th><th>Competencia</th><th>Curso</th><th>Nivel</th><th>Grados</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (c of datosPaginados(); track c.id) {
              <tr>
                <td><code style="font-size:12px;background:#f0f4f8;padding:2px 6px;border-radius:4px">{{ c.codigo }}</code></td>
                <td>
                  <strong>{{ c.nombre }}</strong>
                  @if (c.descripcion) { <br><span class="text-muted text-sm">{{ c.descripcion }}</span> }
                </td>
                <td class="text-sm">{{ getNombreCurso(c.cursoId) }}</td>
                <td><span class="badge badge-{{ c.nivel.toLowerCase() }}">{{ c.nivel }}</span></td>
                <td class="text-sm">{{ c.gradoIds.length }} grado(s)</td>
                <td><span class="badge badge-{{ c.estado.toLowerCase() }}">{{ c.estado }}</span></td>
                <td>
                  <div class="acciones">
                    @if (c.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" title="Editar" (click)="abrirModal(c)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" (click)="confirmarEliminar(c)">🗑️</button>
                    } @else {
                      <button class="btn btn-success btn-sm" (click)="restaurar(c)">↩️ Restaurar</button>
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
          <button class="page-btn" (click)="irPagina(paginaActual()-1)" [disabled]="paginaActual()===1">‹</button>
          @for (p of paginas(); track p) {
            <button class="page-btn" [class.active]="p===paginaActual()" (click)="irPagina(p)">{{ p }}</button>
          }
          <button class="page-btn" (click)="irPagina(paginaActual()+1)" [disabled]="paginaActual()===totalPaginas()">›</button>
        </div>
      }
      <p class="text-muted text-sm mt-4" style="text-align:center">{{ datosFiltrados().length }} competencia(s)</p>
    }
  </div>
</div>

@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? '✏️ Editar Competencia' : '+ Nueva Competencia' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Código *</label>
              <input class="form-control" formControlName="codigo" placeholder="Ej: PRI-MAT-C1" />
              @if (form.get('codigo')?.invalid && form.get('codigo')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Nivel *</label>
              <select class="form-control" formControlName="nivel" (change)="onModalNivelChange()">
                <option value="INICIAL">Inicial</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Nombre de la Competencia *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: Resuelve problemas de cantidad" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Descripción</label>
              <textarea class="form-control" formControlName="descripcion" rows="2"></textarea>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Curso / Área Curricular *</label>
              <select class="form-control" formControlName="cursoId">
                <option value="">Seleccionar curso</option>
                @for (c of cursosParaModal(); track c.id) {
                  <option [value]="c.id">{{ c.nombre }}</option>
                }
              </select>
              @if (form.get('cursoId')?.invalid && form.get('cursoId')?.touched) {
                <span class="form-error">Seleccione un curso</span>
              }
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Grados aplicables</label>
              <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px;background:#f7fafc;border-radius:8px;border:1px solid #e2e8f0">
                @for (g of gradosParaModal(); track g.id) {
                  <label style="display:flex;align-items:center;gap:5px;font-size:13px;cursor:pointer;padding:4px 8px;border-radius:4px"
                         [style.background]="gradoSeleccionado(g.id) ? '#BEE3F8' : 'transparent'">
                    <input type="checkbox" [checked]="gradoSeleccionado(g.id)" (change)="toggleGrado(g.id, $event)" />
                    {{ g.nombre }}
                  </label>
                }
              </div>
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

<app-confirm-dialog [visible]="confirmVisible()" titulo="Eliminar Competencia"
  [mensaje]="'¿Eliminar la competencia ' + (sel()?.nombre||'') + '?'"
  tipo="danger" (confirmado)="eliminar()" (cancelado)="confirmVisible.set(false)" />
  `
})
export class CompetenciasComponent implements OnInit {
  private svc = inject(CompetenciasService);
  private cursosSvc = inject(CursosService);
  private gradosSvc = inject(GradosService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  verEliminados = signal(false); modalVisible = signal(false);
  confirmVisible = signal(false); guardando = signal(false);
  editando = false; sel = signal<Competencia|null>(null);
  paginaActual = signal(1); pageSize = 12;
  filtro: { nivel: NivelEducativo|''; cursoId: number|'' } = { nivel: '', cursoId: '' };
  datos = signal<Competencia[]>([]);
  cursos = signal<Curso[]>([]);
  grados = signal<Grado[]>([]);
  gradosSeleccionados = signal<number[]>([]);
  nivelModal = signal<NivelEducativo>('PRIMARIA');

  form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    cursoId: [null as number|null, Validators.required],
    nivel: ['PRIMARIA' as NivelEducativo, Validators.required]
  });

  datosFiltrados = computed(() => {
    let l = this.datos();
    if (this.filtro.nivel) l = l.filter(c => c.nivel === this.filtro.nivel);
    if (this.filtro.cursoId) l = l.filter(c => c.cursoId === Number(this.filtro.cursoId));
    return this.verEliminados() ? l.filter(c => c.estado === 'ELIMINADO') : l.filter(c => c.estado !== 'ELIMINADO');
  });
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.datosFiltrados().length / this.pageSize)));
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  datosPaginados = computed(() => { const s = (this.paginaActual()-1)*this.pageSize; return this.datosFiltrados().slice(s, s+this.pageSize); });

  cursosParaFiltro = computed(() => {
    if (!this.filtro.nivel) return this.cursos().filter(c => c.estado === 'ACTIVO');
    return this.cursos().filter(c => c.nivel === this.filtro.nivel && c.estado === 'ACTIVO');
  });
  cursosParaModal = computed(() =>
    this.cursos().filter(c => c.nivel === this.nivelModal() && c.estado === 'ACTIVO')
  );
  gradosParaModal = computed(() =>
    this.grados().filter(g => g.nivel === this.nivelModal() && g.estado === 'ACTIVO')
  );

  ngOnInit(): void {
    this.cargar();
    this.cursosSvc.listar().subscribe(d => this.cursos.set(d));
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));

    this.form.get('nivel')!.valueChanges.subscribe(v => {
      this.nivelModal.set(v as NivelEducativo || 'PRIMARIA');
      this.form.patchValue({ cursoId: null }, { emitEvent: false });
      this.gradosSeleccionados.set([]);
    });
  }
  cargar(): void {
    this.svc.listar().subscribe(d => this.datos.set(d));
  }
  onFiltroNivelChange(): void { this.filtro.cursoId = ''; this.aplicarFiltros(); }
  aplicarFiltros(): void { this.paginaActual.set(1); }
  limpiarFiltros(): void { this.filtro = { nivel: '', cursoId: '' }; this.paginaActual.set(1); }
  onModalNivelChange(): void {
    this.nivelModal.set(this.form.get('nivel')?.value as NivelEducativo || 'PRIMARIA');
    this.form.patchValue({ cursoId: null });
    this.gradosSeleccionados.set([]);
  }
  gradoSeleccionado(id: number): boolean { return this.gradosSeleccionados().includes(id); }
  toggleGrado(id: number, e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.gradosSeleccionados.update(l => checked ? [...l, id] : l.filter(x => x !== id));
  }
  getNombreCurso(id: number): string { return this.cursos().find(c => c.id === id)?.nombre || '—'; }

  abrirModal(c?: Competencia): void {
    this.editando = !!c; this.sel.set(c||null);
    if (c) {
      this.form.patchValue(c);
      this.nivelModal.set(c.nivel as NivelEducativo || 'PRIMARIA');
      this.gradosSeleccionados.set([...c.gradoIds]);
    } else {
      this.form.reset({ nivel: 'PRIMARIA' });
      this.nivelModal.set('PRIMARIA');
      this.gradosSeleccionados.set([]);
    }
    this.modalVisible.set(true);
  }
  cerrarModal(): void { this.modalVisible.set(false); }
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const d: CompetenciaForm = { ...this.form.value as any, cursoId: Number(this.form.value.cursoId), gradoIds: this.gradosSeleccionados() };
    (this.editando ? this.svc.editar(this.sel()!.id, d) : this.svc.crear(d)).subscribe({
      next: () => { this.notif.success(this.editando ? 'Competencia actualizada' : 'Competencia registrada'); this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (e: any) => {
        const msg = e?.error?.error || e?.error?.message || e?.message || 'Error al guardar';
        this.notif.error(msg);
        this.guardando.set(false);
      }
    });
  }
  confirmarEliminar(c: Competencia): void { this.sel.set(c); this.confirmVisible.set(true); }
  eliminar(): void {
    this.svc.eliminar(this.sel()!.id).subscribe({ next: () => { this.notif.success('Competencia eliminada'); this.confirmVisible.set(false); this.cargar(); }, error: (e: Error) => this.notif.error(e.message) });
  }
  restaurar(c: Competencia): void {
    this.svc.restaurar(c.id).subscribe({ next: () => { this.notif.success('Competencia restaurada'); if (this.verEliminados()) { this.svc.listarEliminados().subscribe(d => this.datos.set(d)); } else { this.cargar(); } }, error: (e: Error) => this.notif.error(e.message) });
  }
  irPagina(p: number): void { if (p >= 1 && p <= this.totalPaginas()) this.paginaActual.set(p); }
  toggleEliminados(): void {
    this.verEliminados.update(v => !v);
    this.paginaActual.set(1);
    if (this.verEliminados()) {
      this.svc.listarEliminados().subscribe(d => this.datos.set(d));
    } else {
      this.cargar();
    }
  }
}
