
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GradoService } from '../../../../core/services/grado.service';
import { Grado } from '../../../../core/models/grado.model';
import { Nivel } from '../../../../core/models/nivel.model';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.css'
})
export class GradosComponent {
  private readonly gradoService = inject(GradoService);

  readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];

  nivelSeleccionado: Nivel | 'Todos' = 'Todos';
  nombre = '';
  nivel: Nivel = 'Primaria';

  gradoEditando: string | null = null;
  mensaje = '';
  error = '';
  get totalGrados(): number {
    return this.gradoService.getTodos().length;
}

  get grados(): Grado[] {
    const todos = this.gradoService.getTodos();
    

    return this.nivelSeleccionado === 'Todos'
      ? todos
      : todos.filter(g => g.nivel === this.nivelSeleccionado);
    
  }

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    const nombreLimpio = this.nombre.trim();

    if (!nombreLimpio) {
      this.error = 'Escribe el nombre del grado.';
      return;
    }

    const duplicado = this.gradoService.getTodos().some(g =>
      g.nivel === this.nivel &&
      g.nombre.toLowerCase() === nombreLimpio.toLowerCase() &&
      g.id !== this.gradoEditando
    );

    if (duplicado) {
      this.error = 'Ya existe ese grado en el nivel seleccionado.';
      return;
    }

    if (this.gradoEditando) {
      const actualizado = this.gradoService.actualizar(
        this.gradoEditando,
        { nombre: nombreLimpio, nivel: this.nivel }
      );

      if (!actualizado) {
        this.error = 'No se encontró el grado que intentas editar.';
        return;
      }

      this.mensaje = 'Grado actualizado correctamente.';
    } else {
      this.gradoService.crear({
        nombre: nombreLimpio,
        nivel: this.nivel
      });

      this.mensaje = 'Grado registrado correctamente.';
    }

    this.cancelarEdicion();
  }

  editar(grado: Grado): void {
    this.gradoEditando = grado.id;
    this.nombre = grado.nombre;
    this.nivel = grado.nivel;
    this.mensaje = '';
    this.error = '';
  }

  eliminar(grado: Grado): void {
    const confirmado = confirm(
      `¿Seguro que deseas eliminar "${grado.nombre}" de ${grado.nivel}?`
    );

    if (!confirmado) {
      return;
    }

    if (this.gradoService.eliminar(grado.id)) {
      this.mensaje = 'Grado eliminado correctamente.';
      this.error = '';

      if (this.gradoEditando === grado.id) {
        this.cancelarEdicion();
      }
    }
  }

  cancelarEdicion(): void {
    this.gradoEditando = null;
    this.nombre = '';
    this.nivel = 'Primaria';
  }
}
