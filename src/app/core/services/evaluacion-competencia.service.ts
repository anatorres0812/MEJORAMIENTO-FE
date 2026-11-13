
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluacionCompetencia } from '../models/evaluacion-competencia.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionCompetenciaService {
  private readonly apiUrl = `${environment.apiUrl}/evaluaciones-competencia`;

  private readonly http = inject(HttpClient);

  listarTodas(): Observable<EvaluacionCompetencia[]> {
    return this.http.get<EvaluacionCompetencia[]>(this.apiUrl);
  }

  listarPorEstudiante(
    estudianteId: number,
    periodo?: string
  ): Observable<EvaluacionCompetencia[]> {
    let params = new HttpParams();

    if (periodo) {
      params = params.set('periodo', periodo);
    }

    return this.http.get<EvaluacionCompetencia[]>(
      `${this.apiUrl}/estudiante/${estudianteId}`,
      { params }
    );
  }

  listarPorCompetencia(
    competenciaId: number,
    periodo: string
  ): Observable<EvaluacionCompetencia[]> {
    const params = new HttpParams().set('periodo', periodo);

    return this.http.get<EvaluacionCompetencia[]>(
      `${this.apiUrl}/competencia/${competenciaId}`,
      { params }
    );
  }

  guardar(
    evaluacion: EvaluacionCompetencia
  ): Observable<EvaluacionCompetencia> {
    return this.http.post<EvaluacionCompetencia>(
      this.apiUrl,
      evaluacion
    );
  }

  actualizar(
    id: number,
    evaluacion: EvaluacionCompetencia
  ): Observable<EvaluacionCompetencia> {
    return this.http.put<EvaluacionCompetencia>(
      `${this.apiUrl}/${id}`,
      evaluacion
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
