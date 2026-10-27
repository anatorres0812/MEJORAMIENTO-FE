
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Competencia } from '../models/competencia.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompetenciaService {
  private readonly apiUrl = `${environment.apiUrl}/competency`;

  private http = inject(HttpClient);

  listarTodas(): Observable<Competencia[]> {
    return this.http.get<Competencia[]>(this.apiUrl);
  }

  listarActivas(): Observable<Competencia[]> {
    return this.http.get<Competencia[]>(`${this.apiUrl}/activas`);
  }

  listarPorNivel(
    nivel: 'Inicial' | 'Primaria' | 'Secundaria'
  ): Observable<Competencia[]> {
    return this.http.get<Competencia[]>(
      `${this.apiUrl}/nivel/${encodeURIComponent(nivel)}`
    );
  }

  buscarPorId(id: number): Observable<Competencia> {
    return this.http.get<Competencia>(`${this.apiUrl}/${id}`);
  }

  registrar(
    competencia: Omit<Competencia, 'id'>
  ): Observable<Competencia> {
    return this.http.post<Competencia>(this.apiUrl, competencia);
  }

  actualizar(
    id: number,
    competencia: Omit<Competencia, 'id'>
  ): Observable<Competencia> {
    return this.http.put<Competencia>(
      `${this.apiUrl}/${id}`,
      competencia
    );
  }

  cambiarEstado(id: number, estado: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.apiUrl}/${id}/estado?estado=${estado}`,
      null
    );
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
