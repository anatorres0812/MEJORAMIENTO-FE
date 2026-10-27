import { Routes } from '@angular/router';

export const GRADOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/grados.component').then(m => m.GradosComponent)
  }
];
