import { Routes } from '@angular/router';

import { MainLayoutComponent } from '../../core/layouts/main-layout/main-layout.component';

import { authGuard } from '../../core/guards/auth.guard';
import { rolGuard } from '../../core/guards/rol.guard';

import { InicioDocenteComponent } from './pages/inicio/inicio.component';
import { MisCursosDocenteComponent } from './pages/mis-cursos/mis-cursos.component';
import { EstudiantesComponent } from './pages/estudiantes/estudiantes.component';
import { ReporteSeccionComponent } from './pages/reporte-seccion/reporte-seccion.component';
import { PerfilDocenteComponent } from './pages/perfil/perfil.component';
import { CompetenciasComponent } from './pages/competencias/competencias.component';

export const DOCENTE_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [
      authGuard,
      rolGuard('PROFESOR')
    ],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        component: InicioDocenteComponent
      },
      {
        path: 'mis-cursos',
        component: MisCursosDocenteComponent
      },
      {
        path: 'estudiantes',
        component: EstudiantesComponent
      },
      {
        path: 'notas',
        component: EstudiantesComponent
      },
      {
        path: 'notas/reporte',
        component: ReporteSeccionComponent
      },
      {
        path: 'perfil',
        component: PerfilDocenteComponent
      },
      {
        path: 'competencias',
        component: CompetenciasComponent
      },
    ]
  }
];
