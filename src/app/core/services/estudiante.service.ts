
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Nivel } from '../models/nivel.model';
import { Estudiante } from '../models/estudiante.model';
import { ActividadService } from './actividad.service';
import { ESTUDIANTES } from '../mock-data/estudiantes.mock';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private readonly apiUrl = `${environment.apiUrl}/student`;
  private readonly http = inject(HttpClient);
  private readonly actividadService = inject(ActividadService);

  // Los estudiantes de prueba están disponibles desde el inicio.
  private readonly lista = signal<Estudiante[]>(ESTUDIANTES);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');

  constructor() {
    this.cargarDesdeApi();
  }

  cargarDesdeApi(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.http.get<any>(this.apiUrl).subscribe({
      next: respuesta => {
        const datos = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.value ?? [];

        this.lista.set(
          datos.map((estudiante: Estudiante) => ({
            ...estudiante,
            id: estudiante.id,
            codigoEstudiante: estudiante.codigoEstudiante ?? '',
            estado: estudiante.estado ?? 'Activo'
          }))
        );

        console.log(
          'Estudiantes recibidos del backend:',
          this.lista()
        );

        console.table(
          this.lista().map(e => ({
            id: e.id,
            codigo: e.codigoEstudiante,
            nombre: `${e.nombres} ${e.apellidos}`,
            nivel: e.nivel,
            gradoId: e.gradoId,
            seccionId: e.seccionId,
            estado: e.estado
          }))
        );

        this.cargando.set(false);
      },

      error: error => {
        console.error('Error al cargar estudiantes:', error);

        // Si el backend falla, conservamos los datos de prueba.
        this.lista.set(ESTUDIANTES);

        this.errorCarga.set(
          'No se pudo conectar con el servidor. Se están utilizando datos de prueba.'
        );

        console.warn(
          'Se están utilizando estudiantes de prueba:',
          this.lista()
        );

        this.cargando.set(false);
      }
    });
  }

  getTodos(): Estudiante[] {
    return this.lista();
  }

  getPorId(
    estudianteId: string | number
  ): Estudiante | undefined {
    return this.lista().find(
      estudiante => String(estudiante.id) === String(estudianteId)
    );
  }

  getPorNivelGradoSeccion(
    nivel: Nivel,
    gradoId: string,
    seccionId: string
  ): Estudiante[] {
    const normalizar = (valor: unknown): string =>
      String(valor ?? '').trim().toLowerCase();

    // Admite identificadores de grado como s-1, p-1 o 1.
    const normalizarGrado = (valor: unknown): string => {
      const id = normalizar(valor);
      return id.replace(/^[a-z]-/, '');
    };

    // Admite identificadores de sección como s-1-A o simplemente A.
    const normalizarSeccion = (valor: unknown): string => {
      const id = normalizar(valor);
      return id.split('-').pop() ?? '';
    };

    const resultado = this.lista().filter(estudiante => {
      const mismoNivel =
        normalizar(estudiante.nivel) === normalizar(nivel);

      const mismoGrado =
        normalizarGrado(estudiante.gradoId) ===
        normalizarGrado(gradoId);

      const mismaSeccion =
        normalizarSeccion(estudiante.seccionId) ===
        normalizarSeccion(seccionId);

      const activo =
        normalizar(estudiante.estado) !== 'inactivo';

      return mismoNivel && mismoGrado && mismaSeccion && activo;
    });

    console.log('FILTRO ACADÉMICO:', {
      nivel,
      gradoId,
      seccionId,
      estudiantesEncontrados: resultado.length,
      estudiantes: resultado
    });

    return resultado;
  }

  crear(datos: Omit<Estudiante, 'id'>): Estudiante {
    const codigoEstudiante = String(
      datos.codigoEstudiante ?? ''
    ).trim();

    if (!codigoEstudiante) {
      throw new Error('El código de estudiante es obligatorio.');
    }

    const nuevo: Estudiante = {
      ...datos,
      codigoEstudiante,
      id: `pendiente-${codigoEstudiante}`
    };

    this.lista.update(estudiantes => [...estudiantes, nuevo]);

    this.http.post<Estudiante>(this.apiUrl, {
      ...datos,
      codigoEstudiante
    }).subscribe({
      next: creado => {
        this.lista.update(estudiantes =>
          estudiantes.map(estudiante =>
            String(estudiante.id) === String(nuevo.id)
              ? {
                  ...creado,
                  codigoEstudiante: creado.codigoEstudiante ?? ''
                }
              : estudiante
          )
        );

        this.actividadService.registrar(
          `Se registró al estudiante ${creado.nombres} ${creado.apellidos}.`,
          creado.nivel
        );
      },

      error: error => {
        console.error('Error al registrar estudiante:', error);

        this.lista.update(estudiantes =>
          estudiantes.filter(
            estudiante => String(estudiante.id) !== String(nuevo.id)
          )
        );

        this.errorCarga.set(
          'No se pudo registrar el estudiante. Verifica sus datos y el servidor.'
        );
      }
    });

    return nuevo;
  }

  actualizar(
    estudianteId: string,
    datos: Omit<Estudiante, 'id'>
  ): Estudiante {
    const anterior = this.getPorId(estudianteId);

    if (!anterior) {
      throw new Error('No se encontró el estudiante a actualizar.');
    }

    const actualizado: Estudiante = {
      ...anterior,
      ...datos,
      codigoEstudiante: String(datos.codigoEstudiante ?? '').trim()
    };

    this.lista.update(estudiantes =>
      estudiantes.map(estudiante =>
        String(estudiante.id) === String(estudianteId)
          ? actualizado
          : estudiante
      )
    );

    this.http.put<Estudiante>(
      `${this.apiUrl}/${encodeURIComponent(estudianteId)}`,
      actualizado
    ).subscribe({
      next: respuesta => {
        this.lista.update(estudiantes =>
          estudiantes.map(estudiante =>
            String(estudiante.id) === String(estudianteId)
              ? {
                  ...respuesta,
                  codigoEstudiante: respuesta.codigoEstudiante ?? ''
                }
              : estudiante
          )
        );
      },

      error: error => {
        console.error('Error al actualizar estudiante:', error);
        this.cargarDesdeApi();
      }
    });

    return actualizado;
  }

  cambiarEstado(estudianteId: string): Estudiante {
    const estudiante = this.getPorId(estudianteId);

    if (!estudiante) {
      throw new Error('No se encontró el estudiante.');
    }

    const actualizado: Estudiante = {
      ...estudiante,
      estado: estudiante.estado === 'Activo' ? 'Inactivo' : 'Activo'
    };

    this.lista.update(estudiantes =>
      estudiantes.map(actual =>
        String(actual.id) === String(estudianteId)
          ? actualizado
          : actual
      )
    );

    this.http.put<Estudiante>(
      `${this.apiUrl}/${encodeURIComponent(estudianteId)}`,
      actualizado
    ).subscribe({
      next: respuesta => {
        this.lista.update(estudiantes =>
          estudiantes.map(actual =>
            String(actual.id) === String(estudianteId)
              ? {
                  ...respuesta,
                  codigoEstudiante: respuesta.codigoEstudiante ?? ''
                }
              : actual
          )
        );
      },

      error: error => {
        console.error('Error al cambiar estado:', error);
        this.cargarDesdeApi();
      }
    });

    return actualizado;
  }
}
