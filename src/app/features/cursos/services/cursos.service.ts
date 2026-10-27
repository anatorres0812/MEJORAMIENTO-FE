import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Curso, CursoForm } from '../interfaces/curso.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CursosService {

  private readonly url = `${environment.apiUrl}/course`;
  private datos = signal<Curso[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: { nivel?: string; estado?: string }): Observable<Curso[]> {
    let params = new HttpParams();
    if (filtros?.nivel) params = params.set('nivel', filtros.nivel);

    const endpoint = filtros?.estado === 'ACTIVO'
      ? `${this.url}/activos`
      : filtros?.estado === 'INACTIVO'
        ? `${this.url}/inactivos`
        : this.url;

    return this.http.get<unknown>(endpoint, { params }).pipe(
      map(r => extractArray<Curso>(r)),
      tap(d => this.datos.set(d))
    );
  }

  listarEliminados(): Observable<Curso[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Curso>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.url}/${id}`);
  }

  crear(form: CursoForm): Observable<Curso> {
    return this.http.post<Curso>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: CursoForm): Observable<Curso> {
    return this.http.put<Curso>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(c => c.id === id ? act : c)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(c =>
            c.id === id ? { ...c, estado: 'ELIMINADO' as const } : c
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Curso> {
    return this.http.patch<Curso>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(c => c.id === id ? act : c)))
    );
  }

  getDatos() { return this.datos; }
}
