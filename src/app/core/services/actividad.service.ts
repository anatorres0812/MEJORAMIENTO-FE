import { Injectable } from '@angular/core';
import { Actividad } from '../models/actividad.model';
import { Nivel } from '../models/nivel.model';
import { environment } from '../../../environments/environment';
import { cargarDesdeStorage, guardarEnStorage } from '../../shared/utils/storage.util';

const CLAVE_STORAGE = 'rla_actividades';

@Injectable({ providedIn: 'root' })
export class ActividadService {
  private readonly apiUrl = environment.apiUrl;

  private actividades: Actividad[] = cargarDesdeStorage<Actividad>(CLAVE_STORAGE, []);

  registrar(texto: string, nivel: Nivel): void {
    this.actividades.push({
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      texto,
      nivel,
      fecha: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
    });
    guardarEnStorage(CLAVE_STORAGE, this.actividades);
  }

  getRecientesPorNivel(nivel: Nivel, cantidad = 5): Actividad[] {
    return this.actividades
      .filter(a => a.nivel === nivel)
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, cantidad);
  }

  // Actividad más reciente de TODOS los niveles combinados (para el expediente del admin)
  getRecientesGlobal(cantidad = 6): Actividad[] {
    return this.actividades
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, cantidad);
  }
}