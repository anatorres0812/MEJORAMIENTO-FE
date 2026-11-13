import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Matricula, MatriculaForm } from '../interfaces/matricula.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class MatriculasService {
  private readonly url = `${environment.apiUrl}/enrollment`;
  private datos = signal<Matricula[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: { periodoId?: number; estudianteId?: number; anio?: number }): Observable<Matricula[]> {
    let params = new HttpParams();
    if (filtros?.periodoId)    params = params.set('periodoId',    String(filtros.periodoId));
    if (filtros?.estudianteId) params = params.set('estudianteId', String(filtros.estudianteId));
    if (filtros?.anio)         params = params.set('anio',         String(filtros.anio));
    return this.http.get<unknown>(this.url, { params }).pipe(
      map(r => extractArray<Matricula>(r)),
      tap(d => this.datos.set(d))
    );
  }

  listarEliminados(): Observable<Matricula[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Matricula>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Matricula> {
    return this.http.get<Matricula>(`${this.url}/${id}`);
  }

  crear(form: MatriculaForm): Observable<Matricula> {
    return this.http.post<Matricula>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: Partial<MatriculaForm>): Observable<Matricula> {
    return this.http.put<Matricula>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(m => m.id === id ? act : m)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(m =>
            m.id === id ? { ...m, estado: 'ELIMINADO' as const } : m
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Matricula> {
    return this.http.patch<Matricula>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(m => m.id === id ? act : m)))
    );
  }

  getDatos() { return this.datos; }
}
