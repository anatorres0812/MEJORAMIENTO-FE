
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  template: `
    <div class="loading-wrap" role="status" aria-live="polite">
      <span class="spinner-md" aria-hidden="true"></span>
      <span>{{ mensaje }}</span>
    </div>
  `,
  styles: [`
    .loading-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      min-height: 90px;
      padding: 20px;
      color: var(--text-secondary, #4b5568);
    }

    .spinner-md {
      display: inline-block;
      width: 26px;
      height: 26px;
      flex: 0 0 26px;
      border: 3px solid var(--border, #e1e8f0);
      border-top-color: var(--accent, #2563eb);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner-md { animation: none; }
    }
  `]
})
export class LoadingComponent {
  @Input() mensaje = 'Cargando...';
}
