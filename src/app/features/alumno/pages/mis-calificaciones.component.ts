
import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Nota } from '../../notas/interfaces/nota.interface';
import { Matricula } from '../../matriculas/interfaces/matricula.interface';
import { Estudiante } from '../../estudiantes/interfaces/estudiante.interface';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mis-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">

      <header class="page-header">
        <div class="header-icon">📝</div>
        <div class="header-copy">
          <span class="eyebrow">MI ESPACIO ACADÉMICO</span>
          <h2>Mis calificaciones</h2>
          <p>Consulta tus notas registradas por curso y periodo.</p>
        </div>
      </header>

      @if (cargando()) {
        <section class="state-card">
          <div class="spinner-md"></div>
          <p>Cargando tus calificaciones...</p>
        </section>
      } @else if (error()) {
        <section class="state-card error-state">
          <div class="state-icon">⚠️</div>
          <h3>No pudimos cargar tu información</h3>
          <p>{{ error() }}</p>
        </section>
      } @else {

        @if (estudiante()) {
          <section class="student-card">
            <div class="student-main">
              <div class="est-avatar">{{ iniciales() }}</div>
              <div class="student-details">
                <span class="eyebrow">PERFIL DEL ESTUDIANTE</span>
                <h3>{{ estudiante()!.nombres }} {{ estudiante()!.apellidos }}</h3>
                <p class="student-meta">
                  <span class="badge badge-{{ estudiante()!.nivelEducativo?.toLowerCase() }}">
                    {{ estudiante()!.nivelEducativo }}
                  </span>
                  {{ estudiante()!.gradoNombre || '' }}
                  @if (estudiante()!.seccionNombre) {
                    · Sección {{ estudiante()!.seccionNombre }}
                  }
                </p>
                <p class="student-code">
                  Código de estudiante:
                  <strong>{{ estudiante()!.codigo || '—' }}</strong>
                </p>
              </div>
            </div>

            @if (matricula()) {
              <div class="enrollment">
                <span class="enrollment-dot"></span>
                <div>
                  <strong>Matrícula registrada</strong>
                  <span>{{ matricula()!.periodoNombre }} · {{ matricula()!.anioAcademico }}</span>
                </div>
              </div>
            }
          </section>
        }

        @if (notas().length > 0) {
          <section class="filter-card">
            <div class="section-heading">
              <div>
                <span class="eyebrow">PERSONALIZA TU CONSULTA</span>
                <h3>Filtrar calificaciones</h3>
              </div>
              <button
                type="button"
                class="clear-button"
                (click)="filtroCurso=''; filtroPeriodo=''">
                Limpiar filtros
              </button>
            </div>

            <div class="filter-grid">
              <div class="form-group">
                <label for="filtroCurso">Curso o área</label>
                <select id="filtroCurso" class="form-control" [(ngModel)]="filtroCurso">
                  <option value="">Todos los cursos</option>
                  @for (c of cursos(); track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label for="filtroPeriodo">Periodo académico</label>
                <select id="filtroPeriodo" class="form-control" [(ngModel)]="filtroPeriodo">
                  <option value="">Todos los periodos</option>
                  @for (p of periodos(); track p) {
                    <option [value]="p">{{ p }}</option>
                  }
                </select>
              </div>
            </div>
          </section>
        }

        <section class="grades-card">
          <div class="section-heading grades-heading">
            <div>
              <span class="eyebrow">SEGUIMIENTO ACADÉMICO</span>
              <h3>Detalle de calificaciones</h3>
            </div>
            @if (notasFiltradas().length > 0) {
              <span class="count-badge">
                {{ notasFiltradas().length }}
                {{ notasFiltradas().length === 1 ? 'registro' : 'registros' }}
              </span>
            }
          </div>

          @if (notasFiltradas().length === 0) {
            <div class="empty-state">
              <div class="empty-illustration">
                <span>📝</span>
              </div>
              <h3>Aún no hay calificaciones</h3>
              <p>
                Tus notas aparecerán aquí cuando el profesor las registre.
              </p>
            </div>
          } @else {
            <div class="table-wrap">
              <table class="table grades-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Curso / Área</th>
                    <th>Competencia</th>
                    <th>Calificación</th>
                    <th>Periodo</th>
                    <th>Fecha</th>
                    <th>Observación</th>
                  </tr>
                </thead>
                <tbody>
                  @for (n of notasFiltradas(); track n.id; let i = $index) {
                    <tr>
                      <td class="row-number">{{ i + 1 }}</td>
                      <td><strong>{{ n.cursoNombre || '—' }}</strong></td>
                      <td>{{ n.competenciaNombre || '—' }}</td>
                      <td>
                        <span class="cal-badge" [style]="calStyle(n.calificacion)">
                          {{ n.calificacion }}
                        </span>
                      </td>
                      <td>{{ n.periodoNombre || '—' }}</td>
                      <td>{{ n.fechaRegistro }}</td>
                      <td>{{ n.observacion || '—' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="table-footer">
              Se muestran {{ notasFiltradas().length }} calificación(es).
            </p>
          }
        </section>

        @if (notas().length > 0) {
          <section class="summary-card">
            <div class="section-heading">
              <div>
                <span class="eyebrow">VISTA GENERAL</span>
                <h3>Resumen de calificaciones</h3>
              </div>
              <span class="summary-icon">📊</span>
            </div>

            <div class="resumen-grid">
              @for (r of resumen(); track r.cal) {
                <div class="resumen-item">
                  <span class="resumen-cal" [style]="calStyle(r.cal)">
                    {{ r.cal }}
                  </span>
                  <strong class="resumen-cnt">{{ r.total }}</strong>
                  <span class="resumen-lbl">
                    {{ r.total === 1 ? 'calificación' : 'calificaciones' }}
                  </span>
                </div>
              }
            </div>
          </section>
        }
      }

      <footer class="page-footer">
        <span>🎓</span>
        <p>IEP N.° 20973 · Sistema de gestión académica</p>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 0;
      color: var(--text-primary, #172033);
    }

    .page-container {
      --grades-accent: var(--accent, #315ee8);
      --grades-border: var(--border, #e1e8f0);
      --grades-surface: var(--bg-card, #fff);
      --grades-bg: var(--bg-app, #f4f7fb);
      --grades-muted: var(--text-muted, #718096);

      position: relative;
      isolation: isolate;
      display: flex;
      flex-direction: column;
      gap: 20px;
      width: 100%;
      max-width: 1440px;
      margin: 0 auto;
      padding: 8px 0 24px;
      box-sizing: border-box;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 2px 14px;
    }

    .header-icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 58px;
      height: 58px;
      border-radius: 18px;
      background: var(--accent-light, #e5edff);
      font-size: 27px;
    }

    .header-copy h2 {
      margin: 4px 0 6px;
      font-size: clamp(23px, 3vw, 30px);
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: -0.7px;
      color: var(--text-primary, #172033);
    }

    .header-copy p {
      margin: 0;
      color: var(--text-secondary, #4b5568);
      font-size: 14px;
      line-height: 1.6;
    }

    .eyebrow {
      display: block;
      color: var(--grades-accent);
      font-size: 10px;
      line-height: 1.5;
      font-weight: 800;
      letter-spacing: 1.3px;
    }

    .student-card,
    .filter-card,
    .grades-card,
    .summary-card,
    .state-card {
      min-width: 0;
      border: 1px solid var(--grades-border);
      border-radius: 18px;
      background: var(--grades-surface);
      box-shadow: 0 5px 18px rgba(30, 50, 90, 0.045);
      box-sizing: border-box;
    }

    .student-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
      padding: 24px;
      border-top: 3px solid var(--grades-accent);
    }

    .student-main {
      display: flex;
      align-items: center;
      gap: 16px;
      min-width: 0;
    }

    .est-avatar {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 66px;
      height: 66px;
      border: 3px solid var(--grades-surface);
      border-radius: 21px;
      background: linear-gradient(135deg, var(--grades-accent), #7655d8);
      box-shadow: 0 4px 12px rgba(49, 94, 232, 0.2);
      color: #fff;
      font-size: 22px;
      font-weight: 800;
    }

    .student-details h3 {
      margin: 5px 0 8px;
      color: var(--text-primary, #172033);
      font-size: 19px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .student-meta,
    .student-code {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      margin: 5px 0 0;
      color: var(--text-secondary, #4b5568);
      font-size: 12px;
      line-height: 1.6;
    }

    .student-code strong {
      color: var(--text-primary, #172033);
    }

    .enrollment {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 12px 15px;
      border: 1px solid var(--grades-border);
      border-radius: 12px;
      background: var(--bg-card-hover, #f8fafc);
    }

    .enrollment-dot {
      width: 9px;
      height: 9px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #22a06b;
    }

    .enrollment div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .enrollment strong {
      color: var(--text-primary, #172033);
      font-size: 12px;
    }

    .enrollment span:last-child {
      color: var(--grades-muted);
      font-size: 11px;
    }

    .filter-card,
    .grades-card,
    .summary-card {
      padding: 24px;
    }

    .section-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 14px;
      margin-bottom: 20px;
    }

    .section-heading h3 {
      margin: 5px 0 0;
      color: var(--text-primary, #172033);
      font-size: 17px;
      line-height: 1.4;
      font-weight: 800;
    }

    .filter-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .form-group label {
      color: var(--text-secondary, #4b5568);
      font-size: 12px;
      font-weight: 700;
    }

    .form-control {
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border: 1px solid var(--grades-border);
      border-radius: 10px;
      background: var(--grades-surface);
      color: var(--text-primary, #172033);
      font: inherit;
      font-size: 13px;
      box-sizing: border-box;
    }

    .form-control:focus-visible,
    .clear-button:focus-visible {
      outline: 2px solid var(--grades-accent);
      outline-offset: 3px;
    }

    .clear-button {
      padding: 9px 12px;
      border: 1px solid var(--grades-border);
      border-radius: 9px;
      background: transparent;
      color: var(--grades-accent);
      font: inherit;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .clear-button:hover {
      background: var(--bg-card-hover, #f8fafc);
    }

    .grades-heading {
      margin-bottom: 22px;
    }

    .count-badge {
      flex-shrink: 0;
      padding: 7px 11px;
      border-radius: 20px;
      background: var(--accent-light, #e5edff);
      color: var(--grades-accent);
      font-size: 11px;
      font-weight: 800;
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--grades-border);
      border-radius: 12px;
    }

    .grades-table {
      width: 100%;
      min-width: 850px;
      border-collapse: collapse;
      text-align: left;
    }

    .grades-table th {
      padding: 14px 15px;
      background: var(--bg-card-hover, #f8fafc);
      color: var(--text-secondary, #4b5568);
      border-bottom: 1px solid var(--grades-border);
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      white-space: nowrap;
    }

    .grades-table td {
      padding: 15px;
      border-bottom: 1px solid var(--grades-border);
      color: var(--text-secondary, #4b5568);
      font-size: 12px;
      line-height: 1.6;
      vertical-align: middle;
    }

    .grades-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .grades-table tbody tr:hover {
      background: var(--bg-card-hover, #f8fafc);
    }

    .grades-table td strong {
      color: var(--text-primary, #172033);
    }

    .row-number {
      color: var(--grades-muted) !important;
    }

    .cal-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 38px;
      padding: 6px 10px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 800;
      box-sizing: border-box;
    }

    .table-footer {
      margin: 16px 0 0;
      text-align: right;
      color: var(--grades-muted);
      font-size: 11px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 245px;
      padding: 28px 16px;
      text-align: center;
      box-sizing: border-box;
    }

    .empty-illustration {
      display: grid;
      place-items: center;
      width: 76px;
      height: 76px;
      margin-bottom: 17px;
      border: 1px solid var(--grades-border);
      border-radius: 24px;
      background: var(--bg-card-hover, #f8fafc);
    }

    .empty-illustration span {
      font-size: 32px;
    }

    .empty-state h3 {
      margin: 0 0 8px;
      color: var(--text-primary, #172033);
      font-size: 17px;
      font-weight: 800;
    }

    .empty-state p {
      max-width: 360px;
      margin: 0;
      color: var(--grades-muted);
      font-size: 13px;
      line-height: 1.7;
    }

    .summary-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: var(--bg-card-hover, #f8fafc);
      font-size: 20px;
    }

    .resumen-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(115px, 1fr));
      gap: 12px;
    }

    .resumen-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      padding: 17px 12px;
      border: 1px solid var(--grades-border);
      border-radius: 13px;
      background: var(--bg-card-hover, #f8fafc);
      text-align: center;
    }

    .resumen-cal {
      display: grid;
      place-items: center;
      min-width: 43px;
      min-height: 38px;
      padding: 4px 8px;
      border-radius: 10px;
      font-size: 17px;
      font-weight: 900;
      box-sizing: border-box;
    }

    .resumen-cnt {
      color: var(--text-primary, #172033);
      font-size: 25px;
      font-weight: 800;
    }

    .resumen-lbl {
      color: var(--grades-muted);
      font-size: 11px;
    }

    .state-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 240px;
      padding: 30px 20px;
      text-align: center;
    }

    .state-card p {
      max-width: 540px;
      margin: 0;
      color: var(--grades-muted);
      font-size: 13px;
      line-height: 1.7;
      overflow-wrap: anywhere;
    }

    .state-icon {
      display: grid;
      place-items: center;
      width: 62px;
      height: 62px;
      border-radius: 19px;
      background: #fff2df;
      font-size: 27px;
    }

    .error-state h3 {
      margin: 0;
      color: var(--text-primary, #172033);
      font-size: 18px;
    }

    .page-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 8px 0 0;
      color: var(--grades-muted);
      font-size: 11px;
      text-align: center;
    }

    .page-footer p {
      margin: 0;
    }

    @media (max-width: 700px) {
      .page-container {
        gap: 14px;
      }

      .page-header {
        align-items: flex-start;
        gap: 12px;
      }

      .header-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        font-size: 23px;
      }

      .student-card,
      .filter-card,
      .grades-card,
      .summary-card {
        padding: 17px;
        border-radius: 14px;
      }

      .student-main {
        align-items: flex-start;
        gap: 12px;
      }

      .est-avatar {
        width: 51px;
        height: 51px;
        border-radius: 16px;
        font-size: 18px;
      }

      .student-details h3 {
        font-size: 16px;
      }

      .enrollment {
        width: 100%;
        box-sizing: border-box;
      }

      .filter-grid {
        grid-template-columns: minmax(0, 1fr);
        gap: 14px;
      }

      .section-heading {
        align-items: flex-start;
      }

      .section-heading h3 {
        font-size: 15px;
      }

      .empty-state {
        min-height: 220px;
      }

      .resumen-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        scroll-behavior: auto !important;
      }
    }
  `]
})
export class MisCalificacionesComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private api = environment.apiUrl;

  cargando = signal(true);
  error = signal('');
  filtroCurso = '';
  filtroPeriodo = '';

  estudiante = signal<Estudiante | null>(null);
  matricula = signal<Matricula | null>(null);
  notas = signal<Nota[]>([]);

  iniciales = computed(() => {
    const e = this.estudiante();
    if (!e) return '?';
    return `${e.nombres.charAt(0)}${e.apellidos.charAt(0)}`.toUpperCase();
  });

  cursos = computed(() =>
    [...new Set(this.notas().map(n => n.cursoNombre ?? '').filter(Boolean))]
  );

  periodos = computed(() =>
    [...new Set(this.notas().map(n => n.periodoNombre ?? '').filter(Boolean))]
  );

  notasFiltradas = computed(() => {
    let l = this.notas().filter(n => n.estado === 'ACTIVO');
    if (this.filtroCurso) l = l.filter(n => n.cursoNombre === this.filtroCurso);
    if (this.filtroPeriodo) l = l.filter(n => n.periodoNombre === this.filtroPeriodo);
    return l;
  });

  resumen = computed(() => {
    const map = new Map<string, number>();
    this.notasFiltradas().forEach(n =>
      map.set(n.calificacion, (map.get(n.calificacion) ?? 0) + 1)
    );
    return [...map.entries()].map(([cal, total]) => ({ cal, total }));
  });

  ngOnInit(): void {
    const u = this.auth.usuarioActual();

    if (!u || u.rol !== 'ESTUDIANTE') {
      this.error.set('Esta sección es solo para estudiantes.');
      this.cargando.set(false);
      return;
    }

    this.cargarDatos(u.username);
  }

  private cargarDatos(username: string): void {
    this.http.get<Estudiante[]>(`${this.api}/estudiantes`).subscribe({
      next: (lista) => {
        const est = lista.find(e => e.numeroDocumento === username);

        if (!est) {
          this.error.set('No se encontró el perfil de estudiante vinculado a tu usuario.');
          this.cargando.set(false);
          return;
        }

        this.estudiante.set(est);

        const params = new HttpParams().set('estudianteId', est.id);

        this.http.get<Matricula[]>(`${this.api}/matriculas`, { params }).subscribe({
          next: (mats) => {
            const vigente = mats.find(m => m.estado !== 'ELIMINADO') ?? null;
            this.matricula.set(vigente);
          },
          error: () => {}
        });

        this.http.get<Nota[]>(`${this.api}/notas`, { params }).subscribe({
          next: (n) => {
            this.notas.set(n.filter(nota => nota.estudianteId === est.id));
            this.cargando.set(false);
          },
          error: () => {
            this.error.set('No se pudieron cargar las calificaciones.');
            this.cargando.set(false);
          }
        });
      },
      error: () => {
        this.error.set('Error al conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  calStyle(cal: string): string {
    if (cal === 'AD') return 'background:#C6F6D5;color:#276749';
    if (cal === 'A') return 'background:#BEE3F8;color:#2B6CB0';
    if (cal === 'B') return 'background:#FEFCBF;color:#744210';
    if (cal === 'C') return 'background:#FED7D7;color:#742A2A';

    const num = parseFloat(cal);

    if (!isNaN(num)) {
      if (num >= 17) return 'background:#C6F6D5;color:#276749';
      if (num >= 14) return 'background:#BEE3F8;color:#2B6CB0';
      if (num >= 11) return 'background:#FEFCBF;color:#744210';
      return 'background:#FED7D7;color:#742A2A';
    }

    return 'background:#e2e8f0;color:#4a5568';
  }
}
