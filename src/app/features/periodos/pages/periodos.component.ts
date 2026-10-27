import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PeriodosService } from '../services/periodos.service';
import { Periodo, PeriodoForm } from '../interfaces/periodo.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div><h2>📅 Periodos Académicos</h2><p>Bimestres, trimestres o periodos del año académico</p></div>
    <div class="d-flex gap-2">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">
        {{ verEliminados() ? 'Ver activos' : '🗑️ Eliminados' }}
      </button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nuevo Periodo</button>
    </div>
  </div>

  <!-- Periodo activo highlight -->
  @if (periodoActivo()) {
    <div style="background:#C6F6D5;border:1px solid #68D391;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
      <span style="font-size:22px">✅</span>
      <div>
        <strong style="color:#276749">Periodo activo: {{ periodoActivo()!.nombre }}</strong>
        <span style="color:#276749;font-size:13px;margin-left:12px">{{ periodoActivo()!.anioAcademico }} · {{ periodoActivo()!.fechaInicio }} → {{ periodoActivo()!.fechaFin }}</span>
      </div>
    </div>
  }

  <div class="card">
    @if (datosFiltrados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <p>No hay periodos registrados</p>
        <button class="btn btn-primary" (click)="abrirModal()">+ Crear primer periodo</button>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr><th>Nombre</th><th>Año</th><th>Fecha Inicio</th><th>Fecha Fin</th><th>Estado</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            @for (p of datosFiltrados(); track p.id) {
              <tr [style.background]="p.activo ? '#f0fff4' : ''">
                <td><strong>{{ p.nombre }}</strong></td>
                <td>{{ p.anioAcademico }}</td>
                <td>{{ p.fechaInicio }}</td>
                <td>{{ p.fechaFin }}</td>
                <td><span class="badge badge-{{ p.estado.toLowerCase() }}">{{ p.estado }}</span></td>
                <td>
                  @if (p.activo) {
                    <span class="badge" style="background:#C6F6D5;color:#276749">✅ Activo</span>
                  } @else if (p.estado !== 'ELIMINADO') {
                    <button class="btn btn-outline btn-sm" (click)="activar(p)">Activar</button>
                  }
                </td>
                <td>
                  <div class="acciones">
                    @if (p.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" (click)="abrirModal(p)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" (click)="confirmarEliminar(p)" [disabled]="p.activo">🗑️</button>
                    } @else {
                      <button class="btn btn-success btn-sm" (click)="restaurar(p)">↩️ Restaurar</button>
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
</div>

@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" style="max-width:480px" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? 'Editar Periodo' : '+ Nuevo Periodo' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group" style="grid-column:1/-1">
              <label>Nombre del Periodo *</label>
              <input class="form-control" formControlName="nombre" placeholder="Ej: I Bimestre, I Trimestre" />
              @if (form.get('nombre')?.invalid && form.get('nombre')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Año Académico *</label>
              <input class="form-control" type="number" formControlName="anioAcademico" placeholder="2026" />
            </div>
            <div class="form-group" style="align-self:flex-end">
              <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:10px;background:#f7fafc;border-radius:8px;border:1px solid #e2e8f0">
                <input type="checkbox" formControlName="activo" />
                <span>Marcar como periodo activo</span>
              </label>
            </div>
            <div class="form-group">
              <label>Fecha de Inicio *</label>
              <input class="form-control" type="date" formControlName="fechaInicio" />
            </div>
            <div class="form-group">
              <label>Fecha de Fin *</label>
              <input class="form-control" type="date" formControlName="fechaFin" />
            </div>
          </div>
          @if (form.get('activo')?.value) {
            <p style="margin-top:12px;font-size:13px;color:#D69E2E;background:#FFFFF0;border:1px solid #FAF089;border-radius:6px;padding:8px 12px">
              ⚠️ Activar este periodo desactivará cualquier otro periodo activo.
            </p>
          }
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

<app-confirm-dialog [visible]="confirmVisible()" titulo="Eliminar Periodo"
  [mensaje]="'¿Eliminar el periodo ' + (sel()?.nombre||'') + '?'"
  tipo="danger" (confirmado)="eliminar()" (cancelado)="confirmVisible.set(false)" />
  `
})
export class PeriodosComponent implements OnInit {
  private svc = inject(PeriodosService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  verEliminados = signal(false); modalVisible = signal(false);
  confirmVisible = signal(false); guardando = signal(false);
  editando = false; sel = signal<Periodo|null>(null);
  datos = signal<Periodo[]>([]);

  form = this.fb.group({
    nombre: ['', Validators.required],
    anioAcademico: [new Date().getFullYear(), Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    activo: [false]
  });

  periodoActivo = computed(() => this.datos().find(p => p.activo && p.estado === 'ACTIVO'));
  datosFiltrados = computed(() => {
    const l = this.datos();
    return this.verEliminados() ? l.filter(p => p.estado === 'ELIMINADO') : l.filter(p => p.estado !== 'ELIMINADO');
  });

  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.svc.listar().subscribe(d => this.datos.set(d)); }

  activar(p: Periodo): void {
    this.svc.activar(p.id).subscribe({
      next: () => { this.notif.success(`Periodo "${p.nombre}" activado`); this.cargar(); },
      error: (e: Error) => this.notif.error(e.message)
    });
  }

  abrirModal(p?: Periodo): void {
    this.editando = !!p; this.sel.set(p||null);
    p ? this.form.patchValue(p) : this.form.reset({ anioAcademico: new Date().getFullYear(), activo: false });
    this.modalVisible.set(true);
  }
  cerrarModal(): void { this.modalVisible.set(false); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const d = this.form.value as PeriodoForm;
    (this.editando ? this.svc.editar(this.sel()!.id, d) : this.svc.crear(d)).subscribe({
      next: () => { this.notif.success(this.editando ? 'Periodo actualizado' : 'Periodo creado'); this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (e: Error) => { this.notif.error(e.message); this.guardando.set(false); }
    });
  }

  confirmarEliminar(p: Periodo): void { this.sel.set(p); this.confirmVisible.set(true); }
  eliminar(): void {
    this.svc.eliminar(this.sel()!.id).subscribe({
      next: () => { this.notif.success('Periodo eliminado'); this.confirmVisible.set(false); this.cargar(); },
      error: (e: Error) => this.notif.error(e.message)
    });
  }
  restaurar(p: Periodo): void {
    this.svc.restaurar(p.id).subscribe({ next: () => { this.notif.success('Periodo restaurado'); if (this.verEliminados()) { this.svc.listarEliminados().subscribe(d => this.datos.set(d)); } else { this.cargar(); } }, error: (e: Error) => this.notif.error(e.message) });
  }
  toggleEliminados(): void {
    this.verEliminados.update(v => !v);
    if (this.verEliminados()) {
      this.svc.listarEliminados().subscribe(d => this.datos.set(d));
    } else {
      this.cargar();
    }
  }
}
