import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// Todas las claves de localStorage que usa la app — si agregas un nuevo servicio persistente,
// no olvides sumar su clave aquí para que el reset también la limpie.
const CLAVES_APP = [
  'rla_estudiantes',
  'rla_docentes',
  'rla_notas',
  'rla_asistencia',
  'rla_grados',
  'rla_secciones',
  'rla_cursos',
  'rla_actividades',
  'rla_sesion',
];

@Injectable({ providedIn: 'root' })
export class ResetService {
  private readonly apiUrl = environment.apiUrl;

  restablecerDatosDemo(): void {
    CLAVES_APP.forEach(clave => localStorage.removeItem(clave));
    // Recarga completa: cada servicio vuelve a leer sus valores por defecto del mock
    window.location.href = '/login';
  }
}