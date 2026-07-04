import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

const DEFAULT_CATEGORIES = [
  'Restaurante',
  'Quiosque',
  'Passeio',
  'Artesanato',
  'Hospedagem',
  'Eventos',
];

@Component({
  selector: 'app-category-filter',
  standalone: true,
  template: `
    <div class="category-filter">
      @for (category of categories; track category) {
        <button
          class="category-chip"
          data-testid="category-chip"
          [class.active]="category === selectedCategory"
          (click)="onSelect(category)"
        >
          {{ category }}
        </button>
      }
    </div>
  `,
  styles: [`
    .category-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .category-chip {
      padding: 0.35rem 0.75rem;
      border: 1px solid #d0d5dd;
      border-radius: 20px;
      background: #ffffff;
      color: #04303a;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .category-chip:hover {
      border-color: #00a8e8;
      color: #00a8e8;
    }
    .category-chip.active {
      background: #00a8e8;
      color: #ffffff;
      border-color: #00a8e8;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFilterComponent {
  @Input() categories: string[] = DEFAULT_CATEGORIES;

  @Input() selectedCategory = '';

  @Output() categoryChange = new EventEmitter<string>();

  onSelect(category: string): void {
    if (category === this.selectedCategory) {
      this.categoryChange.emit('');
    } else {
      this.categoryChange.emit(category);
    }
  }
}
