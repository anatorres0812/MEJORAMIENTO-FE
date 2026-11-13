import { Routes } from '@angular/router';

import { MainLayoutComponent } from '../../core/layouts/main-layout/main-layout.component';

import { authGuard } from '../../core/guards/auth.guard';
import { rolGuard } from '../../core/guards/rol.guard';

import { InicioAlumnoComponent } from './pages/inicio/inicio.component';
import { MisCursosComponent } from './pages/mis-cursos/mis-cursos.component';
import { MisNotasComponent } from './pages/mis-notas/mis-notas.component';
import { PerfilAlumnoComponent } from './pages/perfil/perfil.component';
import { BoletaComponent } from './pages/boleta/boleta.component';
import { ConstanciaComponent } from './pages/constancia/constancia.component';

export const ALUMNO_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [
      authGuard,
      rolGuard('ESTUDIANTE')
    ],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        component: InicioAlumnoComponent
      },
      {
        path: 'mis-cursos',
        component: MisCursosComponent
      },
      {
        path: 'mis-notas',
        component: MisNotasComponent
      },
      {
        path: 'perfil',
        component: PerfilAlumnoComponent
      },
      {
        path: 'boleta',
        component: BoletaComponent
      },
      {
        path: 'constancia',
        component: ConstanciaComponent
      }
    ]
  }
];
