
import { Injectable, signal, effect } from '@angular/core';
import { environment } from '../../../environments/environment';

export type Tema = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly apiUrl = environment.apiUrl;
  private readonly KEY = 'ga_theme';

  tema = signal<Tema>(this.leerTema());

  private animando = false;

  constructor() {
    effect(() => {
      const actual = this.tema();

      document.documentElement.setAttribute('data-theme', actual);
      document.documentElement.style.colorScheme = actual;

      try {
        localStorage.setItem(this.KEY, actual);
      } catch {
        // La aplicación sigue funcionando si el almacenamiento está bloqueado.
      }
    });
  }

  private leerTema(): Tema {
    try {
      return localStorage.getItem(this.KEY) === 'dark'
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  }

  async toggle(event?: MouseEvent): Promise<void> {
    if (this.animando) return;

    const siguiente: Tema =
      this.tema() === 'light' ? 'dark' : 'light';

    const reducido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reducido) {
      this.tema.set(siguiente);
      return;
    }

    this.animando = true;

    const overlay = document.createElement('div');
    overlay.className = 'theme-bubbles-overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const colorAnterior =
      this.tema() === 'dark' ? '#111827' : '#f4f7fb';

    const colorNuevo =
      siguiente === 'dark' ? '#111827' : '#f4f7fb';

    overlay.style.setProperty('--old-color', colorAnterior);
    overlay.style.setProperty('--bubble-color', colorNuevo);

    const separacion = 100;
    const diametro = 145;
    const columnas = Math.ceil(window.innerWidth / separacion) + 2;
    const filas = Math.ceil(window.innerHeight / separacion) + 2;

    for (let fila = 0; fila < filas; fila++) {
      for (let columna = 0; columna < columnas; columna++) {
        const burbuja = document.createElement('span');

        burbuja.className = 'theme-bubble';
        burbuja.style.width = `${diametro}px`;
        burbuja.style.height = `${diametro}px`;
        burbuja.style.left =
          `${columna * separacion - 25 + (fila % 2 ? 35 : 0)}px`;
        burbuja.style.top = `${fila * separacion - 25}px`;

        // Las burbujas de la izquierda empiezan primero.
        burbuja.style.animationDelay =
          `${columna * 90 + fila * 20}ms`;

        overlay.appendChild(burbuja);
      }
    }

    document.body.appendChild(overlay);

    try {
      // Permite que las primeras burbujas comiencen antes de cambiar el tema.
      await new Promise<void>(resolve =>
        window.setTimeout(resolve, 400)
      );

      this.tema.set(siguiente);

      // Espera a que termine la animación de las últimas burbujas.
      await new Promise<void>(resolve =>
        window.setTimeout(resolve, 2200)
      );
    } finally {
      overlay.remove();
      this.animando = false;
    }
  }

  esDark(): boolean {
    return this.tema() === 'dark';
  }
}
