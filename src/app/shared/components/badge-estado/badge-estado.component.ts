
import { Component, Input } from '@angular/core';
import { EstadoNota } from '../../../core/models/nota.model';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  templateUrl: './badge-estado.component.html',
  styleUrl: './badge-estado.component.css'
})
export class BadgeEstadoComponent {
  @Input({ required: true }) estado!: EstadoNota;
}
