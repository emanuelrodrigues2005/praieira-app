import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-rating-stars',
  template: `
    <span class="rating-stars">
      @for (star of [1,2,3,4,5]; track star) {
        <span class="star">{{ star <= rating ? '★' : '☆' }}</span>
      }
    </span>
  `,
  styles: [`
    .star { color: #ffb74d; font-size: 1.2rem; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingStarsComponent {
  @Input() rating: number = 0;
}
