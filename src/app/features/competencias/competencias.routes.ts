import { Routes } from '@angular/router';

export const COMPETENCIAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/competencias.component').then(m => m.CompetenciasComponent)
  }
];
