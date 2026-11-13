import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Nivel } from '../models/nivel.model';
import { Grado } from '../models/grado.model';
import { Seccion } from '../models/seccion.model';
import { GRADOS } from '../mock-data/grados.mock';
import { SECCIONES } from '../mock-data/secciones.mock';
import { ActividadService } from './actividad.service';
import { environment } from '../../../environments/environment';
import { cargarDesdeStorage, guardarEnStorage } from '../../shared/utils/storage.util';

const CLAVE_GRADOS = 'rla_grados';
const CLAVE_SECCIONES = 'rla_secciones';

@Injectable({ providedIn: 'root' })
export class AcademicoService {
  private readonly apiUrl = environment.apiUrl;

  private readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];

  private grados: Grado[] = cargarDesdeStorage<Grado>(
    CLAVE_GRADOS,
    GRADOS
  );

  private secciones: Seccion[] = cargarDesdeStorage<Seccion>(
    CLAVE_SECCIONES,
    SECCIONES
  );

  constructor(
    private http: HttpClient,
    private actividadService: ActividadService
  ) {
    console.log('Grados académicos:', this.grados);
    console.log('Secciones académicas:', this.secciones);
  }

  // ── Métodos HTTP (API REST) ──────────────────────────────

  listarGradosApi(): Observable<Grado[]> {
    return this.http.get<Grado[]>(`${this.apiUrl}/grade`);
  }

  listarSeccionesApi(): Observable<Seccion[]> {
    return this.http.get<Seccion[]>(`${this.apiUrl}/section`);
  }

  crearGradoApi(grado: Omit<Grado, 'id'>): Observable<Grado> {
    return this.http.post<Grado>(`${this.apiUrl}/grade`, grado);
  }

  actualizarGradoApi(gradoId: string, grado: Partial<Grado>): Observable<Grado> {
    return this.http.put<Grado>(`${this.apiUrl}/grade/${gradoId}`, grado);
  }

  crearSeccionApi(seccion: Omit<Seccion, 'id'>): Observable<Seccion> {
    return this.http.post<Seccion>(`${this.apiUrl}/section`, seccion);
  }

  actualizarSeccionApi(seccionId: string, seccion: Partial<Seccion>): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.apiUrl}/section/${seccionId}`, seccion);
  }

  // ── Storage local (existentes) ──────────────────────────

private guardarGrados(): void {
  guardarEnStorage(CLAVE_GRADOS, this.grados);
}

  private guardarSecciones(): void {
    guardarEnStorage(CLAVE_SECCIONES, this.secciones);
  }

  getNiveles(): Nivel[] {
    return this.niveles;
  }

  getGradosPorNivel(nivel: Nivel): Grado[] {
    return this.grados.filter(g => g.nivel === nivel);
  }

  getGradoPorId(gradoId: string): Grado | undefined {
    return this.grados.find(g => g.id === gradoId);
  }

  getSeccionesPorGrado(gradoId: string): Seccion[] {
    return this.secciones.filter(s => s.gradoId === gradoId);
  }

  getSeccionPorId(seccionId: string): Seccion | undefined {
    return this.secciones.find(s => s.id === seccionId);
  }

  contarSeccionesPorNivel(nivel: Nivel): number {
    const grados = this.getGradosPorNivel(nivel);
    return grados.reduce((total, grado) => total + this.getSeccionesPorGrado(grado.id).length, 0);
  }

  crearGrado(nombre: string, nivel: Nivel): Grado {
    const nuevoGrado: Grado = {
      id: 'grado-' + Date.now(),
      nombre,
      nivel,
    };
    this.grados.push(nuevoGrado);
    this.guardarGrados();
    this.actividadService.registrar(`Se creó el grado "${nombre}".`, nivel);
    return nuevoGrado;
  }

  actualizarGrado(gradoId: string, nombre: string): Grado {
    const grado = this.getGradoPorId(gradoId);
    if (!grado) {
      throw new Error('No se encontró el grado a actualizar.');
    }
    grado.nombre = nombre;
    this.guardarGrados();
    this.actividadService.registrar(`Se actualizó el grado a "${nombre}".`, grado.nivel);
    return grado;
  }

  crearSeccion(nombre: string, gradoId: string): Seccion {
    const grado = this.getGradoPorId(gradoId);
    const nuevaSeccion: Seccion = {
      id: 'seccion-' + Date.now(),
      nombre,
      gradoId,
    };
    this.secciones.push(nuevaSeccion);
    this.guardarSecciones();
    if (grado) {
      this.actividadService.registrar(`Se creó la sección "${nombre}" en ${grado.nombre}.`, grado.nivel);
    }
    return nuevaSeccion;
  }

  actualizarSeccion(seccionId: string, nombre: string): Seccion {
    const seccion = this.getSeccionPorId(seccionId);
    if (!seccion) {
      throw new Error('No se encontró la sección a actualizar.');
    }
    seccion.nombre = nombre;
    this.guardarSecciones();
    const grado = this.getGradoPorId(seccion.gradoId);
    if (grado) {
      this.actividadService.registrar(`Se actualizó la sección a "${nombre}".`, grado.nivel);
    }
    return seccion;

    
  }
}