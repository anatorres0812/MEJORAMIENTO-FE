import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProfesoresService } from '../services/profesores.service';
import { Profesor, ProfesorForm } from '../interfaces/profesor.interface';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { documentoValidator, placeholderDocumento, soloLetrasValidator, telefonoValidator, emailValidator } from '../../../shared/validators/documento.validator';

@Component({
  selector: 'app-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <!-- Header -->
  <div class="page-header">
    <div>
      <h2>👨‍🏫 Profesores</h2>
      <p>Gestión del personal docente</p>
    </div>
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-outline btn-sm" (click)="toggleEliminados()">
        {{ verEliminados() ? '📋 Ver activos' : '🗑️ Eliminados' }}
      </button>
      <button class="btn btn-primary" (click)="abrirModal()">+ Nuevo Profesor</button>
    </div>
  </div>

  <!-- Filtros -->
  <div class="filter-bar">
    <div class="form-group">
      <label>Buscar</label>
      <input class="form-control" [(ngModel)]="filtro.busqueda" placeholder="DNI, nombre o apellido..." (input)="aplicarFiltros()" />
    </div>
    <div class="form-group">
      <label>Especialidad</label>
      <input class="form-control" [(ngModel)]="filtro.especialidad" placeholder="Especialidad..." (input)="aplicarFiltros()" />
    </div>
    <div class="form-group" *ngIf="!verEliminados()">
      <label>Estado</label>
      <select class="form-control" [(ngModel)]="filtro.estado" (change)="aplicarFiltros()">
        <option value="">Todos</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>
    <button class="btn btn-outline btn-sm" (click)="limpiarFiltros()">✕ Limpiar</button>
  </div>

  <!-- Tabla -->
  <div class="card">
    @if (cargando()) {
      <div class="loading-wrap"><div class="spinner-md"></div> Cargando...</div>
    } @else if (datosFiltrados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">👨‍🏫</div>
        <p>{{ verEliminados() ? 'No hay profesores eliminados' : 'No se encontraron profesores' }}</p>
        <button class="btn btn-primary" (click)="abrirModal()" *ngIf="!verEliminados()">+ Registrar primer profesor</button>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Documento</th>
              <th>Nombres y Apellidos</th>
              <th>Nivel</th>
              <th>Especialidad</th>
              <th>Teléfono</th>
              <th>Correo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of datosPaginados(); track p.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ (paginaActual()-1)*pageSize + i + 1 }}</td>
                <td><span class="text-sm text-muted">{{ p.tipoDocumento }}</span><br><strong>{{ p.numeroDocumento }}</strong></td>
                <td><strong>{{ p.apellidos }}</strong>, {{ p.nombres }}</td>
                <td><span class="badge badge-{{ p.nivel?.toLowerCase() || 'inactivo' }}">{{ p.nivel || '—' }}</span></td>
                <td>{{ p.especialidad }}</td>
                <td>{{ p.telefono }}</td>
                <td class="text-sm">{{ p.correo }}</td>
                <td><span class="badge badge-{{ p.estado.toLowerCase() }}">{{ p.estado }}</span></td>
                <td>
                  <div class="acciones">
                    @if (p.estado !== 'ELIMINADO') {
                      <button class="btn btn-outline btn-sm btn-icon" title="Editar" (click)="abrirModal(p)">✏️</button>
                      <button class="btn btn-danger btn-sm btn-icon" title="Eliminar" (click)="confirmarEliminar(p)">🗑️</button>
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
      <!-- Paginación -->
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
      <p class="text-muted text-sm mt-4" style="text-align:center">{{ datosFiltrados().length }} registro(s)</p>
    }
  </div>
</div>

<!-- Modal Formulario -->
@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">
      <div class="modal-header">
        <h3>{{ editando ? '✏️ Editar Profesor' : '+ Nuevo Profesor' }}</h3>
        <button class="btn-close-modal" (click)="cerrarModal()">×</button>
      </div>
      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">
          <div class="form-grid form-grid-2">
            <div class="form-group">
              <label>Tipo de Documento *</label>
              <select class="form-control" formControlName="tipoDocumento" (change)="onTipoDocChange()">
                <option value="DNI">DNI (8 dígitos)</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="CE">Carnet de Extranjería</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Nº Documento *</label>
              <input class="form-control" formControlName="numeroDocumento"
                [placeholder]="placeholderDocProf()"
                [maxlength]="tipoDocProf==='DNI' ? 8 : 15" />
              @if (form.get('numeroDocumento')?.errors?.['required'] && form.get('numeroDocumento')?.touched) {
                <span class="form-error">Requerido</span>
              }
              @if (form.get('numeroDocumento')?.errors?.['documento'] && form.get('numeroDocumento')?.touched) {
                <span class="form-error">{{ form.get('numeroDocumento')?.errors?.['documento'] }}</span>
              }
            </div>
            <div class="form-group">
              <label>Nombres *</label>
              <input class="form-control" formControlName="nombres" placeholder="Nombres" />
              @if (form.get('nombres')?.errors?.['required'] && form.get('nombres')?.touched) {
                <span class="form-error">Requerido</span>
              }
              @if (form.get('nombres')?.errors?.['soloLetras'] && form.get('nombres')?.touched) {
                <span class="form-error">Solo letras y espacios</span>
              }
            </div>
            <div class="form-group">
              <label>Apellidos *</label>
              <input class="form-control" formControlName="apellidos" placeholder="Apellidos" />
              @if (form.get('apellidos')?.errors?.['required'] && form.get('apellidos')?.touched) {
                <span class="form-error">Requerido</span>
              }
              @if (form.get('apellidos')?.errors?.['soloLetras'] && form.get('apellidos')?.touched) {
                <span class="form-error">Solo letras y espacios</span>
              }
            </div>
            <div class="form-group">
              <label>Especialidad *</label>
              <input class="form-control" formControlName="especialidad" placeholder="Ej: Matemáticas" />
              @if (form.get('especialidad')?.invalid && form.get('especialidad')?.touched) {
                <span class="form-error">Requerido</span>
              }
            </div>
            <div class="form-group">
              <label>Nivel Educativo</label>
              <select class="form-control" formControlName="nivel">
                <option value="">Sin asignar</option>
                <option value="INICIAL">Inicial</option>
                <option value="PRIMARIA">Primaria</option>
                <option value="SECUNDARIA">Secundaria</option>
              </select>
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input class="form-control" formControlName="telefono" placeholder="Ej: 987654321" />
              @if (form.get('telefono')?.errors?.['telefono'] && form.get('telefono')?.touched) {
                <span class="form-error">{{ form.get('telefono')?.errors?.['telefono'] }}</span>
              }
            </div>
            <div class="form-group">
              <label>Correo electrónico *</label>
              <input class="form-control" formControlName="correo" type="email" placeholder="correo@ejemplo.com" />
              @if (form.get('correo')?.errors?.['required'] && form.get('correo')?.touched) {
                <span class="form-error">Requerido</span>
              }
              @if (form.get('correo')?.errors?.['email'] && form.get('correo')?.touched) {
                <span class="form-error">{{ form.get('correo')?.errors?.['email'] }}</span>
              }
            </div>
            <div class="form-group">
              <label>Fecha de Contratación</label>
              <input class="form-control" formControlName="fechaContratacion" type="date" />
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

<!-- Confirm Dialog -->
<app-confirm-dialog
  [visible]="confirmVisible()"
  titulo="Eliminar Profesor"
  [mensaje]="'¿Eliminar a ' + (seleccionado()?.nombres || '') + ' ' + (seleccionado()?.apellidos || '') + '? Se puede restaurar después.'"
  tipo="danger"
  (confirmado)="eliminar()"
  (cancelado)="confirmVisible.set(false)" />
  `
})
export class ProfesoresComponent implements OnInit {
  private svc = inject(ProfesoresService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  cargando = signal(false);
  guardando = signal(false);
  modalVisible = signal(false);
  confirmVisible = signal(false);
  verEliminados = signal(false);
  editando = false;
  seleccionado = signal<Profesor | null>(null);
  paginaActual = signal(1);
  pageSize = 10;

  filtro = { busqueda: '', especialidad: '', estado: '' };
  datos = signal<Profesor[]>([]);

  form = this.fb.group({
    tipoDocumento: ['DNI', Validators.required],
    numeroDocumento: ['', [Validators.required, documentoValidator('tipoDocumento')]],
    nombres: ['', [Validators.required, Validators.minLength(2), soloLetrasValidator()]],
    apellidos: ['', [Validators.required, Validators.minLength(2), soloLetrasValidator()]],
    especialidad: ['', Validators.required],
    nivel: ['' as any],
    telefono: ['', [telefonoValidator()]],
    correo: ['', [Validators.required, emailValidator()]],
    fechaContratacion: ['']
  });

  get tipoDocProf(): string { return this.form.get('tipoDocumento')?.value ?? 'DNI'; }
  placeholderDocProf = computed(() => placeholderDocumento(this.tipoDocProf));

  onTipoDocChange(): void {
    this.form.get('numeroDocumento')?.updateValueAndValidity();
    this.form.get('numeroDocumento')?.markAsUntouched();
  }

  datosFiltrados = computed(() => {
    const lista = this.datos();
    return this.verEliminados()
      ? lista.filter(p => p.estado === 'ELIMINADO')
      : lista.filter(p => p.estado !== 'ELIMINADO');
  });

  totalEliminados = computed(() => this.datos().filter(p => p.estado === 'ELIMINADO').length);
  totalPaginas = computed(() => Math.max(1, Math.ceil(this.datosFiltrados().length / this.pageSize)));
  paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  datosPaginados = computed(() => {
    const start = (this.paginaActual() - 1) * this.pageSize;
    return this.datosFiltrados().slice(start, start + this.pageSize);
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.svc.listar().subscribe({ next: d => { this.datos.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  aplicarFiltros(): void {
    this.paginaActual.set(1);
    this.cargando.set(true);
    this.svc.listar({ busqueda: this.filtro.busqueda, especialidad: this.filtro.especialidad, estado: this.filtro.estado || undefined })
      .subscribe({ next: d => { this.datos.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
  }

  limpiarFiltros(): void {
    this.filtro = { busqueda: '', especialidad: '', estado: '' };
    this.aplicarFiltros();
  }

  abrirModal(prof?: Profesor): void {
    this.editando = !!prof;
    this.seleccionado.set(prof || null);
    if (prof) {
      this.form.patchValue(prof);
    } else {
      this.form.reset({ tipoDocumento: 'DNI' });
    }
    this.modalVisible.set(true);
  }

  cerrarModal(): void { this.modalVisible.set(false); }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const data = this.form.value as ProfesorForm;
    const obs = this.editando
      ? this.svc.editar(this.seleccionado()!.id, data)
      : this.svc.crear(data);
    obs.subscribe({
      next: () => {
        this.notif.success(this.editando ? 'Profesor actualizado correctamente' : 'Profesor registrado correctamente');
        this.guardando.set(false);
        this.cerrarModal();
        this.cargar();
      },
      error: (e: any) => { const msg = e?.error?.error || e?.error?.message || e?.message || 'Error'; this.notif.error(msg); this.guardando.set(false); }
    });
  }

  confirmarEliminar(p: Profesor): void { this.seleccionado.set(p); this.confirmVisible.set(true); }

  eliminar(): void {
    if (!this.seleccionado()) return;
    this.svc.eliminar(this.seleccionado()!.id).subscribe({
      next: () => { this.notif.success('Profesor eliminado'); this.confirmVisible.set(false); this.cargar(); },
      error: (e: any) => { const msg = e?.error?.error || e?.error?.message || e?.message || 'Error'; this.notif.error(msg); this.confirmVisible.set(false); }
    });
  }

  restaurar(p: Profesor): void {
    this.svc.restaurar(p.id).subscribe({
      next: () => {
        this.notif.success('Profesor restaurado');
        if (this.verEliminados()) {
          this.svc.listarEliminados().subscribe(d => this.datos.set(d));
        } else {
          this.cargar();
        }
      },
      error: (e: Error) => this.notif.error(e.message)
    });
  }

  irPagina(p: number): void { if (p >= 1 && p <= this.totalPaginas()) this.paginaActual.set(p); }
  toggleEliminados(): void {
    this.verEliminados.update(v => !v);
    this.paginaActual.set(1);
    if (this.verEliminados()) {
      this.filtro.estado = '';
      this.cargando.set(true);
      this.svc.listarEliminados().subscribe({ next: d => { this.datos.set(d); this.cargando.set(false); }, error: () => this.cargando.set(false) });
    } else {
      this.cargar();
    }
  }
}
