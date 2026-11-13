import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Competencia, CompetenciaForm } from '../interfaces/competencia.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class CompetenciasService {

  private readonly url = `${environment.apiUrl}/competency`;
  private datos = signal<Competencia[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: { cursoId?: number; nivel?: string }): Observable<Competencia[]> {
    let params = new HttpParams();
    if (filtros?.cursoId) params = params.set('cursoId', String(filtros.cursoId));
    if (filtros?.nivel)   params = params.set('nivel',   filtros.nivel);
    return this.http.get<unknown>(this.url, { params }).pipe(
      map(r => extractArray<Competencia>(r)),
      tap(d => this.datos.set(d))
    );
  }

  listarEliminados(): Observable<Competencia[]> {
    return this.http.get<unknown>(`${this.url}/eliminados`).pipe(
      map(r => extractArray<Competencia>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Competencia> {
    return this.http.get<Competencia>(`${this.url}/${id}`);
  }

  crear(form: CompetenciaForm): Observable<Competencia> {
    return this.http.post<Competencia>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: CompetenciaForm): Observable<Competencia> {
    return this.http.put<Competencia>(`${this.url}/${id}`, form).pipe(
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

  restaurar(id: number): Observable<Competencia> {
    return this.http.patch<Competencia>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(c => c.id === id ? act : c)))
    );
  }

  getDatos() { return this.datos; }
}
