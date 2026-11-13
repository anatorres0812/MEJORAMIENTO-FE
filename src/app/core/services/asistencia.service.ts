
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';

import { Asistencia, EstadoAsistencia } from '../models/asistencia.model';
import { ActividadService } from './actividad.service';
import { environment } from '../../../environments/environment';
import { DocenteService } from './docente.service';
import { CursoService } from './curso.service';
import { EstudianteService } from './estudiante.service';
import { AsistenciaDetallada } from '../../shared/interfaces/asistencia-detallada.interface';

interface AsistenciaApi {
  id: number;
  estudianteId: number;
  cursoId: number;
  docenteId: number;
  fecha: string;
  estado: EstadoAsistencia;
}

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private readonly apiUrl = `${environment.apiUrl}/attendance`;

  private readonly http = inject(HttpClient);
  private readonly actividadService = inject(ActividadService);
  private readonly docenteService = inject(DocenteService);
  private readonly cursoService = inject(CursoService);
  private readonly estudianteService = inject(EstudianteService);

  private registros: Asistencia[] = [];

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.http.get<AsistenciaApi[]>(this.apiUrl).subscribe({
      next: datos => {
        this.registros = datos.map(r => ({
          id: String(r.id),
          estudianteId: String(r.estudianteId),
          cursoId: String(r.cursoId),
          docenteId: String(r.docenteId),
          fecha: r.fecha,
          estado: r.estado
        }));
      },
      error: error => {
        console.error('No se pudieron cargar las asistencias:', error);
      }
    });
  }

  obtenerEstado(
    estudianteId: string | number,
    cursoId: string,
    fecha: string
  ): EstadoAsistencia | undefined {
    return this.registros.find(r =>
      r.estudianteId === String(estudianteId) &&
      r.cursoId === String(cursoId) &&
      r.fecha === fecha
    )?.estado;
  }

  marcar(
    estudianteId: string | number,
    cursoId: string,
    docenteId: string,
    fecha: string,
    estado: EstadoAsistencia
  ): Observable<Asistencia> {
    const estudiante = Number(estudianteId);
    const curso = Number(cursoId);
    const docente = Number(docenteId);

    if (
      !Number.isSafeInteger(estudiante) || estudiante <= 0 ||
      !Number.isSafeInteger(curso) || curso <= 0 ||
      !Number.isSafeInteger(docente) || docente <= 0
    ) {
      throw new Error(
        'El estudiante, curso y docente deben tener IDs numéricos válidos.'
      );
    }

    const existente = this.registros.find(r =>
      r.estudianteId === String(estudiante) &&
      r.cursoId === String(curso) &&
      r.fecha === fecha
    );

    const datos = {
      estudianteId: estudiante,
      cursoId: curso,
      docenteId: docente,
      fecha,
      estado
    };

    const peticion = existente
      ? this.http.put<AsistenciaApi>(
          `${this.apiUrl}/${existente.id}`,
          datos
        )
      : this.http.post<AsistenciaApi>(this.apiUrl, datos);

    return peticion.pipe(
      map(r => ({
        id: String(r.id),
        estudianteId: String(r.estudianteId),
        cursoId: String(r.cursoId),
        docenteId: String(r.docenteId),
        fecha: r.fecha,
        estado: r.estado
      })),
      tap(registro => {
        this.registros = [
          ...this.registros.filter(r => r.id !== registro.id),
          registro
        ];

        const profesorLocal = this.docenteService.getPorId(docenteId);

        if (profesorLocal) {
          this.actividadService.registrar(
            `El docente ${profesorLocal.nombres} ${profesorLocal.apellidos} registró asistencia (${estado}) el ${fecha}.`,
            profesorLocal.nivel
          );
        }
      })
    );
  }

  getPorEstudiante(
    estudianteId: string | number
  ): AsistenciaDetallada[] {
    return this.registros
      .filter(r => r.estudianteId === String(estudianteId))
      .slice()
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map(r => ({
        ...r,
        cursoNombre:
          this.cursoService.getPorId(r.cursoId)?.nombre ??
          'Curso no encontrado'
      }));
  }

  getPorDocente(docenteId: string): AsistenciaDetallada[] {
    return this.registros
      .filter(r => r.docenteId === String(docenteId))
      .slice()
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .map(r => {
        const estudiante = this.estudianteService.getPorId(r.estudianteId);

        return {
          ...r,
          cursoNombre:
            this.cursoService.getPorId(r.cursoId)?.nombre ??
            'Curso no encontrado',
          estudianteNombre: estudiante
            ? `${estudiante.nombres} ${estudiante.apellidos}`
            : 'Estudiante no encontrado'
        };
      });
  }
}
