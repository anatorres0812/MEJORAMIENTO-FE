import { Routes } from '@angular/router';

export const ASISTENCIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/asistencias.component').then(m => m.AsistenciasComponent)
  }
];
