export type NivelEducativo = 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA';
export type EstadoRegistro = 'ACTIVO' | 'INACTIVO' | 'ELIMINADO';
export type TipoDocumento = 'DNI' | 'PASAPORTE' | 'CE' | 'OTRO';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FiltroBase {
  busqueda?: string;
  estado?: EstadoRegistro;
  page?: number;
  pageSize?: number;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'badge' | 'actions' | 'number';
}

export interface ConfirmDialogData {
  titulo: string;
  mensaje: string;
  tipo?: 'danger' | 'warning' | 'info';
}

export interface Notification {
  tipo: 'success' | 'error' | 'warning' | 'info';
  mensaje: string;
  duracion?: number;
}

export interface BreadcrumbItem {
  label: string;
  ruta?: string;
}

// Contrato para backend Spring Boot
// GET    /api/{recurso}           - Listar con paginación y filtros
// GET    /api/{recurso}/{id}      - Obtener por ID
// POST   /api/{recurso}           - Crear
// PUT    /api/{recurso}/{id}      - Actualizar
// DELETE /api/{recurso}/{id}      - Eliminación lógica
// PATCH  /api/{recurso}/{id}/restaurar - Restaurar
