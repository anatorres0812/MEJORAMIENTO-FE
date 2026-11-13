
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">{{ icono }}</div>
      <p>{{ mensaje }}</p>
      <ng-content />
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 36px 20px;
      text-align: center;
      border: 1px dashed var(--border, #e1e8f0);
      border-radius: 14px;
      background: var(--bg-card, #fff);
      color: var(--text-secondary, #4b5568);
    }

    .empty-icon {
      font-size: 36px;
      line-height: 1.2;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-muted, #718096);
    }
  `]
})
export class EmptyStateComponent {
  @Input() icono = '📋';
  @Input() mensaje = 'No se encontraron registros';
}
