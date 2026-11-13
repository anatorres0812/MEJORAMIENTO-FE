import { Routes } from '@angular/router';

export const ESTUDIANTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/estudiantes.component').then(m => m.EstudiantesComponent)
  }
];
