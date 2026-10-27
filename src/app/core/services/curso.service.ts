
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Nivel } from '../models/nivel.model';
import { Curso } from '../models/curso.model';
import { ActividadService } from './actividad.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private readonly apiUrl = `${environment.apiUrl}/course`;

  private readonly http = inject(HttpClient);
  private readonly actividadService = inject(ActividadService);

  private readonly cursosSignal = signal<Curso[]>([]);
  readonly cursosActuales = this.cursosSignal.asReadonly();

  constructor() {
    this.cargarDesdeBackend();
  }

cargarDesdeBackend(): void {
  this.http.get<any>(this.apiUrl).subscribe({
    next: respuesta => {
      const datos = Array.isArray(respuesta)
        ? respuesta
        : respuesta?.value ?? [];

      const cursos: Curso[] = datos.map((c: any) => ({
        id: String(c.id),
        nombre: c.nombre,
        nivel: c.nivel as Nivel,
        descripcion: c.descripcion,
        horasSemanales: c.horasSemanales,
        profesorId: c.profesorId,
        estado: c.estado
      }));

      this.cursosSignal.set(cursos);

      console.log('Cursos cargados desde el backend:', cursos);
    },
    error: error => {
      console.error(
        'Error al cargar cursos del backend:',
        error
      );
    }
  });
}


  getTodos(): Curso[] {
    return this.cursosSignal();
  }

  getPorNivel(nivel: Nivel): Curso[] {
    return this.cursosSignal().filter(c =>
      c.nivel === nivel && c.estado !== 'Inactivo'
    );
  }

  getPorId(cursoId: string): Curso | undefined {
    return this.cursosSignal().find(c => c.id === String(cursoId));
  }

  getPorIds(cursoIds: string[]): Curso[] {
    const ids = cursoIds.map(String);
    return this.cursosSignal().filter(c => ids.includes(c.id));
  }

  getPorProfesor(profesorId: number): Curso[] {
    return this.cursosSignal().filter(c =>
      Number(c.profesorId) === profesorId &&
      c.estado !== 'Inactivo'
    );
  }

  crear(nombre: string, nivel: Nivel): Curso {
    throw new Error(
      'La creación de cursos debe realizarse mediante el CRUD conectado al backend.'
    );
  }

  actualizar(cursoId: string, nombre: string): Curso {
    throw new Error(
      'La actualización de cursos debe realizarse mediante el CRUD conectado al backend.'
    );
  }
}
