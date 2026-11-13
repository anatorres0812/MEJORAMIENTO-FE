import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodosService } from '../../periodos/services/periodos.service';
import { GradosService } from '../../grados/services/grados.service';
import { CursosService } from '../../cursos/services/cursos.service';
import { ProfesoresService } from '../../profesores/services/profesores.service';
import { NotasService } from '../../notas/services/notas.service';
import { Nota } from '../../notas/interfaces/nota.interface';
import { Periodo } from '../../periodos/interfaces/periodo.interface';
import { Grado, Seccion } from '../../grados/interfaces/grado.interface';
import { Curso } from '../../cursos/interfaces/curso.interface';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="page-container">
  <div class="page-header">
    <div>
      <h2>📄 Reportes y Exportación</h2>
      <p>Genera reportes de notas en PDF o Excel</p>
    </div>
  </div>

  <!-- Panel de filtros -->
  <div class="card" style="margin-bottom:20px">
    <h3 style="margin:0 0 18px;font-size:15px;font-weight:700;color:var(--text-primary);border-bottom:2px solid var(--border);padding-bottom:10px;">
      🔍 Filtros del reporte
    </h3>
    <div class="form-grid form-grid-3">
      <div class="form-group">
        <label>Periodo Académico</label>
        <select class="form-control" [(ngModel)]="filtro.periodoId" (change)="cargarNotas()">
          <option value="">Todos los periodos</option>
          @for (p of periodos(); track p.id) {
            <option [value]="p.id">{{ p.nombre }} — {{ p.anioAcademico }}</option>
          }
        </select>
      </div>
      <div class="form-group">
        <label>Nivel Educativo</label>
        <select class="form-control" [(ngModel)]="filtro.nivel" (change)="onNivelChange()">
          <option value="">Todos</option>
          <option value="INICIAL">Inicial</option>
          <option value="PRIMARIA">Primaria</option>
          <option value="SECUNDARIA">Secundaria</option>
        </select>
      </div>
      <div class="form-group">
        <label>Grado</label>
        <select class="form-control" [(ngModel)]="filtro.gradoId" (change)="onGradoChange()">
          <option value="">Todos los grados</option>
          @for (g of gradosFiltrados(); track g.id) {
            <option [value]="g.id">{{ g.nombre }}</option>
          }
        </select>
      </div>
      <div class="form-group">
        <label>Sección</label>
        <select class="form-control" [(ngModel)]="filtro.seccionId" (change)="cargarNotas()">
          <option value="">Todas las secciones</option>
          @for (s of seccionesFiltradas(); track s.id) {
            <option [value]="s.id">{{ s.nombre }}</option>
          }
        </select>
      </div>
      <div class="form-group">
        <label>Curso</label>
        <select class="form-control" [(ngModel)]="filtro.cursoId" (change)="cargarNotas()">
          <option value="">Todos los cursos</option>
          @for (c of cursos(); track c.id) {
            <option [value]="c.id">{{ c.nombre }}</option>
          }
        </select>
      </div>
      <div class="form-group" style="align-self:flex-end">
        <button class="btn btn-outline w-full" (click)="limpiarFiltros()">✕ Limpiar filtros</button>
      </div>
    </div>
  </div>

  <!-- Acciones de exportación -->
  <div class="export-actions">
    <div class="export-card" (click)="exportarPDF()">
      <div class="export-icon">📄</div>
      <div class="export-info">
        <strong>Exportar a PDF</strong>
        <span>Reporte formal con encabezado institucional</span>
      </div>
      <button class="btn btn-primary btn-sm" [disabled]="generando()">
        {{ generando() ? 'Generando...' : 'Generar PDF' }}
      </button>
    </div>
    <div class="export-card" (click)="exportarExcel()">
      <div class="export-icon">📊</div>
      <div class="export-info">
        <strong>Exportar a Excel</strong>
        <span>Planilla con todas las calificaciones</span>
      </div>
      <button class="btn btn-success btn-sm" [disabled]="generando()">
        {{ generando() ? 'Generando...' : 'Generar Excel' }}
      </button>
    </div>
  </div>

  <!-- Vista previa de datos -->
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px">
      <h3 style="margin:0;font-size:15px;font-weight:700">
        📋 Vista previa — {{ notasFiltradas().length }} registro(s)
      </h3>
      <span class="text-muted text-sm">Los reportes incluirán todos los registros, no solo la página visible</span>
    </div>

    @if (cargando()) {
      <div class="loading-wrap"><div class="spinner-md"></div> Cargando datos...</div>
    } @else if (notasFiltradas().length === 0) {
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <p>No hay notas con los filtros seleccionados</p>
      </div>
    } @else {
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>#</th><th>Estudiante</th><th>DNI/Código</th>
              <th>Nivel</th><th>Grado / Sección</th>
              <th>Curso</th><th>Competencia</th>
              <th>Calificación</th><th>Periodo</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            @for (n of notasPaginadas(); track n.id; let i = $index) {
              <tr>
                <td class="text-muted text-sm">{{ (paginaActual()-1)*pageSize+i+1 }}</td>
                <td><strong>{{ n.estudianteNombre }}</strong></td>
                <td class="text-sm text-muted">{{ n.estudianteCodigo }}</td>
                <td><span class="badge badge-{{ n.nivelEducativo.toLowerCase() }}">{{ n.nivelEducativo }}</span></td>
                <td class="text-sm">
                  {{ n.gradoId ? 'Grado ' + n.gradoId : '—' }}
                  {{ n.seccionId ? ' / Sec.' + n.seccionId : '' }}
                </td>
                <td>{{ n.cursoNombre }}</td>
                <td class="text-sm">{{ n.competenciaNombre }}</td>
                <td>
                  <span class="cal-badge" [style]="calStyle(n.calificacion)">{{ n.calificacion }}</span>
                </td>
                <td class="text-sm text-muted">{{ n.periodoNombre }}</td>
                <td class="text-sm text-muted">{{ n.fechaRegistro }}</td>
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
    }
  </div>
</div>
  `,
  styles: [`
    .export-actions {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px,1fr));
      gap: 16px; margin-bottom: 20px;
    }
    .export-card {
      background: var(--bg-card); border: 1.5px solid var(--border);
      border-radius: 14px; padding: 20px;
      display: flex; align-items: center; gap: 16px;
      cursor: pointer; transition: border-color .2s, box-shadow .2s, transform .2s;
    }
    .export-card:hover {
      border-color: var(--accent); transform: translateY(-2px);
      box-shadow: 0 6px 20px var(--shadow-md);
    }
    .export-icon { font-size: 32px; flex-shrink: 0; }
    .export-info { flex: 1; }
    .export-info strong { display: block; font-size: 14px; color: var(--text-primary); margin-bottom: 3px; }
    .export-info span { font-size: 12px; color: var(--text-muted); }
    .cal-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-weight: 700; font-size: 13px; }
  `]
})
export class ReportesComponent implements OnInit {
  private http       = inject(HttpClient);
  private notif      = inject(NotificationService);
  private periodosSvc = inject(PeriodosService);
  private gradosSvc  = inject(GradosService);
  private cursosSvc  = inject(CursosService);
  private profSvc    = inject(ProfesoresService);
  private notasSvc   = inject(NotasService);

  cargando  = signal(false);
  generando = signal(false);
  paginaActual = signal(1);
  pageSize = 15;

  periodos  = signal<Periodo[]>([]);
  grados    = signal<Grado[]>([]);
  secciones = signal<Seccion[]>([]);
  cursos    = signal<Curso[]>([]);
  notas     = signal<Nota[]>([]);

  filtro = { periodoId: '', nivel: '', gradoId: '', seccionId: '', cursoId: '' };

  gradosFiltrados = computed(() =>
    this.filtro.nivel
      ? this.grados().filter(g => g.nivel === this.filtro.nivel && g.estado === 'ACTIVO')
      : this.grados().filter(g => g.estado === 'ACTIVO')
  );

  seccionesFiltradas = computed(() =>
    this.filtro.gradoId
      ? this.secciones().filter(s => s.gradoId === Number(this.filtro.gradoId) && s.estado === 'ACTIVO')
      : this.secciones().filter(s => s.estado === 'ACTIVO')
  );

  notasFiltradas = computed(() => {
    let l = this.notas().filter(n => n.estado === 'ACTIVO');
    if (this.filtro.nivel)    l = l.filter(n => n.nivelEducativo === this.filtro.nivel);
    if (this.filtro.gradoId)  l = l.filter(n => n.gradoId === Number(this.filtro.gradoId));
    if (this.filtro.seccionId) l = l.filter(n => n.seccionId === Number(this.filtro.seccionId));
    if (this.filtro.cursoId)  l = l.filter(n => n.cursoId === Number(this.filtro.cursoId));
    return l;
  });

  totalPaginas   = computed(() => Math.max(1, Math.ceil(this.notasFiltradas().length / this.pageSize)));
  paginas        = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i+1));
  notasPaginadas = computed(() => {
    const s = (this.paginaActual()-1) * this.pageSize;
    return this.notasFiltradas().slice(s, s+this.pageSize);
  });

  ngOnInit(): void {
    this.periodosSvc.listar('ACTIVO').subscribe(d => this.periodos.set(d));
    this.gradosSvc.listarGrados().subscribe(d => this.grados.set(d));
    this.gradosSvc.listarSecciones().subscribe(d => this.secciones.set(d));
    this.cursosSvc.listar().subscribe(d => this.cursos.set(d));
    this.cargarNotas();
  }

  cargarNotas(): void {
    this.cargando.set(true);
    this.paginaActual.set(1);
    const filtros: any = {};
    if (this.filtro.periodoId) filtros.periodoId = Number(this.filtro.periodoId);
    if (this.filtro.cursoId)   filtros.cursoId = Number(this.filtro.cursoId);
    this.notasSvc.listar(filtros).subscribe({
      next: d => { this.notas.set(d); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  onNivelChange(): void { this.filtro.gradoId = ''; this.filtro.seccionId = ''; this.cargarNotas(); }
  onGradoChange(): void { this.filtro.seccionId = ''; this.cargarNotas(); }
  limpiarFiltros(): void {
    this.filtro = { periodoId: '', nivel: '', gradoId: '', seccionId: '', cursoId: '' };
    this.cargarNotas();
  }

  exportarPDF(): void {
    this.generando.set(true);
    const datos = this.notasFiltradas();
    if (datos.length === 0) { this.notif.error('No hay datos para exportar'); this.generando.set(false); return; }
    import('jspdf').then((jspdfModule) => {
      const jsPDF = (jspdfModule as any).jsPDF ?? jspdfModule.default;
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const fecha = new Date().toLocaleDateString('es-PE');
        // Encabezado
        doc.setFontSize(14); doc.setFont('helvetica','bold');
        doc.text('INSTITUCIÓN EDUCATIVA — GESTIÓN ACADÉMICA', 148, 15, { align: 'center' });
        doc.setFontSize(11); doc.setFont('helvetica','normal');
        doc.text('Reporte de Calificaciones', 148, 22, { align: 'center' });
        doc.setFontSize(9); doc.text(`Generado: ${fecha}  |  Total registros: ${datos.length}`, 148, 28, { align: 'center' });
        doc.line(14, 31, 283, 31);
        // Tabla
        (doc as any).autoTable({
          startY: 35,
          head: [['#','Estudiante','Código','Nivel','Curso','Competencia','Calificación','Periodo','Fecha']],
          body: datos.map((n, i) => [
            i+1, n.estudianteNombre || '', n.estudianteCodigo || '',
            n.nivelEducativo || '', n.cursoNombre || '',
            n.competenciaNombre || '', n.calificacion || '',
            n.periodoNombre || '', n.fechaRegistro || ''
          ]),
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [30,58,95], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245,248,252] },
          margin: { left: 14, right: 14 },
          didDrawPage: (data: any) => {
            const pageCount = (doc as any).internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.text(`Página ${data.pageNumber} de ${pageCount}`, 148, doc.internal.pageSize.height - 8, { align: 'center' });
          }
        });
        doc.save(`reporte-notas-${fecha.replace(/\//g,'-')}.pdf`);
        this.notif.success('PDF generado correctamente');
        this.generando.set(false);
      });
    }).catch(() => {
      this.notif.error('No se pudo generar el PDF. Instala jspdf: npm install jspdf jspdf-autotable');
      this.generando.set(false);
    });
  }

  exportarExcel(): void {
    this.generando.set(true);
    const datos = this.notasFiltradas();
    if (datos.length === 0) { this.notif.error('No hay datos para exportar'); this.generando.set(false); return; }
    import('exceljs').then((ExcelJSModule) => {
      const ExcelJS = ExcelJSModule.default || ExcelJSModule;
      const wb = new (ExcelJS as any).Workbook();
      wb.creator = 'Gestión Académica 20973';
      wb.created = new Date();
      const ws = wb.addWorksheet('Notas');
      // Estilos cabecera
      const headerFill: any = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
      const headerFont: any = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      // Encabezado institucional
      ws.mergeCells('A1:I1');
      ws.getCell('A1').value = 'INSTITUCIÓN EDUCATIVA — REPORTE DE CALIFICACIONES';
      ws.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FF1E3A5F' } };
      ws.getCell('A1').alignment = { horizontal: 'center' };
      ws.mergeCells('A2:I2');
      ws.getCell('A2').value = `Fecha de generación: ${new Date().toLocaleDateString('es-PE')}  |  Total registros: ${datos.length}`;
      ws.getCell('A2').alignment = { horizontal: 'center' };
      ws.getCell('A2').font = { size: 9, italic: true };
      // Columnas
      ws.columns = [
        { key: 'num',         header: '#',            width: 5  },
        { key: 'estudiante',  header: 'Estudiante',   width: 30 },
        { key: 'codigo',      header: 'Código/DNI',   width: 15 },
        { key: 'nivel',       header: 'Nivel',        width: 12 },
        { key: 'curso',       header: 'Curso',        width: 20 },
        { key: 'competencia', header: 'Competencia',  width: 30 },
        { key: 'calificacion',header: 'Calificación', width: 12 },
        { key: 'periodo',     header: 'Periodo',      width: 18 },
        { key: 'fecha',       header: 'Fecha',        width: 12 },
      ];
      // Estilo fila de encabezados de columna (fila 4)
      const headerRow = ws.getRow(4);
      headerRow.height = 20;
      ws.columns.forEach((_col: any, i: number) => {
        const cell = headerRow.getCell(i+1);
        cell.fill = headerFill;
        cell.font = headerFont;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } } };
      });
      // Datos desde fila 5
      datos.forEach((n, i) => {
        const row = ws.addRow({
          num: i+1, estudiante: n.estudianteNombre, codigo: n.estudianteCodigo,
          nivel: n.nivelEducativo, curso: n.cursoNombre, competencia: n.competenciaNombre,
          calificacion: n.calificacion, periodo: n.periodoNombre, fecha: n.fechaRegistro
        });
        if (i % 2 === 0) {
          row.eachCell((cell: any) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F8FC' } };
          });
        }
        row.getCell('calificacion').alignment = { horizontal: 'center' };
        row.getCell('calificacion').font = { bold: true };
      });
      // Descargar
      wb.xlsx.writeBuffer().then((buffer: any) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `notas-${new Date().toISOString().split('T')[0]}.xlsx`;
        a.click(); URL.revokeObjectURL(url);
        this.notif.success('Excel generado correctamente');
        this.generando.set(false);
      });
    }).catch(() => {
      this.notif.error('Error al generar Excel');
      this.generando.set(false);
    });
  }

  calStyle(cal: string): string {
    if (!cal) return 'background:#e2e8f0;color:#4a5568';
    if (cal==='AD') return 'background:#dcfce7;color:#166534';
    if (cal==='A')  return 'background:#dbeafe;color:#1e40af';
    if (cal==='B')  return 'background:#fef9c3;color:#854d0e';
    if (cal==='C')  return 'background:#fee2e2;color:#991b1b';
    const n = parseFloat(cal);
    if (!isNaN(n)) {
      if (n>=17) return 'background:#dcfce7;color:#166534';
      if (n>=14) return 'background:#dbeafe;color:#1e40af';
      if (n>=11) return 'background:#fef9c3;color:#854d0e';
      return 'background:#fee2e2;color:#991b1b';
    }
    return 'background:#e2e8f0;color:#4a5568';
  }

  irPagina(p: number): void { if (p>=1 && p<=this.totalPaginas()) this.paginaActual.set(p); }
}
