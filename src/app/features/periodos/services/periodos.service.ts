import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Periodo, PeriodoForm } from '../interfaces/periodo.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PeriodosService {

  private readonly url = `${environment.apiUrl}/academic-period`;
  private datos = signal<Periodo[]>([]);

  constructor(private http: HttpClient) {}

  listar(estado?: string): Observable<Periodo[]> {
    const endpoint = estado === 'ACTIVO' ? `${this.url}/activos` : this.url;
    return this.http.get<unknown>(endpoint).pipe(
      map(r => extractArray<Periodo>(r)),
      tap(d => this.datos.set(d))
    );
  }

  listarEliminados(): Observable<Periodo[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Periodo>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.url}/${id}`);
  }

  getActivo(): Observable<Periodo> {
    return this.http.get<Periodo>(`${this.url}/activo`);
  }

  crear(form: PeriodoForm): Observable<Periodo> {
    return this.http.post<Periodo>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: PeriodoForm): Observable<Periodo> {
    return this.http.put<Periodo>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(p => p.id === id ? act : p)))
    );
  }

  activar(id: number): Observable<Periodo> {
    return this.http.patch<Periodo>(`${this.url}/${id}/activar`, {}).pipe(
      tap(() => this.listar().subscribe())
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

  restaurar(id: number): Observable<Periodo> {
    return this.http.patch<Periodo>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(p => p.id === id ? act : p)))
    );
  }

  getDatos() { return this.datos; }
}
