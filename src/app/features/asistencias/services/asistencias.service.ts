import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Asistencia, AsistenciaForm, FiltroAsistencia } from '../interfaces/asistencia.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AsistenciasService {

  private readonly url = `${environment.apiUrl}/attendance`;
  private datos = signal<Asistencia[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: FiltroAsistencia): Observable<Asistencia[]> {
    let params = new HttpParams();

    // Enviar todos los filtros disponibles al backend
    if (filtros?.nivelEducativo) params = params.set('nivelEducativo', filtros.nivelEducativo);
    if (filtros?.gradoId)        params = params.set('gradoId',        String(filtros.gradoId));
    if (filtros?.seccionId)      params = params.set('seccionId',      String(filtros.seccionId));
    if (filtros?.cursoId)        params = params.set('cursoId',        String(filtros.cursoId));
    if (filtros?.periodoId)      params = params.set('periodoId',      String(filtros.periodoId));
    if (filtros?.fecha)          params = params.set('fecha',          filtros.fecha);
    if (filtros?.estudianteId)   params = params.set('estudianteId',   String(filtros.estudianteId));

    return this.http.get<unknown>(this.url, { params }).pipe(
      map(r => extractArray<Asistencia>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Asistencia> {
    return this.http.get<Asistencia>(`${this.url}/${id}`);
  }

  crear(form: AsistenciaForm): Observable<Asistencia> {
    return this.http.post<Asistencia>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  editar(id: number, form: Partial<AsistenciaForm>): Observable<Asistencia> {
    return this.http.put<Asistencia>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(a => a.id === id ? act : a)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(a =>
            a.id === id ? { ...a, estado: 'ELIMINADO' as const } : a
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Asistencia> {
    return this.http.patch<Asistencia>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(a => a.id === id ? act : a)))
    );
  }

  getDatos() { return this.datos; }
}
