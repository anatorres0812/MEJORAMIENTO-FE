import { Injectable, signal } from '@angular/core';
import { Nivel } from '../models/nivel.model';
import { environment } from '../../../environments/environment';

// Guarda qué nivel (Inicial/Primaria/Secundaria) está viendo el administrador,
// para que el navbar (donde están las pestañas) y las páginas de admin lo compartan.
@Injectable({ providedIn: 'root' })
export class NivelAdminService {
  private readonly apiUrl = environment.apiUrl;
  nivelSeleccionado = signal<Nivel>('Secundaria');

  seleccionar(nivel: Nivel): void {
    this.nivelSeleccionado.set(nivel);
  }
}