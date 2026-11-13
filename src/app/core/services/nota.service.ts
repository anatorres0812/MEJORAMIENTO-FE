import { Injectable, inject } from '@angular/core';
import { Nota, Calificacion, EstadoNota, Periodo } from '../models/nota.model';
import { NOTAS } from '../mock-data/notas.mock';
import { CursoService } from './curso.service';
import { DocenteService } from './docente.service';
import { EstudianteService } from './estudiante.service';
import { ActividadService } from './actividad.service';
import {
  cargarDesdeStorage,
  guardarEnStorage
} from '../../shared/utils/storage.util';
import { NotaDetallada } from '../../shared/interfaces/nota-detallada.interface';
import { environment } from '../../../environments/environment';

const CLAVE_STORAGE = 'rla_notas';

// Conversión interna para los cálculos estadísticos existentes.
// AD=4, A=3, B=2, C=1.
const VALOR_CALIFICACION: Record<Calificacion, number> = {
  AD: 4,
  A: 3,
  B: 2,
  C: 1
};

@Injectable({ providedIn: 'root' })
export class NotaService {
  private readonly apiUrl = environment.apiUrl;
  private cursoService = inject(CursoService);
  private docenteService = inject(DocenteService);
  private estudianteService = inject(EstudianteService);
  private actividadService = inject(ActividadService);

  private notas: Nota[] = cargarDesdeStorage(CLAVE_STORAGE, NOTAS);

  private guardar(): void {
    guardarEnStorage(CLAVE_STORAGE, this.notas);
  }

  esNotaValida(nota: string): nota is Calificacion {
    return ['AD', 'A', 'B', 'C'].includes(nota);
  }

  // Compatibilidad con las pantallas que aún muestran el estado.
  calcularEstado(nota: Calificacion): EstadoNota {
    return nota === 'AD' || nota === 'A'
      ? 'Aprobado'
      : 'Desaprobado';
  }

  private valorNumerico(nota: Calificacion): number {
    return VALOR_CALIFICACION[nota];
  }

  private promedioCalificaciones(notas: Nota[]): number {
    if (notas.length === 0) return 0;

    const suma = notas.reduce(
      (acc, n) => acc + this.valorNumerico(n.nota),
      0
    );

    return Math.round((suma / notas.length) * 100) / 100;
  }

  getPorEstudiante(estudianteId: string | number): NotaDetallada[] {
    const id = String(estudianteId);

    return this.notas
      .filter(n => n.estudianteId === id)
      .map(n => this.enriquecerNota(n));
  }

  getPorDocente(docenteId: string): Nota[] {
    return this.notas.filter(n => n.docenteId === docenteId);
  }

  getPorDocenteDetallada(docenteId: string): NotaDetallada[] {
    return this.notas
      .filter(n => n.docenteId === docenteId)
      .map(n => this.enriquecerNota(n));
  }

  getPorEstudianteYCurso(
    estudianteId: string | number,
    cursoId: string
  ): Nota | undefined {
    return this.notas.find(
      n =>
        n.estudianteId === String(estudianteId) &&
        n.cursoId === cursoId
    );
  }

  getPorEstudianteCursoYPeriodo(
    estudianteId: string | number,
    cursoId: string,
    periodo: Periodo
  ): Nota | undefined {
    return this.notas.find(
      n =>
        n.estudianteId === String(estudianteId) &&
        n.cursoId === cursoId &&
        n.periodo === periodo
    );
  }

  getPorId(notaId: string): Nota | undefined {
    return this.notas.find(n => n.id === notaId);
  }

  calcularPromedio(estudianteId: string | number): number {
    const id = String(estudianteId);
    const notasEstudiante = this.notas.filter(
      n => n.estudianteId === id
    );

    return this.promedioCalificaciones(notasEstudiante);
  }

  registrar(datos: Omit<Nota, 'id'>): Nota {
    if (!this.esNotaValida(datos.nota)) {
      throw new Error('Selecciona una calificación válida: AD, A, B o C.');
    }

    const existente = this.getPorEstudianteCursoYPeriodo(
      datos.estudianteId,
      datos.cursoId,
      datos.periodo
    );

    if (existente) {
      throw new Error(
        'Ya existe una calificación para este estudiante, curso y bimestre.'
      );
    }

    const nuevaNota: Nota = {
      ...datos,
      id: 'n' + (this.notas.length + 1) + '-' + Date.now()
    };

    this.notas.push(nuevaNota);
    this.guardar();
    this.registrarActividad(nuevaNota, 'registró');

    return nuevaNota;
  }

  actualizar(notaId: string, nuevoValor: Calificacion): Nota {
    if (!this.esNotaValida(nuevoValor)) {
      throw new Error('Selecciona una calificación válida: AD, A, B o C.');
    }

    const nota = this.getPorId(notaId);

    if (!nota) {
      throw new Error('No se encontró la calificación a actualizar.');
    }

    nota.nota = nuevoValor;
    this.guardar();
    this.registrarActividad(nota, 'actualizó');

    return nota;
  }

  getTodas(): Nota[] {
    return this.notas;
  }

  promedioPorCurso(cursoId: string): number {
    const notasDelCurso = this.notas.filter(
      n => n.cursoId === cursoId
    );

    return this.promedioCalificaciones(notasDelCurso);
  }

  promedioPorCursoYEstudiantes(
    cursoId: string,
    estudianteIds: (string | number)[]
  ): number {
    const ids = estudianteIds.map(String);

    const notasRelevantes = this.notas.filter(
      n => n.cursoId === cursoId && ids.includes(n.estudianteId)
    );

    return this.promedioCalificaciones(notasRelevantes);
  }

  private enriquecerNota(nota: Nota): NotaDetallada {
    const curso = this.cursoService.getPorId(nota.cursoId);
    const docente = this.docenteService.getPorId(nota.docenteId);
    const estudiante = this.estudianteService.getPorId(nota.estudianteId);

    return {
      ...nota,
      cursoNombre: curso?.nombre ?? 'Curso no encontrado',
      docenteNombre: docente
        ? `${docente.nombres} ${docente.apellidos}`
        : 'Docente no encontrado',
      estudianteNombre: estudiante
        ? `${estudiante.nombres} ${estudiante.apellidos}`
        : 'Estudiante no encontrado',
      estado: this.calcularEstado(nota.nota)
    };
  }

  private registrarActividad(
    nota: Nota,
    accion: 'registró' | 'actualizó'
  ): void {
    const curso = this.cursoService.getPorId(nota.cursoId);
    const docente = this.docenteService.getPorId(nota.docenteId);

    if (!curso || !docente) return;

    this.actividadService.registrar(
      `Prof. ${docente.nombres} ${docente.apellidos} ${accion} la calificación ${nota.nota} de ${curso.nombre}.`,
      docente.nivel
    );
  }
}
