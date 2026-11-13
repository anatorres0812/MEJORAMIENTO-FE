
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { environment } from '../../../../../environments/environment';

type Registro = Record<string, any>;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  private auth = inject(AuthService);
  private http = inject(HttpClient);
  private notif = inject(NotificationService);
  private readonly api = environment.apiUrl;

  usuario = this.auth.usuarioActual;
  cargando = signal(false);
  noEncontrado = signal(false);
  filtroCurso = signal('');

  estudiante = signal<Registro | null>(null);
  profesor = signal<Registro | null>(null);
  matriculas = signal<Registro[]>([]);
  notas = signal<Registro[]>([]);
  asistencias = signal<Registro[]>([]);

  esAdmin = computed(() => this.usuario()?.rol === 'ADMINISTRADOR');
  esProfesor = computed(() => this.usuario()?.rol === 'PROFESOR');
  esEstudiante = computed(() => this.usuario()?.rol === 'ESTUDIANTE');

  labelRol = computed(() => {
    const rol = this.usuario()?.rol ?? '';
    const etiquetas: Record<string, string> = {
      ADMINISTRADOR: 'Administrador',
      PROFESOR: 'Docente',
      ESTUDIANTE: 'Estudiante'
    };
    return etiquetas[rol] ?? rol;
  });

  iniciales = computed(() => {
    const u = this.usuario();
    if (!u) return '?';

    const nombre = String(u.nombre ?? '').trim();
    const apellido = String(u.apellido ?? '').trim();

    if (nombre && apellido) {
      return `${nombre[0]}${apellido[0]}`.toUpperCase();
    }

    return (nombre || u.username || '?').slice(0, 2).toUpperCase();
  });

  nombreCompleto = computed(() => {
    const est = this.estudiante();

    if (est) {
      const nombres = this.dato(est, 'nombres', 'nombre', 'firstName');
      const apellidos = this.dato(est, 'apellidos', 'apellido', 'lastName');
      const nombreFicha = `${nombres} ${apellidos}`.trim();

      if (nombreFicha) return nombreFicha;
    }

    const u = this.usuario();
    const nombreCuenta = `${u?.nombre ?? ''} ${u?.apellido ?? ''}`.trim();

    return nombreCuenta || u?.username || 'Mi perfil';
  });

  matriculaVigente = computed(() =>
    this.matriculas().find(m => this.esMatriculaVigente(m))
  );

  gradoNombre = computed(() =>
    this.dato(
      this.matriculaVigente(),
      'gradoNombre',
      'nombreGrado',
      'grado',
      'gradoDescripcion'
    ) ||
    this.dato(this.estudiante(), 'gradoNombre', 'nombreGrado', 'grado') ||
    'Sin asignar'
  );

  seccionNombre = computed(() =>
    this.dato(
      this.matriculaVigente(),
      'seccionNombre',
      'nombreSeccion',
      'seccion'
    ) ||
    this.dato(this.estudiante(), 'seccionNombre', 'nombreSeccion', 'seccion') ||
    'Sin asignar'
  );

  cursosEstudiante = computed(() => [
    ...new Set(
      this.notas()
        .map(n => this.dato(n, 'cursoNombre', 'nombreCurso', 'curso'))
        .filter(Boolean)
    )
  ]);

  notasFiltradas = computed(() => {
    const curso = this.filtroCurso();

    return curso
      ? this.notas().filter(
          n => this.dato(n, 'cursoNombre', 'nombreCurso', 'curso') === curso
        )
      : this.notas();
  });

  logrosDestacados = computed(() =>
    this.notas().filter(n => this.calClase(this.valorNota(n)) === 'nota-ad').length
  );

  asistResumen = computed(() => {
    const lista = this.asistencias();

    const cuenta = (estados: string[]) =>
      lista.filter(a => {
        const estado = this.normalizar(
          this.dato(a, 'estadoAsistencia', 'tipoAsistencia', 'estado')
        );
        return estados.some(s => estado.startsWith(s.toLowerCase()));
      }).length;

    const total = lista.length;
    const presentes = cuenta(['presente']);

    return {
      total,
      presentes,
      tardanzas: cuenta(['tardanza', 'tarde']),
      faltas: cuenta(['falta', 'ausente']),
      justificadas: cuenta(['justificado']),
      porcentaje: total ? Math.round((presentes / total) * 100) : 0
    };
  });

  ngOnInit(): void {
    const usuario = this.usuario();

    if (!usuario) {
      this.noEncontrado.set(true);
      return;
    }

    if (usuario.rol === 'ESTUDIANTE') {
      this.cargarEstudiante(String(usuario.username ?? ''));
    } else if (usuario.rol === 'PROFESOR') {
      this.cargarProfesor(String(usuario.username ?? ''));
    }
  }

  // ============================================================
  // ESTUDIANTE
  // ============================================================

  private cargarEstudiante(username: string): void {
    this.cargando.set(true);
    this.noEncontrado.set(false);

    this.lista('estudiantes').subscribe({
      next: lista => {
        const identificador = this.normalizar(username);

        // Busca primero por documento o código y después por nombre.
        const est = lista.find(e =>
          [
            e['numeroDocumento'],
            e['dni'],
            e['documento'],
            e['numero_documento'],
            e['codigo'],
            e['codigoEstudiante'],
            e['codigo_estudiante']
          ].some(v => this.normalizar(v) === identificador)
        ) ?? lista.find(e => {
          const nombres = this.normalizar(
            this.dato(e, 'nombres', 'nombre', 'firstName')
          );
          const apellidos = this.normalizar(
            this.dato(e, 'apellidos', 'apellido', 'lastName')
          );
          const completo = `${nombres} ${apellidos}`.trim();

          return nombres === identificador || completo === identificador;
        });

        if (!est) {
          console.error(
            'No se encontró un estudiante que coincida con el usuario:',
            username
          );
          console.table(
            lista.map(e => ({
              id: e['id'],
              nombres: this.dato(e, 'nombres', 'nombre'),
              documento: this.dato(
                e,
                'numeroDocumento',
                'dni',
                'documento'
              ),
              codigo: this.dato(
                e,
                'codigo',
                'codigoEstudiante',
                'codigo_estudiante'
              )
            }))
          );

          this.estudiante.set(null);
          this.matriculas.set([]);
          this.notas.set([]);
          this.asistencias.set([]);
          this.noEncontrado.set(true);
          this.cargando.set(false);
          return;
        }

        // Conserva todos los datos originales y normaliza alias comunes.
        const adaptado: Registro = {
          ...est,
          id: est['id'] ?? est['estudianteId'] ?? est['estudiante_id'],
          codigo: this.dato(
            est,
            'codigo',
            'codigoEstudiante',
            'codigo_estudiante'
          ),
          numeroDocumento: this.dato(
            est,
            'numeroDocumento',
            'dni',
            'documento',
            'numero_documento'
          ),
          tipoDocumento: this.dato(
            est,
            'tipoDocumento',
            'tipo_documento'
          ) || 'DNI',
          nombres: this.dato(est, 'nombres', 'nombre', 'firstName'),
          apellidos: this.dato(est, 'apellidos', 'apellido', 'lastName'),
          fechaNacimiento: this.dato(
            est,
            'fechaNacimiento',
            'fecha_nacimiento',
            'fechaNac',
            'fecha_nac'
          ),
          genero: this.dato(est, 'genero', 'género', 'sexo'),
          nivelEducativo: this.dato(
            est,
            'nivelEducativo',
            'nivel_educativo',
            'nivel'
          )
        };

        this.estudiante.set(adaptado);

        const estudianteId = Number(adaptado['id']);

        if (!Number.isFinite(estudianteId) || estudianteId <= 0) {
          console.error('El estudiante no tiene un ID válido:', adaptado);
          this.cargando.set(false);
          this.notif.error('El estudiante encontrado no tiene un ID válido.');
          return;
        }

        this.cargarDatosAcademicos(estudianteId);
      },
      error: error => {
        console.error('Error al consultar estudiantes:', error);
        this.noEncontrado.set(true);
        this.cargando.set(false);
      }
    });
  }

  private cargarDatosAcademicos(estudianteId: number): void {
    const params = new HttpParams().set(
      'estudianteId',
      String(estudianteId)
    );

    this.lista('matriculas', params).subscribe({
      next: respuesta => {
        // No dependemos solamente de que el backend aplique el filtro.
        const propias = respuesta.filter(m =>
          this.perteneceAEstudiante(m, estudianteId)
        );

        this.matriculas.set(propias);

        const matricula = propias.find(m => this.esMatriculaVigente(m));

        if (matricula) {
          this.cargarNotasPorMatricula(matricula, estudianteId);
        } else {
          // Si no hay matrícula, comprobamos si las notas se pueden
          // consultar directamente por el ID del estudiante.
          this.cargarNotasPorEstudiante(estudianteId);
        }

        this.cargarAsistenciasEstudiante(estudianteId);
      },
      error: error => {
        console.error('Error al consultar matrículas:', error);
        this.matriculas.set([]);
        this.cargarNotasPorEstudiante(estudianteId);
        this.cargarAsistenciasEstudiante(estudianteId);
      }
    });
  }

  private cargarNotasPorMatricula(
    matricula: Registro,
    estudianteId: number
  ): void {
    const matriculaId = Number(matricula['id']);

    if (!Number.isFinite(matriculaId) || matriculaId <= 0) {
      this.cargarNotasPorEstudiante(estudianteId);
      return;
    }

    const params = new HttpParams().set(
      'matriculaId',
      String(matriculaId)
    );

    this.lista('notas', params).subscribe({
      next: respuesta => {
        const propias = respuesta.filter(n => {
          const idMatricula = this.idRelacion(
            n,
            'matriculaId',
            'matricula_id',
            'matricula'
          );

          const idEstudiante = this.idRelacion(
            n,
            'estudianteId',
            'estudiante_id',
            'estudiante'
          );

          return (
            idMatricula === matriculaId &&
            (idEstudiante === null || idEstudiante === estudianteId) &&
            this.registroActivo(n)
          );
        });

        this.notas.set(propias);
      },
      error: error => {
        console.error('Error al consultar notas por matrícula:', error);
        this.cargarNotasPorEstudiante(estudianteId);
      }
    });
  }

  private cargarNotasPorEstudiante(estudianteId: number): void {
    const params = new HttpParams().set(
      'estudianteId',
      String(estudianteId)
    );

    this.lista('notas', params).subscribe({
      next: respuesta => {
        this.notas.set(
          respuesta.filter(n =>
            this.perteneceAEstudiante(n, estudianteId) &&
            this.registroActivo(n)
          )
        );
      },
      error: error => {
        console.error('Error al consultar notas por estudiante:', error);
        this.notas.set([]);
      }
    });
  }

  private cargarAsistenciasEstudiante(estudianteId: number): void {
    const params = new HttpParams().set(
      'estudianteId',
      String(estudianteId)
    );

    this.lista('asistencias', params)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: respuesta => {
          this.asistencias.set(
            respuesta.filter(a =>
              this.perteneceAEstudiante(a, estudianteId) &&
              this.registroActivo(a)
            )
          );
        },
        error: error => {
          console.error('Error al consultar asistencias:', error);
          this.asistencias.set([]);
        }
      });
  }

  // ============================================================
  // PROFESOR
  // ============================================================

  private cargarProfesor(username: string): void {
    this.cargando.set(true);
    this.noEncontrado.set(false);

    const identificador = this.normalizar(username);

    this.lista('profesores').subscribe({
      next: lista => {
        const prof = lista.find(p =>
          this.normalizar(p['correo']) === identificador ||
          this.normalizar(p['email']) === identificador ||
          this.normalizar(p['numeroDocumento']) === identificador ||
          this.normalizar(p['dni']) === identificador
        );

        if (!prof) {
          this.profesor.set(null);
          this.noEncontrado.set(true);
          this.cargando.set(false);
          return;
        }

        this.profesor.set(prof);
        const profesorId = Number(prof['id']);

        if (!Number.isFinite(profesorId) || profesorId <= 0) {
          this.cargando.set(false);
          return;
        }

        forkJoin({
          notas: this.lista('notas'),
          asistencias: this.lista('asistencias')
        })
          .pipe(finalize(() => this.cargando.set(false)))
          .subscribe({
            next: respuesta => {
              this.notas.set(respuesta.notas.filter(n =>
                this.idRelacion(
                  n,
                  'profesorId',
                  'profesor_id',
                  'profesor'
                ) === profesorId && this.registroActivo(n)
              ));

              this.asistencias.set(respuesta.asistencias.filter(a =>
                this.idRelacion(
                  a,
                  'profesorId',
                  'profesor_id',
                  'profesor'
                ) === profesorId && this.registroActivo(a)
              ));
            },
            error: error => {
              console.error('Error al consultar datos del profesor:', error);
              this.notas.set([]);
              this.asistencias.set([]);
            }
          });
      },
      error: error => {
        console.error('Error al consultar profesores:', error);
        this.profesor.set(null);
        this.noEncontrado.set(true);
        this.cargando.set(false);
      }
    });
  }

  // ============================================================
  // UTILIDADES PARA RELACIONES Y ESTADOS
  // ============================================================

  private esMatriculaVigente(m: Registro): boolean {
    const estado = this.normalizar(m['estado']);

    return [
      'matriculado',
      'matriculada',
      'activo',
      'activa',
      'vigente',
      'pendiente'
    ].includes(estado);
  }

  private registroActivo(registro: Registro): boolean {
    const estado = this.normalizar(registro['estado']);

    // Si el backend no devuelve estado, no descartamos el registro
    // automáticamente. Solo excluimos estados claramente inactivos.
    return ![
      'eliminado',
      'eliminada',
      'inactivo',
      'inactiva',
      'anulado',
      'anulada',
      'borrado',
      'borrada'
    ].includes(estado);
  }

  private perteneceAEstudiante(
    registro: Registro,
    estudianteId: number
  ): boolean {
    const id = this.idRelacion(
      registro,
      'estudianteId',
      'estudiante_id',
      'estudiante'
    );

    return id === estudianteId;
  }

  private idRelacion(
    registro: Registro,
    ...claves: string[]
  ): number | null {
    for (const clave of claves) {
      const valor = registro[clave];

      if (valor !== null && valor !== undefined) {
        const candidato =
          typeof valor === 'object'
            ? valor['id'] ?? valor['estudianteId'] ?? valor['estudiante_id']
            : valor;

        const numero = Number(candidato);

        if (Number.isFinite(numero) && numero > 0) {
          return numero;
        }
      }
    }

    return null;
  }

  private lista(
    ruta: string,
    params?: HttpParams
  ): Observable<Registro[]> {
    return this.http.get<unknown>(`${this.api}/${ruta}`, { params }).pipe(
      map(respuesta => {
        if (Array.isArray(respuesta)) {
          return respuesta as Registro[];
        }

        const envoltura = respuesta as Record<string, unknown> | null;

        const posible =
          envoltura?.['data'] ??
          envoltura?.['content'] ??
          envoltura?.[ruta];

        return Array.isArray(posible)
          ? posible as Registro[]
          : [];
      }),
      catchError(error => {
        console.error(`Error al cargar ${ruta}:`, error);
        this.notif.error(`No se pudo consultar ${ruta}.`);
        return of([] as Registro[]);
      })
    );
  }

  normalizar(valor: unknown): string {
    return String(valor ?? '').trim().toLowerCase();
  }

  dato(
    obj: Registro | null | undefined,
    ...claves: string[]
  ): string {
    if (!obj) return '';

    for (const clave of claves) {
      const valor = obj[clave];

      if (
        valor !== null &&
        valor !== undefined &&
        typeof valor !== 'object' &&
        String(valor).trim() !== ''
      ) {
        return String(valor);
      }
    }

    return '';
  }

  valorNota(nota: Registro): string {
    return this.dato(
      nota,
      'calificacion',
      'nota',
      'valor',
      'puntaje'
    );
  }

  calClase(valor: string): string {
    const texto = String(valor ?? '').trim().toUpperCase();

    if (texto === 'AD') return 'nota-ad';
    if (texto === 'A') return 'nota-a';
    if (texto === 'B') return 'nota-b';
    if (texto === 'C') return 'nota-c';

    const numero = Number(texto);

    if (texto !== '' && Number.isFinite(numero)) {
      if (numero >= 17) return 'nota-ad';
      if (numero >= 14) return 'nota-a';
      if (numero >= 11) return 'nota-b';
      return 'nota-c';
    }

    return 'nota-nd';
  }

  onFiltroCurso(evento: Event): void {
    this.filtroCurso.set(
      (evento.target as HTMLSelectElement).value
    );
  }
}
