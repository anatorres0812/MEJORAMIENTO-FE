
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CompetenciaService } from '../../../../core/services/competencia.service';
import { Competencia } from '../../../../core/models/competencia.model';

@Component({
  selector: 'app-competencias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './competencias.component.html',
  styleUrl: './competencias.component.css'
})
export class CompetenciasComponent implements OnInit {
  private competenciaService = inject(CompetenciaService);

  competencias = signal<Competencia[]>([]);
  cargando = signal(false);
  mensaje = signal('');
  error = signal('');

  editandoId = signal<number | null>(null);

  formulario = {
    codigo: '',
    nombre: '',
    areaCurricular: '',
    nivel: 'Primaria' as 'Inicial' | 'Primaria' | 'Secundaria',
    descripcion: '',
    estado: true
  };

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargando.set(true);
    this.error.set('');

    this.competenciaService.listarTodas().subscribe({
      next: datos => {
        this.competencias.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las competencias. Verifica que el backend esté ejecutándose.');
        this.cargando.set(false);
      }
    });
  }

  guardar(): void {
    if (
      !this.formulario.codigo.trim() ||
      !this.formulario.nombre.trim() ||
      !this.formulario.areaCurricular.trim()
    ) {
      this.error.set('Completa el código, nombre y área curricular.');
      return;
    }

    const datos = {
      ...this.formulario,
      codigo: this.formulario.codigo.trim(),
      nombre: this.formulario.nombre.trim(),
      areaCurricular: this.formulario.areaCurricular.trim(),
      descripcion: this.formulario.descripcion.trim() || null
    };

    const id = this.editandoId();

    const peticion = id !== null
      ? this.competenciaService.actualizar(id, datos)
      : this.competenciaService.registrar(datos);

    peticion.subscribe({
      next: () => {
        this.mensaje.set(id !== null
          ? 'Competencia actualizada correctamente.'
          : 'Competencia registrada correctamente.');

        this.limpiarFormulario();
        this.listar();
      },
      error: () => {
        this.error.set('No se pudo guardar la competencia. Revisa los datos y el backend.');
      }
    });
  }

  editar(competencia: Competencia): void {
    this.editandoId.set(competencia.id);

    this.formulario = {
      codigo: competencia.codigo,
      nombre: competencia.nombre,
      areaCurricular: competencia.areaCurricular,
      nivel: competencia.nivel,
      descripcion: competencia.descripcion ?? '',
      estado: competencia.estado
    };

    this.mensaje.set('');
    this.error.set('');
  }

  eliminar(competencia: Competencia): void {
    const confirmar = window.confirm(
      `¿Deseas eliminar la competencia "${competencia.nombre}"?`
    );

    if (!confirmar) return;

    this.competenciaService.eliminar(competencia.id).subscribe({
      next: () => {
        this.mensaje.set('Competencia eliminada correctamente.');
        this.listar();
      },
      error: () => {
        this.error.set('No se pudo eliminar la competencia.');
      }
    });
  }

  limpiarFormulario(): void {
    this.editandoId.set(null);

    this.formulario = {
      codigo: '',
      nombre: '',
      areaCurricular: '',
      nivel: 'Primaria',
      descripcion: '',
      estado: true
    };

    this.error.set('');
  }
}
