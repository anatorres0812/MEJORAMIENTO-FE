
import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators
} from '@angular/forms';

import { Subscription } from 'rxjs';

import { EstudiantesService } from '../services/estudiantes.service';
import {
  Estudiante,
  EstudianteForm
} from '../interfaces/estudiante.interface';

import { GradosService } from '../../grados/services/grados.service';
import {
  Grado,
  Seccion
} from '../../grados/interfaces/grado.interface';

import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { NivelEducativo } from '../../../shared/interfaces';

import {
  documentoValidator,
  placeholderDocumento,
  soloLetrasValidator,
  telefonoValidator
} from '../../../shared/validators/documento.validator';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogComponent
  ],
  template: `
<div class="page-container">

  <div class="page-header">
    <div>
      <h2>👨‍🎓 Estudiantes</h2>
      <p>Gestión de alumnos por nivel educativo</p>
    </div>

    <div class="d-flex gap-2 flex-wrap">
      <button
        type="button"
        class="btn btn-outline btn-sm"
        (click)="toggleEliminados()">
        {{ verEliminados() ? '📋 Ver activos' : '🗑️ Eliminados' }}
      </button>

      @if (!verEliminados()) {
        <button
          type="button"
          class="btn btn-primary"
          (click)="abrirModal()">
          + Nuevo Estudiante
        </button>
      }
    </div>
  </div>

  <!-- FILTROS -->
  <div class="filter-bar">
    <div class="form-group">
      <label for="buscarEstudiante">Buscar</label>
      <input
        id="buscarEstudiante"
        class="form-control"
        [(ngModel)]="filtro.busqueda"
        [ngModelOptions]="{standalone: true}"
        placeholder="Código, DNI, nombre..."
        (input)="aplicarFiltros()" />
    </div>

    <div class="form-group">
      <label for="filtroNivel">Nivel</label>
      <select
        id="filtroNivel"
        class="form-control"
        [(ngModel)]="filtro.nivel"
        [ngModelOptions]="{standalone: true}"
        (change)="aplicarFiltros()">
        <option value="">Todos</option>
        <option value="INICIAL">Inicial</option>
        <option value="PRIMARIA">Primaria</option>
        <option value="SECUNDARIA">Secundaria</option>
      </select>
    </div>

    @if (!verEliminados()) {
      <div class="form-group">
        <label for="filtroEstado">Estado</label>
        <select
          id="filtroEstado"
          class="form-control"
          [(ngModel)]="filtro.estado"
          [ngModelOptions]="{standalone: true}"
          (change)="aplicarFiltros()">
          <option value="">Todos</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>
    }

    <button
      type="button"
      class="btn btn-outline btn-sm"
      style="align-self:flex-end"
      (click)="limpiarFiltros()">
      ✕ Limpiar
    </button>
  </div>

  <!-- TABLA -->
  <div class="card">
    @if (cargando()) {
      <div class="loading-wrap">
        <div class="spinner-md"></div>
        Cargando...
      </div>
    } @else if (datosPaginados().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">👨‍🎓</div>
        <p>
          {{ verEliminados()
            ? 'No hay estudiantes eliminados'
            : 'No se encontraron estudiantes' }}
        </p>

        @if (!verEliminados()) {
          <button
            type="button"
            class="btn btn-primary"
            (click)="abrirModal()">
            + Registrar estudiante
          </button>
        }
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Tipo Doc.</th>
              <th>N.º Documento</th>
              <th>Apellidos y Nombres</th>
              <th>F. Nacimiento</th>
              <th>Género</th>
              <th>Nivel</th>
              <th>Grado / Sección</th>
              <th>Apoderado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            @for (e of datosPaginados(); track e.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">
                  {{ (paginaActual() - 1) * pageSize + i + 1 }}
                </td>

                <td><strong>{{ e.codigo || '—' }}</strong></td>
                <td>{{ e.tipoDocumento }}</td>
                <td>{{ e.numeroDocumento }}</td>

                <td>
                  <strong>{{ e.apellidos }}</strong>, {{ e.nombres }}
                </td>

                <td class="text-sm">{{ e.fechaNacimiento }}</td>

                <td>
                  {{ e.genero === 'M' ? '♂ Masculino' : '♀ Femenino' }}
                </td>

                <td>
                  <span class="badge">
                    {{ e.nivelEducativo || '—' }}
                  </span>
                </td>

                <td class="text-sm">
                  {{ e.gradoNombre || '—' }}
                  {{ e.seccionNombre ? ' / ' + e.seccionNombre : '' }}
                </td>

                <td class="text-sm">
                  {{ e.nombreApoderado }}
                  <br />
                  <span class="text-muted">
                    {{ e.telefonoApoderado }}
                  </span>
                </td>

                <td>
                  <span class="badge">{{ e.estado }}</span>
                </td>

                <td>
                  <div class="acciones">
                    @if (e.estado !== 'ELIMINADO') {
                      <button
                        type="button"
                        class="btn btn-outline btn-sm btn-icon"
                        title="Editar"
                        aria-label="Editar estudiante"
                        (click)="abrirModal(e)">
                        ✏️
                      </button>

                      <button
                        type="button"
                        class="btn btn-danger btn-sm btn-icon"
                        title="Eliminar"
                        aria-label="Eliminar estudiante"
                        (click)="confirmarEliminar(e)">
                        🗑️
                      </button>
                    } @else {
                      <button
                        type="button"
                        class="btn btn-success btn-sm"
                        (click)="restaurar(e)">
                        ↩️ Restaurar
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- PAGINACIÓN -->
      @if (totalPaginas() > 1) {
        <div class="pagination">
          <button
            type="button"
            class="page-btn"
            (click)="irPagina(1)"
            [disabled]="paginaActual() === 1">
            «
          </button>

          <button
            type="button"
            class="page-btn"
            (click)="irPagina(paginaActual() - 1)"
            [disabled]="paginaActual() === 1">
            ‹
          </button>

          @for (p of paginas(); track p) {
            <button
              type="button"
              class="page-btn"
              [class.active]="p === paginaActual()"
              [attr.aria-current]="p === paginaActual() ? 'page' : null"
              (click)="irPagina(p)">
              {{ p }}
            </button>
          }

          <button
            type="button"
            class="page-btn"
            (click)="irPagina(paginaActual() + 1)"
            [disabled]="paginaActual() === totalPaginas()">
            ›
          </button>

          <button
            type="button"
            class="page-btn"
            (click)="irPagina(totalPaginas())"
            [disabled]="paginaActual() === totalPaginas()">
            »
          </button>
        </div>
      }

      <p class="text-muted text-sm mt-4" style="text-align:center">
        {{ datosFiltrados().length }}
        estudiante(s)
      </p>
    }
  </div>
</div>

<!-- MODAL -->
@if (modalVisible()) {
  <div class="modal-overlay" (click)="cerrarModal()">
    <div class="modal" (click)="$event.stopPropagation()">

      <div class="modal-header">
        <h3>
          {{ editando ? '✏️ Editar Estudiante' : '+ Nuevo Estudiante' }}
        </h3>

        <button
          type="button"
          class="btn-close-modal"
          aria-label="Cerrar modal"
          (click)="cerrarModal()">
          ×
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="guardar()">
        <div class="modal-body">

          <!-- PESTAÑAS -->
          <div class="tabs">
            <button
              type="button"
              class="tab-btn"
              [class.active]="tabActiva() === 'personal'"
              (click)="tabActiva.set('personal')">
              📋 Datos Personales
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="tabActiva() === 'academico'"
              (click)="tabActiva.set('academico')">
              🏫 Asignación Académica
            </button>

            <button
              type="button"
              class="tab-btn"
              [class.active]="tabActiva() === 'apoderado'"
              (click)="tabActiva.set('apoderado')">
              👪 Apoderado
            </button>
          </div>

          <!-- DATOS PERSONALES -->
          @if (tabActiva() === 'personal') {
            <div class="form-grid form-grid-2">

              <div class="form-group">
                <label for="codigoEstudiante">Código de Estudiante</label>
                <input
                  id="codigoEstudiante"
                  class="form-control"
                  formControlName="codigoEstudiante"
                  placeholder="Ej: 2024001" />
              </div>

              <div class="form-group">
                <label for="tipoDocumento">Tipo de Documento *</label>
                <select
                  id="tipoDocumento"
                  class="form-control"
                  formControlName="tipoDocumento"
                  (change)="onTipoDocChange()">
                  <option value="DNI">DNI (8 dígitos)</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="CE">Carnet de Extranjería</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div class="form-group">
                <label for="numeroDocumento">N.º Documento *</label>
                <input
                  id="numeroDocumento"
                  class="form-control"
                  formControlName="numeroDocumento"
                  [placeholder]="placeholderDoc()"
                  [maxlength]="tipoDocumento === 'DNI' ? 8 : 15"
                  autocomplete="off" />

                @if (
                  form.get('numeroDocumento')?.errors?.['required']
                  && form.get('numeroDocumento')?.touched
                ) {
                  <span class="form-error">Campo requerido.</span>
                }

                @if (
                  form.get('numeroDocumento')?.errors?.['documento']
                  && form.get('numeroDocumento')?.touched
                ) {
                  <span class="form-error">
                    {{ form.get('numeroDocumento')?.errors?.['documento'] }}
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="nombres">Nombres *</label>
                <input
                  id="nombres"
                  class="form-control"
                  formControlName="nombres"
                  placeholder="Nombres completos"
                  autocomplete="given-name" />

                @if (
                  form.get('nombres')?.invalid
                  && form.get('nombres')?.touched
                ) {
                  <span class="form-error">
                    Ingresa nombres válidos usando letras y espacios.
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="apellidos">Apellidos *</label>
                <input
                  id="apellidos"
                  class="form-control"
                  formControlName="apellidos"
                  placeholder="Apellidos completos"
                  autocomplete="family-name" />

                @if (
                  form.get('apellidos')?.invalid
                  && form.get('apellidos')?.touched
                ) {
                  <span class="form-error">
                    Ingresa apellidos válidos usando letras y espacios.
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="fechaNacimiento">Fecha de Nacimiento *</label>
                <input
                  id="fechaNacimiento"
                  class="form-control"
                  type="date"
                  formControlName="fechaNacimiento"
                  [max]="fechaActual" />

                @if (
                  form.get('fechaNacimiento')?.invalid
                  && form.get('fechaNacimiento')?.touched
                ) {
                  <span class="form-error">
                    Ingresa una fecha de nacimiento válida.
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="genero">Género *</label>
                <select
                  id="genero"
                  class="form-control"
                  formControlName="genero">
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
          }

          <!-- ASIGNACIÓN ACADÉMICA -->
          @if (tabActiva() === 'academico') {
            <div class="form-grid form-grid-2">

              <div class="form-group">
                <label for="nivelEducativo">Nivel Educativo</label>
                <select
                  id="nivelEducativo"
                  class="form-control"
                  formControlName="nivelEducativo">
                  <option value="">Sin asignar</option>
                  <option value="INICIAL">Inicial</option>
                  <option value="PRIMARIA">Primaria</option>
                  <option value="SECUNDARIA">Secundaria</option>
                </select>
              </div>

              <div class="form-group">
                <label for="gradoId">Grado</label>
                <select
                  id="gradoId"
                  class="form-control"
                  formControlName="gradoId">
                  <option [ngValue]="null">Sin asignar</option>

                  @for (g of gradosFiltrados(); track g.id) {
                    <option [ngValue]="g.id">
                      {{ g.nombre }}
                    </option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="seccionId">Sección</label>
                <select
                  id="seccionId"
                  class="form-control"
                  formControlName="seccionId"
                  [disabled]="cargandoSecciones()">
                  <option [ngValue]="null">
                    {{ cargandoSecciones() ? 'Cargando secciones...' : 'Sin asignar' }}
                  </option>

                  @for (s of seccionesFiltradas(); track s.id) {
                    <option [ngValue]="s.id">
                      {{ s.nombre }} ({{ s.turno }})
                    </option>
                  }
                </select>

                @if (
                  gradoSeleccionado()
                  && !cargandoSecciones()
                  && seccionesFiltradas().length === 0
                ) {
                  <small class="form-error">
                    Este grado no tiene secciones. Créalas en el módulo Secciones.
                  </small>
                }
              </div>
            </div>
          }

          <!-- APODERADO -->
          @if (tabActiva() === 'apoderado') {
            <div class="form-grid form-grid-2">

              <div class="form-group" style="grid-column:1/-1">
                <label for="nombreApoderado">Nombre del Apoderado *</label>
                <input
                  id="nombreApoderado"
                  class="form-control"
                  formControlName="nombreApoderado"
                  placeholder="Nombre completo del apoderado" />

                @if (
                  form.get('nombreApoderado')?.invalid
                  && form.get('nombreApoderado')?.touched
                ) {
                  <span class="form-error">
                    Ingresa un nombre válido para el apoderado.
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="telefonoApoderado">
                  Teléfono del Apoderado *
                </label>
                <input
                  id="telefonoApoderado"
                  class="form-control"
                  type="tel"
                  inputmode="numeric"
                  formControlName="telefonoApoderado"
                  placeholder="Ej: 987654321"
                  maxlength="15"
                  autocomplete="tel" />

                @if (
                  form.get('telefonoApoderado')?.invalid
                  && form.get('telefonoApoderado')?.touched
                ) {
                  <span class="form-error">
                    Ingresa un teléfono válido.
                  </span>
                }
              </div>

              <div class="form-group">
                <label for="relacionApoderado">
                  Relación con el Estudiante *
                </label>
                <select
                  id="relacionApoderado"
                  class="form-control"
                  formControlName="relacionApoderado">
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Tutor">Tutor/a</option>
                  <option value="Abuelo">Abuelo/a</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          }
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline"
            [disabled]="guardando()"
            (click)="cerrarModal()">
            Cancelar
          </button>

          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="guardando()">
            {{ guardando()
              ? 'Guardando...'
              : (editando ? 'Actualizar' : 'Guardar') }}
          </button>
        </div>
      </form>
    </div>
  </div>
}

<!-- CONFIRMACIÓN -->
<app-confirm-dialog
  [visible]="confirmVisible()"
  titulo="Eliminar Estudiante"
  [mensaje]="'¿Eliminar al estudiante ' +
    (seleccionado()?.nombres || '') + ' ' +
    (seleccionado()?.apellidos || '') +
    '? Se puede restaurar después.'"
  tipo="danger"
  (confirmado)="eliminar()"
  (cancelado)="confirmVisible.set(false)"
/>
`
})
export class EstudiantesComponent implements OnInit, OnDestroy {

  private svc = inject(EstudiantesService);
  private gradosSvc = inject(GradosService);
  private notif = inject(NotificationService);
  private fb = inject(FormBuilder);

  private subscriptions = new Subscription();

  readonly fechaActual = this.obtenerFechaLocal();

  cargando = signal(false);
  guardando = signal(false);
  cargandoSecciones = signal(false);
  modalVisible = signal(false);
  confirmVisible = signal(false);
  verEliminados = signal(false);

  editando = false;

  seleccionado = signal<Estudiante | null>(null);

  tabActiva = signal<'personal' | 'academico' | 'apoderado'>(
    'personal'
  );

  paginaActual = signal(1);
  pageSize = 10;

  filtro: {
    busqueda: string;
    nivel: NivelEducativo | '';
    estado: string;
  } = {
    busqueda: '',
    nivel: '',
    estado: ''
  };

  datos = signal<Estudiante[]>([]);
  grados = signal<Grado[]>([]);
  secciones = signal<Seccion[]>([]);

  nivelSeleccionado = signal<string>('');
  gradoSeleccionado = signal<number | null>(null);

  form = this.fb.group({
    codigoEstudiante: [''],
    tipoDocumento: ['DNI', Validators.required],

    numeroDocumento: [
      '',
      [
        Validators.required,
        documentoValidator('tipoDocumento')
      ]
    ],

    nombres: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        soloLetrasValidator()
      ]
    ],

    apellidos: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        soloLetrasValidator()
      ]
    ],

    fechaNacimiento: ['', Validators.required],
    genero: ['M', Validators.required],

    nombreApoderado: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        soloLetrasValidator()
      ]
    ],

    telefonoApoderado: [
      '',
      [
        Validators.required,
        telefonoValidator()
      ]
    ],

    relacionApoderado: ['Padre', Validators.required],

    nivelEducativo: ['' as NivelEducativo | ''],
    gradoId: [null as number | null],
    seccionId: [null as number | null]
  });

  placeholderDoc = computed(() =>
    placeholderDocumento(
      this.form.get('tipoDocumento')?.value ?? 'DNI'
    )
  );

  gradosFiltrados = computed(() => {
    const nivel = this.nivelSeleccionado()
      .trim()
      .toUpperCase();

    return this.grados().filter(g => {
      const activo =
        String(g.estado ?? '')
          .trim()
          .toUpperCase() === 'ACTIVO';

      const nivelGrado =
        String(g.nivel ?? '')
          .trim()
          .toUpperCase();

      return activo && (!nivel || nivelGrado === nivel);
    });
  });

  seccionesFiltradas = computed(() => {
    const gradoId = this.gradoSeleccionado();

    if (gradoId === null) {
      return [];
    }

    return this.secciones().filter(s => {
      const mismaId = String(s.gradoId) === String(gradoId);

      const estado =
        String(s.estado ?? 'ACTIVO')
          .trim()
          .toUpperCase();

      return mismaId && estado === 'ACTIVO';
    });
  });

  datosFiltrados = computed(() => {
    let lista = this.verEliminados()
      ? this.datos().filter(e => e.estado === 'ELIMINADO')
      : this.datos().filter(e => e.estado !== 'ELIMINADO');

    const busqueda = this.filtro.busqueda
      .trim()
      .toLowerCase();

    if (busqueda) {
      lista = lista.filter(e =>
        String(e.nombres ?? '').toLowerCase().includes(busqueda) ||
        String(e.apellidos ?? '').toLowerCase().includes(busqueda) ||
        String(e.numeroDocumento ?? '').toLowerCase().includes(busqueda) ||
        String(e.codigo ?? '').toLowerCase().includes(busqueda)
      );
    }

    if (this.filtro.nivel) {
      lista = lista.filter(
        e => e.nivelEducativo === this.filtro.nivel
      );
    }

    if (!this.verEliminados() && this.filtro.estado) {
      lista = lista.filter(
        e => e.estado === this.filtro.estado
      );
    }

    return lista;
  });

  totalPaginas = computed(() =>
    Math.max(
      1,
      Math.ceil(this.datosFiltrados().length / this.pageSize)
    )
  );

  paginas = computed(() =>
    Array.from(
      { length: this.totalPaginas() },
      (_, i) => i + 1
    )
  );

  datosPaginados = computed(() => {
    const inicio =
      (this.paginaActual() - 1) * this.pageSize;

    return this.datosFiltrados().slice(
      inicio,
      inicio + this.pageSize
    );
  });

  get tipoDocumento(): string {
    return this.form.get('tipoDocumento')?.value ?? 'DNI';
  }

  private obtenerFechaLocal(): string {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  ngOnInit(): void {
    this.cargar();
    this.cargarGradosYSecciones();

    const nivelControl = this.form.get('nivelEducativo');
    const gradoControl = this.form.get('gradoId');

    if (nivelControl) {
      this.subscriptions.add(
        nivelControl.valueChanges.subscribe(nivel => {
          this.nivelSeleccionado.set(nivel ?? '');

          this.form.patchValue(
            {
              gradoId: null,
              seccionId: null
            },
            { emitEvent: false }
          );

          this.gradoSeleccionado.set(null);
        })
      );
    }

    if (gradoControl) {
      this.subscriptions.add(
        gradoControl.valueChanges.subscribe(valor => {
          const id =
            valor == null
              ? null
              : Number(valor);

          const gradoId =
            id !== null && Number.isFinite(id) ? id : null;

          this.gradoSeleccionado.set(gradoId);

          this.form.patchValue(
            { seccionId: null },
            { emitEvent: false }
          );

          // Cargar secciones específicas del grado seleccionado.
          // Usar el endpoint /secciones/grado/{id} para obtener
          // exactamente las secciones del grado, en lugar de filtrar
          // client-side sobre todas las secciones cargadas al inicio.
          if (gradoId !== null) {
            this.cargandoSecciones.set(true);
            this.gradosSvc.listarSecciones(gradoId).subscribe({
              next: datos => {
                // Reemplazamos las secciones en el signal con las
                // del grado actual para que seccionesFiltradas funcione.
                // Conservamos las secciones de otros grados que ya
                // estuvieran cargadas (para no perderlas si el usuario
                // cambia de grado y vuelve atrás).
                this.secciones.update(actuales => {
                  const sinEsteGrado = actuales.filter(
                    s => String(s.gradoId) !== String(gradoId)
                  );
                  return [...sinEsteGrado, ...(datos ?? [])];
                });
                this.cargandoSecciones.set(false);
              },
              error: () => { this.cargandoSecciones.set(false); } // catchError en el servicio ya usa fallback
            });
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarGradosYSecciones(): void {
    this.gradosSvc.listarGrados().subscribe({
      next: datos => {
        this.grados.set(datos ?? []);
      },
      error: error => {
        console.error('Error al cargar grados:', error);
        this.notif.error('No se pudieron cargar los grados.');
      }
    });

    this.gradosSvc.listarSecciones().subscribe({
      next: datos => {
        this.secciones.set(datos ?? []);
      },
      error: error => {
        console.error('Error al cargar secciones:', error);
        this.notif.error('No se pudieron cargar las secciones.');
      }
    });
  }

  cargar(): void {
    this.cargando.set(true);

    // Guardamos los IDs que localmente ya están marcados como ELIMINADO
    // por si el backend los devuelve aún como ACTIVO (lag de consistencia).
    const eliminadosLocales = new Set(
      this.datos()
        .filter(e => e.estado === 'ELIMINADO')
        .map(e => e.id)
    );

    const peticion = this.verEliminados()
      ? this.svc.listarEliminados()
      : this.svc.listar();

    peticion.subscribe({
      next: datos => {
        const lista = (datos ?? []).map(e =>
          eliminadosLocales.has(e.id)
            ? { ...e, estado: 'ELIMINADO' as const }
            : e
        );
        this.datos.set(lista);
        this.cargando.set(false);
        this.ajustarPagina();
      },

      error: error => {
        console.error('Error al cargar estudiantes:', error);
        this.cargando.set(false);
        this.notif.error(
          'No se pudieron cargar los estudiantes.'
        );
      }
    });
  }

  aplicarFiltros(): void {
    this.paginaActual.set(1);
    this.ajustarPagina();
  }

  limpiarFiltros(): void {
    this.filtro = {
      busqueda: '',
      nivel: '',
      estado: ''
    };

    this.paginaActual.set(1);
    this.cargar();
  }

  private ajustarPagina(): void {
    if (this.paginaActual() > this.totalPaginas()) {
      this.paginaActual.set(this.totalPaginas());
    }
  }

  onTipoDocChange(): void {
    this.form.get('numeroDocumento')?.updateValueAndValidity();
    this.form.get('numeroDocumento')?.markAsUntouched();
  }

  abrirModal(e?: Estudiante): void {
    this.editando = !!e;
    this.seleccionado.set(e ?? null);
    this.tabActiva.set('personal');

    if (e) {
      this.form.reset({
        codigoEstudiante: e.codigo ?? '',
        tipoDocumento: e.tipoDocumento,
        numeroDocumento: e.numeroDocumento,
        nombres: e.nombres,
        apellidos: e.apellidos,
        fechaNacimiento: e.fechaNacimiento,
        genero: e.genero,
        nombreApoderado: e.nombreApoderado,
        telefonoApoderado: e.telefonoApoderado,
        relacionApoderado: e.relacionApoderado,
        nivelEducativo: e.nivelEducativo ?? '',
        gradoId: e.gradoId == null ? null : Number(e.gradoId),
        seccionId: e.seccionId == null ? null : Number(e.seccionId)
      });
    } else {
      this.form.reset({
        codigoEstudiante: '',
        tipoDocumento: 'DNI',
        numeroDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        genero: 'M',
        nombreApoderado: '',
        telefonoApoderado: '',
        relacionApoderado: 'Padre',
        nivelEducativo: '',
        gradoId: null,
        seccionId: null
      });
    }

    this.nivelSeleccionado.set(
      this.form.get('nivelEducativo')?.value ?? ''
    );

    const valorGrado = this.form.get('gradoId')?.value;

    const idGrado =
      valorGrado == null
        ? null
        : Number(valorGrado);

    this.gradoSeleccionado.set(
      idGrado !== null && Number.isFinite(idGrado)
        ? idGrado
        : null
    );

    // Si los datos de grados o secciones no se cargaron aún, reintentamos.
    if (this.grados().length === 0 || this.secciones().length === 0) {
      this.cargarGradosYSecciones();
    }

    this.modalVisible.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }

    this.modalVisible.set(false);
  }

  guardar(): void {
    if (this.guardando()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      const controles = [
        'numeroDocumento',
        'nombres',
        'apellidos',
        'fechaNacimiento',
        'nombreApoderado',
        'telefonoApoderado'
      ];

      const primerInvalido = controles.find(
        nombre => this.form.get(nombre)?.invalid
      );

      if (primerInvalido) {
        const perteneceApoderado = [
          'nombreApoderado',
          'telefonoApoderado'
        ].includes(primerInvalido);

        this.tabActiva.set(
          perteneceApoderado ? 'apoderado' : 'personal'
        );
      }

      this.notif.error(
        'Revisa los campos obligatorios antes de guardar.'
      );

      return;
    }

    this.guardando.set(true);

    const v = this.form.getRawValue();

    const gradoId =
      v.gradoId === null ? null : Number(v.gradoId);

    const seccionId =
      v.seccionId === null ? null : Number(v.seccionId);

    const d: EstudianteForm = {
      codigoEstudiante: v.codigoEstudiante || undefined,
      tipoDocumento: v.tipoDocumento! as any,
      numeroDocumento: v.numeroDocumento!.trim(),
      nombres: v.nombres!.trim(),
      apellidos: v.apellidos!.trim(),
      fechaNacimiento: v.fechaNacimiento!,
      genero: v.genero as 'M' | 'F',
      nombreApoderado: v.nombreApoderado!.trim(),
      telefonoApoderado: v.telefonoApoderado!.trim(),
      relacionApoderado: v.relacionApoderado!,
      nivelEducativo:
        (v.nivelEducativo as NivelEducativo) || undefined,
      gradoId,
      seccionId
    };

    const estudianteActual = this.seleccionado();

    const operacion = this.editando && estudianteActual
      ? this.svc.editar(estudianteActual.id, d)
      : this.svc.crear(d);

    operacion.subscribe({
      next: () => {
        this.notif.success(
          this.editando
            ? 'Estudiante actualizado correctamente.'
            : 'Estudiante registrado correctamente.'
        );

        this.guardando.set(false);
        this.modalVisible.set(false);
        this.cargar();
      },

      error: (err: Error) => {
        console.error('Error al guardar estudiante:', err);

        this.notif.error(
          err?.message || 'No se pudo guardar el estudiante.'
        );

        this.guardando.set(false);
      }
    });
  }

  confirmarEliminar(e: Estudiante): void {
    this.seleccionado.set(e);
    this.confirmVisible.set(true);
  }

  eliminar(): void {
    const estudiante = this.seleccionado();

    if (!estudiante) {
      return;
    }

    this.svc.eliminar(estudiante.id).subscribe({
      next: (respuesta) => {
        this.notif.success('Estudiante eliminado correctamente.');
        this.confirmVisible.set(false);

        // Si el backend devuelve el estudiante con estado ELIMINADO → soft delete
        // confirmado: actualizamos localmente sin recargar.
        if (respuesta && typeof respuesta === 'object' && 'estado' in respuesta) {
          const est = respuesta as { estado: string };
          if (est.estado === 'ELIMINADO') {
            this.datos.update(list =>
              list.map(e =>
                e.id === estudiante.id
                  ? { ...e, estado: 'ELIMINADO' as const }
                  : e
              )
            );
            return;
          }
        }

        // Si el backend devuelve ACTIVO, void o cualquier otro estado,
        // aplicamos el soft-delete localmente para que la UI sea consistente
        // y después recargamos para sincronizar con lo que realmente guardó el backend.
        this.datos.update(list =>
          list.map(e =>
            e.id === estudiante.id
              ? { ...e, estado: 'ELIMINADO' as const }
              : e
          )
        );
        this.cargar();
      },

      error: (err: Error) => {
        console.error('Error al eliminar estudiante:', err);

        this.notif.error(
          err?.message || 'No se pudo eliminar el estudiante.'
        );

        this.confirmVisible.set(false);
      }
    });
  }

  restaurar(e: Estudiante): void {
    this.svc.restaurar(e.id).subscribe({
      next: () => {
        this.notif.success('Estudiante restaurado correctamente.');
        this.cargar();
      },

      error: (err: Error) => {
        console.error('Error al restaurar estudiante:', err);

        this.notif.error(
          err?.message || 'No se pudo restaurar el estudiante.'
        );
      }
    });
  }

  irPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  toggleEliminados(): void {
    this.verEliminados.update(valor => !valor);

    this.paginaActual.set(1);
    this.filtro.estado = '';
    this.filtro.busqueda = '';
    this.filtro.nivel = '';

    this.cargar();
  }
}
