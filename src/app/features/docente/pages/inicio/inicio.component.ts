import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { NotaService } from '../../../../core/services/nota.service';

@Component({
  selector: 'app-docente-inicio',
  standalone: true,
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioDocenteComponent {
  private authService = inject(AuthService);
  private docenteService = inject(DocenteService);
  private estudianteService = inject(EstudianteService);
  private notaService = inject(NotaService);

  docente = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario?.referenciaId) return undefined;
    return this.docenteService.getPorId(String(usuario.referenciaId));
  });

  cursos = computed(() => {
    const doc = this.docente();
    return doc ? this.docenteService.getCursosDelDocente(String(doc.id)) : [];
  });

  // Total de estudiantes del mismo nivel que dicta el docente (referencia general del dashboard)
  totalEstudiantes = computed(() => {
    const doc = this.docente();
    if (!doc) return 0;
    return this.estudianteService.getTodos().filter(e => e.nivel === doc.nivel).length;
  });

  notasRegistradas = computed(() => {
    const doc = this.docente();
    return doc ? this.notaService.getPorDocente(doc.id).length : 0;
  });
}
