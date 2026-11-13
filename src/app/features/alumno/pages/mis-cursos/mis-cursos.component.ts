import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { NotaService } from '../../../../core/services/nota.service';

@Component({
  selector: 'app-alumno-mis-cursos',
  standalone: true,
  templateUrl: './mis-cursos.component.html',
  styleUrl: './mis-cursos.component.css'
})
export class MisCursosComponent {
  private authService = inject(AuthService);
  private estudianteService = inject(EstudianteService);
  private notaService = inject(NotaService);

  // Reutilizamos NotaService.getPorEstudiante: ya trae el nombre del curso y del docente
  cursos = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario?.referenciaId) return [];
    const estudiante = this.estudianteService.getPorId(usuario.referenciaId);
    if (!estudiante) return [];
    return this.notaService.getPorEstudiante(estudiante.id);
  });
}
