import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { NotaService } from '../../../../core/services/nota.service';

@Component({
  selector: 'app-alumno-inicio',
  standalone: true,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioAlumnoComponent {
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private academicoService = inject(AcademicoService);
  private notaService = inject(NotaService);

  anioAcademico = 2026;

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
}
