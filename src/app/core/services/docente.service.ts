
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { Docente } from '../models/docente.model';
import { Curso } from '../models/curso.model';
import { Nivel } from '../models/nivel.model';

import { DOCENTES } from '../mock-data/docentes.mock';

import { CursoService } from './curso.service';
import { ActividadService } from './actividad.service';

import {
  cargarDesdeStorage,
  guardarEnStorage
} from '../../shared/utils/storage.util';
import { environment } from '../../../environments/environment';

const CLAVE_STORAGE = 'rla_docentes';

interface DocenteApi {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  dni?: string;
  especialidad: string;
  telefono?: string;
  estado: boolean;
}

interface CursoApi {
  id: number;
  nivel: Nivel;
  profesorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocenteService {
  private readonly apiUrl = `${environment.apiUrl}/teacher`;
  private readonly cursosApiUrl = `${environment.apiUrl}/course`;
  private readonly http = inject(HttpClient);
  private readonly cursoService = inject(CursoService);
  private readonly actividadService = inject(ActividadService);

  // Docentes del CRUD local o del almacenamiento.
  private docentes: Docente[] = cargarDesdeStorage(
    CLAVE_STORAGE,
    DOCENTES
  );

  // Lista del backend o respaldo local.
  private readonly docentesBackendSignal = signal<Docente[]>([
    ...this.docentes
  ]);

  readonly docentesBackend =
    this.docentesBackendSignal.asReadonly();

  constructor() {
    this.cargarDesdeBackend();
  }

  /**
   * Extrae listas de respuestas de API que pueden ser
   * arreglos directos o contener una propiedad value.
   */
  private extraerLista<T>(respuesta: any): T[] {
    if (Array.isArray(respuesta)) {
      return respuesta as T[];
    }

    if (respuesta && Array.isArray(respuesta.value)) {
      return respuesta.value as T[];
    }

    return [];
  }

  /**
   * Convierte un docente de la API al modelo de Angular.
   */
  private convertirDocente(
    docente: DocenteApi,
    cursos: CursoApi[]
  ): Docente {
    const cursosAsignados = cursos.filter(
      curso =>
        Number(curso.profesorId) === Number(docente.id)
    );

    return {
      id: String(docente.id),
      nombres: docente.nombres,
      apellidos: docente.apellidos,
      correo: docente.email,
      dni: docente.dni,
      especialidad: docente.especialidad,
      telefono: docente.telefono,
      nivel: cursosAsignados[0]?.nivel ?? 'Secundaria',
      cursosAsignados: cursosAsignados.map(
        curso => String(curso.id)
      )
    } satisfies Docente;
  }

  /**
   * Busca un docente local por correo, DNI y nivel.
   */
  private buscarDocenteLocal(
    correo: string,
    dni: string,
    nivel: Nivel
  ): Docente | null {
    const correoNormalizado = correo.trim().toLowerCase();
    const dniNormalizado = dni.trim();

    const docente = this.docentes.find(actual =>
      actual.correo.trim().toLowerCase() === correoNormalizado &&
      String(actual.dni ?? '').trim() === dniNormalizado &&
      actual.nivel === nivel
    );

    if (!docente) {
      console.warn(
        'No se encontró el docente local con el correo, DNI y nivel indicados.'
      );

      return null;
    }

    return { ...docente };
  }

  /**
   * Busca un docente por correo, DNI y nivel.
   * Si el backend no responde o no contiene el DNI,
   * intenta validar con los datos locales.
   */
  buscarDocenteBackend(
    correo: string,
    dni: string,
    nivel: Nivel
  ): Observable<Docente | null> {
    return forkJoin({
      docentes: this.http.get<any>(this.apiUrl),
      cursos: this.http.get<any>(this.cursosApiUrl)
    }).pipe(
      map(({ docentes: respuestaDocentes, cursos: respuestaCursos }) => {
        const datosDocentes =
          this.extraerLista<DocenteApi>(respuestaDocentes);

        const datosCursos =
          this.extraerLista<CursoApi>(respuestaCursos);

        const correoNormalizado = correo.trim().toLowerCase();
        const dniNormalizado = dni.trim();

        const docenteApi = datosDocentes.find(docente =>
          docente.estado === true &&
          docente.email.trim().toLowerCase() === correoNormalizado &&
          String(docente.dni ?? '').trim() === dniNormalizado
        );

        if (!docenteApi) {
          return this.buscarDocenteLocal(correo, dni, nivel);
        }

        const cursosAsignados = datosCursos.filter(curso =>
          Number(curso.profesorId) === Number(docenteApi.id) &&
          curso.nivel === nivel
        );

        // El docente debe tener cursos en el nivel seleccionado.
        if (cursosAsignados.length === 0) {
          return null;
        }

        return {
          id: String(docenteApi.id),
          nombres: docenteApi.nombres,
          apellidos: docenteApi.apellidos,
          correo: docenteApi.email,
          dni: docenteApi.dni,
          especialidad: docenteApi.especialidad,
          telefono: docenteApi.telefono,
          nivel: cursosAsignados[0].nivel,
          cursosAsignados: cursosAsignados.map(
            curso => String(curso.id)
          )
        } satisfies Docente;
      }),

      catchError(error => {
        console.error(
          'Error al consultar el docente en el backend:',
          error
        );

        return of(
          this.buscarDocenteLocal(correo, dni, nivel)
        );
      })
    );
  }

  /**
   * Carga los docentes desde el backend.
   * Si falla, conserva los docentes locales.
   */
  cargarDesdeBackend(): void {
    forkJoin({
      docentes: this.http.get<any>(this.apiUrl),
      cursos: this.http.get<any>(this.cursosApiUrl)
    }).subscribe({
      next: ({
        docentes: respuestaDocentes,
        cursos: respuestaCursos
      }) => {
        const datosDocentes =
          this.extraerLista<DocenteApi>(respuestaDocentes);

        const datosCursos =
          this.extraerLista<CursoApi>(respuestaCursos);

        const docentes = datosDocentes
          .filter(docente => docente.estado === true)
          .map(docente =>
            this.convertirDocente(docente, datosCursos)
          );

        this.docentesBackendSignal.set(docentes);

        console.log(
          'Docentes cargados desde el backend:',
          docentes
        );
      },

      error: error => {
        console.error(
          'Error al cargar docentes desde el backend:',
          error
        );

        this.docentesBackendSignal.set([
          ...this.docentes
        ]);

        console.warn(
          'Se están utilizando los docentes locales:',
          this.docentesBackendSignal()
        );
      }
    });
  }

  /**
   * Devuelve todos los docentes del CRUD local.
   */
  getTodos(): Docente[] {
    return this.docentes;
  }

  /**
   * Devuelve los docentes del backend o del respaldo local.
   */
  getTodosBackend(): Docente[] {
    return this.docentesBackendSignal();
  }

  /**
   * Carga docentes y cursos del backend.
   * En caso de error, devuelve los docentes locales.
   */
  cargarDocentesBackend(): Observable<Docente[]> {
    return forkJoin({
      docentes: this.http.get<any>(this.apiUrl),
      cursos: this.http.get<any>(this.cursosApiUrl)
    }).pipe(
      map(({ docentes: respuestaDocentes, cursos: respuestaCursos }) => {
        const datosDocentes =
          this.extraerLista<DocenteApi>(respuestaDocentes);

        const datosCursos =
          this.extraerLista<CursoApi>(respuestaCursos);

        const docentes = datosDocentes
          .filter(docente => docente.estado === true)
          .map(docente =>
            this.convertirDocente(docente, datosCursos)
          );

        this.docentesBackendSignal.set(docentes);

        console.log('Docentes cargados:', docentes);

        return docentes;
      }),

      catchError(error => {
        console.error(
          'Error al cargar docentes:',
          error
        );

        const respaldo = [...this.docentes];

        this.docentesBackendSignal.set(respaldo);

        return of(respaldo);
      })
    );
  }

  /**
   * Busca un docente por su ID del backend.
   */
  getPorIdBackend(
    docenteId: string | number
  ): Docente | undefined {
    const id = String(docenteId ?? '')
      .replace(/^sesion-/, '')
      .trim();

    return this.docentesBackendSignal().find(
      docente => String(docente.id) === id
    );
  }

  /**
   * Busca un docente en el CRUD local.
   */
  getPorId(docenteId: string): Docente | undefined {
    const id = String(docenteId ?? '').trim();

    if (!id) {
      return undefined;
    }

    const exacto = this.docentes.find(
      docente => String(docente.id).trim() === id
    );

    if (exacto) {
      return exacto;
    }

    const normalizado = id.replace(/^sesion-/, '');

    return this.docentes.find(
      docente =>
        String(docente.id).trim() === normalizado
    );
  }

  /**
   * Obtiene los cursos del docente local.
   */
  getCursosDelDocente(docenteId: string): Curso[] {
    const docente = this.getPorId(docenteId);

    if (!docente) {
      return [];
    }

    return this.cursoService.getPorIds(
      docente.cursosAsignados
    );
  }

  /**
   * Obtiene los cursos del docente del backend.
   */
  getCursosBackendDelDocente(
    docenteId: string | number
  ): Curso[] {
    const id = Number(
      String(docenteId).replace(/^sesion-/, '')
    );

    return this.cursoService.getTodos().filter(
      curso =>
        Number(curso.profesorId) === id &&
        curso.estado !== 'Inactivo'
    );
  }

  /**
   * Registra un docente en el CRUD local.
   */
  crear(datos: Omit<Docente, 'id'>): Docente {
    const nuevoDocente: Docente = {
      ...datos,
      id: 'd' + (this.docentes.length + 1) + '-' + Date.now()
    };

    this.docentes.push(nuevoDocente);

    this.guardar();

    this.docentesBackendSignal.set([
      ...this.docentes
    ]);

    this.actividadService.registrar(
      `Se registró al docente ${nuevoDocente.nombres} ${nuevoDocente.apellidos} (${nuevoDocente.especialidad}).`,
      nuevoDocente.nivel
    );

    return nuevoDocente;
  }

  /**
   * Actualiza un docente del CRUD local.
   */
  actualizar(
    docenteId: string,
    datos: Omit<Docente, 'id'>
  ): Docente {
    const docente = this.getPorId(docenteId);

    if (!docente) {
      throw new Error(
        'No se encontró el docente a actualizar.'
      );
    }

    Object.assign(docente, datos);

    this.guardar();

    this.docentesBackendSignal.set([
      ...this.docentes
    ]);

    this.actividadService.registrar(
      `Se actualizaron los datos del docente ${docente.nombres} ${docente.apellidos}.`,
      docente.nivel
    );

    return docente;
  }

  /**
   * Guarda los docentes en el almacenamiento local.
   */
  private guardar(): void {
    guardarEnStorage(
      CLAVE_STORAGE,
      this.docentes
    );
  }
}
