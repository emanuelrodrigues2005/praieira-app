import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-beach-selector',
  standalone: true,
  template: `
    <select
      class="beach-select"
      data-testid="beach-select"
      [value]="selectedBeach"
      (change)="onChange($any($event.target).value)"
    >
      <option value="">Todas as praias</option>
      @for (beach of beaches; track beach) {
        <option [value]="beach">{{ beach }}</option>
      }
    </select>
  `,
  styles: [`
    .beach-select {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #04303a;
      background: #ffffff;
      cursor: pointer;
      outline: none;
      appearance: auto;
    }
    .beach-select:focus {
      border-color: #00a8e8;
      box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeachSelectorComponent {
  readonly beaches = ['Gaibu', 'Porto de Galinhas', 'Praia dos Carneiros', 'Boa Viagem'];

  @Input() selectedBeach = '';

  @Output() beachChange = new EventEmitter<string>();

  onChange(value: string): void {
    this.beachChange.emit(value);
  }
}
