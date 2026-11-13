
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, finalize } from 'rxjs';

import {
  Usuario,
  LoginRequest,
  Rol
} from '../models';

import { USUARIOS } from '../mock-data/usuarios.mock';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'ga_token';
  private readonly USER_KEY = 'ga_user';

  usuarioActual = signal<Usuario | null>(this.cargarUsuarioLocal());
  cargando = signal(false);

  constructor(private router: Router) {}

  login(request: LoginRequest): Observable<Usuario> {
    this.cargando.set(true);

    const normalizar = (valor: string): string =>
      valor
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const entrada = normalizar(request.username);

    const usuario = USUARIOS.find(u => {
      const username = normalizar(u.username);
      const nombreCompleto = normalizar(
        u.nombreCompleto ?? `${u.nombre} ${u.apellido}`
      );

      return username === entrada || nombreCompleto === entrada;
    });

    if (!usuario || !usuario.activo) {
      this.cargando.set(false);
      return throwError(
        () => new Error('Usuario no encontrado o inactivo.')
      );
    }

    // Validación temporal para practicar.
    if (usuario.rol === 'ESTUDIANTE') {
      if (!/^\d{8}$/.test(request.password)) {
        this.cargando.set(false);
        return throwError(
          () => new Error('El DNI debe contener exactamente 8 dígitos.')
        );
      }
    } else if (!request.password.trim()) {
      this.cargando.set(false);
      return throwError(
        () => new Error('Ingresa tu contraseña.')
      );
    }

    const usuarioSesion: Usuario = {
      ...usuario,
      token: `demo-${usuario.id}-${Date.now()}`
    };

    localStorage.setItem(
      this.TOKEN_KEY,
      usuarioSesion.token!
    );

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(usuarioSesion)
    );

    this.usuarioActual.set(usuarioSesion);
    this.cargando.set(false);

    return of(usuarioSesion).pipe(
      finalize(() => this.cargando.set(false))
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.usuarioActual.set(null);

    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY)
      && !!this.usuarioActual();
  }

  // Compatibilidad con los guards y componentes existentes.
  estaAutenticado(): boolean {
    return this.isAuthenticated();
  }

  usuario(): Usuario | null {
    return this.usuarioActual();
  }

  getRol(): Rol | null {
    return this.usuarioActual()?.rol ?? null;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  tieneRol(rol: Rol): boolean {
    return this.usuarioActual()?.rol === rol;
  }

  esAdmin(): boolean {
    return this.tieneRol('ADMINISTRADOR');
  }

  esProfesor(): boolean {
    return this.tieneRol('PROFESOR');
  }

  esEstudiante(): boolean {
    return this.tieneRol('ESTUDIANTE');
  }

  actualizarUsuarioSesion(cambios: Partial<Usuario>): void {
    const actual = this.usuarioActual();

    if (!actual) return;

    const actualizado: Usuario = {
      ...actual,
      ...cambios
    };

    this.usuarioActual.set(actualizado);

    localStorage.setItem(
      this.USER_KEY,
      JSON.stringify(actualizado)
    );

    if (actualizado.token) {
      localStorage.setItem(
        this.TOKEN_KEY,
        actualizado.token
      );
    }
  }

  private cargarUsuarioLocal(): Usuario | null {
    // Evita acceder a localStorage durante el renderizado del servidor.
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const data = localStorage.getItem(this.USER_KEY);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as Usuario;
    } catch {
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
      return null;
    }
  }
}
