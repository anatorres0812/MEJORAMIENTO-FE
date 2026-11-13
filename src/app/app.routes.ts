
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard, roleGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './core/layouts/main-layout.component';

export const routes: Routes = [
  // Página de inicio
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/pages/landing.component')
        .then(m => m.LandingComponent),
    pathMatch: 'full'
  },

  // Autenticación (sin layout)
  {
    path: 'auth',
    canActivate: [noAuthGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component')
            .then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Aplicación con layout principal
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard.component')
            .then(m => m.DashboardComponent)
      },

      // Solo ADMINISTRADOR
      {
        path: 'profesores',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/profesores/pages/profesores.component')
            .then(m => m.ProfesoresComponent)
      },
      {
        path: 'matriculas',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/matriculas/pages/matriculas.component')
            .then(m => m.MatriculasComponent)
      },
      {
        path: 'aulas',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/aulas/pages/aulas.component')
            .then(m => m.AulasComponent)
      },
      {
        path: 'grados',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/grados/pages/grados.component')
            .then(m => m.GradosComponent)
      },
      {
        path: 'periodos',
        canActivate: [roleGuard(['ADMINISTRADOR'])],
        loadComponent: () =>
          import('./features/periodos/pages/periodos.component')
            .then(m => m.PeriodosComponent)
      },

      // ADMINISTRADOR y PROFESOR
      {
        path: 'estudiantes',
        canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESOR'])],
        loadComponent: () =>
          import('./features/estudiantes/pages/estudiantes.component')
            .then(m => m.EstudiantesComponent)
      },
      {
        path: 'cursos',
        canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESOR'])],
        loadComponent: () =>
          import('./features/cursos/pages/cursos.component')
            .then(m => m.CursosComponent)
      },
      {
        path: 'competencias',
        canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESOR'])],
        loadComponent: () =>
          import('./features/competencias/pages/competencias.component')
            .then(m => m.CompetenciasComponent)
      },
      {
        path: 'notas',
        canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESOR'])],
        loadComponent: () =>
          import('./features/notas/pages/notas.component')
            .then(m => m.NotasComponent)
      },
      {
        path: 'reportes',
        canActivate: [roleGuard(['ADMINISTRADOR', 'PROFESOR'])],
        loadComponent: () =>
          import('./features/reportes/pages/reportes.component')
            .then(m => m.ReportesComponent)
      },

      // Solo ESTUDIANTE
      {
        path: 'mis-calificaciones',
        canActivate: [roleGuard(['ESTUDIANTE'])],
        loadComponent: () =>
          import('./features/alumno/pages/mis-calificaciones.component')
            .then(m => m.MisCalificacionesComponent)
      },

      // Todos los usuarios autenticados
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/pages/perfil.component')
            .then(m => m.PerfilComponent)
      }
    ]
  },

  // Ruta no encontrada
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
