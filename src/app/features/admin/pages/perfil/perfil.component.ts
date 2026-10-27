import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AdminPerfilService } from '../../services/admin-perfil.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { NotaService } from '../../../../core/services/nota.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { ActividadService } from '../../../../core/services/actividad.service';
import { Nivel } from '../../../../core/models/nivel.model';

@Component({
  selector: 'app-admin-perfil',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilAdminComponent {
  private authService = inject(AuthService);
  private adminPerfilService = inject(AdminPerfilService);
  private docenteService = inject(DocenteService);
  private estudianteService = inject(EstudianteService);
  private notaService = inject(NotaService);
  private academicoService = inject(AcademicoService);
  private actividadService = inject(ActividadService);

  readonly niveles: Nivel[] = ['Inicial', 'Primaria', 'Secundaria'];

  perfil = signal(this.adminPerfilService.obtener());

  nombreCompleto = computed(() => `${this.perfil().nombres} ${this.perfil().apellidos}`.trim());

  iniciales = computed(() => {
    const p = this.perfil();
    const n = p.nombres?.charAt(0) ?? 'A';
    const a = p.apellidos?.charAt(0) ?? '';
    return (n + a).toUpperCase();
  });

  // ── Estadísticas reales de todo el sistema ──────────────────
  totalDocentes = computed(() => this.docenteService.getTodos().length);
  totalEstudiantes = computed(() => this.estudianteService.getTodos().length);
  totalNotasRegistradas = computed(() => this.notaService.getTodas().length);
  totalSecciones = computed(() =>
    this.niveles.reduce((total, nivel) => total + this.academicoService.contarSeccionesPorNivel(nivel), 0)
  );

  resumenPorNivel = computed(() =>
    this.niveles.map(nivel => ({
      nivel,
      docentes: this.docenteService.getTodos().filter(d => d.nivel === nivel).length,
      estudiantes: this.estudianteService.getTodos().filter(e => e.nivel === nivel).length,
      secciones: this.academicoService.contarSeccionesPorNivel(nivel),
    }))
  );

  actividadReciente = computed(() => this.actividadService.getRecientesGlobal(6));

  // ── Edición de perfil ────────────────────────────────────────
  editando = signal(false);

  nombres = signal('');
  apellidos = signal('');
  dni = signal('');
  correo = signal('');
  telefono = signal('');
  fotoUrl = signal<string | undefined>(undefined);

  mensajeError = signal('');
  mensajeExito = signal('');

  activarEdicion(): void {
    const p = this.perfil();
    this.nombres.set(p.nombres);
    this.apellidos.set(p.apellidos);
    this.dni.set(p.dni);
    this.correo.set(p.correo);
    this.telefono.set(p.telefono);
    this.fotoUrl.set(p.fotoUrl);
    this.mensajeError.set('');
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.mensajeError.set('');
  }

  onFotoSeleccionada(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    if (archivo.size > 1.5 * 1024 * 1024) {
      this.mensajeError.set('La imagen es muy pesada. Usa una de menos de 1.5 MB.');
      return;
    }

    const lector = new FileReader();
    lector.onload = () => this.fotoUrl.set(lector.result as string);
    lector.readAsDataURL(archivo);
  }

  guardar(): void {
    const nombres = this.nombres().trim();
    const apellidos = this.apellidos().trim();
    const dni = this.dni().trim();
    const correo = this.correo().trim();

    if (!nombres || !apellidos) {
      this.mensajeError.set('Ingresa tus nombres y apellidos.');
      return;
    }

    if (dni && !/^\d{8}$/.test(dni)) {
      this.mensajeError.set('El DNI debe tener 8 dígitos numéricos.');
      return;
    }

    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.mensajeError.set('Ingresa un correo válido.');
      return;
    }

    const nuevoPerfil = {
      nombres,
      apellidos,
      dni,
      correo,
      telefono: this.telefono().trim(),
      fotoUrl: this.fotoUrl(),
    };

    this.adminPerfilService.guardar(nuevoPerfil);
    this.perfil.set(nuevoPerfil);

    this.authService.actualizarUsuarioSesion({
      nombreCompleto: `${nombres} ${apellidos}`,
    });

    this.editando.set(false);
    this.mensajeExito.set('Perfil actualizado correctamente.');
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }
}
