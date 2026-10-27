import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface NotificationItem {
  id: number;
  tipo: 'success' | 'error' | 'warning' | 'info';
  mensaje: string;
  duracion?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = environment.apiUrl;
  private counter = 0;
  notificaciones = signal<NotificationItem[]>([]);

  success(mensaje: string, duracion = 4000): void {
    this.agregar({ tipo: 'success', mensaje, duracion });
  }

  error(mensaje: string, duracion = 6000): void {
    this.agregar({ tipo: 'error', mensaje, duracion });
  }

  warning(mensaje: string, duracion = 5000): void {
    this.agregar({ tipo: 'warning', mensaje, duracion });
  }

  info(mensaje: string, duracion = 4000): void {
    this.agregar({ tipo: 'info', mensaje, duracion });
  }

  remover(id: number): void {
    this.notificaciones.update(items => items.filter(n => n.id !== id));
  }

  private agregar(notif: Omit<NotificationItem, 'id'>): void {
    const id = ++this.counter;
    this.notificaciones.update(items => [...items, { ...notif, id }]);
    if (notif.duracion && notif.duracion > 0) {
      setTimeout(() => this.remover(id), notif.duracion);
    }
  }
}
