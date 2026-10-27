import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'estadoLabel', standalone: true })
export class EstadoPipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      ACTIVO: 'Activo',
      INACTIVO: 'Inactivo',
      ELIMINADO: 'Eliminado',
      INICIAL: 'Inicial',
      PRIMARIA: 'Primaria',
      SECUNDARIA: 'Secundaria',
      PRESENTE: 'Presente',
      AUSENTE: 'Ausente',
      TARDANZA: 'Tardanza',
      JUSTIFICADO: 'Justificado',
    };
    return map[value] ?? value;
  }
}
