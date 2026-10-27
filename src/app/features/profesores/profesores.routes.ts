import { Routes } from '@angular/router';

export const PROFESORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/profesores.component').then(m => m.ProfesoresComponent)
  }
];
