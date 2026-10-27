import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GradosService } from '../services/grados.service';
import { Grado, Seccion } from '../interfaces/grado.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { NivelEducativo } from '../../../shared/interfaces';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div><h2>🏫 Grados y Secciones</h2><p>Organización académica por nivel educativo</p></div>
  </div>

  <div class="tabs">
    <button class="tab-btn" [class.active]="tabActiva()==='grados'" (click)="tabActiva.set('grados')">📐 Grados ({{ gradosActivos().length }})</button>
    <button class="tab-btn" [class.active]="tabActiva()==='secciones'" (click)="tabActiva.set('secciones')">🏷️ Secciones ({{ seccionesActivas().length }})</button>
  </div>

  <!-- GRADOS -->
  @if (tabActiva() === 'grados') {
    <div class="page-header" style="margin-bottom:16px">
      <div class="d-flex gap-2">
        <select class="form-control" style="width:180px" [(ngModel)]="filtroNivel" (change)="cargarGrados()">
          <option value="">Todos los niveles</option>
          <option value="INICIAL">Inicial</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
        </select>
        <button class="btn btn-outline btn-sm" (click)="toggleEliminadosG()">{{ verEliminadosG() ? 'Ver activos' : '🗑️ Eliminados' }}</button>
      </div>
      <button class="btn btn-primary" (click)="abrirModalGrado()">+ Nuevo Grado</button>
    </div>
    <div class="card">
      @if (gradosFiltrados().length === 0) {
        <div class="empty-state"><div class="empty-icon">🏫</div><p>No hay grados</p></div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Nombre</th><th>Nivel</th><th>Orden</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (g of gradosFiltrados(); track g.id) {
                <tr>
                  <td><strong>{{ g.nombre }}</strong></td>
                  <td><span class="badge badge-{{ g.nivel.toLowerCase() }}">{{ g.nivel }}</span></td>
                  <td>{{ g.orden }}</td>
                  <td><span class="badge badge-{{ g.estado.toLowerCase() }}">{{ g.estado }}</span></td>
                  <td>
                    <div class="acciones">
                      @if (g.estado !== 'ELIMINADO') {
                        <button class="btn btn-outline btn-sm btn-icon" (click)="abrirModalGrado(g)">✏️</button>
                        <button class="btn btn-danger btn-sm btn-icon" (click)="confirmarEliminarG(g)">🗑️</button>
                      } @else {
                        <button class="btn btn-success btn-sm" (click)="restaurarGrado(g)">↩️</button>
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

  <!-- SECCIONES -->
  @if (tabActiva() === 'secciones') {
    <div class="page-header" style="margin-bottom:16px">
      <div class="d-flex gap-2">
        <select class="form-control" style="width:200px" [(ngModel)]="filtroGradoS" (change)="cargarSecciones()">
          <option value="">Todos los grados</option>
          @for (g of gradosActivos(); track g.id) {
            <option [value]="g.id">{{ g.nombre }} ({{ g.nivel }})</option>
          }
        </select>
        <button class="btn btn-outline btn-sm" (click)="toggleEliminadosS()">{{ verEliminadosS() ? 'Ver activos' : '🗑️ Eliminados' }}</button>
      </div>
      <button class="btn btn-primary" (click)="abrirModalSeccion()">+ Nueva Sección</button>
    </div>
    <div class="card">
      @if (seccionesFiltradas().length === 0) {
        <div class="empty-state"><div class="empty-icon">🏷️</div><p>No hay secciones</p></div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Sección</th><th>Grado</th><th>Nivel</th><th>Turno</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (s of seccionesFiltradas(); track s.id) {
                <tr>
                  <td><strong>{{ s.nombre }}</strong></td>
                  <td>{{ s.gradoNombre }}</td>
                  <td><span class="badge badge-{{ s.nivel?.toLowerCase() }}">{{ s.nivel }}</span></td>
                  <td>{{ s.turno }}</td>
                  <td>{{ s.capacidad }}</td>
                  <td><span class="badge badge-{{ s.estado.toLowerCase() }}">{{ s.estado }}</span></td>
                  <td>
                    <div class="acciones">
                      @if (s.estado !== 'ELIMINADO') {
                        <button class="btn btn-outline btn-sm btn-icon" (click)="abrirModalSeccion(s)">✏️</button>
                        <button class="btn btn-danger btn-sm btn-icon" (click)="confirmarEliminarS(s)">🗑️</button>
                      } @else {
                        <button class="btn btn-success btn-sm" (click)="restaurarSeccion(s)">↩️</button>
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
</div>

<!-- Modal Grado -->
@if (modalGradoVisible()) {
  <div class="modal-overlay" (click)="modalGradoVisible.set(false)">
    <div class="modal" style="max-width:440px" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editandoG ? 'Editar Grado' : '+ Nuevo Grado' }}</h3>
        <button class="btn-close-modal" (click)="modalGradoVisible.set(false)">×</button>
      </div>
      <form [formGroup]="formGrado" (ngSubmit)="guardarGrado()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Nombre *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: 1° Primaria" />
            </div>
            <div class="form-group">
              <label>Nivel *</label>
              <select class="form-control" formControlName="nivel">
                <option value="INICIAL">Inicial</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </select>
            </div>
            <div class="form-group">
              <label>Orden</label>
              <input class="form-control" type="number" formControlName="orden" min="1" />
            </div>
            <div class="form-group">
              <label>Descripción</label>
              <input class="form-control" formControlName="descripcion" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="modalGradoVisible.set(false)">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editandoG ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>
}

<!-- Modal Sección -->
@if (modalSeccionVisible()) {
  <div class="modal-overlay" (click)="modalSeccionVisible.set(false)">
    <div class="modal" style="max-width:440px" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editandoS ? 'Editar Sección' : '+ Nueva Sección' }}</h3>
        <button class="btn-close-modal" (click)="modalSeccionVisible.set(false)">×</button>
      </div>
      <form [formGroup]="formSeccion" (ngSubmit)="guardarSeccion()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Nombre *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: A, B, C" />
            </div>
            <div class="form-group">
              <label>Grado *</label>
              <select class="form-control" formControlName="gradoId">
                <option value="">Seleccionar grado</option>
                @for (g of gradosActivos(); track g.id) {
                  <option [value]="g.id">{{ g.nombre }} ({{ g.nivel }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Turno *</label>
              <select class="form-control" formControlName="turno">
                <option value="MANANA">Mañana</option>
                <option value="TARDE">Tarde</option>
                <option value="NOCHE">Noche</option>
              </select>
            </div>
            <div class="form-group">
              <label>Capacidad</label>
              <input class="form-control" type="number" formControlName="capacidad" min="1" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="modalSeccionVisible.set(false)">Cancelar</button>
          <button type="submit" class="btn btn-primary">{{ editandoS ? 'Actualizar' : 'Guardar' }}</button>
        </div>
      </form>
    </div>
  </div>
}

<app-confirm-dialog [visible]="confirmVG()" titulo="Eliminar Grado"
  [mensaje]="'¿Eliminar el grado ' + (selG()?.nombre||'') + '?'"
  tipo="danger" (confirmado)="eliminarGrado()" (cancelado)="confirmVG.set(false)" />
<app-confirm-dialog [visible]="confirmVS()" titulo="Eliminar Sección"
  [mensaje]="'¿Eliminar la sección ' + (selS()?.nombre||'') + '?'"
  tipo="danger" (confirmado)="eliminarSeccion()" (cancelado)="confirmVS.set(false)" />
  `
})
export class GradosComponent implements OnInit {
  private svc = inject(GradosService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  tabActiva = signal<'grados'|'secciones'>('grados');
  verEliminadosG = signal(false); verEliminadosS = signal(false);
  modalGradoVisible = signal(false); modalSeccionVisible = signal(false);
  confirmVG = signal(false); confirmVS = signal(false);
  editandoG = false; editandoS = false;
  selG = signal<Grado|null>(null); selS = signal<Seccion|null>(null);
  filtroNivel = ''; filtroGradoS: number | '' = '';

  grados = signal<Grado[]>([]); secciones = signal<Seccion[]>([]);

  formGrado = this.fb.group({
    nombre: ['', Validators.required], nivel: ['PRIMARIA', Validators.required],
    orden: [1], descripcion: [''], estado: ['ACTIVO']
  });
  formSeccion = this.fb.group({
    nombre: ['', Validators.required], gradoId: [null as number|null, Validators.required],
    turno: ['MANANA', Validators.required], capacidad: [30], estado: ['ACTIVO']
  });

  gradosActivos = computed(() => this.grados().filter(g => g.estado === 'ACTIVO'));
  gradosFiltrados = computed(() => {
    let l = this.grados();
    if (this.filtroNivel) l = l.filter(g => g.nivel === this.filtroNivel);
    return this.verEliminadosG() ? l.filter(g => g.estado === 'ELIMINADO') : l.filter(g => g.estado !== 'ELIMINADO');
  });
  seccionesActivas = computed(() => this.secciones().filter(s => s.estado === 'ACTIVO'));
  seccionesFiltradas = computed(() => {
    let l = this.secciones();
    if (this.filtroGradoS) l = l.filter(s => s.gradoId === Number(this.filtroGradoS));
    return this.verEliminadosS() ? l.filter(s => s.estado === 'ELIMINADO') : l.filter(s => s.estado !== 'ELIMINADO');
  });

  ngOnInit(): void { this.cargarGrados(); this.cargarSecciones(); }
  cargarGrados(): void { this.svc.listarGrados(this.filtroNivel as NivelEducativo || undefined).subscribe(d => this.grados.set(d)); }
  cargarSecciones(): void { this.svc.listarSecciones(this.filtroGradoS ? Number(this.filtroGradoS) : undefined).subscribe(d => this.secciones.set(d)); }

  abrirModalGrado(g?: Grado): void {
    this.editandoG = !!g; this.selG.set(g||null);
    g ? this.formGrado.patchValue(g) : this.formGrado.reset({ nivel: 'PRIMARIA', orden: 1, estado: 'ACTIVO' });
    this.modalGradoVisible.set(true);
  }
  guardarGrado(): void {
    if (this.formGrado.invalid) return;
    const d = this.formGrado.value as Omit<Grado,'id'>;
    const obs = this.editandoG ? this.svc.editarGrado(this.selG()!.id, d) : this.svc.crearGrado(d);
    obs.subscribe({ next: () => { this.notif.success(this.editandoG?'Grado actualizado':'Grado creado'); this.modalGradoVisible.set(false); this.cargarGrados(); }, error: (e:Error) => this.notif.error(e.message) });
  }
  confirmarEliminarG(g: Grado): void { this.selG.set(g); this.confirmVG.set(true); }
  eliminarGrado(): void { this.svc.eliminarGrado(this.selG()!.id).subscribe({ next: () => { this.notif.success('Grado eliminado'); this.confirmVG.set(false); this.cargarGrados(); }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }
  restaurarGrado(g: Grado): void { this.svc.restaurarGrado(g.id).subscribe({ next: () => { this.notif.success('Grado restaurado'); if (this.verEliminadosG()) { this.svc.listarGradosEliminados().subscribe(d => this.grados.set(d)); } else { this.cargarGrados(); } }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }

  abrirModalSeccion(s?: Seccion): void {
    this.editandoS = !!s; this.selS.set(s||null);
    s ? this.formSeccion.patchValue({...s, gradoId: s.gradoId}) : this.formSeccion.reset({ turno: 'MANANA', capacidad: 30, estado: 'ACTIVO' });
    this.modalSeccionVisible.set(true);
  }
  guardarSeccion(): void {
    if (this.formSeccion.invalid) return;
    const d = { ...this.formSeccion.value, gradoId: Number(this.formSeccion.value.gradoId) } as Omit<Seccion,'id'>;
    const obs = this.editandoS ? this.svc.editarSeccion(this.selS()!.id, d) : this.svc.crearSeccion(d);
    obs.subscribe({ next: () => { this.notif.success(this.editandoS?'Sección actualizada':'Sección creada'); this.modalSeccionVisible.set(false); this.cargarSecciones(); }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } });
  }
  confirmarEliminarS(s: Seccion): void { this.selS.set(s); this.confirmVS.set(true); }
  eliminarSeccion(): void { this.svc.eliminarSeccion(this.selS()!.id).subscribe({ next: () => { this.notif.success('Sección eliminada'); this.confirmVS.set(false); this.cargarSecciones(); }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }
  restaurarSeccion(s: Seccion): void { this.svc.restaurarSeccion(s.id).subscribe({ next: () => { this.notif.success('Sección restaurada'); if (this.verEliminadosS()) { this.svc.listarSeccionesEliminadas().subscribe(d => this.secciones.set(d)); } else { this.cargarSecciones(); } }, error:(e:any)=>{ const msg=e?.error?.error||e?.error?.message||e?.message||'Error'; this.notif.error(msg); } }); }
  toggleEliminadosG(): void {
    this.verEliminadosG.update(v => !v);
    if (this.verEliminadosG()) {
      this.svc.listarGradosEliminados().subscribe(d => this.grados.set(d));
    } else {
      this.cargarGrados();
    }
  }
  toggleEliminadosS(): void {
    this.verEliminadosS.update(v => !v);
    if (this.verEliminadosS()) {
      this.svc.listarSeccionesEliminadas().subscribe(d => this.secciones.set(d));
    } else {
      this.cargarSecciones();
    }
  }
}
