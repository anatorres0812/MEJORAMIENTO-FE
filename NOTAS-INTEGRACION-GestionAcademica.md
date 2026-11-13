# Integración FE → BE → GestionAcademica

- Se conserva Angular y el diseño existente.
- En producción Angular usa `apiUrl: '/api'`.
- Nginx reenvía `/api/` al backend privado `10.0.1.158:8080` observado durante la revisión. Confirmar que esa IP privada siga vigente antes de desplegar.
- El formulario público de contacto envía `POST /api/contacto`; el backend actualizado incorpora ese endpoint y guarda en `dbo.contact_message`.
- No se cambia el script SQL ni se crean contenedores desde el frontend.
