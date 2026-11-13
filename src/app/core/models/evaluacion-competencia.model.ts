
export type NivelLogro = 'AD' | 'A' | 'B' | 'C';

export interface EvaluacionCompetencia {
  id?: number;
  estudianteId: number;
  competenciaId: number;
  periodo: string;
  nivelLogro: NivelLogro;
  conclusionDescriptiva: string | null;
  fechaEdicion?: string;
}
