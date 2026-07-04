import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (totalPages > 1) {
      <nav class="pagination" data-testid="pagination">
        <button
          class="page-nav"
          data-testid="prev-btn"
          [disabled]="page <= 1"
          (click)="goToPage(page - 1)"
        >
          Anterior
        </button>

        @for (p of getPages(); track p) {
          <button
            class="page-btn"
            data-testid="page-btn"
            [class.active]="p === page"
            (click)="goToPage(p)"
          >
            {{ p }}
          </button>
        }

        <button
          class="page-nav"
          data-testid="next-btn"
          [disabled]="page >= totalPages"
          (click)="goToPage(page + 1)"
        >
          Próximo
        </button>
      </nav>
    }
  `,
  styles: [`
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;
      padding: 1rem 0;
    }
    .page-btn, .page-nav {
      min-width: 36px;
      height: 36px;
      border: 1px solid #d0d5dd;
      border-radius: 6px;
      background: #ffffff;
      color: #04303a;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.5rem;
      transition: all 0.15s;
    }
    .page-btn:hover:not(.active), .page-nav:hover:not(:disabled) {
      border-color: #00a8e8;
      color: #00a8e8;
    }
    .page-btn.active {
      background: #00a8e8;
      color: #ffffff;
      border-color: #00a8e8;
      font-weight: 600;
    }
    .page-nav:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input({ required: true }) page!: number;
  @Input({ required: true }) totalPages!: number;

  @Output() pageChange = new EventEmitter<number>();

  protected getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages && p !== this.page) {
      this.pageChange.emit(p);
    }
  }
}
