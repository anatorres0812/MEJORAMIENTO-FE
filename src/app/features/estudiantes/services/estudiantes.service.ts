import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Estudiante, EstudianteForm } from '../interfaces/estudiante.interface';
import { NivelEducativo } from '../../../shared/interfaces';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {

  private readonly url = `${environment.apiUrl}/student`;
  private datos = signal<Estudiante[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: {
    busqueda?: string;
    nivel?: NivelEducativo;
    gradoId?: number;
    estado?: string;
  }): Observable<Estudiante[]> {
    let params = new HttpParams();

    // Enviar todos los filtros que el backend pueda procesar
    if (filtros?.busqueda)  params = params.set('busqueda',  filtros.busqueda);
    if (filtros?.nivel)     params = params.set('nivel',     filtros.nivel);
    if (filtros?.gradoId)   params = params.set('gradoId',   String(filtros.gradoId));

    const endpoint = filtros?.estado === 'ACTIVO'
      ? `${this.url}/activos`
      : filtros?.estado === 'INACTIVO'
        ? `${this.url}/inactivos`
        : this.url;

    return this.http.get<unknown>(endpoint, { params }).pipe(
      map(r => extractArray<Estudiante>(r)),
      tap(data => this.datos.set(data))
    );
  }

  listarEliminados(): Observable<Estudiante[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Estudiante>(r)),
      tap(data => this.datos.set(data))
    );
  }

  obtener(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.url}/${id}`);
  }

  crear(form: EstudianteForm): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: EstudianteForm): Observable<Estudiante> {
    return this.http.put<Estudiante>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(e => e.id === id ? act : e)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(e =>
            e.id === id ? { ...e, estado: 'ELIMINADO' as const } : e
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Estudiante> {
    return this.http.patch<Estudiante>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(e => e.id === id ? act : e)))
    );
  }

  getDatos() { return this.datos; }
}
