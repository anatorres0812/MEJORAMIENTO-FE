import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';

@Component({
  selector: 'app-docente-mis-cursos',
  standalone: true,
  templateUrl: './mis-cursos.component.html',
  styleUrl: './mis-cursos.component.css'
})
export class MisCursosDocenteComponent {
  private authService = inject(AuthService);
  private docenteService = inject(DocenteService);

  cursos = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario?.referenciaId) return [];
    return this.docenteService.getCursosDelDocente(String(usuario.referenciaId));
  });
}
