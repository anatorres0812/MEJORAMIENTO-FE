import { Routes } from '@angular/router';

import { MainLayoutComponent } from '../../core/layouts/main-layout/main-layout.component';

import { authGuard } from '../../core/guards/auth.guard';
import { rolGuard } from '../../core/guards/rol.guard';

import { DashboardAdminComponent } from './pages/dashboard/dashboard.component';
import { AcademicoComponent } from './pages/academico/academico.component';
import { DocentesAdminComponent } from './pages/docentes/docentes.component';
import { PerfilAdminComponent } from './pages/perfil/perfil.component';
import { CompetenciasComponent } from './pages/competencias/competencias.component';
import { GradosComponent } from './pages/grados/grados.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [
      authGuard,
      rolGuard('ADMINISTRADOR')
    ],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardAdminComponent
      },
      {
        path: 'academico',
        component: AcademicoComponent
      },
      {
        path: 'docentes',
        component: DocentesAdminComponent
      },
      {
        path: 'perfil',
        component: PerfilAdminComponent
      },
      {
        path: 'competencias',
        component: CompetenciasComponent
      },
      {
        path: 'grados',
        component: GradosComponent
      },
    ]
  }
];
