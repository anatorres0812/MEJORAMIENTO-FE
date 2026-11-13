
import { Docente } from '../models/docente.model';

export const DOCENTES: Docente[] = [
  {
    id: 'd1',
    nombres: 'Carlos',
    apellidos: 'Pérez',
    correo: 'carlos.perez@colegio.edu.pe',
    dni: '12345678',
    especialidad: 'Matemática',
    nivel: 'Secundaria',
    cursosAsignados: ['mat-sec']
  },
  {
    id: 'd2',
    nombres: 'María',
    apellidos: 'López',
    correo: 'maria.lopez@colegio.edu.pe',
    dni: '23456789',
    especialidad: 'Comunicación',
    nivel: 'Primaria',
    cursosAsignados: ['com-pri']
  },
  {
    id: 'd3',
    nombres: 'Juan',
    apellidos: 'Ramos',
    correo: 'juan.ramos@colegio.edu.pe',
    dni: '34567890',
    especialidad: 'Ciencia y Tecnología',
    nivel: 'Secundaria',
    cursosAsignados: ['cyt-sec']
  },
  {
    id: 'd4',
    nombres: 'Ana',
    apellidos: 'Torres',
    correo: 'ana.torres@colegio.edu.pe',
    dni: '45678901',
    especialidad: 'Inglés',
    nivel: 'Secundaria',
    cursosAsignados: ['ing-sec']
  },
  {
    id: 'd5',
    nombres: 'Rosa',
    apellidos: 'Medina',
    correo: 'rosa.medina@colegio.edu.pe',
    dni: '56789012',
    especialidad: 'Comunicación Inicial',
    nivel: 'Inicial',
    cursosAsignados: ['com-ini', 'psi-ini']
  },
  {
    id: 'd6',
    nombres: 'Miguel',
    apellidos: 'Sánchez',
    correo: 'miguel.sanchez@colegio.edu.pe',
    dni: '67890123',
    especialidad: 'Comunicación',
    nivel: 'Secundaria',
    cursosAsignados: ['com-sec']
  }
];
