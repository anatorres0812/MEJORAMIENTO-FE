import { Nota } from '../models/nota.model';

// Calificaciones registradas por estudiante, curso, docente y bimestre.
export const NOTAS: Nota[] = [
  // Juan Pérez (e1) — Secundaria 3.º A
  {
    id: 'n1',
    estudianteId: 'e1',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'AD',
    periodo: 'I Bimestre',
    fecha: '2026-04-10'
  },
  {
    id: 'n2',
    estudianteId: 'e1',
    cursoId: 'com-sec',
    docenteId: 'd6',
    nota: 'AD',
    periodo: 'I Bimestre',
    fecha: '2026-04-10'
  },
  {
    id: 'n3',
    estudianteId: 'e1',
    cursoId: 'cyt-sec',
    docenteId: 'd3',
    nota: 'B',
    periodo: 'I Bimestre',
    fecha: '2026-04-11'
  },

  // Lucía Fernández (e2) — Secundaria 3.º A
  {
    id: 'n4',
    estudianteId: 'e2',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'A',
    periodo: 'I Bimestre',
    fecha: '2026-04-10'
  },
  {
    id: 'n5',
    estudianteId: 'e2',
    cursoId: 'com-sec',
    docenteId: 'd6',
    nota: 'C',
    periodo: 'I Bimestre',
    fecha: '2026-04-10'
  },

  // Pedro Gómez (e3) — Secundaria 3.º A
  {
    id: 'n6',
    estudianteId: 'e3',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'C',
    periodo: 'I Bimestre',
    fecha: '2026-04-10'
  },

  // Nuevos estudiantes en Matemática — docente d1
  // 1.º A
  {
    id: 'n7',
    estudianteId: 'e6',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'A',
    periodo: 'I Bimestre',
    fecha: '2026-04-12'
  },
  {
    id: 'n8',
    estudianteId: 'e7',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'C',
    periodo: 'I Bimestre',
    fecha: '2026-04-12'
  },

  // 3.º B
  {
    id: 'n9',
    estudianteId: 'e10',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'AD',
    periodo: 'I Bimestre',
    fecha: '2026-04-13'
  },
  {
    id: 'n10',
    estudianteId: 'e11',
    cursoId: 'mat-sec',
    docenteId: 'd1',
    nota: 'B',
    periodo: 'I Bimestre',
    fecha: '2026-04-13'
  }
];
