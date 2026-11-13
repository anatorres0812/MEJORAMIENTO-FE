# Adaptación del frontend al backend MEJORAMIENTO-BE-main

Se conservaron la estructura y los componentes de Angular. Se ajustaron las URLs de los servicios para apuntar a las rutas reales del backend Spring Boot:

| Funcionalidad Angular | Endpoint del backend |
|---|---|
| Estudiantes | `/api/student` |
| Profesores | `/api/teacher` |
| Cursos | `/api/course` |
| Grados | `/api/grade` |
| Secciones | `/api/section` |
| Matrículas | `/api/enrollment` |
| Notas/registros de calificación | `/api/grade-record` |
| Competencias | `/api/competency` |
| Periodos | `/api/academic-period` |
| Asistencias | `/api/attendance` |
| Aulas | `/api/classroom` |

La URL base de desarrollo sigue siendo `http://localhost:8085/api`.

## Limitaciones que siguen pendientes

La adaptación de rutas no implica que todas las pantallas funcionen completamente todavía. El backend proporcionado solo implementa operaciones CRUD básicas para varios recursos. No se encontraron controladores para login/usuarios, aulas adicionales del frontend, notificaciones, reportes ni todas las rutas auxiliares (`/activos`, `/eliminados`, `/restaurar`, filtros por nivel/grado, etc.). Algunas entidades del backend usan nombres de campos e identificadores distintos a las interfaces de Angular; esos mapeos deben hacerse según los modelos reales de cada pantalla y no es seguro inferirlos solo cambiando URLs.

Por ello, conserva una copia del proyecto original. Este paquete adapta las rutas base del frontend al backend existente; no se debe considerar una integración completa hasta implementar y probar los mapeos de DTO y las operaciones que faltan.
