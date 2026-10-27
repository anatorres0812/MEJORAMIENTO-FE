import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AcademicoService } from '../../../../core/services/academico.service';

@Component({
  selector: 'app-alumno-constancia',
  standalone: true,
  templateUrl: './constancia.component.html',
  styleUrl: './constancia.component.css'
})
export class ConstanciaComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private academicoService = inject(AcademicoService);

  anioAcademico = 2026;
  fechaEmision = new Date().toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Código simple y legible, basado en el DNI y el año — suficiente para un proyecto académico
  codigoConstancia = computed(() => {
    const est = this.estudiante();
    return est ? `CM-${this.anioAcademico}-${est.dni}` : '';
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

  imprimir(): void {
    window.print();
  }

  volver(): void {
    this.router.navigate(['/alumno/perfil']);
  }
}
