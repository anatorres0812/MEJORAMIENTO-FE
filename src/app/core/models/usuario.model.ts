export type Rol = 'ADMINISTRADOR' | 'PROFESOR' | 'ESTUDIANTE';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  token?: string;

  referenciaId?: number | string;
  nombreCompleto?: string;
  usuario?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export type RolUsuario = Rol;