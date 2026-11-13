# Conexión FE -> BE -> SQL Server (sin modificar el BE)

Se conservó el diseño y la API base de producción (`/api`). Se agregó `nginx-TorresAna.conf` para que el mismo origen web reenvíe `/api/*` al backend Spring Boot existente en `172.31.18.45:8080`. Esto evita que Nginx intente resolver `/api/teacher` como una ruta del frontend y provoque el 404.

## Crear imagen del frontend
Desde la carpeta raíz del proyecto FE:

```bash
sudo docker build -f Dockerfile -t torresana-fe:1.1 .
```

Antes de reemplazar el contenedor, comprueba el nombre existente:

```bash
sudo docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Ports}}'
```

Si el contenedor actual se llama `frontend-TorresAna`, reemplázalo conservando la imagen anterior para poder volver atrás:

```bash
sudo docker stop frontend-TorresAna
sudo docker rename frontend-TorresAna frontend-TorresAna-anterior
sudo docker run -d --name frontend-TorresAna --restart unless-stopped -p 80:80 torresana-fe:1.1
```

No borres el contenedor anterior hasta probar la aplicación. Si el puerto 80 sigue ocupado por otro contenedor, no ejecutes el último comando todavía; primero revisa `docker ps -a`.

## Qué debe ocurrir
- Angular solicita `/api/teacher`, `/api/student`, etc. al mismo servidor web.
- Nginx reenvía esas solicitudes al BE sin cambiar el BE.
- Los GET consultan lo que devuelve el backend; si se inserta un registro por Swagger o directamente en SQL Server y el backend lo devuelve en el listado, Angular lo mostrará al recargar/actualizar el módulo.
- Los POST enviados desde Angular deben ser aceptados por el backend para que Spring Boot los persista en SQL Server.

## Límite importante
El backend recibido implementa GET de colección, GET por ID y POST para sus controladores CRUD básicos. No implementa en esos controladores PUT, DELETE, PATCH, filtros `/activos`, `/eliminados`, ni operaciones por lote. Esas operaciones no se pueden hacer funcionar únicamente desde el FE sin cambiar el BE; el frontend no debe simular que fueron guardadas. Las funciones que dependan de esos endpoints deben identificarse y probarse por separado.

La instancia FE debe poder acceder por red al puerto 8080 de `172.31.18.45`. Si la regla de seguridad del BE restringe el puerto 8080, permite TCP 8080 desde la IP privada de la instancia FE, no hace falta abrir SQL Server al público.
