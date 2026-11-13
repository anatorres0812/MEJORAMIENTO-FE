# Sistema de Gestión Académica 20973
### Inicial · Primaria · Secundaria

Frontend Angular 19 — Etapa 1 de 3  
**Estado:** ✅ Compilación sin errores · Listo para ejecución local

---

## 🚀 Ejecutar localmente

```bash
cd gestion-academica-20973
npm install
ng serve
```

Abre en el navegador: **http://localhost:4200**

### Credenciales de demostración

| Usuario | Contraseña | Rol |
|---|---|---|
| admin | admin123 | ADMINISTRADOR |
| profesor1 | prof123 | PROFESOR |
| estudiante1 | est123 | ESTUDIANTE |

> ⚠️ Estas credenciales son solo para demostración. No están conectadas a ninguna base de datos real.

---

## 🏗️ Arquitectura Feature-Based

```
src/app/
├── core/
│   ├── guards/         auth.guard.ts, role.guard
│   ├── interceptors/   auth.interceptor.ts
│   ├── layouts/        main-layout.component.ts
│   ├── models/         usuario.model.ts, api-response.model.ts
│   └── services/       auth.service.ts, notification.service.ts, export.service.ts
│
├── shared/
│   ├── components/     confirm-dialog, page-header, empty-state, loading
│   ├── interfaces/     common.interfaces.ts (NivelEducativo, EstadoRegistro…)
│   ├── pipes/          estado.pipe.ts
│   └── utils/          demo-data.ts, helpers.ts
│
└── features/
    ├── auth/           login
    ├── dashboard/      resumen con stats, accesos rápidos, niveles
    ├── profesores/     CRUD completo + restauración
    ├── estudiantes/    CRUD completo + apoderado + filtros
    ├── grados/         grados y secciones en tabs
    ├── cursos/         áreas curriculares por nivel
    ├── competencias/   por curso, nivel y grado
    ├── periodos/       año académico, activar periodo
    ├── matriculas/     asignación estudiante↔grado↔sección↔periodo
    ├── notas/          registro masivo + exportar Excel/CSV + imprimir
    └── asistencias/    registro diario + resumen + exportar
```

---

## ✅ Funcionalidades implementadas

| Módulo | Lista | Crear | Editar | Eliminar | Restaurar | Exportar |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Profesores | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Estudiantes | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Grados | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Secciones | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Cursos | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Competencias | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Periodos | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Matrículas | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Notas | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Excel/CSV/Print |
| Asistencias | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Excel/CSV/Print |
| Dashboard | ✅ | — | — | — | — | — |
| Login | ✅ | — | — | — | — | — |

---

## 🔐 Roles y permisos

| Módulo | ADMINISTRADOR | PROFESOR | ESTUDIANTE |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Profesores | ✅ | ❌ | ❌ |
| Estudiantes | ✅ | ✅ (ver) | ❌ |
| Grados/Secciones | ✅ | ❌ | ❌ |
| Cursos | ✅ | ✅ (ver) | ❌ |
| Competencias | ✅ | ✅ (ver) | ❌ |
| Periodos | ✅ | ❌ | ❌ |
| Matrículas | ✅ | ❌ | ❌ |
| Notas | ✅ | ✅ | ✅ (ver propias) |
| Asistencias | ✅ | ✅ | ❌ |

---

## 📦 Dependencias

| Paquete | Versión | Motivo |
|---|---|---|
| @angular/core | 19.x | Framework principal |
| exceljs | ^4.x | Exportación a .xlsx |
| file-saver | ^2.x | Descarga de archivos |
| @types/file-saver | ^2.x | Tipado TypeScript |

---

## 🗂️ Niveles educativos

### INICIAL
- Aulas: 3 años, 4 años, 5 años
- Escala sugerida: AD / A / B / C (configurable)
- Competencias: ingresadas por la institución según su currículo

### PRIMARIA
- Grados: 1° a 6°
- Escala sugerida: AD / A / B / C (configurable)
- Competencias: ingresadas por la institución según su currículo

### SECUNDARIA
- Grados: 1° a 5°
- Escala sugerida: 0 – 20 (configurable)
- Competencias: ingresadas por la institución según su currículo

> ℹ️ Las escalas de evaluación son configurables. No se impone una escala oficial.

---

## 🔌 Contratos para backend Spring Boot (Etapa 2)

### Entidades principales

```
Usuario        → id, username, password, nombre, apellido, correo, rol, activo
Profesor       → id, tipoDocumento, numeroDocumento, nombres, apellidos, especialidad,
                 telefono, correo, fechaContratacion, estado
Estudiante     → id, codigo, tipoDocumento, numeroDocumento, nombres, apellidos,
                 fechaNacimiento, genero, telefono, correo, nombreApoderado,
                 telefonoApoderado, relacionApoderado, estado
NivelEducativo → INICIAL | PRIMARIA | SECUNDARIA
Grado          → id, nombre, nivel, orden, descripcion, estado
Seccion        → id, nombre, gradoId, capacidad, turno, estado
Curso          → id, codigo, nombre, descripcion, nivel, gradoIds[], horasSemanales, estado
Competencia    → id, codigo, nombre, descripcion, cursoId, nivel, gradoIds[], estado
Periodo        → id, nombre, anioAcademico, fechaInicio, fechaFin, activo, estado
Matricula      → id, estudianteId, nivelEducativo, gradoId, seccionId, periodoId,
                 anioAcademico, fechaMatricula, estado
Nota           → id, matriculaId, estudianteId, competenciaId, cursoId, nivelEducativo,
                 gradoId, seccionId, periodoId, profesorId, calificacion, observacion,
                 fechaRegistro, estado
Asistencia     → id, matriculaId, estudianteId, nivelEducativo, gradoId, seccionId,
                 cursoId, periodoId, fecha, estadoAsistencia, observacion, estado
```

### Endpoints REST necesarios

```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/profesores?busqueda=&especialidad=&estado=&page=&size=
POST   /api/profesores
GET    /api/profesores/{id}
PUT    /api/profesores/{id}
DELETE /api/profesores/{id}
PATCH  /api/profesores/{id}/restaurar

GET    /api/estudiantes?busqueda=&nivel=&gradoId=&seccionId=&estado=&page=&size=
POST   /api/estudiantes
GET    /api/estudiantes/{id}
PUT    /api/estudiantes/{id}
DELETE /api/estudiantes/{id}
PATCH  /api/estudiantes/{id}/restaurar

GET    /api/grados?nivel=
POST   /api/grados
PUT    /api/grados/{id}
DELETE /api/grados/{id}
PATCH  /api/grados/{id}/restaurar

GET    /api/secciones?gradoId=
POST   /api/secciones
PUT    /api/secciones/{id}
DELETE /api/secciones/{id}
PATCH  /api/secciones/{id}/restaurar

GET    /api/cursos?busqueda=&nivel=&gradoId=&estado=
POST   /api/cursos
PUT    /api/cursos/{id}
DELETE /api/cursos/{id}
PATCH  /api/cursos/{id}/restaurar

GET    /api/competencias?cursoId=&nivel=&gradoId=&estado=
POST   /api/competencias
PUT    /api/competencias/{id}
DELETE /api/competencias/{id}
PATCH  /api/competencias/{id}/restaurar

GET    /api/periodos?estado=
POST   /api/periodos
PUT    /api/periodos/{id}
DELETE /api/periodos/{id}
PATCH  /api/periodos/{id}/restaurar
PATCH  /api/periodos/{id}/activar

GET    /api/matriculas?nivel=&gradoId=&seccionId=&periodoId=&estado=
POST   /api/matriculas
PUT    /api/matriculas/{id}
DELETE /api/matriculas/{id}
PATCH  /api/matriculas/{id}/restaurar

GET    /api/notas?nivelEducativo=&gradoId=&seccionId=&cursoId=&periodoId=&estudianteId=
POST   /api/notas
POST   /api/notas/lote
PUT    /api/notas/{id}
DELETE /api/notas/{id}
PATCH  /api/notas/{id}/restaurar

GET    /api/asistencias?nivelEducativo=&seccionId=&cursoId=&periodoId=&fecha=&estudianteId=
POST   /api/asistencias
PUT    /api/asistencias/{id}
DELETE /api/asistencias/{id}
PATCH  /api/asistencias/{id}/restaurar
```

---

## ⚠️ Limitaciones de esta etapa (Etapa 1)

- Los datos son de **demostración local** — no se persisten en base de datos
- La autenticación es simulada — **no segura para producción**
- Los cambios se pierden al recargar la página
- La exportación Excel/CSV usa los datos en memoria
- La seguridad real, permisos por endpoint y validaciones de negocio se implementarán en el backend Spring Boot (Etapa 2)

---

## 🛠️ Stack tecnológico

- **Angular 19** — Standalone components, Signals, @if/@for
- **TypeScript 5** — Strict mode
- **RxJS** — Observables para servicios
- **ExcelJS** — Generación de archivos .xlsx
- **FileSaver** — Descarga de archivos en el navegador
- CSS puro — Sin dependencias de UI externas

---

*Desarrollado como Etapa 1 de 3. Siguiente etapa: Backend Spring Boot + SQL Server.*
