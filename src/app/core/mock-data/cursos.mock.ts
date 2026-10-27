import { Curso } from '../models/curso.model';

// Catálogo de cursos, relacionados a su nivel educativo
export const CURSOS: Curso[] = [
  // Inicial
  { id: 'com-ini', nombre: 'Comunicación', nivel: 'Inicial' },
  { id: 'mat-ini', nombre: 'Matemática', nivel: 'Inicial' },
  { id: 'ps-ini', nombre: 'Personal Social', nivel: 'Inicial' },
  { id: 'cyt-ini', nombre: 'Ciencia y Tecnología', nivel: 'Inicial' },
  { id: 'psi-ini', nombre: 'Psicomotricidad', nivel: 'Inicial' },

  // Primaria
  { id: 'mat-pri', nombre: 'Matemática', nivel: 'Primaria' },
  { id: 'com-pri', nombre: 'Comunicación', nivel: 'Primaria' },
  { id: 'cyt-pri', nombre: 'Ciencia y Tecnología', nivel: 'Primaria' },
  { id: 'ps-pri', nombre: 'Personal Social', nivel: 'Primaria' },
  { id: 'ing-pri', nombre: 'Inglés', nivel: 'Primaria' },
  { id: 'art-pri', nombre: 'Arte y Cultura', nivel: 'Primaria' },
  { id: 'ef-pri', nombre: 'Educación Física', nivel: 'Primaria' },

  // Secundaria
  { id: 'mat-sec', nombre: 'Matemática', nivel: 'Secundaria' },
  { id: 'com-sec', nombre: 'Comunicación', nivel: 'Secundaria' },
  { id: 'cyt-sec', nombre: 'Ciencia y Tecnología', nivel: 'Secundaria' },
  { id: 'cs-sec', nombre: 'Ciencias Sociales', nivel: 'Secundaria' },
  { id: 'ing-sec', nombre: 'Inglés', nivel: 'Secundaria' },
  { id: 'ef-sec', nombre: 'Educación Física', nivel: 'Secundaria' },
  { id: 'art-sec', nombre: 'Arte y Cultura', nivel: 'Secundaria' },
  { id: 'ept-sec', nombre: 'Educación para el Trabajo', nivel: 'Secundaria' },
];