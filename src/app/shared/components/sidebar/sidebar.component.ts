
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Estructura de un ítem del menú lateral
export interface MenuItem {
  label: string;
  icono: string;
  ruta?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() items: MenuItem[] = [];
  @Input() abierto = false;

  @Output() cerrarSesion = new EventEmitter<void>();
  @Output() itemSeleccionado = new EventEmitter<void>();

  onCerrarSesion(): void {
    this.cerrarSesion.emit();
  }

  onSeleccionarItem(): void {
    this.itemSeleccionado.emit();
  }
}
