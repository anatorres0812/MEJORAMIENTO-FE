
import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  @Input() nombreUsuario = '';
  @Input() rolLabel = '';

  @Output() toggleSidebar = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
}
