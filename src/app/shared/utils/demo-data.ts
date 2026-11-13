// DATOS DE DEMOSTRACIÓN — Identificados explícitamente como datos de prueba
// Estos datos NO están conectados a SQL Server ni a ninguna base de datos real.
// Serán reemplazados por las respuestas del backend Spring Boot en etapa 2.

import { Profesor } from '../../features/profesores/interfaces/profesor.interface';
import { Estudiante } from '../../features/estudiantes/interfaces/estudiante.interface';
import { Grado, Seccion } from '../../features/grados/interfaces/grado.interface';
import { Curso } from '../../features/cursos/interfaces/curso.interface';
import { Competencia } from '../../features/competencias/interfaces/competencia.interface';
import { Periodo } from '../../features/periodos/interfaces/periodo.interface';
import { Matricula } from '../../features/matriculas/interfaces/matricula.interface';
import { Nota } from '../../features/notas/interfaces/nota.interface';
import { Asistencia } from '../../features/asistencias/interfaces/asistencia.interface';

export const DEMO_PROFESORES: Profesor[] = [
  { id: 1, tipoDocumento: 'DNI', numeroDocumento: '45678901', nombres: 'Ana María', apellidos: 'Torres Vega', especialidad: 'Matemáticas', telefono: '987654321', correo: 'atorres@colegio.edu.pe', fechaContratacion: '2020-03-01', estado: 'ACTIVO' },
  { id: 2, tipoDocumento: 'DNI', numeroDocumento: '45678902', nombres: 'Carlos Alberto', apellidos: 'Mendoza Ríos', especialidad: 'Comunicación', telefono: '987654322', correo: 'cmendoza@colegio.edu.pe', fechaContratacion: '2019-04-15', estado: 'ACTIVO' },
  { id: 3, tipoDocumento: 'DNI', numeroDocumento: '45678903', nombres: 'Rosa Elena', apellidos: 'Quispe Luna', especialidad: 'Ciencias Naturales', telefono: '987654323', correo: 'rquispe@colegio.edu.pe', fechaContratacion: '2021-01-10', estado: 'ACTIVO' },
  { id: 4, tipoDocumento: 'DNI', numeroDocumento: '45678904', nombres: 'Jorge Luis', apellidos: 'Castillo Poma', especialidad: 'Historia', telefono: '987654324', correo: 'jcastillo@colegio.edu.pe', fechaContratacion: '2018-07-20', estado: 'ACTIVO' },
  { id: 5, tipoDocumento: 'DNI', numeroDocumento: '45678905', nombres: 'Lucía Fernanda', apellidos: 'Palomino Cruz', especialidad: 'Educación Inicial', telefono: '987654325', correo: 'lpalomino@colegio.edu.pe', fechaContratacion: '2022-02-14', estado: 'ACTIVO' },
  { id: 6, tipoDocumento: 'DNI', numeroDocumento: '45678906', nombres: 'Pedro Miguel', apellidos: 'Salcedo Huanca', especialidad: 'Inglés', telefono: '987654326', correo: 'psalcedo@colegio.edu.pe', fechaContratacion: '2020-08-01', estado: 'INACTIVO' },
];

export const DEMO_GRADOS: Grado[] = [
  // INICIAL
  { id: 1, nombre: '3 años', nivel: 'INICIAL', orden: 1, estado: 'ACTIVO' },
  { id: 2, nombre: '4 años', nivel: 'INICIAL', orden: 2, estado: 'ACTIVO' },
  { id: 3, nombre: '5 años', nivel: 'INICIAL', orden: 3, estado: 'ACTIVO' },
  // PRIMARIA
  { id: 4, nombre: '1° Primaria', nivel: 'PRIMARIA', orden: 1, estado: 'ACTIVO' },
  { id: 5, nombre: '2° Primaria', nivel: 'PRIMARIA', orden: 2, estado: 'ACTIVO' },
  { id: 6, nombre: '3° Primaria', nivel: 'PRIMARIA', orden: 3, estado: 'ACTIVO' },
  { id: 7, nombre: '4° Primaria', nivel: 'PRIMARIA', orden: 4, estado: 'ACTIVO' },
  { id: 8, nombre: '5° Primaria', nivel: 'PRIMARIA', orden: 5, estado: 'ACTIVO' },
  { id: 9, nombre: '6° Primaria', nivel: 'PRIMARIA', orden: 6, estado: 'ACTIVO' },
  // SECUNDARIA
  { id: 10, nombre: '1° Secundaria', nivel: 'SECUNDARIA', orden: 1, estado: 'ACTIVO' },
  { id: 11, nombre: '2° Secundaria', nivel: 'SECUNDARIA', orden: 2, estado: 'ACTIVO' },
  { id: 12, nombre: '3° Secundaria', nivel: 'SECUNDARIA', orden: 3, estado: 'ACTIVO' },
  { id: 13, nombre: '4° Secundaria', nivel: 'SECUNDARIA', orden: 4, estado: 'ACTIVO' },
  { id: 14, nombre: '5° Secundaria', nivel: 'SECUNDARIA', orden: 5, estado: 'ACTIVO' },
];

export const DEMO_SECCIONES: Seccion[] = [
  { id: 1, nombre: 'A', gradoId: 3, gradoNombre: '5 años', nivel: 'INICIAL', capacidad: 25, turno: 'MANANA', estado: 'ACTIVO' },
  { id: 2, nombre: 'B', gradoId: 3, gradoNombre: '5 años', nivel: 'INICIAL', capacidad: 25, turno: 'TARDE', estado: 'ACTIVO' },
  { id: 3, nombre: 'A', gradoId: 4, gradoNombre: '1° Primaria', nivel: 'PRIMARIA', capacidad: 30, turno: 'MANANA', estado: 'ACTIVO' },
  { id: 4, nombre: 'B', gradoId: 4, gradoNombre: '1° Primaria', nivel: 'PRIMARIA', capacidad: 30, turno: 'TARDE', estado: 'ACTIVO' },
  { id: 5, nombre: 'A', gradoId: 5, gradoNombre: '2° Primaria', nivel: 'PRIMARIA', capacidad: 30, turno: 'MANANA', estado: 'ACTIVO' },
  { id: 6, nombre: 'A', gradoId: 10, gradoNombre: '1° Secundaria', nivel: 'SECUNDARIA', capacidad: 35, turno: 'MANANA', estado: 'ACTIVO' },
  { id: 7, nombre: 'B', gradoId: 10, gradoNombre: '1° Secundaria', nivel: 'SECUNDARIA', capacidad: 35, turno: 'TARDE', estado: 'ACTIVO' },
  { id: 8, nombre: 'A', gradoId: 11, gradoNombre: '2° Secundaria', nivel: 'SECUNDARIA', capacidad: 35, turno: 'MANANA', estado: 'ACTIVO' },
];

export const DEMO_CURSOS: Curso[] = [
  // INICIAL
  { id: 1, codigo: 'INI-COM', nombre: 'Comunicación', nivel: 'INICIAL', gradoIds: [1,2,3], horasSemanales: 6, estado: 'ACTIVO' },
  { id: 2, codigo: 'INI-MAT', nombre: 'Matemática', nivel: 'INICIAL', gradoIds: [1,2,3], horasSemanales: 5, estado: 'ACTIVO' },
  { id: 3, codigo: 'INI-CYT', nombre: 'Ciencia y Tecnología', nivel: 'INICIAL', gradoIds: [2,3], horasSemanales: 4, estado: 'ACTIVO' },
  // PRIMARIA
  { id: 4, codigo: 'PRI-COM', nombre: 'Comunicación', nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], horasSemanales: 6, estado: 'ACTIVO' },
  { id: 5, codigo: 'PRI-MAT', nombre: 'Matemática', nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], horasSemanales: 6, estado: 'ACTIVO' },
  { id: 6, codigo: 'PRI-CYT', nombre: 'Ciencia y Tecnología', nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], horasSemanales: 4, estado: 'ACTIVO' },
  { id: 7, codigo: 'PRI-SOC', nombre: 'Personal Social', nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], horasSemanales: 4, estado: 'ACTIVO' },
  // SECUNDARIA
  { id: 8, codigo: 'SEC-COM', nombre: 'Comunicación', nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], horasSemanales: 5, estado: 'ACTIVO' },
  { id: 9, codigo: 'SEC-MAT', nombre: 'Matemática', nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], horasSemanales: 5, estado: 'ACTIVO' },
  { id: 10, codigo: 'SEC-CYT', nombre: 'Ciencia y Tecnología', nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], horasSemanales: 4, estado: 'ACTIVO' },
  { id: 11, codigo: 'SEC-HGE', nombre: 'Historia, Geografía y Economía', nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], horasSemanales: 3, estado: 'ACTIVO' },
  { id: 12, codigo: 'SEC-ING', nombre: 'Inglés', nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], horasSemanales: 3, estado: 'ACTIVO' },
];

// Competencias — DATOS DE DEMOSTRACIÓN (no representan el currículo oficial)
// La institución debe ingresarlas según el currículo que utilice
export const DEMO_COMPETENCIAS: Competencia[] = [
  // INICIAL - Comunicación
  { id: 1, codigo: 'INI-COM-C1', nombre: 'Se comunica oralmente en su lengua materna', cursoId: 1, nivel: 'INICIAL', gradoIds: [1,2,3], estado: 'ACTIVO' },
  { id: 2, codigo: 'INI-COM-C2', nombre: 'Lee diversos tipos de textos escritos en su lengua materna', cursoId: 1, nivel: 'INICIAL', gradoIds: [2,3], estado: 'ACTIVO' },
  // INICIAL - Matemática
  { id: 3, codigo: 'INI-MAT-C1', nombre: 'Resuelve problemas de cantidad', cursoId: 2, nivel: 'INICIAL', gradoIds: [1,2,3], estado: 'ACTIVO' },
  { id: 4, codigo: 'INI-MAT-C2', nombre: 'Resuelve problemas de forma, movimiento y localización', cursoId: 2, nivel: 'INICIAL', gradoIds: [2,3], estado: 'ACTIVO' },
  // PRIMARIA - Comunicación
  { id: 5, codigo: 'PRI-COM-C1', nombre: 'Se comunica oralmente en su lengua materna', cursoId: 4, nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], estado: 'ACTIVO' },
  { id: 6, codigo: 'PRI-COM-C2', nombre: 'Lee diversos tipos de textos escritos en su lengua materna', cursoId: 4, nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], estado: 'ACTIVO' },
  { id: 7, codigo: 'PRI-COM-C3', nombre: 'Escribe diversos tipos de textos en su lengua materna', cursoId: 4, nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], estado: 'ACTIVO' },
  // PRIMARIA - Matemática
  { id: 8, codigo: 'PRI-MAT-C1', nombre: 'Resuelve problemas de cantidad', cursoId: 5, nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], estado: 'ACTIVO' },
  { id: 9, codigo: 'PRI-MAT-C2', nombre: 'Resuelve problemas de regularidad, equivalencia y cambio', cursoId: 5, nivel: 'PRIMARIA', gradoIds: [4,5,6,7,8,9], estado: 'ACTIVO' },
  // SECUNDARIA - Comunicación
  { id: 10, codigo: 'SEC-COM-C1', nombre: 'Se comunica oralmente en su lengua materna', cursoId: 8, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
  { id: 11, codigo: 'SEC-COM-C2', nombre: 'Lee diversos tipos de textos escritos en su lengua materna', cursoId: 8, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
  { id: 12, codigo: 'SEC-COM-C3', nombre: 'Escribe diversos tipos de textos en su lengua materna', cursoId: 8, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
  // SECUNDARIA - Matemática
  { id: 13, codigo: 'SEC-MAT-C1', nombre: 'Resuelve problemas de cantidad', cursoId: 9, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
  { id: 14, codigo: 'SEC-MAT-C2', nombre: 'Resuelve problemas de regularidad, equivalencia y cambio', cursoId: 9, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
  { id: 15, codigo: 'SEC-MAT-C3', nombre: 'Resuelve problemas de gestión de datos e incertidumbre', cursoId: 9, nivel: 'SECUNDARIA', gradoIds: [10,11,12,13,14], estado: 'ACTIVO' },
];

export const DEMO_PERIODOS: Periodo[] = [
  { id: 1, nombre: 'I Bimestre', anioAcademico: 2026, fechaInicio: '2026-03-01', fechaFin: '2026-05-31', activo: false, estado: 'ACTIVO' },
  { id: 2, nombre: 'II Bimestre', anioAcademico: 2026, fechaInicio: '2026-06-01', fechaFin: '2026-08-15', activo: true, estado: 'ACTIVO' },
  { id: 3, nombre: 'III Bimestre', anioAcademico: 2026, fechaInicio: '2026-08-16', fechaFin: '2026-10-31', activo: false, estado: 'ACTIVO' },
  { id: 4, nombre: 'IV Bimestre', anioAcademico: 2026, fechaInicio: '2026-11-01', fechaFin: '2026-12-20', activo: false, estado: 'ACTIVO' },
];

export const DEMO_ESTUDIANTES: Estudiante[] = [
  { id: 1, codigo: 'EST-001', tipoDocumento: 'DNI', numeroDocumento: '72345001', nombres: 'Luis Fernando',   apellidos: 'Ramírez Torres',  fechaNacimiento: '2013-04-12', genero: 'M', nombreApoderado: 'Mario Ramírez',      telefonoApoderado: '912345001', relacionApoderado: 'Padre',  estado: 'ACTIVO',    nivelEducativo: 'PRIMARIA',   gradoNombre: '4 Grado',        seccionNombre: 'A' },
  { id: 2, codigo: 'EST-002', tipoDocumento: 'DNI', numeroDocumento: '72345002', nombres: 'María Alejandra', apellidos: 'Quispe Flores',   fechaNacimiento: '2013-07-23', genero: 'F', nombreApoderado: 'Carmen Flores',      telefonoApoderado: '912345002', relacionApoderado: 'Madre',  estado: 'ACTIVO',    nivelEducativo: 'PRIMARIA',   gradoNombre: '4 Grado',        seccionNombre: 'A' },
  { id: 3, codigo: 'EST-003', tipoDocumento: 'DNI', numeroDocumento: '72345003', nombres: 'Diego Sebastián', apellidos: 'Vega Mendoza',    fechaNacimiento: '2013-01-05', genero: 'M', nombreApoderado: 'Ana Mendoza',        telefonoApoderado: '912345003', relacionApoderado: 'Madre',  estado: 'ACTIVO',    nivelEducativo: 'PRIMARIA',   gradoNombre: '4 Grado',        seccionNombre: 'A' },
  { id: 4, codigo: 'EST-004', tipoDocumento: 'DNI', numeroDocumento: '72345004', nombres: 'Camila Sofía',    apellidos: 'Huanca Paz',      fechaNacimiento: '2014-09-18', genero: 'F', nombreApoderado: 'José Huanca',        telefonoApoderado: '912345004', relacionApoderado: 'Padre',  estado: 'ACTIVO',    nivelEducativo: 'PRIMARIA',   gradoNombre: '4 Grado',        seccionNombre: 'B' },
  { id: 5, codigo: 'EST-005', tipoDocumento: 'DNI', numeroDocumento: '72345005', nombres: 'Ángel Gabriel',   apellidos: 'Salinas Ríos',    fechaNacimiento: '2010-03-22', genero: 'M', nombreApoderado: 'Elena Ríos',         telefonoApoderado: '912345005', relacionApoderado: 'Madre',  estado: 'ACTIVO',    nivelEducativo: 'SECUNDARIA', gradoNombre: '1 Secundaria',   seccionNombre: 'A' },
  { id: 6, codigo: 'EST-006', tipoDocumento: 'DNI', numeroDocumento: '72345006', nombres: 'Valentina',       apellidos: 'Morales Castro',  fechaNacimiento: '2010-11-30', genero: 'F', nombreApoderado: 'Pedro Morales',      telefonoApoderado: '912345006', relacionApoderado: 'Padre',  estado: 'ACTIVO',    nivelEducativo: 'SECUNDARIA', gradoNombre: '1 Secundaria',   seccionNombre: 'A' },
  { id: 7, codigo: 'EST-007', tipoDocumento: 'DNI', numeroDocumento: '72345007', nombres: 'Sebastián Andrés',apellidos: 'León Prado',      fechaNacimiento: '2020-06-14', genero: 'M', nombreApoderado: 'Silvia Prado',       telefonoApoderado: '912345007', relacionApoderado: 'Madre',  estado: 'ACTIVO',    nivelEducativo: 'INICIAL',    gradoNombre: '5 años',         seccionNombre: 'A' },
  { id: 8, codigo: 'EST-008', tipoDocumento: 'DNI', numeroDocumento: '72345008', nombres: 'Isabella',        apellidos: 'Gutiérrez Meza', fechaNacimiento: '2020-02-08', genero: 'F', nombreApoderado: 'Roberto Gutiérrez',  telefonoApoderado: '912345008', relacionApoderado: 'Padre',  estado: 'ACTIVO',    nivelEducativo: 'INICIAL',    gradoNombre: '5 años',         seccionNombre: 'A' },
];

export const DEMO_MATRICULAS: Matricula[] = [
  { id: 1, estudianteId: 1, estudianteNombres: 'Luis Fernando', estudianteApellidos: 'Ramírez Torres', estudianteCodigo: 'EST-001', estudianteDni: '72345001', nivelEducativo: 'PRIMARIA', gradoId: 4, gradoNombre: '1° Primaria', seccionId: 3, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 2, estudianteId: 2, estudianteNombres: 'María Alejandra', estudianteApellidos: 'Quispe Flores', estudianteCodigo: 'EST-002', estudianteDni: '72345002', nivelEducativo: 'PRIMARIA', gradoId: 4, gradoNombre: '1° Primaria', seccionId: 3, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 3, estudianteId: 3, estudianteNombres: 'Diego Sebastián', estudianteApellidos: 'Vega Mendoza', estudianteCodigo: 'EST-003', estudianteDni: '72345003', nivelEducativo: 'PRIMARIA', gradoId: 4, gradoNombre: '1° Primaria', seccionId: 3, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 4, estudianteId: 5, estudianteNombres: 'Ángel Gabriel', estudianteApellidos: 'Salinas Ríos', estudianteCodigo: 'EST-005', estudianteDni: '72345005', nivelEducativo: 'SECUNDARIA', gradoId: 10, gradoNombre: '1° Secundaria', seccionId: 6, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 5, estudianteId: 6, estudianteNombres: 'Valentina', estudianteApellidos: 'Morales Castro', estudianteCodigo: 'EST-006', estudianteDni: '72345006', nivelEducativo: 'SECUNDARIA', gradoId: 10, gradoNombre: '1° Secundaria', seccionId: 6, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 6, estudianteId: 7, estudianteNombres: 'Sebastián Andrés', estudianteApellidos: 'León Prado', estudianteCodigo: 'EST-007', estudianteDni: '72345007', nivelEducativo: 'INICIAL', gradoId: 3, gradoNombre: '5 años', seccionId: 1, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
  { id: 7, estudianteId: 8, estudianteNombres: 'Isabella', estudianteApellidos: 'Gutiérrez Meza', estudianteCodigo: 'EST-008', estudianteDni: '72345008', nivelEducativo: 'INICIAL', gradoId: 3, gradoNombre: '5 años', seccionId: 1, seccionNombre: 'A', periodoId: 2, periodoNombre: 'II Bimestre', anioAcademico: 2026, fechaMatricula: '2026-03-01', estado: 'MATRICULADO' },
];

export const DEMO_NOTAS: Nota[] = [
  { id: 1, matriculaId: 1, estudianteId: 1, estudianteNombre: 'Luis Fernando Ramírez Torres', estudianteCodigo: 'EST-001', competenciaId: 5, competenciaNombre: 'Se comunica oralmente', cursoId: 4, cursoNombre: 'Comunicación', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, periodoId: 2, periodoNombre: 'II Bimestre', calificacion: 'A', fechaRegistro: '2026-07-10', estado: 'ACTIVO' },
  { id: 2, matriculaId: 1, estudianteId: 1, estudianteNombre: 'Luis Fernando Ramírez Torres', estudianteCodigo: 'EST-001', competenciaId: 6, competenciaNombre: 'Lee diversos tipos de textos', cursoId: 4, cursoNombre: 'Comunicación', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, periodoId: 2, periodoNombre: 'II Bimestre', calificacion: 'AD', fechaRegistro: '2026-07-10', estado: 'ACTIVO' },
  { id: 3, matriculaId: 2, estudianteId: 2, estudianteNombre: 'María Alejandra Quispe Flores', estudianteCodigo: 'EST-002', competenciaId: 5, competenciaNombre: 'Se comunica oralmente', cursoId: 4, cursoNombre: 'Comunicación', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, periodoId: 2, periodoNombre: 'II Bimestre', calificacion: 'AD', fechaRegistro: '2026-07-10', estado: 'ACTIVO' },
];

export const DEMO_ASISTENCIAS: Asistencia[] = [
  { id: 1, matriculaId: 1, estudianteId: 1, estudianteNombre: 'Luis Fernando Ramírez Torres', estudianteCodigo: 'EST-001', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, cursoId: 4, cursoNombre: 'Comunicación', periodoId: 2, fecha: '2026-10-13', estadoAsistencia: 'PRESENTE', estado: 'ACTIVO' },
  { id: 2, matriculaId: 2, estudianteId: 2, estudianteNombre: 'María Alejandra Quispe Flores', estudianteCodigo: 'EST-002', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, cursoId: 4, cursoNombre: 'Comunicación', periodoId: 2, fecha: '2026-10-13', estadoAsistencia: 'PRESENTE', estado: 'ACTIVO' },
  { id: 3, matriculaId: 3, estudianteId: 3, estudianteNombre: 'Diego Sebastián Vega Mendoza', estudianteCodigo: 'EST-003', nivelEducativo: 'PRIMARIA', gradoId: 4, seccionId: 3, cursoId: 4, cursoNombre: 'Comunicación', periodoId: 2, fecha: '2026-10-13', estadoAsistencia: 'TARDANZA', estado: 'ACTIVO' },
];
