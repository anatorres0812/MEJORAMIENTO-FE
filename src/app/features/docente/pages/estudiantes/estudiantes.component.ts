import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { DocenteService } from '../../../../core/services/docente.service';
import { AcademicoService } from '../../../../core/services/academico.service';
import { EstudianteService } from '../../../../core/services/estudiante.service';
import { NotaService } from '../../../../core/services/nota.service';
import {
  NotasApiService,
  NotaBackend
} from '../../../../core/services/notas-api.service';
import {
  EstadoSiagie,
  Calificacion,
  Nota,
  Periodo
} from '../../../../core/models/nota.model';
import { Nivel } from '../../../../core/models/nivel.model';
import { Competencia } from '../../../../core/models/competencia.model';
import {
  EvaluacionCompetencia,
  NivelLogro
} from '../../../../core/models/evaluacion-competencia.model';

import { CompetenciaService } from '../../../../core/services/competencia.service';
import { EvaluacionCompetenciaService } from '../../../../core/services/evaluacion-competencia.service';

import { BadgeEstadoComponent } from '../../../../shared/components/badge-estado/badge-estado.component';
import { PaginadorComponent } from '../../../../shared/components/paginador/paginador.component';
import { ReporteSeccionService } from '../../services/reporte-seccion.service';

import { exportarCsv } from '../../../../shared/utils/csv-export.util';
import { exportarNotasXlsx } from '../../../../shared/utils/excel-export.util';
import { exportarPlantillaSiagie } from '../../../../shared/utils/siagie-export.util';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BadgeEstadoComponent,
    PaginadorComponent
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.css'
})
export class EstudiantesComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly docenteService = inject(DocenteService);
  private readonly academicoService = inject(AcademicoService);
  private readonly estudianteService = inject(EstudianteService);
  private readonly notaService = inject(NotaService);
  private readonly notasApi = inject(NotasApiService);
  readonly notasBackend = signal<NotaBackend[]>([]);
  private readonly reporteSeccionService = inject(ReporteSeccionService);
  private readonly competenciaService = inject(CompetenciaService);
  private readonly evaluacionCompetenciaService =
    inject(EvaluacionCompetenciaService);

  readonly periodos: Periodo[] = [
    'I Bimestre',
    'II Bimestre',
    'III Bimestre',
    'IV Bimestre'
  ];

  actualizarCodigoEstudiante(valor: string): void {
  this.nuevoCodigoEstudiante.set(
    String(valor ?? '').replace(/\D/g, '')
  );
}
  readonly calificaciones: Calificacion[] = ['AD', 'A', 'B', 'C'];

  readonly mensajeError = signal('');
  readonly mensajeExito = signal('');
  readonly mensajeErrorEstudiante = signal('');
  readonly mensajeExitoEstudiante = signal('');

  readonly gradoSeleccionado = signal('');
  readonly seccionSeleccionado = signal('');
  readonly cursoSeleccionado = signal('');
  readonly periodoValor = signal<Periodo>('I Bimestre');
  readonly terminoBusqueda = signal('');

  readonly editandoId = signal<string | number | null>(null);
  readonly notaValor = signal<Calificacion | null>(null);

  readonly mostrarFormularioEstudiante = signal(false);
  readonly editandoEstudianteId = signal<string | null>(null);

  // Evaluaciones por competencias
  readonly competencias = signal<Competencia[]>([]);
  readonly evaluacionesCompetencia = signal<EvaluacionCompetencia[]>([]);
  readonly competenciaSeleccionada = signal<number | null>(null);
  readonly nivelLogroValor = signal<NivelLogro>('A');
  readonly conclusionDescriptivaValor = signal('');
  readonly estudianteEvaluacionId = signal<string | number | null>(null);
  readonly guardandoEvaluacion = signal(false);

  readonly nuevoCodigoEstudiante = signal('');
  readonly nuevoNombres = signal('');
  readonly nuevoApellidos = signal('');
  readonly nuevoDni = signal('');
  readonly nuevoApoderado = signal('');
  readonly nuevoGradoId = signal('');
  readonly nuevoSeccionId = signal('');

  readonly paginaActual = signal(1);
  readonly elementosPorPagina = 10;

// Docente autenticado
readonly docente = computed(() => {
  const usuario = this.authService.usuario();

  if (!usuario || usuario.rol !== 'PROFESOR') {
    return undefined;
  }

  const docenteId = String(
    usuario.referenciaId ?? usuario.id
  ).replace(/^sesion-/, '');

  return this.docenteService.getPorIdBackend(docenteId);
});


  readonly nivelDocente = computed<Nivel | ''>(() => {
    const nivel = this.docente()?.nivel;

    if (
      nivel === 'Inicial' ||
      nivel === 'Primaria' ||
      nivel === 'Secundaria'
    ) {
      return nivel;
    }

    return '';
  });

  // Grados disponibles para el nivel del docente
  readonly grados = computed(() => {
    const nivel = this.nivelDocente();

    if (nivel) {
      return this.academicoService.getGradosPorNivel(nivel);
    }

    return [
      ...this.academicoService.getGradosPorNivel('Inicial'),
      ...this.academicoService.getGradosPorNivel('Primaria'),
      ...this.academicoService.getGradosPorNivel('Secundaria')
    ];
  });

  readonly secciones = computed(() => {
    const gradoId = this.gradoSeleccionado();

    if (!gradoId) {
      return [];
    }

    return this.academicoService.getSeccionesPorGrado(gradoId);
  });

  readonly seccionesNuevo = computed(() => {
    const gradoId = this.nuevoGradoId();

    if (!gradoId) {
      return [];
    }

    return this.academicoService.getSeccionesPorGrado(gradoId);
  });

readonly cursosDelDocente = computed(() => {
  const docente = this.docente();

  if (!docente) {
    return [];
  }

  const cursos =
    this.docenteService.getCursosBackendDelDocente(
      docente.id
    );

  const nivel = this.nivelDocente();

  if (!nivel) {
    return cursos;
  }

  return cursos.filter(curso => curso.nivel === nivel);
});

readonly filtroCompleto = computed(() =>
  Boolean(
    this.gradoSeleccionado() &&
    this.seccionSeleccionado()
  )
);

  readonly estudiantes = computed(() => {
    if (!this.filtroCompleto()) {
      return [];
    }

    const gradoId = this.gradoSeleccionado();
    const seccionId = this.seccionSeleccionado();
    const busqueda = this.terminoBusqueda().trim().toLowerCase();

    const nivelDocente = this.nivelDocente();
    const nivelGrado = this.academicoNivelDeGrado(gradoId);
    const nivelFinal: Nivel | '' = nivelDocente || nivelGrado;
    console.log('DEBUG estudiantes:', {
  nivelDocente,
  nivelGrado,
  nivelFinal,
  gradoSeleccionado: gradoId,
  seccionSeleccionada: seccionId,
  estudiantesAPI: this.estudianteService.getTodos()
});

    if (!nivelFinal) {
      return [];
    }

    const lista = this.estudianteService.
    getPorNivelGradoSeccion(
      nivelFinal,
      gradoId,
      seccionId
    );

    return lista
      .filter(estudiante => estudiante.estado !== 'Eliminado')
      .filter(estudiante => {
        if (!busqueda) {
          return true;
        }

        return [
          estudiante.codigoEstudiante,
          estudiante.nombres,
          estudiante.apellidos,
          estudiante.dni
        ].some(valor =>
          String(valor ?? '').toLowerCase().includes(busqueda)
        );
      });
  });

  readonly estudiantesPaginados = computed(() => {
    const inicio =
      (this.paginaActual() - 1) * this.elementosPorPagina;

    return this.estudiantes().slice(
      inicio,
      inicio + this.elementosPorPagina
    );
  });

  readonly totalPaginas = computed(() =>
    Math.max(
      1,
      Math.ceil(this.estudiantes().length / this.elementosPorPagina)
    )
  );

  
ngOnInit(): void {
  this.docenteService.cargarDocentesBackend().subscribe({

next: docentes => {
  console.log('DOCENTES CARGADOS:', docentes);
  console.log('DOCENTE ACTUAL:', this.docente());
  console.log('NIVEL DEL DOCENTE:', this.nivelDocente());
  console.log('CURSOS DEL DOCENTE:', this.cursosDelDocente());

  this.cargarNotasBackend();


      const nivel = this.nivelDocente();

      if (!nivel) {
        console.warn('No se pudo identificar el nivel del docente.');
        return;
      }

      this.competenciaService.listarPorNivel(nivel).subscribe({
        next: competencias => {
          this.competencias.set(
            competencias.filter(competencia => competencia.estado)
          );
          console.log('Competencias cargadas:', competencias);
        },
        error: error => {
          console.error('Error al cargar competencias:', error);
          this.mensajeError.set(
            'No se pudieron cargar las competencias. Verifica el backend.'
          );
        }
      });
    },
    error: error => {
      console.error('Error al cargar docentes:', error);
      this.mensajeError.set(
        'No se pudieron cargar los docentes del servidor.'
      );
    }
  });
}

  cargarNotasBackend(): void {
  this.notasApi.listar().subscribe({
    next: notas => {
      this.notasBackend.set(notas);
    },
    error: error => {
      console.error('Error al cargar las notas del backend:', error);
      this.mensajeError.set(
        'No se pudieron cargar las notas del servidor.'
      );
    }
  });
}

  private academicoNivelDeGrado(gradoId: string): Nivel | '' {
    return this.academicoService.getGradoPorId(gradoId)?.nivel ?? '';
  }

  onCambioGrado(gradoId: string): void {
    this.gradoSeleccionado.set(gradoId);
    this.seccionSeleccionado.set('');
    this.paginaActual.set(1);
    this.cancelar();
    this.cancelarEvaluacion();
    this.limpiarMensajes();
  }

  onCambioSeccion(seccionId: string): void {
    this.seccionSeleccionado.set(seccionId);
    this.paginaActual.set(1);
    this.cancelar();
    this.cancelarEvaluacion();
    this.limpiarMensajes();
  }

  onCambioCurso(cursoId: string): void {
    this.cursoSeleccionado.set(cursoId);
    this.paginaActual.set(1);
    this.cancelar();
    this.limpiarMensajes();
  }

  cambiarPeriodo(periodo: Periodo): void {
    if (!this.periodos.includes(periodo)) {
      return;
    }

    this.periodoValor.set(periodo);
    this.cancelar();
    this.cancelarEvaluacion();
  }

  onBuscar(valor: string): void {
    this.terminoBusqueda.set(valor);
    this.paginaActual.set(1);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
    }
  }

  onCambioGradoNuevo(gradoId: string): void {
    this.nuevoGradoId.set(gradoId);
    this.nuevoSeccionId.set('');
  }

  private limpiarMensajes(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  notaDe(estudianteId: string | number): Nota | undefined {
    return this.notaService.getPorEstudianteCursoYPeriodo(
      estudianteId,
      this.cursoSeleccionado(),
      this.periodoValor()
    );
  }

  calcularEstado(nota: Calificacion): EstadoSiagie {
    switch (nota) {
      case 'AD':
        return 'Logro destacado';
      case 'A':
        return 'Logro esperado';
      case 'B':
        return 'En proceso';
      case 'C':
        return 'En inicio';
      default:
        return 'En inicio';
    }
  }

  abrirFormulario(estudianteId: string | number): void {
    if (!this.filtroCompleto()) {
      return;
    }

    this.limpiarMensajes();
    this.editandoId.set(estudianteId);
    this.notaValor.set(this.notaDe(estudianteId)?.nota ?? null);
  }

  cancelar(): void {
    this.editandoId.set(null);
    this.notaValor.set(null);
    this.mensajeError.set('');
  }

  guardar(estudianteId: string | number): void {
    const docente = this.docente();
    const cursoId = this.cursoSeleccionado();
    const calificacion = this.notaValor();

    if (!docente) {
      this.mensajeError.set('No se pudo identificar al docente.');
      return;
    }

    if (!this.filtroCompleto()) {
      this.mensajeError.set('Selecciona grado, sección y curso.');
      return;
    }

    if (
      !calificacion ||
      !this.notaService.esNotaValida(calificacion)
    ) {
      this.mensajeError.set('Selecciona AD, A, B o C.');
      return;
    }

    try {
      const existente = this.notaDe(estudianteId);

      if (existente) {
        this.notaService.actualizar(existente.id, calificacion);
      } else {
        this.notaService.registrar({
          estudianteId: String(estudianteId),
          cursoId,
          docenteId: String(docente.id),
          nota: calificacion,
          periodo: this.periodoValor(),
          fecha: new Date().toISOString().slice(0, 10)
        });
      }

      this.cancelar();
      this.mensajeExito.set('Calificación guardada correctamente.');

      setTimeout(() => this.mensajeExito.set(''), 3000);
    } catch (error) {
      this.mensajeError.set(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  // ==========================================================
  // EVALUACIONES POR COMPETENCIAS
  // ==========================================================

  abrirEvaluacion(estudianteId: string | number): void {
    this.limpiarMensajes();

    const id = Number(estudianteId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.mensajeError.set(
        'El ID del estudiante debe ser numérico y corresponder ' +
        'a un estudiante real del backend.'
      );
      return;
    }

    this.estudianteEvaluacionId.set(estudianteId);
    this.competenciaSeleccionada.set(null);
    this.nivelLogroValor.set('A');
    this.conclusionDescriptivaValor.set('');
    this.evaluacionesCompetencia.set([]);

    this.evaluacionCompetenciaService
      .listarPorEstudiante(id, this.periodoValor())
      .subscribe({
        next: evaluaciones => {
          this.evaluacionesCompetencia.set(evaluaciones);
        },
        error: error => {
          console.error('Error al consultar evaluaciones:', error);
          this.mensajeError.set(
            'No se pudieron consultar las evaluaciones del estudiante.'
          );
        }
      });
  }

  seleccionarCompetencia(competenciaId: number | string): void {
    const id = Number(competenciaId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.competenciaSeleccionada.set(null);
      this.nivelLogroValor.set('A');
      this.conclusionDescriptivaValor.set('');
      return;
    }

    this.competenciaSeleccionada.set(id);

    const existente = this.evaluacionesCompetencia().find(
      evaluacion =>
        evaluacion.competenciaId === id &&
        evaluacion.periodo === this.periodoValor()
    );

    this.nivelLogroValor.set(existente?.nivelLogro ?? 'A');
    this.conclusionDescriptivaValor.set(
      existente?.conclusionDescriptiva ?? ''
    );
  }

  guardarEvaluacion(): void {
    this.limpiarMensajes();

    const estudianteId = Number(this.estudianteEvaluacionId());
    const competenciaId = this.competenciaSeleccionada();
    const nivelLogro = this.nivelLogroValor();
    const conclusion = this.conclusionDescriptivaValor().trim();

    if (!Number.isSafeInteger(estudianteId) || estudianteId <= 0) {
      this.mensajeError.set('Selecciona un estudiante válido.');
      return;
    }

    if (
      competenciaId === null ||
      !Number.isSafeInteger(competenciaId) ||
      competenciaId <= 0
    ) {
      this.mensajeError.set('Selecciona una competencia.');
      return;
    }

    if (!['AD', 'A', 'B', 'C'].includes(nivelLogro)) {
      this.mensajeError.set('Selecciona un nivel de logro válido.');
      return;
    }

    if (!conclusion) {
      this.mensajeError.set(
        'Escribe la conclusión descriptiva de la competencia.'
      );
      return;
    }

    if (this.guardandoEvaluacion()) {
      return;
    }

    const existente = this.evaluacionesCompetencia().find(
      evaluacion =>
        evaluacion.competenciaId === competenciaId &&
        evaluacion.periodo === this.periodoValor()
    );

    const datos: EvaluacionCompetencia = {
      estudianteId,
      competenciaId,
      periodo: this.periodoValor(),
      nivelLogro,
      conclusionDescriptiva: conclusion
    };

    this.guardandoEvaluacion.set(true);

    const peticion = existente?.id
      ? this.evaluacionCompetenciaService.actualizar(
          existente.id,
          datos
        )
      : this.evaluacionCompetenciaService.guardar(datos);

    peticion.subscribe({
      next: respuesta => {
        const actualizadas = this.evaluacionesCompetencia().filter(
          evaluacion =>
            !(
              evaluacion.competenciaId === competenciaId &&
              evaluacion.periodo === this.periodoValor()
            )
        );

        this.evaluacionesCompetencia.set([
          ...actualizadas,
          respuesta
        ]);

        this.nivelLogroValor.set(respuesta.nivelLogro);
        this.conclusionDescriptivaValor.set(
          respuesta.conclusionDescriptiva ?? ''
        );

        this.guardandoEvaluacion.set(false);
        this.mensajeExito.set(
          'Evaluación por competencias guardada correctamente.'
        );  

        setTimeout(() => this.mensajeExito.set(''), 3000);
      },
      error: error => {
        console.error('Error al guardar evaluación:', error);
        this.guardandoEvaluacion.set(false);

        this.mensajeError.set(
          error.status === 409
            ? 'Ya existe una evaluación para esta competencia y período. ' +
              'Vuelve a cargar las evaluaciones e inténtalo de nuevo.'
            : 'No se pudo guardar la evaluación. Verifica el backend, ' +
              'el ID del estudiante y la conexión con la base de datos.'
        );
      }
    });
  }

  cancelarEvaluacion(): void {
    this.estudianteEvaluacionId.set(null);
    this.competenciaSeleccionada.set(null);
    this.nivelLogroValor.set('A');
    this.conclusionDescriptivaValor.set('');
    this.evaluacionesCompetencia.set([]);
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  // ==========================================================
  // CRUD DE ESTUDIANTES
  // ==========================================================

  abrirFormularioEstudiante(): void {
    this.cancelarFormularioEstudiante();
    this.nuevoGradoId.set(this.gradoSeleccionado());
    this.nuevoSeccionId.set(this.seccionSeleccionado());
    this.mostrarFormularioEstudiante.set(true);
  }


nuevoCodigoSugerido(): string {
  const estudiantes = this.estudianteService.getTodos();

  const codigos = estudiantes
    .map(estudiante => Number(estudiante.codigoEstudiante))
    .filter(codigo => Number.isSafeInteger(codigo) && codigo > 0);

  return String(Math.max(1000, ...codigos) + 1);
}


  abrirEdicionEstudiante(estudianteId: string | number): void {
    const estudiante = this.estudianteService.getPorId(
      String(estudianteId)
    );

    if (!estudiante) {
      this.mensajeErrorEstudiante.set('No se encontró el estudiante.');
      return;
    }

    this.editandoEstudianteId.set(String(estudiante.id));
    this.nuevoCodigoEstudiante.set(estudiante.codigoEstudiante);
    this.nuevoNombres.set(estudiante.nombres);
    this.nuevoApellidos.set(estudiante.apellidos);
    this.nuevoDni.set(estudiante.dni);
    this.nuevoApoderado.set(estudiante.apoderado);
    this.nuevoGradoId.set(estudiante.gradoId);
    this.nuevoSeccionId.set(estudiante.seccionId);

    this.mensajeErrorEstudiante.set('');
    this.mensajeExitoEstudiante.set('');
    this.mostrarFormularioEstudiante.set(true);
  }

  cancelarFormularioEstudiante(): void {
    this.mostrarFormularioEstudiante.set(false);
    this.editandoEstudianteId.set(null);
    this.nuevoCodigoEstudiante.set('');
    this.nuevoNombres.set('');
    this.nuevoApellidos.set('');
    this.nuevoDni.set('');
    this.nuevoApoderado.set('');
    this.nuevoGradoId.set('');
    this.nuevoSeccionId.set('');
    this.mensajeErrorEstudiante.set('');
    this.mensajeExitoEstudiante.set('');
  }

  guardarEstudiante(): void {
    const codigoEstudiante = this.nuevoCodigoEstudiante().trim();
    
if (!/^\d+$/.test(codigoEstudiante)) {
  this.mensajeErrorEstudiante.set(
    'El código del estudiante debe contener solo números.'
  );
  return;
}

    const nombres = this.nuevoNombres().trim();
    const apellidos = this.nuevoApellidos().trim();
    const dni = this.nuevoDni().trim();
    const apoderado = this.nuevoApoderado().trim();
    const gradoId = this.nuevoGradoId();
    const seccionId = this.nuevoSeccionId();
    const nivel = this.nivelDocente();

    if (
      !codigoEstudiante ||
      !nombres ||
      !apellidos ||
      !dni ||
      !apoderado ||
      !gradoId ||
      !seccionId
    ) {
      this.mensajeErrorEstudiante.set(
        'Completa todos los campos obligatorios.'
      );
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      this.mensajeErrorEstudiante.set(
        'El DNI debe tener 8 dígitos numéricos.'
      );
      return;
    }

    if (!/^\d+$/.test(codigoEstudiante)) {
  this.mensajeErrorEstudiante.set(
    'El código del estudiante debe contener solo números.'
  );
  return;
}

    const grado = this.academicoService.getGradoPorId(gradoId);

    if (!grado) {
      this.mensajeErrorEstudiante.set(
        'El grado seleccionado no existe.'
      );
      return;
    }

    if (nivel && grado.nivel !== nivel) {
      this.mensajeErrorEstudiante.set(
        'El grado seleccionado no pertenece al nivel del docente.'
      );
      return;
    }

    const seccionValida = this.academicoService
      .getSeccionesPorGrado(gradoId)
      .some(seccion => seccion.id === seccionId);

    if (!seccionValida) {
      this.mensajeErrorEstudiante.set(
        'Selecciona una sección válida para el grado elegido.'
      );
      return;
    }

    const idEnEdicion = this.editandoEstudianteId();
    const todos = this.estudianteService.getTodos();

    if (
      todos.some(estudiante =>
        estudiante.dni === dni &&
        String(estudiante.id) !== idEnEdicion &&
        estudiante.estado !== 'Eliminado'
      )
    ) {
      this.mensajeErrorEstudiante.set(
        'Ya existe un estudiante con ese DNI.'
      );
      return;
    }

    if (
      todos.some(estudiante =>
        String(estudiante.codigoEstudiante ?? '').trim().toLowerCase() ===
          codigoEstudiante.toLowerCase() &&
        String(estudiante.id) !== String(idEnEdicion ?? '') &&
        estudiante.estado !== 'Eliminado'
      )
    ) {
      this.mensajeErrorEstudiante.set(
        'Ese código de estudiante ya está registrado.'
      );
      return;
    }

    const datos = {
      codigoEstudiante,
      nombres,
      apellidos,
      dni,
      apoderado,
      nivel: grado.nivel,
      gradoId,
      seccionId,
      estado: 'Activo' as const
    };

    try {
      if (idEnEdicion) {
        this.estudianteService.actualizar(idEnEdicion, datos);
      } else {
        this.estudianteService.crear(datos);
      }

      this.cancelarFormularioEstudiante();
      this.paginaActual.set(1);

      this.mensajeExitoEstudiante.set(
        idEnEdicion
          ? 'Estudiante actualizado correctamente.'
          : 'Estudiante registrado correctamente.'
      );

      setTimeout(
        () => this.mensajeExitoEstudiante.set(''),
        3000
      );
    } catch (error) {
      this.mensajeErrorEstudiante.set(
        error instanceof Error ? error.message : String(error)
      );
    }
  }


toggleEstado(estudianteId: string | number): void {
  try {
    console.log('ID del estudiante:', estudianteId);

    const estudiante = this.estudianteService.getPorId(estudianteId);
    console.log('Estudiante encontrado:', estudiante);

    if (!estudiante) {
      this.mensajeError.set('No se encontró el estudiante.');
      return;
    }

    const actualizado =
      this.estudianteService.cambiarEstado(String(estudianteId));

    console.log('Estado actualizado:', actualizado.estado);
    this.mensajeError.set('');
  } catch (error) {
    console.error('Error al cambiar estado:', error);

    this.mensajeError.set(
      error instanceof Error ? error.message : String(error)
    );
  }
}



  // ==========================================================
  // REPORTES Y EXPORTACIONES
  // ==========================================================

  verReporte(): void {
    if (!this.filtroCompleto()) {
      this.mensajeError.set(
        'Selecciona grado, sección y curso antes de ver el reporte.'
      );
      return;
    }

    this.reporteSeccionService.establecer(
      this.gradoSeleccionado(),
      this.seccionSeleccionado(),
      this.cursoSeleccionado()
    );

    this.router.navigate(['/docente/notas/reporte']);
  }

  exportarEstudiantesCsv(): void {
    if (!this.filtroCompleto()) {
      this.mensajeError.set(
        'Selecciona grado, sección y curso antes de exportar.'
      );
      return;
    }

    const cursoNombre = this.cursosDelDocente().find(
      curso => curso.id === this.cursoSeleccionado()
    )?.nombre ?? 'Curso';

    const filas = this.estudiantes().map(estudiante => {
      const nota = this.notaDe(estudiante.id);

      return [
        estudiante.codigoEstudiante,
        `${estudiante.nombres} ${estudiante.apellidos}`,
        estudiante.dni,
        nota?.periodo ?? 'Sin registrar',
        nota?.nota ?? '',
        nota ? this.calcularEstado(nota.nota) : 'Sin registrar'
      ];
    });

    if (!filas.length) {
      this.mensajeError.set('No hay estudiantes para exportar.');
      return;
    }

    exportarCsv(
      `estudiantes-${cursoNombre}`,
      [
        'Cód. Estudiante',
        'Estudiante',
        'DNI',
        'Periodo',
        'Nota',
        'Estado'
      ],
      filas
    );

    this.mensajeError.set('');
    this.mensajeExito.set('Archivo CSV exportado correctamente.');
    setTimeout(() => this.mensajeExito.set(''), 3000);
  }

  async exportarEstudiantesXlsx(): Promise<void> {
    if (!this.filtroCompleto()) {
      this.mensajeError.set(
        'Selecciona grado, sección y curso antes de exportar.'
      );
      return;
    }

    const cursoNombre = this.cursosDelDocente().find(
      curso => curso.id === this.cursoSeleccionado()
    )?.nombre ?? 'Curso';

    const filas = this.estudiantes()
      .map(estudiante => {
        const nota = this.notaDe(estudiante.id);

        if (!nota) {
          return null;
        }

        return {
          estudiante: `${estudiante.nombres} ${estudiante.apellidos}`,
          curso: cursoNombre,
          nota: nota.nota,
          estado: this.calcularEstado(nota.nota)
        };
      })
      .filter(
        (fila): fila is NonNullable<typeof fila> => fila !== null
      );

    if (!filas.length) {
      this.mensajeError.set(
        'No hay notas registradas para exportar.'
      );
      return;
    }

    try {
      await exportarNotasXlsx(
        `notas-${cursoNombre}`,
        `Notas - ${cursoNombre}`,
        filas
      );

      this.mensajeError.set('');
      this.mensajeExito.set('Archivo Excel exportado correctamente.');
      setTimeout(() => this.mensajeExito.set(''), 3000);
    } catch (error) {
      this.mensajeError.set(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  async exportarPlantillaSiagie(): Promise<void> {
    if (!this.filtroCompleto()) {
      this.mensajeError.set(
        'Selecciona grado, sección y curso antes de exportar.'
      );
      return;
    }

    const listaEstudiantes = this.estudiantes();

    if (!listaEstudiantes.length) {
      this.mensajeError.set(
        'No hay estudiantes en la sección seleccionada para exportar.'
      );
      return;
    }

    try {
      const estudiantes = listaEstudiantes.map(estudiante => ({
        id: estudiante.id,
        dni: estudiante.dni,
        nombres: estudiante.nombres,
        apellidos: estudiante.apellidos,
        codigoEstudiante: estudiante.codigoEstudiante
      }));

      const cursoNombre = this.cursosDelDocente().find(
        curso => curso.id === this.cursoSeleccionado()
      )?.nombre ?? 'Curso';

      await exportarPlantillaSiagie(
        estudiantes,
        `SIAGIE-${cursoNombre}`
      );

      this.mensajeError.set('');
      this.mensajeExito.set(
        'Plantilla SIAGIE exportada correctamente.'
      );
      setTimeout(() => this.mensajeExito.set(''), 3000);
    } catch (error) {
      this.mensajeError.set(
        `No se pudo exportar la plantilla SIAGIE: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
