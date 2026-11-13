
import { Component, Input, Output, EventEmitter, computed } from '@angular/core';

@Component({
  selector: 'app-paginador',
  standalone: true,
  templateUrl: './paginador.component.html',
  styleUrl: './paginador.component.css'
})
export class PaginadorComponent {
  @Input({ required: true }) paginaActual = 1;
  @Input({ required: true }) totalPaginas = 1;

  @Output() cambiarPagina = new EventEmitter<number>();

  paginasVisibles = computed(() => {
    const total = Math.max(1, this.totalPaginas);
    const actual = Math.min(Math.max(1, this.paginaActual), total);

    let inicio = Math.max(1, actual - 2);
    let fin = Math.min(total, actual + 2);

    if (fin - inicio < 4) {
      if (inicio === 1) {
        fin = Math.min(total, inicio + 4);
      } else if (fin === total) {
        inicio = Math.max(1, fin - 4);
      }
    }

    return Array.from(
      { length: Math.max(0, fin - inicio + 1) },
      (_, i) => inicio + i
    );
  });

  ir(pagina: number): void {
    if (
      pagina >= 1 &&
      pagina <= this.totalPaginas &&
      pagina !== this.paginaActual
    ) {
      this.cambiarPagina.emit(pagina);
    }
  }
}
