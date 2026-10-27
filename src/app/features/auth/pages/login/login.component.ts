
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { Nivel } from '../../../../core/models/nivel.model';

type PasoLogin = 'rol' | 'nivel-form' | 'admin-form';
type RolSeleccionado = 'alumno' | 'docente' | 'administrador';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly niveles: Nivel[] = [
    'Inicial',
    'Primaria',
    'Secundaria'
  ];

  paso = signal<PasoLogin>('rol');
  rolSeleccionado = signal<RolSeleccionado | null>(null);
  nivelSeleccionado = signal<Nivel | null>(null);

  usuarioInput = signal('');
  passwordInput = signal('');
  mostrarPassword = signal(false);
  mensajeError = signal('');

  adminUsuario = signal('');
  adminPassword = signal('');
  mostrarPasswordAdmin = signal(false);
  mensajeErrorAdmin = signal('');

  cargando = this.authService.cargando;

  seleccionarRol(rol: RolSeleccionado): void {
    this.limpiarErrores();

    this.usuarioInput.set('');
    this.passwordInput.set('');
    this.adminUsuario.set('');
    this.adminPassword.set('');
    this.nivelSeleccionado.set(null);
    this.mostrarPassword.set(false);
    this.mostrarPasswordAdmin.set(false);

    this.rolSeleccionado.set(rol);

    if (rol === 'administrador') {
      this.paso.set('admin-form');
    } else {
      this.paso.set('nivel-form');
    }
  }

  volver(): void {
    this.limpiarErrores();

    this.paso.set('rol');
    this.rolSeleccionado.set(null);
    this.nivelSeleccionado.set(null);

    this.usuarioInput.set('');
    this.passwordInput.set('');
    this.adminUsuario.set('');
    this.adminPassword.set('');

    this.mostrarPassword.set(false);
    this.mostrarPasswordAdmin.set(false);
  }

  private limpiarErrores(): void {
    this.mensajeError.set('');
    this.mensajeErrorAdmin.set('');
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update(valor => !valor);
  }

  toggleMostrarPasswordAdmin(): void {
    this.mostrarPasswordAdmin.update(valor => !valor);
  }

  etiquetaUsuario(): string {
    return this.rolSeleccionado() === 'docente'
      ? 'Usuario (correo institucional)'
      : 'Usuario (nombres y apellidos)';
  }

  placeholderUsuario(): string {
    return this.rolSeleccionado() === 'docente'
      ? 'nombre@colegio.edu.pe'
      : 'Ej. Juan Pérez';
  }

  etiquetaPassword(): string {
    return 'Contraseña (DNI de 8 dígitos)';
  }

  placeholderPassword(): string {
    return 'Ingresa los 8 números del DNI';
  }

  nombreValido(nombre: string): boolean {
    return /^[\p{L}\p{M}]+(?:\s+[\p{L}\p{M}]+)*$/u.test(
      nombre.trim()
    );
  }

  correoInstitucionalValido(correo: string): boolean {
    return /^[a-z0-9._%+-]+@colegio\.edu\.pe$/i.test(
      correo.trim()
    );
  }

  dniValido(dni: string): boolean {
    return /^\d{8}$/.test(dni.trim());
  }

  usuarioValido(): boolean {
    const usuario = this.usuarioInput().trim();

    if (!usuario) {
      return false;
    }

    if (this.rolSeleccionado() === 'docente') {
      return this.correoInstitucionalValido(usuario);
    }

    return this.nombreValido(usuario);
  }

  passwordValido(): boolean {
    return this.dniValido(this.passwordInput());
  }

  ingresarComoAlumnoODocente(): void {
    this.mensajeError.set('');

    const rol = this.rolSeleccionado();
    const nivel = this.nivelSeleccionado();
    const usuarioOriginal = this.usuarioInput().trim();
    const password = this.passwordInput().trim();

    if (rol !== 'alumno' && rol !== 'docente') {
      this.mensajeError.set(
        'Selecciona primero tu tipo de usuario.'
      );
      return;
    }

    if (!nivel) {
      this.mensajeError.set(
        'Selecciona un nivel académico.'
      );
      return;
    }

    if (!usuarioOriginal || !password) {
      this.mensajeError.set(
        'Completa el usuario y el DNI.'
      );
      return;
    }

    if (
      rol === 'alumno' &&
      !this.nombreValido(usuarioOriginal)
    ) {
      this.mensajeError.set(
        'Escribe los nombres y apellidos usando solo letras y espacios.'
      );
      return;
    }

    if (
      rol === 'docente' &&
      !this.correoInstitucionalValido(usuarioOriginal)
    ) {
      this.mensajeError.set(
        'Ingresa un correo válido terminado en @colegio.edu.pe.'
      );
      return;
    }

    if (!this.dniValido(password)) {
      this.mensajeError.set(
        'El DNI debe contener exactamente 8 números.'
      );
      return;
    }

    const request = {
      username: rol === 'docente'
        ? usuarioOriginal.toLowerCase()
        : usuarioOriginal,
      password,
      rol: rol === 'alumno'
        ? 'ESTUDIANTE'
        : 'PROFESOR',
      nivelEducativo: nivel
    };

    type LoginPayload = Parameters<AuthService['login']>[0];

    this.authService.login(request as LoginPayload).subscribe({
      next: usuario => {
        const rolEsperado =
          rol === 'alumno'
            ? 'ESTUDIANTE'
            : 'PROFESOR';

        if (usuario.rol !== rolEsperado) {
          this.mensajeError.set(
            'Tu cuenta no corresponde al perfil seleccionado.'
          );
          return;
        }

        if (rol === 'alumno') {
          this.router.navigate(['/mis-calificaciones']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: Error) => {
        this.mensajeError.set(
          error.message ||
          'No se pudo iniciar sesión. Verifica tus credenciales.'
        );
      }
    });
  }

  ingresarComoAdmin(): void {
    this.mensajeErrorAdmin.set('');

    const username = this.adminUsuario().trim();
    const password = this.adminPassword();

    if (!username || !password.trim()) {
      this.mensajeErrorAdmin.set(
        'Completa el usuario y la contraseña.'
      );
      return;
    }

    const request = {
      username,
      password,
      rol: 'ADMINISTRADOR'
    };

    type LoginPayload = Parameters<AuthService['login']>[0];

    this.authService.login(request as LoginPayload).subscribe({
      next: usuario => {
        if (usuario.rol !== 'ADMINISTRADOR') {
          this.mensajeErrorAdmin.set(
            'La cuenta no tiene permisos de administrador.'
          );
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (error: Error) => {
        this.mensajeErrorAdmin.set(
          error.message ||
          'No se pudo iniciar sesión. Verifica tus credenciales.'
        );
      }
    });
  }
}
