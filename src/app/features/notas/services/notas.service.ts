import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Nota, NotaForm, FiltroNotas, NotaEstudiante } from '../interfaces/nota.interface';
import { environment } from '../../../../environments/environment';
import { extractArray } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class NotasService {

  private readonly url = `${environment.apiUrl}/grade-record`;
  private datos = signal<Nota[]>([]);

  constructor(private http: HttpClient) {}

  listar(filtros?: FiltroNotas): Observable<Nota[]> {
    let params = new HttpParams();
    // Enviar todos los filtros disponibles al backend
    if (filtros?.nivelEducativo) params = params.set('nivelEducativo', filtros.nivelEducativo);
    if (filtros?.gradoId)        params = params.set('gradoId',        String(filtros.gradoId));
    if (filtros?.seccionId)      params = params.set('seccionId',      String(filtros.seccionId));
    if (filtros?.cursoId)        params = params.set('cursoId',        String(filtros.cursoId));
    if (filtros?.periodoId)      params = params.set('periodoId',      String(filtros.periodoId));
    if (filtros?.estudianteId)   params = params.set('estudianteId',   String(filtros.estudianteId));

    return this.http.get<unknown>(this.url, { params }).pipe(
      map(r => extractArray<Nota>(r)),
      tap(d => this.datos.set(d))
    );
  }

  obtener(id: number): Observable<Nota> {
    return this.http.get<Nota>(`${this.url}/${id}`);
  }

  crear(form: NotaForm): Observable<Nota> {
    return this.http.post<Nota>(this.url, form).pipe(
      tap(nuevo => this.datos.update(list => [...list, nuevo]))
    );
  }

  crearLote(forms: NotaForm[]): Observable<Nota[]> {
    return this.http.post<unknown>(`${this.url}/lote`, forms).pipe(
      map(r => extractArray<Nota>(r)),
      tap(nuevas => this.datos.update(list => [...list, ...nuevas]))
    );
  }

  editar(id: number, form: Partial<NotaForm>): Observable<Nota> {
    return this.http.put<Nota>(`${this.url}/${id}`, form).pipe(
      tap(act => this.datos.update(list => list.map(n => n.id === id ? act : n)))
    );
  }

  eliminar(id: number): Observable<unknown> {
    return this.http.delete<unknown>(`${this.url}/${id}`).pipe(
      tap(() =>
        this.datos.update(list =>
          list.map(n =>
            n.id === id ? { ...n, estado: 'ELIMINADO' as const } : n
          )
        )
      )
    );
  }

  restaurar(id: number): Observable<Nota> {
    return this.http.patch<Nota>(`${this.url}/${id}/restaurar`, {}).pipe(
      tap(act => this.datos.update(list => list.map(n => n.id === id ? act : n)))
    );
  }

  // Agrupa notas por estudiante para la vista de grilla
  agruparPorEstudiante(notas: Nota[]): NotaEstudiante[] {
    const mapa = new Map<number, NotaEstudiante>();
    notas.forEach(nota => {
      if (!mapa.has(nota.estudianteId)) {
        mapa.set(nota.estudianteId, {
          estudianteId:     nota.estudianteId,
          estudianteNombre: nota.estudianteNombre ?? '',
          estudianteCodigo: nota.estudianteCodigo ?? '',
          competencias: []
        });
      }
      mapa.get(nota.estudianteId)!.competencias.push({
        competenciaId:     nota.competenciaId,
        competenciaNombre: nota.competenciaNombre ?? '',
        calificacion:      nota.calificacion,
        notaId:            nota.id
      });
    });
    return Array.from(mapa.values());
  }

  getDatos() { return this.datos; }
}
