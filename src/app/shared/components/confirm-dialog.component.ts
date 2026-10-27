
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (visible) {
      <div class="overlay" (click)="cancelar()" role="presentation">
        <section
          class="dialog"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="titulo">

          <div class="dialog-header" [class]="'header-' + tipo">
            <span class="dialog-icon" aria-hidden="true">{{ iconoTipo }}</span>
            <h3>{{ titulo }}</h3>
          </div>

          <div class="dialog-body">
            <p>{{ mensaje }}</p>
          </div>

          <div class="dialog-footer">
            <button type="button" class="btn-cancel" (click)="cancelar()">
              Cancelar
            </button>
            <button
              type="button"
              class="btn-confirm"
              [class]="'btn-' + tipo"
              (click)="confirmar()">
              Confirmar
            </button>
          </div>
        </section>
      </div>
    }
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: rgba(0, 0, 0, .56);
      animation: fadeIn .2s ease;
    }

    .dialog {
      width: 100%;
      max-width: 420px;
      overflow: hidden;
      border: 1px solid var(--border, #e1e8f0);
      border-radius: 14px;
      background: var(--bg-card, #fff);
      color: var(--text-primary, #172033);
      box-shadow: 0 20px 60px rgba(0, 0, 0, .3);
      animation: slideUp .2s ease;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 18px 20px;
      border-bottom: 2px solid var(--border, #e1e8f0);
    }

    .header-danger { background: var(--danger-light, #fee2e2); }
    .header-warning { background: var(--warning-light, #fef3c7); }
    .header-info { background: var(--info-light, #e0f2fe); }

    .dialog-icon { font-size: 24px; }

    .dialog-header h3 {
      margin: 0;
      color: var(--text-primary, #172033);
      font-size: 17px;
    }

    .dialog-body { padding: 20px; }

    .dialog-body p {
      margin: 0;
      color: var(--text-secondary, #4b5568);
      font-size: 15px;
      line-height: 1.5;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 20px;
      background: var(--bg-filter, #f7fafc);
      border-top: 1px solid var(--border, #e1e8f0);
    }

    .btn-cancel, .btn-confirm {
      padding: 8px 18px;
      border-radius: 7px;
      cursor: pointer;
      font-size: 14px;
    }

    .btn-cancel {
      background: var(--bg-card, #fff);
      border: 1px solid var(--border, #e1e8f0);
      color: var(--text-secondary, #4b5568);
    }

    .btn-confirm {
      border: 0;
      color: #fff;
      font-weight: 700;
    }

    .btn-danger { background: #dc2626; }
    .btn-warning { background: #b45309; }
    .btn-info { background: #0369a1; }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (prefers-reduced-motion: reduce) {
      .overlay, .dialog { animation: none; }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() titulo = 'Confirmar acción';
  @Input() mensaje = '¿Estás seguro de realizar esta acción?';
  @Input() tipo: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  get iconoTipo(): string {
    return {
      danger: '🗑️',
      warning: '⚠️',
      info: 'ℹ️'
    }[this.tipo];
  }

  confirmar(): void {
    this.confirmado.emit();
  }

  cancelar(): void {
    this.cancelado.emit();
  }
}
