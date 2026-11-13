# 🚀 Despliegue en AWS EC2 — ASE252S3-T03

Guía paso a paso para desplegar las 3 capas en instancias EC2 independientes.

---

## Arquitectura

```
Internet
    │
    │  puerto 80 (público)
    ▼
┌─────────────────────────┐
│  EC2-3: FRONTEND        │  IP pública: xx.xx.xx.xx
│  Angular + Nginx        │  IP privada: 10.0.1.30
│  puerto 80              │
└────────────┬────────────┘
             │  puerto 8085 (IP privada)
             ▼
┌─────────────────────────┐
│  EC2-2: BACKEND         │  IP privada: 10.0.1.20
│  Spring Boot            │  (sin IP pública)
│  puerto 8085            │
└────────────┬────────────┘
             │  puerto 1433 (IP privada)
             ▼
┌─────────────────────────┐
│  EC2-1: BASE DE DATOS   │  IP privada: 10.0.1.10
│  SQL Server 2022        │  (sin IP pública)
│  puerto 1433            │
└─────────────────────────┘
```

---

## PASO 1 — Crear las 3 instancias EC2

En la consola AWS → EC2 → Launch Instance:

| Instancia | Nombre sugerido | AMI | Tipo | Almacenamiento |
|---|---|---|---|---|
| EC2-1 DB | `t03-sqlserver` | Amazon Linux 2023 | `t3.medium` | 30 GB |
| EC2-2 BE | `t03-backend` | Amazon Linux 2023 | `t3.small` | 20 GB |
| EC2-3 FE | `t03-frontend` | Amazon Linux 2023 | `t3.micro` | 20 GB |

> **Importante:** Las 3 deben estar en la **misma VPC y misma subred** para poder comunicarse por IP privada.

Para cada instancia:
- Key pair: crear o usar uno existente (guarda el `.pem`)
- Network: misma VPC y subred
- Auto-assign Public IP: **Solo activar en EC2-3 (frontend)**

---

## PASO 2 — Configurar Security Groups

### SG-1: `sg-sqlserver` (EC2-1 — Base de Datos)

| Tipo | Puerto | Fuente | Descripción |
|---|---|---|---|
| Custom TCP | 1433 | IP privada de EC2-2 | Solo el backend accede a la BD |
| SSH | 22 | Tu IP | Para administración |

> ⛔ NUNCA abrir 1433 a `0.0.0.0/0`

### SG-2: `sg-backend` (EC2-2 — Spring Boot)

| Tipo | Puerto | Fuente | Descripción |
|---|---|---|---|
| Custom TCP | 8085 | IP privada de EC2-3 | Solo el frontend accede al backend |
| SSH | 22 | Tu IP | Para administración |

> ⛔ NUNCA abrir 8085 a `0.0.0.0/0`

### SG-3: `sg-frontend` (EC2-3 — Angular)

| Tipo | Puerto | Fuente | Descripción |
|---|---|---|---|
| HTTP | 80 | `0.0.0.0/0` | Acceso público al frontend |
| SSH | 22 | Tu IP | Para administración |

---

## PASO 3 — Instalar Docker en las 3 instancias

Conectarse por SSH a cada instancia:
```bash
ssh -i tu-key.pem ec2-user@<IP-PUBLICA-EC2>
```

Instalar Docker en cada una:
```bash
sudo yum update -y
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Cerrar sesión y volver a conectar para aplicar el grupo
exit
```

---

## PASO 4 — EC2-1: Levantar SQL Server

```bash
# Crear red Docker
docker network create gestion-net

# Levantar SQL Server
docker run -d \
  --name sqlserver \
  --network gestion-net \
  -e ACCEPT_EULA=Y \
  -e SA_PASSWORD=Admin12345 \
  -p 1433:1433 \
  --restart unless-stopped \
  ruby08/sql-server:2022
```

Verificar que está corriendo:
```bash
docker ps
docker logs sqlserver | tail -20
```

Ejecutar los scripts SQL (desde tu PC con SSMS o Azure Data Studio):
1. Conectar a `<IP-PUBLICA-EC2-1>:1433` con usuario `sa` / `Admin12345`
2. Ejecutar `db.sql`
3. Ejecutar `data-seeds.sql`

---

## PASO 5 — EC2-2: Levantar Spring Boot

Reemplaza `<IP-PRIVADA-EC2-1>` con la IP privada real de EC2-1 (ej: `10.0.1.10`):

```bash
docker network create gestion-net

docker run -d \
  --name backend \
  --network gestion-net \
  -e PORT=8085 \
  -e DATABASE_URL="jdbc:sqlserver://<IP-PRIVADA-EC2-1>:1433;databaseName=BD_Gestion_Academica;encrypt=true;trustServerCertificate=true" \
  -e DATABASE_USERNAME=sa \
  -e DATABASE_PASSWORD=Admin12345 \
  -e DATABASE_DRIVER=com.microsoft.sqlserver.jdbc.SQLServerDriver \
  -e SERVER_URL="http://<IP-PRIVADA-EC2-2>:8085" \
  -p 8085:8085 \
  --restart unless-stopped \
  ruby08/estudiante-sqlserver:1.0
```

Verificar:
```bash
docker logs backend | tail -30
# Debe aparecer: Started CrudApplication in X.X seconds
```

---

## PASO 6 — EC2-3: Levantar Frontend Angular

Reemplaza `<IP-PUBLICA-EC2-2>` con la IP pública de EC2-2 (si la tiene) o la IP privada
desde dentro de la VPC. Para el examen, si el frontend accede al backend por el navegador
del evaluador, usa la **IP pública de EC2-2** con el **puerto 8085 abierto temporalmente**,
o configura un proxy en nginx.

```bash
docker network create gestion-net

docker run -d \
  --name frontend \
  --network gestion-net \
  -e API_URL="http://<IP-PUBLICA-EC2-2>:8085/api" \
  -p 80:80 \
  --restart unless-stopped \
  ruby08/gestion-academica-frontend:1.0
```

Verificar:
```bash
docker logs frontend | grep "Configurando\|ready"
# Debe aparecer: Configurando API_URL: http://...
#                Configuration complete; ready for start up
```

Acceder desde el navegador:
```
http://<IP-PUBLICA-EC2-3>
```

---

## PASO 7 — Verificación de la arquitectura

### Prueba de conectividad desde EC2-2 hacia EC2-1:
```bash
# Desde EC2-2 (backend)
docker exec backend curl -s http://<IP-PRIVADA-EC2-1>:1433 || echo "Conectado (error esperado, no es HTTP)"
```

### Prueba del backend:
```bash
curl http://<IP-PRIVADA-EC2-2>:8085/api/estudiantes
```

### Prueba del frontend:
Abrir en navegador: `http://<IP-PUBLICA-EC2-3>`

---

## PASO 8 — Subir imágenes a Docker Hub (si no están publicadas)

Desde tu PC local:

```bash
# Login
docker login -u ruby08

# Frontend
docker build -t ruby08/gestion-academica-frontend:1.0 -f dockerfile-ruby/Dockerfile .
docker push ruby08/gestion-academica-frontend:1.0

# Backend
cd C:\Users\Usuario3\Desktop\ASE252S3_T03-be
docker build -t ruby08/estudiante-sqlserver:1.0 -f dockerfile-ruby/Dockerfile .
docker push ruby08/estudiante-sqlserver:1.0
```

Luego en cada EC2 basta con `docker pull`:
```bash
docker pull ruby08/gestion-academica-frontend:1.0
docker pull ruby08/estudiante-sqlserver:1.0
docker pull ruby08/sql-server:2022
```

---

## Resumen de IPs a anotar en el examen

| Instancia | IP Privada | IP Pública | Puerto usado |
|---|---|---|---|
| EC2-1 SQL Server | ____________ | (no necesaria) | 1433 |
| EC2-2 Backend | ____________ | ____________ | 8085 |
| EC2-3 Frontend | ____________ | ____________ | 80 |

> Rellena esta tabla cuando levantes las instancias. Las IPs privadas son fijas dentro de la VPC.
> Las IPs públicas cambian si reinicias la instancia (a menos que uses Elastic IP).

---

## Comandos rápidos de emergencia

```bash
# Ver estado de contenedores
docker ps -a

# Ver logs en tiempo real
docker logs -f <nombre-contenedor>

# Reiniciar un contenedor
docker restart <nombre-contenedor>

# Ver IP privada de la instancia actual
hostname -I | awk '{print $1}'

# Ver si el puerto está escuchando
ss -tlnp | grep <puerto>
```

---

