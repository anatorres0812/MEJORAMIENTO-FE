import { Nivel } from './nivel.model';

// Representa un grado dentro de un nivel (ej: "3 años", "1.º Primaria", "5.º Secundaria")
export interface Grado {
  id: string;
  nombre: string;
  nivel: Nivel;
}