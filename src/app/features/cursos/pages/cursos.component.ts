import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CursosService } from '../services/cursos.service';
import { Curso, CursoForm } from '../interfaces/curso.interface';
import { GradosService } from '../../grados/services/grados.service';
import { ProfesoresService } from '../../profesores/services/profesores.service';
import { Grado } from '../../grados/interfaces/grado.interface';
import { Profesor } from '../../profesores/interfaces/profesor.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { NivelEducativo } from '../../../shared/interfaces';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div><h2>📚 Cursos / Áreas Curriculares</h2><p>Gestión de cursos por nivel educativo</p></div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">{{ verEliminados() ? 'Ver activos' : '🗑️ Eliminados' }}</button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nuevo Curso</button>
    </div>
  </div>

  <div class="filter-bar">
    <div class="form-group"><label>Buscar</label>
      <input class="form-control" [(ngModel)]="filtro.busqueda" placeholder="Nombre o código..." (input)="aplicarFiltros()" />
    </div>
    <div class="form-group"><label>Nivel</label>
      <select class="form-control" [(ngModel)]="filtro.nivel" (change)="aplicarFiltros()">
        <option value="">Todos</option>
        <option value="INICIAL">Inicial</option>
        <option value="PRIMARIA">Primaria</option>
        <option value="SECUNDARIA">Secundaria</option>
      </select>
    </div>
    <button class="btn btn-outline btn-sm" (click)="limpiarFiltros()">✕ Limpiar</button>
  </div>

  <div class="card">
    @if (datosFiltrados().length === 0) {
      <div class="empty-state"><div class="empty-icon">📚</div><p>No se encontraron cursos</p>
        @if (!verEliminados()) { <button class="btn btn-primary" (click)="abrirModal()">+ Registrar curso</button> }
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead><tr>
            <th>Código</th><th>Nombre</th><th>Nivel</th><th>Grados</th>
            <th>Horas/sem</th><th>Profesor Encargado</th><th>Estado</th><th>Acciones</th>
          </tr></thead>
          <tbody>
            @for (c of datosPaginados(); track c.id) {
              <tr>
                <td><code>{{ c.codigo }}</code></td>
                <td><strong>{{ c.nombre }}</strong>
                  @if (c.descripcion) { <br><span class="text-muted text-sm">{{ c.descripcion }}</span> }
                </td>
                <td><span class="badge badge-{{ c.nivel.toLowerCase() }}">{{ c.nivel }}</span></td>
                <td class="text-sm">
                  @if (c.gradoNombres?.length) {
                    @for (g of c.gradoNombres!; track g) { <span class="badge" style="margin:1px;background:var(--bg-table-head);color:var(--text-secondary)">{{ g }}</span> }
                  } @else { <span class="text-muted">—</span> }
                </td>
                <td>{{ c.horasSemanales || '—' }}</td>
                <td class="text-sm">{{ c.profesorNombre || '—' }}</td>
                <td><span class="badge badge-{{ c.estado.toLowerCase() }}">{{ c.estado }}</span></td>
                <td>
                  <div class="acciones">
                    @if (c.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" (click)="abrirModal(c)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" (click)="confirmarEliminar(c)">🗑️</button>
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
          <button class="page-btn" (click)="irPagina(1)" [disabled]="paginaActual()===1">«</button>
          <button class="page-btn" (click)="irPagina(paginaActual()-1)" [disabled]="paginaActual()===1">‹</button>
          @for (p of paginas(); track p) {
            <button class="page-btn" [class.active]="p===paginaActual()" (click)="irPagina(p)">{{ p }}</button>
          }
          <button class="page-btn" (click)="irPagina(paginaActual()+1)" [disabled]="paginaActual()===totalPaginas()">›</button>
          <button class="page-btn" (click)="irPagina(totalPaginas())" [disabled]="paginaActual()===totalPaginas()">»</button>
        </div>
      }
      <p class="text-muted text-sm mt-4" style="text-align:center">{{ datosFiltrados().length }} curso(s)</p>
    }
  </div>
</div>

@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? 'Editar Curso' : '+ Nuevo Curso' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Código *</label>
              <input class="form-control" formControlName="codigo" placeholder="Ej: SEC-MAT" />
              @if (form.get('codigo')?.invalid && form.get('codigo')?.touched) { <span class="form-error">Requerido</span> }
            </div>
            <div class="form-group">
              <label>Nivel *</label>
              <select class="form-control" formControlName="nivel" (change)="onNivelChange()">
                <option value="INICIAL">Inicial</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Nombre del Curso *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: Matemática" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) { <span class="form-error">Requerido</span> }
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Descripción</label>
              <textarea class="form-control" formControlName="descripcion" rows="2"></textarea>
            </div>
            <div class="form-group">
              <label>Horas semanales</label>
              <input class="form-control" type="number" formControlName="horasSemanales" min="1" />
            </div>
            <div class="form-group">
              <label>Profesor Encargado</label>
              <select class="form-control" formControlName="profesorId">
                <option [value]="null">Sin asignar</option>
                @for (p of profesoresActivos(); track p.id) {
                  <option [value]="p.id">{{ p.apellidos }}, {{ p.nombres }}</option>
                }
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Grados aplicables</label>
              <div class="grados-check-list">
                @for (g of gradosFiltradosPorNivel(); track g.id) {
                  <label class="check-item">
                    <input type="checkbox" [value]="g.id" [checked]="gradoSeleccionado(g.id)" (change)="toggleGrado(g.id, $event)" />
                    {{ g.nombre }}
                  </label>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="cerrarModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="guardando()">{{ guardando() ? 'Guardando...' : (editando ? 'Actualizar' : 'Guardar') }}</button>
        </div>
      </form>
    </div>
  </div>
}

<app-confirm-dialog [visible]="confirmVisible()" titulo="Eliminar Curso"
  [mensaje]="'¿Eliminar el curso ' + (sel()?.nombre||'') + '?'"
  tipo="danger" (confirmado)="eliminar()" (cancelado)="confirmVisible.set(false)" />
  `,
  styles: [`
    .grados-check-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: var(--bg-table-head); border-radius: 8px; border: 1px solid var(--border); max-height: 160px; overflow-y: auto; }
    .check-item { display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
    .check-item:hover { background: var(--accent-light); }
    .check-item input { cursor: pointer; }
  `]
})
export class CursosComponent implements OnInit {
  private svc = inject(CursosService);
  private gradosSvc = inject(GradosService);
  private profSvc = inject(ProfesoresService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  verEliminados = signal(false); modalVisible = signal(false); confirmVisible = signal(false);
  guardando = signal(false); editando = false;
  sel = signal<Curso|null>(null); paginaActual = signal(1); pageSize = 10;
  filtro: { busqueda: string; nivel: NivelEducativo | '' } = { busqueda: '', nivel: '' };
  datos = signal<Curso[]>([]); grados = signal<Grado[]>([]);
  gradosSeleccionados = signal<number[]>([]);
  nivelModal = signal<NivelEducativo>('PRIMARIA'); // signal reactivo para el nivel del modal

  profesoresActivos = computed(() =>
    this.profSvc.getDatos()().filter((p: Profesor) => p.estado === 'ACTIVO')
  );

  form = this.fb.group({
    codigo: ['', Validators.required], nombre: ['', Validators.required],
    nivel: ['PRIMARIA' as NivelEducativo, Validators.required],
    descripcion: [''], horasSemanales: [null as number|null],
    profesorId: [null as number|null]
  });

  datosFiltrados = computed(() => {
    let l = this.datos();
    if (this.filtro.busqueda) { const b = this.filtro.busqueda.toLowerCase(); l = l.filter(c => c.nombre.toLowerCase().includes(b) || c.codigo.toLowerCase().includes(b)); }
    if (this.filtro.nivel) l = l.filter(c => c.nivel === this.filtro.nivel);
    return this.verEliminados() ? l.filter(c => c.estado === 'ELIMINADO') : l.filter(c => c.estado !== 'ELIMINADO');
  });
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.datosFiltrados().length / this.pageSize)));
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  datosPaginados = computed(() => { const s = (this.paginaActual()-1)*this.pageSize; return this.datosFiltrados().slice(s, s+this.pageSize); });
  gradosFiltradosPorNivel = computed(() =>
    this.grados().filter(g => g.nivel === this.nivelModal() && g.estado === 'ACTIVO')
  );

  ngOnInit(): void {
    this.cargar();
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));
    this.profSvc.listar().subscribe();

    this.form.get('nivel')!.valueChanges.subscribe(v => {
      this.nivelModal.set(v as NivelEducativo || 'PRIMARIA');
      this.gradosSeleccionados.set([]);
    });
  }
  cargar(): void { this.svc.listar().subscribe(d => this.datos.set(d)); }
  aplicarFiltros(): void { this.paginaActual.set(1); this.cargar(); }
  limpiarFiltros(): void { this.filtro = { busqueda: '', nivel: '' }; this.cargar(); }

  onNivelChange(): void {
    this.nivelModal.set(this.form.get('nivel')?.value as NivelEducativo || 'PRIMARIA');
    this.gradosSeleccionados.set([]);
  }

  gradoSeleccionado(id: number): boolean { return this.gradosSeleccionados().includes(id); }
  toggleGrado(id: number, e: Event): void {
    const checked = (e.target as HTMLInputElement).checked;
    this.gradosSeleccionados.update(l => checked ? [...l, id] : l.filter(x => x !== id));
  }

  abrirModal(c?: Curso): void {
    this.editando = !!c; this.sel.set(c||null);
    if (c) {
      this.form.patchValue({ ...c, profesorId: c.profesorId ?? null });
      this.nivelModal.set(c.nivel as NivelEducativo || 'PRIMARIA');
      this.gradosSeleccionados.set([...c.gradoIds]);
    } else {
      this.form.reset({ nivel: 'PRIMARIA', profesorId: null });
      this.nivelModal.set('PRIMARIA');
      this.gradosSeleccionados.set([]);
    }
    this.modalVisible.set(true);
  }
  cerrarModal(): void { this.modalVisible.set(false); }
  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const d: CursoForm = {
      ...this.form.value as any,
      profesorId: this.form.value.profesorId ? Number(this.form.value.profesorId) : null,
      gradoIds: this.gradosSeleccionados()
    };
    (this.editando ? this.svc.editar(this.sel()!.id, d) : this.svc.crear(d)).subscribe({
      next: () => { this.notif.success(this.editando?'Curso actualizado':'Curso registrado'); this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (e: any) => { const msg = e?.error?.error || e?.error?.message || e?.message || 'Error'; this.notif.error(msg); this.guardando.set(false); }
    });
  }
  confirmarEliminar(c: Curso): void { this.sel.set(c); this.confirmVisible.set(true); }
  eliminar(): void { this.svc.eliminar(this.sel()!.id).subscribe({ next: () => { this.notif.success('Curso eliminado'); this.confirmVisible.set(false); this.cargar(); }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }
  restaurar(c: Curso): void { this.svc.restaurar(c.id).subscribe({ next: () => { this.notif.success('Curso restaurado'); if (this.verEliminados()) { this.svc.listarEliminados().subscribe(d => this.datos.set(d)); } else { this.cargar(); } }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }
  irPagina(p: number): void { if (p>=1 && p<=this.totalPaginas()) this.paginaActual.set(p); }
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
