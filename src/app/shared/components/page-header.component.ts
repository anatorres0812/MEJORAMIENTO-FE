
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="page-header-text">
        <h2>{{ titulo }}</h2>
        <p *ngIf="subtitulo" class="text-muted text-sm">
          {{ subtitulo }}
        </p>
      </div>

      <div class="page-header-actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      flex-wrap: wrap;
      margin-bottom: 22px;
      color: var(--text-primary, #172033);
    }

    .page-header-text { min-width: 0; }

    .page-header h2 {
      margin: 0;
      color: var(--text-primary, #172033);
      font-size: clamp(1.25rem, 2vw, 1.65rem);
      font-weight: 800;
    }

    .page-header p {
      margin: 7px 0 0;
      color: var(--text-muted, #718096);
    }

    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
  `]
})
export class PageHeaderComponent {
  @Input() titulo = '';
  @Input() subtitulo = '';
}
