import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsistenciasService } from '../services/asistencias.service';
import { MatriculasService } from '../../matriculas/services/matriculas.service';
import { GradosService } from '../../grados/services/grados.service';
import { CursosService } from '../../cursos/services/cursos.service';
import { PeriodosService } from '../../periodos/services/periodos.service';
import { ExportService } from '../../../core/services/export.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog.component';
import { Asistencia, AsistenciaForm, EstadoAsistencia } from '../interfaces/asistencia.interface';
import { Matricula } from '../../matriculas/interfaces/matricula.interface';
import { Grado, Seccion } from '../../grados/interfaces/grado.interface';
import { Curso } from '../../cursos/interfaces/curso.interface';
import { Periodo } from '../../periodos/interfaces/periodo.interface';
import { NivelEducativo } from '../../../shared/interfaces';

interface FilaAsistencia {
  matriculaId: number;
  estudianteId: number;
  nombre: string;
  codigo: string;
  estado: EstadoAsistencia;
  asistenciaId?: number;
  observacion?: string;
}

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  template: `
<div class="page-container">
  <div class="page-header">
    <div><h2>✅ Asistencias</h2><p>Registro diario de asistencia por sección y curso</p></div>
  </div>

  <!-- Filtros -->
  <div class="card" style="margin-bottom:16px">
    <h4 style="margin-bottom:14px;color:#1E3A5F">🔍 Seleccionar contexto</h4>
    <div class="form-grid form-grid-3" style="gap:12px">
      <div class="form-group">
        <label>Nivel *</label>
        <select class="form-control" [(ngModel)]="sel.nivel" (change)="onNivelChange()">
          <option value="">— Seleccionar —</option>
          <option value="INICIAL">Inicial</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grado *</label>
        <select class="form-control" [(ngModel)]="sel.gradoId" (change)="onGradoChange()" [disabled]="!sel.nivel">
          <option value="">— Seleccionar —</option>
          @for (g of gradosFiltrados(); track g.id) { <option [value]="g.id">{{ g.nombre }}</option> }
        </select>
      </div>
      <div class="form-group">
        <label>Sección *</label>
        <select class="form-control" [(ngModel)]="sel.seccionId" [disabled]="!sel.gradoId">
          <option value="">— Seleccionar —</option>
          @for (s of seccionesFiltradas(); track s.id) { <option [value]="s.id">{{ s.nombre }} ({{ s.turno }})</option> }
        </select>
      </div>
      <div class="form-group">
        <label>Curso (opcional)</label>
        <select class="form-control" [(ngModel)]="sel.cursoId" [disabled]="!sel.nivel">
          <option value="">Todos los cursos</option>
          @for (c of cursosFiltrados(); track c.id) { <option [value]="c.id">{{ c.nombre }}</option> }
        </select>
      </div>
      <div class="form-group">
        <label>Periodo *</label>
        <select class="form-control" [(ngModel)]="sel.periodoId" [disabled]="!sel.nivel">
          <option value="">— Seleccionar —</option>
          @for (p of periodos(); track p.id) { <option [value]="p.id">{{ p.nombre }} {{ p.anioAcademico }}{{ p.activo ? ' ✅' : '' }}</option> }
        </select>
      </div>
      <div class="form-group">
        <label>Fecha *</label>
        <input class="form-control" type="date" [(ngModel)]="sel.fecha" />
      </div>
      <div class="form-group" style="align-self:flex-end">
        <button class="btn btn-primary w-full" (click)="cargarTabla()" [disabled]="!puedeCargar()">
          Cargar Lista
        </button>
      </div>
    </div>
  </div>

  @if (tablaVisible()) {
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px">
        <div>
          <h4 style="margin:0;color:#1E3A5F">{{ encabezado() }}</h4>
          <p class="text-muted text-sm">{{ filas().length }} estudiante(s) · {{ sel.fecha }}</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-success btn-sm" (click)="guardarTodos()" [disabled]="guardando()">
            💾 {{ guardando() ? 'Guardando...' : 'Guardar Asistencia' }}
          </button>
          <button class="btn btn-outline btn-sm" (click)="marcarTodos('PRESENTE')">✅ Todos Presentes</button>
          <button class="btn btn-outline btn-sm" (click)="exportarExcel()">📊 Excel</button>
          <button class="btn btn-outline btn-sm" (click)="exportarCSV()">📄 CSV</button>
          <button class="btn btn-outline btn-sm" (click)="imprimir()">🖨️ Imprimir</button>
        </div>
      </div>

      <!-- Resumen rápido -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
        @for (item of resumen(); track item.valor) {
          <div [style]="'padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600;background:' + item.bg + ';color:' + item.color">
            {{ item.icono }} {{ item.valor }}: {{ item.cantidad }}
          </div>
        }
      </div>

      @if (cargando()) {
        <div class="loading-wrap"><div class="spinner-md"></div></div>
      } @else if (filas().length === 0) {
        <div class="empty-state"><div class="empty-icon">📋</div><p>No hay estudiantes matriculados en esta sección</p></div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>#</th><th>Código</th><th>Apellidos y Nombres</th><th>Estado de Asistencia</th><th>Observación</th></tr>
            </thead>
            <tbody>
              @for (fila of filas(); track fila.estudianteId; let i = $index) {
                <tr [style.background]="colorFila(fila.estado)">
                  <td class="text-muted text-sm">{{ i+1 }}</td>
                  <td><code style="font-size:12px">{{ fila.codigo }}</code></td>
                  <td><strong>{{ fila.nombre }}</strong></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                      @for (est of estadosAsistencia; track est.valor) {
                        <button class="btn btn-sm"
                          [style]="'border:2px solid '+(fila.estado===est.valor ? est.color : '#e2e8f0')+';background:'+(fila.estado===est.valor ? est.bg : 'white')+';color:'+(fila.estado===est.valor ? est.color : '#718096')"
                          (click)="fila.estado = est.valor">
                          {{ est.icono }} {{ est.label }}
                        </button>
                      }
                    </div>
                  </td>
                  <td>
                    <input class="form-control" style="font-size:13px;padding:5px 8px" [(ngModel)]="fila.observacion" placeholder="Observación..." />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    <!-- Historial -->
    <div class="card" style="margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h4 style="margin:0;color:#1E3A5F">📚 Historial de Asistencias</h4>
        <button class="btn btn-outline btn-sm" (click)="toggleEliminadas()">{{ verEliminadas() ? 'Ver activas' : '🗑️ Eliminadas' }}</button>
      </div>
      @if (asistenciasFiltradas().length === 0) {
        <p class="text-muted text-sm">No hay registros para esta selección.</p>
      } @else {
        <div class="table-wrap">
          <table class="table" style="font-size:13px">
            <thead><tr><th>Estudiante</th><th>Fecha</th><th>Estado</th><th>Observación</th><th>Acciones</th></tr></thead>
            <tbody>
              @for (a of asistenciasFiltradas(); track a.id) {
                <tr>
                  <td>{{ a.estudianteNombre }}<br><span class="text-muted text-sm">{{ a.estudianteCodigo }}</span></td>
                  <td>{{ a.fecha }}</td>
                  <td><span [style]="'padding:3px 10px;border-radius:12px;font-size:12px;font-weight:600;background:'+getBgEstado(a.estadoAsistencia)+';color:'+getColorEstado(a.estadoAsistencia)">{{ a.estadoAsistencia }}</span></td>
                  <td class="text-sm text-muted">{{ a.observacion || '—' }}</td>
                  <td>
                    <div class="acciones">
                      @if (a.estado !== 'ELIMINADO') {
                        <button class="btn btn-danger btn-sm btn-icon" (click)="confirmarEliminar(a)">🗑️</button>
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
      }
    </div>
  }

  @if (!tablaVisible()) {
    <div class="empty-state" style="padding:60px 20px">
      <div class="empty-icon">✅</div>
      <p>Selecciona los filtros y carga la lista de estudiantes para registrar asistencia</p>
    </div>
  }
</div>

<app-confirm-dialog [visible]="confirmVisible()" titulo="Eliminar Registro"
  mensaje="¿Eliminar este registro de asistencia?" tipo="danger"
  (confirmado)="eliminar()" (cancelado)="confirmVisible.set(false)" />
  `
})
export class AsistenciasComponent implements OnInit {
  private svc = inject(AsistenciasService);
  private matriculasSvc = inject(MatriculasService);
  private gradosSvc = inject(GradosService);
  private cursosSvc = inject(CursosService);
  private periodosSvc = inject(PeriodosService);
  private exportSvc = inject(ExportService);
  private notif = inject(NotificationService);

  cargando = signal(false); guardando = signal(false);
  tablaVisible = signal(false); confirmVisible = signal(false);
  verEliminadas = signal(false); seleccionada = signal<Asistencia|null>(null);

  sel: { nivel: NivelEducativo|''; gradoId: number|''; seccionId: number|''; cursoId: number|''; periodoId: number|''; fecha: string } =
    { nivel: '', gradoId: '', seccionId: '', cursoId: '', periodoId: '', fecha: new Date().toISOString().split('T')[0] };

  grados = signal<Grado[]>([]); secciones = signal<Seccion[]>([]);
  cursos = signal<Curso[]>([]); periodos = signal<Periodo[]>([]);
  matriculas = signal<Matricula[]>([]); asistencias = signal<Asistencia[]>([]);
  filas = signal<FilaAsistencia[]>([]);

  estadosAsistencia: { valor: EstadoAsistencia; label: string; icono: string; color: string; bg: string }[] = [
    { valor: 'PRESENTE', label: 'Presente', icono: '✅', color: '#276749', bg: '#C6F6D5' },
    { valor: 'AUSENTE', label: 'Ausente', icono: '❌', color: '#742a2a', bg: '#FED7D7' },
    { valor: 'TARDANZA', label: 'Tardanza', icono: '⏰', color: '#744210', bg: '#FEFCBF' },
    { valor: 'JUSTIFICADO', label: 'Justificado', icono: '📋', color: '#2a4365', bg: '#BEE3F8' },
  ];

  gradosFiltrados = computed(() => this.grados().filter(g => g.nivel === this.sel.nivel && g.estado === 'ACTIVO'));
  seccionesFiltradas = computed(() => this.secciones().filter(s => s.gradoId === Number(this.sel.gradoId) && s.estado === 'ACTIVO'));
  cursosFiltrados = computed(() => this.cursos().filter(c => c.nivel === this.sel.nivel && c.estado === 'ACTIVO'));
  puedeCargar = computed(() => !!this.sel.nivel && !!this.sel.gradoId && !!this.sel.seccionId && !!this.sel.periodoId && !!this.sel.fecha);

  encabezado = computed(() => {
    const g = this.grados().find(g => g.id === Number(this.sel.gradoId));
    const s = this.secciones().find(s => s.id === Number(this.sel.seccionId));
    return `${this.sel.nivel} · ${g?.nombre||''} · Sección ${s?.nombre||''} · ${this.sel.fecha}`;
  });

  resumen = computed(() => {
    const estados = this.filas().map(f => f.estado);
    return this.estadosAsistencia.map(e => ({ ...e, cantidad: estados.filter(x => x === e.valor).length }));
  });

  asistenciasFiltradas = computed(() => {
    const l = this.asistencias();
    return this.verEliminadas() ? l.filter(a => a.estado === 'ELIMINADO') : l.filter(a => a.estado !== 'ELIMINADO');
  });

  ngOnInit(): void {
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));
    this.gradosSvc.listarSecciones().subscribe(d => this.secciones.set(d));
    this.cursosSvc.listar().subscribe(d => this.cursos.set(d));
    this.periodosSvc.listar().subscribe(d => this.periodos.set(d));
  }

  onNivelChange(): void { this.sel.gradoId = ''; this.sel.seccionId = ''; this.tablaVisible.set(false); }
  onGradoChange(): void { this.sel.seccionId = ''; this.tablaVisible.set(false); }

  cargarTabla(): void {
    if (!this.puedeCargar()) return;
    this.cargando.set(true);
    this.matriculasSvc.listar({ periodoId: Number(this.sel.periodoId) })
      .subscribe(mats => {
        this.matriculas.set(mats.filter(m => m.estado === 'MATRICULADO'));
        this.svc.listar({ nivelEducativo: this.sel.nivel as NivelEducativo, gradoId: Number(this.sel.gradoId), seccionId: Number(this.sel.seccionId), cursoId: this.sel.cursoId ? Number(this.sel.cursoId) : undefined, periodoId: Number(this.sel.periodoId), fecha: this.sel.fecha })
          .subscribe(asist => {
            this.asistencias.set(asist);
            const filas: FilaAsistencia[] = mats.filter(m => m.estado === 'MATRICULADO').map(m => {
              const reg = asist.find(a => a.estudianteId === m.estudianteId && a.fecha === this.sel.fecha && a.estado !== 'ELIMINADO');
              return { matriculaId: m.id, estudianteId: m.estudianteId, nombre: (m.estudianteNombres||'') + ' ' + (m.estudianteApellidos||''), codigo: m.estudianteCodigo||'', estado: reg?.estadoAsistencia || 'PRESENTE', asistenciaId: reg?.id, observacion: reg?.observacion || '' };
            });
            this.filas.set(filas);
            this.tablaVisible.set(true);
            this.cargando.set(false);
          });
      });
  }

  marcarTodos(estado: EstadoAsistencia): void { this.filas.update(f => f.map(x => ({ ...x, estado }))); }

  guardarTodos(): void {
    this.guardando.set(true);
    let pendientes = this.filas().length; let completados = 0;
    if (pendientes === 0) { this.guardando.set(false); return; }
    this.filas().forEach(fila => {
      const form: AsistenciaForm = {
        estudianteId: fila.estudianteId, matriculaId: fila.matriculaId,
        nivelEducativo: this.sel.nivel as NivelEducativo, gradoId: Number(this.sel.gradoId),
        seccionId: Number(this.sel.seccionId), cursoId: this.sel.cursoId ? Number(this.sel.cursoId) : undefined,
        periodoId: Number(this.sel.periodoId), fecha: this.sel.fecha,
        estadoAsistencia: fila.estado, observacion: fila.observacion
      };
      if (fila.asistenciaId) {
        this.svc.editar(fila.asistenciaId, { estadoAsistencia: fila.estado, observacion: fila.observacion })
          .subscribe({ next: () => { completados++; if (completados === pendientes) this.finGuardar(); } });
      } else {
        this.svc.crear(form).subscribe({
          next: (a) => { fila.asistenciaId = a.id; completados++; if (completados === pendientes) this.finGuardar(); },
          error: () => { completados++; if (completados === pendientes) this.finGuardar(); }
        });
      }
    });
  }

  finGuardar(): void {
    this.notif.success('Asistencia guardada correctamente');
    this.guardando.set(false);
    this.svc.listar({ nivelEducativo: this.sel.nivel as NivelEducativo, seccionId: Number(this.sel.seccionId), fecha: this.sel.fecha }).subscribe(d => this.asistencias.set(d));
  }

  async exportarExcel(): Promise<void> {
    const columns = [
      { key: 'codigo', header: 'Código', width: 12 },
      { key: 'nombre', header: 'Apellidos y Nombres', width: 30 },
      { key: 'estado', header: 'Asistencia', width: 14 },
      { key: 'observacion', header: 'Observación', width: 25 }
    ];
    const data = this.filas().map(f => ({ codigo: f.codigo, nombre: f.nombre, estado: f.estado, observacion: f.observacion||'' }));
    await this.exportSvc.exportarExcel(`asistencia_${this.sel.fecha}`, 'Asistencia', columns, data);
    this.notif.success('Excel generado');
  }

  exportarCSV(): void {
    const columns = [
      { key: 'codigo', header: 'Código' }, { key: 'nombre', header: 'Apellidos y Nombres' },
      { key: 'estado', header: 'Asistencia' }, { key: 'observacion', header: 'Observación' }
    ];
    const data = this.filas().map(f => ({ codigo: f.codigo, nombre: f.nombre, estado: f.estado, observacion: f.observacion||'' }));
    this.exportSvc.exportarCSV(`asistencia_${this.sel.fecha}`, columns, data);
    this.notif.success('CSV generado');
  }

  imprimir(): void {
    const filas = this.filas().map((f, i) => `<tr><td>${i+1}</td><td>${f.codigo}</td><td>${f.nombre}</td><td>${f.estado}</td><td>${f.observacion||''}</td></tr>`).join('');
    const html = `<div class="info"><span>Fecha:</span> ${this.sel.fecha} &nbsp; <span>Sección:</span> ${this.encabezado()}</div>
      <table><thead><tr><th>#</th><th>Código</th><th>Apellidos y Nombres</th><th>Asistencia</th><th>Observación</th></tr></thead><tbody>${filas}</tbody></table>`;
    this.exportSvc.imprimirReporte(html, `Registro de Asistencia — ${this.sel.fecha}`);
  }

  colorFila(estado: EstadoAsistencia): string {
    return { PRESENTE: '', AUSENTE: '#fff5f5', TARDANZA: '#fffff0', JUSTIFICADO: '#ebf8ff' }[estado] || '';
  }
  getBgEstado(e: EstadoAsistencia): string { return { PRESENTE: '#C6F6D5', AUSENTE: '#FED7D7', TARDANZA: '#FEFCBF', JUSTIFICADO: '#BEE3F8' }[e] || '#e2e8f0'; }
  getColorEstado(e: EstadoAsistencia): string { return { PRESENTE: '#276749', AUSENTE: '#742a2a', TARDANZA: '#744210', JUSTIFICADO: '#2a4365' }[e] || '#4a5568'; }

  confirmarEliminar(a: Asistencia): void { this.seleccionada.set(a); this.confirmVisible.set(true); }
  eliminar(): void { this.svc.eliminar(this.seleccionada()!.id).subscribe({ next: () => { this.notif.success('Registro eliminado'); this.confirmVisible.set(false); this.cargarTabla(); }, error: (e: Error) => this.notif.error(e.message) }); }
  restaurar(a: Asistencia): void { this.svc.restaurar(a.id).subscribe({ next: () => { this.notif.success('Registro restaurado'); this.cargarTabla(); }, error: (e: Error) => this.notif.error(e.message) }); }
  toggleEliminadas(): void {
    this.verEliminadas.update(v => !v);
    this.cargarTabla();
  }
}
