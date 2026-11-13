import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, map, of } from 'rxjs';
import { Grado, Seccion } from '../interfaces/grado.interface';
import { NivelEducativo } from '../../../shared/interfaces';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

// ── Datos locales de respaldo ────────────────────────────────────────────────
// Se usan cuando el backend no está disponible.
// Los IDs están en formato numérico para ser compatibles con la interfaz del feature.

const NIVEL_MAP: Record<string, NivelEducativo> = {
  inicial:    'INICIAL',
  primaria:   'PRIMARIA',
  secundaria: 'SECUNDARIA',
};

function normalizeNivel(n: string): NivelEducativo {
  return NIVEL_MAP[n.toLowerCase()] ?? 'PRIMARIA';
}

// Grados locales ordenados por nivel
const GRADOS_FALLBACK: Grado[] = [
  // Inicial
  { id: 1,  nombre: '3 años',         nivel: 'INICIAL',    orden: 1, estado: 'ACTIVO' },
  { id: 2,  nombre: '4 años',         nivel: 'INICIAL',    orden: 2, estado: 'ACTIVO' },
  { id: 3,  nombre: '5 años',         nivel: 'INICIAL',    orden: 3, estado: 'ACTIVO' },
  // Primaria
  { id: 4,  nombre: '1.º Primaria',   nivel: 'PRIMARIA',   orden: 1, estado: 'ACTIVO' },
  { id: 5,  nombre: '2.º Primaria',   nivel: 'PRIMARIA',   orden: 2, estado: 'ACTIVO' },
  { id: 6,  nombre: '3.º Primaria',   nivel: 'PRIMARIA',   orden: 3, estado: 'ACTIVO' },
  { id: 7,  nombre: '4.º Primaria',   nivel: 'PRIMARIA',   orden: 4, estado: 'ACTIVO' },
  { id: 8,  nombre: '5.º Primaria',   nivel: 'PRIMARIA',   orden: 5, estado: 'ACTIVO' },
  { id: 9,  nombre: '6.º Primaria',   nivel: 'PRIMARIA',   orden: 6, estado: 'ACTIVO' },
  // Secundaria
  { id: 10, nombre: '1.º Secundaria', nivel: 'SECUNDARIA', orden: 1, estado: 'ACTIVO' },
  { id: 11, nombre: '2.º Secundaria', nivel: 'SECUNDARIA', orden: 2, estado: 'ACTIVO' },
  { id: 12, nombre: '3.º Secundaria', nivel: 'SECUNDARIA', orden: 3, estado: 'ACTIVO' },
  { id: 13, nombre: '4.º Secundaria', nivel: 'SECUNDARIA', orden: 4, estado: 'ACTIVO' },
  { id: 14, nombre: '5.º Secundaria', nivel: 'SECUNDARIA', orden: 5, estado: 'ACTIVO' },
];

// Secciones locales: A, B, C para cada grado
const SECCIONES_FALLBACK: Seccion[] = GRADOS_FALLBACK.flatMap(g =>
  ['A', 'B', 'C'].map((letra, i) => ({
    id: (g.id - 1) * 3 + i + 1,
    nombre: `Sección ${letra}`,
    gradoId: g.id,
    nivel: g.nivel,
    capacidad: 30,
    turno: 'MANANA' as const,
    estado: 'ACTIVO' as const,
  }))
);
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class GradosService {

  private readonly gradosUrl    = `${environment.apiUrl}/grade`;
  private readonly seccionesUrl = `${environment.apiUrl}/section`;

  private gradosDatos    = signal<Grado[]>([]);
  private seccionesDatos = signal<Seccion[]>([]);

  constructor(private http: HttpClient) {}

  // ── GRADOS ──────────────────────────────────────────────
  listarGrados(nivel?: string): Observable<Grado[]> {
    const url = nivel
      ? `${this.gradosUrl}/nivel/${nivel}`
      : `${this.gradosUrl}/activos`;

    return this.http.get<unknown>(url).pipe(
      map(r => extractArray<Grado>(r)),
      tap(d => this.gradosDatos.set(d ?? [])),
      catchError(err => {
        console.warn('Backend de grados no disponible, usando datos locales.', err);
        const fallback = nivel
          ? GRADOS_FALLBACK.filter(g => g.nivel === normalizeNivel(nivel))
          : GRADOS_FALLBACK;
        this.gradosDatos.set(fallback);
        return of(fallback);
      })
    );
  }

  listarGradosEliminados(): Observable<Grado[]> {
    return this.http.get<unknown>(`${this.gradosUrl}/eliminados`).pipe(
      map(r => extractArray<Grado>(r)),
      tap(d => this.gradosDatos.set(d ?? [])),
      catchError(() => of([]))
    );
  }

  obtenerGrado(id: number): Observable<Grado> {
    return this.http.get<Grado>(`${this.gradosUrl}/${id}`);
  }

  crearGrado(data: Partial<Grado>): Observable<Grado> {
    return this.http.post<Grado>(this.gradosUrl, data).pipe(
      tap(nuevo => this.gradosDatos.update(list => [...list, nuevo]))
    );
  }

  editarGrado(id: number, data: Partial<Grado>): Observable<Grado> {
    return this.http.put<Grado>(`${this.gradosUrl}/${id}`, data).pipe(
      tap(act => this.gradosDatos.update(list => list.map(g => g.id === id ? act : g)))
    );
  }

  eliminarGrado(id: number): Observable<Grado> {
    return this.http.delete<Grado>(`${this.gradosUrl}/${id}`).pipe(
      tap(() => this.gradosDatos.update(list => list.filter(g => g.id !== id)))
    );
  }

  restaurarGrado(id: number): Observable<Grado> {
    return this.http.patch<Grado>(`${this.gradosUrl}/${id}/restaurar`, {}).pipe(
      tap(act => this.gradosDatos.update(list => list.map(g => g.id === id ? act : g)))
    );
  }

  getGradosDatos() { return this.gradosDatos; }

  // ── SECCIONES ────────────────────────────────────────────
  listarSecciones(gradoId?: number): Observable<Seccion[]> {
    const url = gradoId
      ? `${this.seccionesUrl}/grado/${gradoId}`
      : `${this.seccionesUrl}/activos`;

    return this.http.get<unknown>(url).pipe(
      map(r => extractArray<Seccion>(r)),
      tap(d => this.seccionesDatos.set(d ?? [])),
      catchError(err => {
        console.warn('Backend de secciones no disponible, usando datos locales.', err);
        const fallback = gradoId
          ? SECCIONES_FALLBACK.filter(s => String(s.gradoId) === String(gradoId))
          : SECCIONES_FALLBACK;
        this.seccionesDatos.set(fallback);
        return of(fallback);
      })
    );
  }

  listarSeccionesEliminadas(): Observable<Seccion[]> {
    return this.http.get<unknown>(`${this.seccionesUrl}/eliminados`).pipe(
      map(r => extractArray<Seccion>(r)),
      tap(d => this.seccionesDatos.set(d ?? [])),
      catchError(() => of([]))
    );
  }

  obtenerSeccion(id: number): Observable<Seccion> {
    return this.http.get<Seccion>(`${this.seccionesUrl}/${id}`);
  }

  crearSeccion(data: Partial<Seccion>): Observable<Seccion> {
    return this.http.post<Seccion>(this.seccionesUrl, data).pipe(
      tap(nuevo => this.seccionesDatos.update(list => [...list, nuevo]))
    );
  }

  editarSeccion(id: number, data: Partial<Seccion>): Observable<Seccion> {
    return this.http.put<Seccion>(`${this.seccionesUrl}/${id}`, data).pipe(
      tap(act => this.seccionesDatos.update(list => list.map(s => s.id === id ? act : s)))
    );
  }

  eliminarSeccion(id: number): Observable<Seccion> {
    return this.http.delete<Seccion>(`${this.seccionesUrl}/${id}`).pipe(
      tap(() => this.seccionesDatos.update(list => list.filter(s => s.id !== id)))
    );
  }

  restaurarSeccion(id: number): Observable<Seccion> {
    return this.http.patch<Seccion>(`${this.seccionesUrl}/${id}/restaurar`, {}).pipe(
      tap(act => this.seccionesDatos.update(list => list.map(s => s.id === id ? act : s)))
    );
  }

  getSeccionesDatos() { return this.seccionesDatos; }
}
