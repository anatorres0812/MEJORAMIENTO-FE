import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Profesor, ProfesorForm } from '../interfaces/profesor.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ProfesoresService {

  private readonly url = `${environment.apiUrl}/teacher`;
  private datos = signal<Profesor[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: {
    busqueda?: string;
    estado?: string;
    especialidad?: string;
  }): Observable<Profesor[]> {
    let params = new HttpParams();

    // Enviar todos los filtros disponibles
    if (filtros?.busqueda)    params = params.set('busqueda',    filtros.busqueda);
    if (filtros?.especialidad) params = params.set('especialidad', filtros.especialidad);

    const endpoint = filtros?.estado === 'ACTIVO'
      ? `${this.url}/activos`
      : filtros?.estado === 'INACTIVO'
        ? `${this.url}/inactivos`
        : this.url;

    return this.http.get<unknown>(endpoint, { params }).pipe(
      map(r => extractArray<Profesor>(r)),
      tap(data => this.datos.set(data))
    );
  }

  listarEliminados(): Observable<Profesor[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Profesor>(r)),
      tap(data => this.datos.set(data))
    );
  }

  obtener(id: number): Observable<Profesor> {
    return this.http.get<Profesor>(`${this.url}/${id}`);
  }

  crear(form: ProfesorForm): Observable<Profesor> {
    return this.http.post<Profesor>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: ProfesorForm): Observable<Profesor> {
    return this.http.put<Profesor>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(p => p.id === id ? act : p)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(p =>
            p.id === id ? { ...p, estado: 'ELIMINADO' as const } : p
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Profesor> {
    return this.http.patch<Profesor>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(p => p.id === id ? act : p)))
    );
  }

  getDatos() { return this.datos; }
}
