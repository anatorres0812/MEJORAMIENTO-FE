
import { Component, signal, inject, computed } from '@angular/core';
import {
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { ThemeService } from '../services/theme.service';

interface NavItem {
  label: string;
  icon: string;
  ruta: string;
  roles: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  styleUrl: './main-layout.component.css',
  template: `
    <div class="layout" [class.sidebar-collapsed]="sidebarCollapsed()">

      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-wrap">
            <div class="logo-icon">🎓</div>
            <span class="logo-text">
              Gestión<br><strong>Académica</strong>
            </span>
          </div>

          <button
            class="btn-collapse"
            (click)="toggleSidebar()"
            title="Colapsar menú">
            {{ sidebarCollapsed() ? '›' : '‹' }}
          </button>
        </div>

        <nav
          class="nav-menu"
          role="navigation"
          aria-label="Menú principal">

          @for (item of navItems(); track item.ruta) {
            @if (puedeVerItem(item)) {
              <a
                [routerLink]="item.ruta"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: true }"
                class="nav-item"
                [title]="item.label">

                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ iniciales() }}</div>

            <div class="user-details">
              <span class="user-name">
                {{ usuario()?.nombre }}
                {{ usuario()?.apellido }}
              </span>
              <span class="user-rol">{{ usuario()?.rol }}</span>
            </div>
          </div>

          <button
            class="btn-logout"
            (click)="logout()"
            title="Cerrar sesión">
            <span>⎋</span>
            <span class="nav-label">Salir</span>
          </button>
        </div>
      </aside>

      <div class="main-wrap">
        <header class="topbar">
          <div class="topbar-left">
            <button
              class="btn-menu-toggle"
              (click)="toggleSidebar()"
              aria-label="Menú">
              ☰
            </button>

            <a class="breadcrumb-home" routerLink="/dashboard">
              🏠 Inicio
            </a>
          </div>

          <div class="topbar-right">
            <button
              class="btn-theme"
              (click)="cambiarTema($event)"
              [title]="themeSvc.esDark()
                ? 'Cambiar a modo claro'
                : 'Cambiar a modo oscuro'"
              [attr.aria-label]="themeSvc.esDark()
                ? 'Modo claro'
                : 'Modo oscuro'">

              <span class="theme-icon">
                {{ themeSvc.esDark() ? '☀️' : '🌙' }}
              </span>
            </button>

            <div
              class="user-chip"
              [routerLink]="'/perfil'"
              title="Ver mi perfil">

              <span class="chip-avatar">{{ iniciales() }}</span>
              <span class="chip-name">
                {{ usuario()?.nombre }} {{ usuario()?.apellido }}
              </span>
              <span class="chip-rol">{{ usuario()?.rol }}</span>
            </div>
          </div>
        </header>

        <div class="notifications-wrap" aria-live="polite">
          @for (n of notificaciones(); track n.id) {
            <div
              class="notification notif-{{ n.tipo }}"
              role="alert">

              <span class="notif-icon">
                {{ iconoNotif(n.tipo) }}
              </span>

              <span class="notif-msg">{{ n.mensaje }}</span>

              <button
                class="notif-close"
                (click)="removerNotif(n.id)"
                aria-label="Cerrar">
                ×
              </button>
            </div>
          }
        </div>

        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  notifService = inject(NotificationService);
  themeSvc = inject(ThemeService);

  sidebarCollapsed = signal(false);

  usuario = this.auth.usuarioActual;
  notificaciones = this.notifService.notificaciones;

  iniciales = computed(() => {
    const u = this.usuario();

    if (!u) {
      return '?';
    }

    const nombre = u.nombre?.trim() || '';
    const apellido = u.apellido?.trim() || '';

    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  });

  navItems = signal<NavItem[]>([
    {
      label: 'Dashboard',
      icon: '📊',
      ruta: '/dashboard',
      roles: ['ADMINISTRADOR', 'PROFESOR', 'ESTUDIANTE']
    },
    {
      label: 'Profesores',
      icon: '👨‍🏫',
      ruta: '/profesores',
      roles: ['ADMINISTRADOR']
    },
    {
      label: 'Estudiantes',
      icon: '👨‍🎓',
      ruta: '/estudiantes',
      roles: ['ADMINISTRADOR', 'PROFESOR']
    },
    {
      label: 'Matrícula',
      icon: '📋',
      ruta: '/matriculas',
      roles: ['ADMINISTRADOR']
    },
    {
      label: 'Aulas',
      icon: '🏛️',
      ruta: '/aulas',
      roles: ['ADMINISTRADOR']
    },
    {
      label: 'Grados y Secciones',
      icon: '🏫',
      ruta: '/grados',
      roles: ['ADMINISTRADOR']
    },
    {
      label: 'Cursos',
      icon: '📚',
      ruta: '/cursos',
      roles: ['ADMINISTRADOR', 'PROFESOR']
    },
    {
      label: 'Competencias',
      icon: '🎯',
      ruta: '/competencias',
      roles: ['ADMINISTRADOR', 'PROFESOR']
    },
    {
      label: 'Periodos',
      icon: '📅',
      ruta: '/periodos',
      roles: ['ADMINISTRADOR']
    },
    {
      label: 'Registro de Notas',
      icon: '📝',
      ruta: '/notas',
      roles: ['ADMINISTRADOR', 'PROFESOR']
    },
    {
      label: 'Reportes y PDF',
      icon: '📄',
      ruta: '/reportes',
      roles: ['ADMINISTRADOR', 'PROFESOR']
    },
    {
      label: 'Mis Calificaciones',
      icon: '📄',
      ruta: '/mis-calificaciones',
      roles: ['ESTUDIANTE']
    },
    {
      label: 'Mi Perfil',
      icon: '🧑',
      ruta: '/perfil',
      roles: ['ADMINISTRADOR', 'PROFESOR', 'ESTUDIANTE']
    }
  ]);

  puedeVerItem(item: NavItem): boolean {
    const rol = this.usuario()?.rol?.trim().toUpperCase();

    return rol ? item.roles.includes(rol) : false;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  cambiarTema(event: MouseEvent): void {
    this.themeSvc.toggle(event);
  }

  logout(): void {
    this.auth.logout();
  }

  iconoNotif(tipo: string): string {
    const iconos: Record<string, string> = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    };

    return iconos[tipo] ?? 'ℹ';
  }

  removerNotif(id: number): void {
    this.notifService.remover(id);
  }
}
