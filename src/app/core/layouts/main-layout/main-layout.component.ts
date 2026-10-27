import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

import { AuthService } from '../../services/auth.service';
import { NivelAdminService } from '../../services/nivel-admin.service';
import { Nivel } from '../../models/nivel.model';

interface MenuItem {
  label: string;
  icono: string;
  ruta: string;
}

const MENU_ALUMNO: MenuItem[] = [
  { label: 'Inicio', icono: '🏠', ruta: 'inicio' },
  { label: 'Mis cursos', icono: '📚', ruta: 'mis-cursos' },
  { label: 'Mis notas', icono: '📊', ruta: 'mis-notas' },
  { label: 'Boleta', icono: '📄', ruta: 'boleta' },
  { label: 'Constancia', icono: '📝', ruta: 'constancia' },
  { label: 'Perfil', icono: '👤', ruta: 'perfil' }
];

const MENU_DOCENTE: MenuItem[] = [
  { label: 'Inicio', icono: '🏠', ruta: 'inicio' },
  { label: 'Mis cursos', icono: '📚', ruta: 'mis-cursos' },
  { label: 'Estudiantes', icono: '👩‍🎓', ruta: 'estudiantes' },
  { label: 'Consultar notas', icono: '📊', ruta: 'notas' },
  { label: 'Reporte por sección', icono: '📑', ruta: 'notas/reporte' },
  { label: 'Competencias', icono: '📘', ruta: 'competencias' },
  { label: 'Perfil', icono: '👤', ruta: 'perfil' }
];

const MENU_ADMIN: MenuItem[] = [
  { label: 'Dashboard', icono: '📊', ruta: 'dashboard' },
  { label: 'Académico', icono: '🏫', ruta: 'academico' },
  { label: 'Grados', icono: '🎓', ruta: 'grados' },
  { label: 'Competencias', icono: '📚', ruta: 'competencias' },
  { label: 'Docentes', icono: '👩‍🏫', ruta: 'docentes' },
  { label: 'Perfil', icono: '👤', ruta: 'perfil' }
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  nivelAdminService = inject(NivelAdminService);

  usuario = this.authService.usuario;
  sidebarAbierto = signal(false);

  esAdmin = computed(
    () => this.authService.getRol() === 'ADMINISTRADOR'
  );

  menuItems = computed<MenuItem[]>(() => {
    const rol = this.authService.getRol();

    if (rol === 'PROFESOR') {
      return MENU_DOCENTE;
    }

    if (rol === 'ADMINISTRADOR') {
      return MENU_ADMIN;
    }

    return MENU_ALUMNO;
  });

  toggleSidebar(): void {
    this.sidebarAbierto.update(valor => !valor);
  }

  cambiarNivel(nivel: Nivel): void {
    this.nivelAdminService.seleccionar(nivel);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}