
import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface Contacto {
  nombre: string;
  correo: string;
  asunto: string;
  mensaje: string;
}

interface Servicio {
  numero: string;
  icono: string;
  categoria: string;
  titulo: string;
  descripcion: string;
}

interface Nivel {
  numero: string;
  titulo: string;
  descripcion: string;
  imagen: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  scrolled = signal(false);
  menuOpen = signal(false);

  enviando = signal(false);
  enviado = signal(false);
  errorEnvio = signal('');

  contacto: Contacto = this.nuevoContacto();
  currentYear = new Date().getFullYear();

  servicios: Servicio[] = [
    {
      numero: '01',
      icono: '◈',
      categoria: 'INFORMACIÓN',
      titulo: 'Gestión de estudiantes',
      descripcion: 'Organización de la información de los estudiantes en la plataforma académica.'
    },
    {
      numero: '02',
      icono: '▤',
      categoria: 'SEGUIMIENTO',
      titulo: 'Control académico',
      descripcion: 'Consulta y seguimiento de las calificaciones y del progreso académico.'
    },
    {
      numero: '03',
      icono: '◷',
      categoria: 'ORGANIZACIÓN',
      titulo: 'Asistencia',
      descripcion: 'Registro y seguimiento de la asistencia de los estudiantes.'
    },
    {
      numero: '04',
      icono: '↗',
      categoria: 'RESULTADOS',
      titulo: 'Reportes académicos',
      descripcion: 'Información organizada para facilitar las consultas y el seguimiento escolar.'
    }
  ];

  niveles: Nivel[] = [
    {
      numero: '01',
      titulo: 'Inicial',
      descripcion: 'Aprendizaje y desarrollo desde los primeros años.',
      imagen: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=85'
    },
    {
      numero: '02',
      titulo: 'Primaria',
      descripcion: 'Formación académica y desarrollo de habilidades.',
      imagen: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=85'
    },
    {
      numero: '03',
      titulo: 'Secundaria',
      descripcion: 'Preparación académica para nuevos retos y oportunidades.',
      imagen: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85'
    }
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.scrolled.set(window.scrollY > 30);
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    this.menuOpen.set(false);
  }

  toggleMenu(): void {
    this.menuOpen.update(abierto => !abierto);
  }

  irLogin(): void {
    this.menuOpen.set(false);
    this.router.navigate(['/login']);
  }

  enviarContacto(): void {
    if (this.enviando()) {
      return;
    }

    this.errorEnvio.set('');
    this.enviado.set(false);

    const nombre = this.contacto.nombre.trim();
    const correo = this.contacto.correo.trim();
    const asunto = this.contacto.asunto.trim();
    const mensaje = this.contacto.mensaje.trim();

    const nombreValido =
      /^[A-ZÁÉÍÓÚÜÑ][A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]*$/.test(nombre);

    const correoValido =
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.com$/.test(correo);

    if (!nombre) {
      this.errorEnvio.set('El nombre completo es obligatorio.');
      return;
    }

    if (!nombreValido) {
      this.errorEnvio.set(
        'El nombre debe comenzar con mayúscula y contener solamente letras, espacios, apóstrofes o guiones.'
      );
      return;
    }

    if (!correo) {
      this.errorEnvio.set('El correo electrónico es obligatorio.');
      return;
    }

    if (!correoValido) {
      this.errorEnvio.set(
        'Escribe un correo en minúsculas terminado en .com. Ejemplo: ana@gmail.com.'
      );
      return;
    }

    if (!mensaje) {
      this.errorEnvio.set('El mensaje es obligatorio.');
      return;
    }

    if (asunto.length > 500) {
      this.errorEnvio.set('El asunto no puede superar los 500 caracteres.');
      return;
    }

    if (mensaje.length > 2000) {
      this.errorEnvio.set('El mensaje no puede superar los 2000 caracteres.');
      return;
    }

    const datosContacto: Contacto = {
      nombre,
      correo,
      asunto,
      mensaje
    };

    this.enviando.set(true);

    this.http
      .post(`${environment.apiUrl}/contacto`, datosContacto)
      .subscribe({
        next: () => {
          this.enviado.set(true);
          this.contacto = this.nuevoContacto();
          this.enviando.set(false);
        },
        error: (error) => {
          console.error('Error al enviar el contacto:', error);

          this.errorEnvio.set(
            'No se pudo enviar el mensaje. Verifica tu conexión e inténtalo nuevamente.'
          );

          this.enviando.set(false);
        }
      });
  }

  private nuevoContacto(): Contacto {
    return {
      nombre: '',
      correo: '',
      asunto: '',
      mensaje: ''
    };
  }
}
