import { Routes } from '@angular/router';

export const NOTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/notas.component').then(m => m.NotasComponent)
  }
];
