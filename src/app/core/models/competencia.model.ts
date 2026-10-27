
export interface Competencia {
  id: number;
  codigo: string;
  nombre: string;
  areaCurricular: string;
  nivel: 'Inicial' | 'Primaria' | 'Secundaria';
  descripcion: string | null;
  estado: boolean;
}
