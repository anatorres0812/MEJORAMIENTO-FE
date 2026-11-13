import { Routes } from '@angular/router';

export const MATRICULAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/matriculas.component').then(m => m.MatriculasComponent)
  }
];
