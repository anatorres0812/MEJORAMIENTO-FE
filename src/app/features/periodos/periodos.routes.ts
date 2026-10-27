import { Routes } from '@angular/router';

export const PERIODOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/periodos.component').then(m => m.PeriodosComponent)
  }
];
