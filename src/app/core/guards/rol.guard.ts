
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolUsuario } from '../models/usuario.model';

function rutaBase(rol: RolUsuario | null): string {
  if (rol === 'PROFESOR') return '/docente';
  if (rol === 'ADMINISTRADOR') return '/admin';
  if (rol === 'ESTUDIANTE') return '/alumno';
  return '/auth/login';
}

// Fábrica de guards: genera un guard según el rol requerido.
export function rolGuard(rolEsperado: RolUsuario): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.getRol() === rolEsperado) {
      return true;
    }

    if (authService.estaAutenticado()) {
      router.navigate([rutaBase(authService.getRol())]);
    } else {
      router.navigate(['/auth/login']);
    }

    return false;
  };
}
