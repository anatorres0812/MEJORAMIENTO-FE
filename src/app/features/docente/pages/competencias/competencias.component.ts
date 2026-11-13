import { Component, OnInit, inject, signal } from '@angular/core';
import { CompetenciaService } from '../../../../core/services/competencia.service';
import { Competencia } from '../../../../core/models/competencia.model';

@Component({
  selector: 'app-competencias',
  standalone: true,
  imports: [],
  templateUrl: './competencias.component.html',
  styleUrl: './competencias.component.css'
})
export class CompetenciasComponent implements OnInit {
  private competenciaService = inject(CompetenciaService);

  competencias = signal<Competencia[]>([]);
  cargando = signal(false);
  error = signal('');

  nivelSeleccionado = signal('Todos');

  ngOnInit(): void {
    this.cargarCompetencias();
  }

  cargarCompetencias(): void {
    this.cargando.set(true);
    this.error.set('');

    this.competenciaService.listarTodas().subscribe({
      next: (datos) => {
        this.competencias.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(
          'No se pudieron cargar las competencias. Verifica que el backend esté ejecutándose.'
        );
        this.cargando.set(false);
      }
    });
  }

  competenciasFiltradas(): Competencia[] {
    const nivel = this.nivelSeleccionado();

    if (nivel === 'Todos') {
      return this.competencias();
    }

    return this.competencias().filter(
      competencia => competencia.nivel === nivel
    );
  }
}
