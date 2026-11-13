import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Calificacion, Periodo } from '../models/nota.model';
import { environment } from '../../../environments/environment';

export interface NotaBackend {
  id: number;
  estudianteId: number;
  cursoId: number;
  periodo: Periodo;
  calificacion: Calificacion;
  observacion?: string | null;
  fechaEdicion?: string;
}

export interface NotaBackendCrear {
  estudianteId: number;
  cursoId: number;
  periodo: Periodo;
  calificacion: Calificacion;
  observacion?: string;
}

interface RespuestaLista<T> {
  value: T[];
  Count: number;
}

@Injectable({ providedIn: 'root' })
export class NotasApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/grade-record`;

  listar(): Observable<NotaBackend[]> {
    return this.http.get<NotaBackend[] | RespuestaLista<NotaBackend>>(
      this.apiUrl
    ).pipe(
      map(respuesta =>
        Array.isArray(respuesta) ? respuesta : respuesta.value ?? []
      )
    );
  }

  buscarPorId(id: number): Observable<NotaBackend> {
    return this.http.get<NotaBackend>(`${this.apiUrl}/${id}`);
  }

  crear(datos: NotaBackendCrear): Observable<NotaBackend> {
    return this.http.post<NotaBackend>(this.apiUrl, datos);
  }

  actualizar(
    id: number,
    datos: NotaBackendCrear
  ): Observable<NotaBackend> {
    return this.http.put<NotaBackend>(`${this.apiUrl}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}