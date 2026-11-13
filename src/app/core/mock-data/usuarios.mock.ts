import { Usuario } from '../models/usuario.model';

// Usuarios simulados para el login del frontend
// Nota: estas credenciales son de prueba; todavía no validan contra el backend.

export const USUARIOS: Usuario[] = [
  // =========================
  // ESTUDIANTES
  // =========================
  {
    id: 1,
    username: 'Mateo',
    nombre: 'Mateo',
    apellido: '',
    correo: '',
    rol: 'ESTUDIANTE',
    activo: true,
    nombreCompleto: 'Mateo',
    referenciaId: 'e1',
  },
  {
    id: 2,
    username: 'Sofía',
    nombre: 'Sofía',
    apellido: '',
    correo: '',
    rol: 'ESTUDIANTE',
    activo: true,
    nombreCompleto: 'Sofía',
    referenciaId: 'e2',
  },
  {
    id: 3,
    username: 'Juan',
    nombre: 'Juan',
    apellido: '',
    correo: '',
    rol: 'ESTUDIANTE',
    activo: true,
    nombreCompleto: 'Juan',
    referenciaId: 'e3',
  },

  // =========================
  // DOCENTES
  // =========================
  {
    id: 4,
    username: 'rosa.medina@colegio.edu.pe',
    nombre: 'Rosa',
    apellido: 'Medina',
    correo: 'rosa.medina@colegio.edu.pe',
    rol: 'PROFESOR',
    activo: true,
    nombreCompleto: 'Rosa Medina',
    referenciaId: 'd1',
  },
  {
    id: 5,
    username: 'maria.lopez@colegio.edu.pe',
    nombre: 'María',
    apellido: 'López',
    correo: 'maria.lopez@colegio.edu.pe',
    rol: 'PROFESOR',
    activo: true,
    nombreCompleto: 'María López',
    referenciaId: 'd2',
  },
  {
    id: 6,
    username: 'carlos.perez@colegio.edu.pe',
    nombre: 'Carlos',
    apellido: 'Pérez',
    correo: 'carlos.perez@colegio.edu.pe',
    rol: 'PROFESOR',
    activo: true,
    nombreCompleto: 'Carlos Pérez',
    referenciaId: 'd3',
  },

  // =========================
  // ADMINISTRADOR
  // =========================
  {
    id: 7,
    username: 'admin',
    nombre: 'Administrador',
    apellido: 'del Sistema',
    correo: 'admin@colegio.edu.pe',
    rol: 'ADMINISTRADOR',
    activo: true,
    nombreCompleto: 'Administrador del Sistema',
    referenciaId: '',
  },
];
