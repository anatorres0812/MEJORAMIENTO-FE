import { Component, inject, computed } from '@angular/core';
import { DocenteService } from '../../../../core/services/docente.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { NotaService } from '../../../../core/services/nota.service';
import { ActividadService } from '../../../../core/services/actividad.service';
import { NivelAdminService } from '../../../../core/services/nivel-admin.service';
import { Nivel } from '../../../../core/models/nivel.model';
import { CursoService } from '../../../../core/services/curso.service';
import { ResetService } from '../../../../core/services/reset.service';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardAdminComponent {
  private docenteService = inject(DocenteService);
  private estudianteService = inject(EstudianteService);
  private academicoService = inject(AcademicoService);
  private notaService = inject(NotaService);
  private nivelAdminService = inject(NivelAdminService);
  private actividadService = inject(ActividadService);
  private cursoService = inject(CursoService);
  private resetService = inject(ResetService);

  readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];
  readonly coloresBarra = ['#2563eb', '#16a34a', '#7c3aed', '#f59e0b', '#1d4ed8', '#dc2626'];

  nivelActivo = this.nivelAdminService.nivelSeleccionado;

  cambiarNivel(nivel: Nivel): void {
    this.nivelAdminService.seleccionar(nivel);
  }

  // ── Tarjetas resumen ────────────────────────────────────────
  totalEstudiantes = computed(() =>
    this.estudianteService.getTodos().filter(e => e.nivel === this.nivelActivo()).length
  );

  totalDocentes = computed(() =>
    this.docenteService.getTodos().filter(d => d.nivel === this.nivelActivo()).length
  );

  totalGrados = computed(() =>
    this.academicoService.getGradosPorNivel(this.nivelActivo()).length
  );

  totalSecciones = computed(() =>
    this.academicoService.contarSeccionesPorNivel(this.nivelActivo())
  );

  private cursosDelNivel = computed(() =>
    this.cursoService.getPorNivel(this.nivelActivo())
  );
  notasRegistradas = computed(() => {
    const idsCursos = this.cursosDelNivel().map(c => c.id);
    return this.notaService.getTodas().filter(n => idsCursos.includes(n.cursoId)).length;
  });

  // ── Gráfico: rendimiento promedio por curso (solo cursos con notas) ──
  rendimientoPorCurso = computed(() => {
    return this.cursosDelNivel()
      .map(curso => ({
        nombre: curso.nombre,
        porcentaje: Math.round((this.notaService.promedioPorCurso(curso.id) / 20) * 100),
      }))
      .filter(item => item.porcentaje > 0);
  });

  // ── Actividad reciente: eventos reales registrados por ActividadService ──
  actividadReciente = computed(() =>
    this.actividadService.getRecientesPorNivel(this.nivelActivo(), 6).map(a => ({
      texto: a.texto,
      fecha: a.fecha,
    }))
  );

    mostrarConfirmacionReset = false;

  abrirConfirmacionReset(): void {
    this.mostrarConfirmacionReset = true;
  }

  cancelarReset(): void {
    this.mostrarConfirmacionReset = false;
  }

  confirmarReset(): void {
    this.resetService.restablecerDatosDemo();
  }
}
