import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { NotaService } from '../../../../core/services/nota.service';

@Component({
  selector: 'app-alumno-boleta',
  standalone: true,
  templateUrl: './boleta.component.html',
  styleUrl: './boleta.component.css'
})
export class BoletaComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private academicoService = inject(AcademicoService);
  private notaService = inject(NotaService);

  anioAcademico = 2026;
  fechaEmision = new Date().toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  estudiante = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario?.referenciaId) return undefined;
    return this.estudianteService.getPorId(usuario.referenciaId);
  });

  grado = computed(() => {
    const est = this.estudiante();
    return est ? this.academicoService.getGradoPorId(est.gradoId) : undefined;
  });

  seccion = computed(() => {
    const est = this.estudiante();
    return est ? this.academicoService.getSeccionPorId(est.seccionId) : undefined;
  });

  notas = computed(() => {
    const est = this.estudiante();
    return est ? this.notaService.getPorEstudiante(est.id) : [];
  });

  promedio = computed(() => {
    const est = this.estudiante();
    return est ? this.notaService.calcularPromedio(est.id) : 0;
  });

  imprimir(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/alumno/mis-notas']);
  }
}
