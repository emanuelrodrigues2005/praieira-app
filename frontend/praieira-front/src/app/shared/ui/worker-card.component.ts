import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { WorkerProfileSearchResult } from '../../core/http/catalog-api.service';
import { RatingStarsComponent } from './rating-stars.component';

@Component({
  selector: 'app-worker-card',
  standalone: true,
  imports: [RouterModule, RatingStarsComponent],
  template: `
    <div class="worker-card">
      <div class="worker-image" data-testid="worker-image">
        @if (worker.coverImage) {
          <img [src]="worker.coverImage" [alt]="worker.name" class="cover-img" />
        } @else {
          <span class="placeholder-icon">🏪</span>
        }
      </div>
      <div class="worker-info">
        <h3 class="worker-name">{{ worker.name }}</h3>
        <span class="worker-category">{{ worker.category }}</span>
        <span class="worker-beach">📍 {{ worker.beach }}</span>
        <div class="worker-rating" data-testid="rating">
          <app-rating-stars [rating]="averageRating" />
          <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
          <span class="rating-count">({{ totalReviews }})</span>
        </div>
        <button
          class="view-profile-btn"
          data-testid="view-profile-btn"
          (click)="goToProfile()"
        >
          Ver perfil
        </button>
      </div>
    </div>
  `,
  styles: [`
    .worker-card {
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      transition: box-shadow 0.2s, transform 0.2s;
    }
    .worker-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .worker-image {
      height: 120px;
      background: linear-gradient(135deg, #e0f4fd, #b3e5fc);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-icon {
      font-size: 2.5rem;
    }
    .worker-info {
      padding: 0.75rem 1rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .worker-name {
      font-size: 1rem;
      font-weight: 700;
      color: #04303a;
      margin: 0;
    }
    .worker-category {
      font-size: 0.8rem;
      font-weight: 600;
      color: #00a8e8;
    }
    .worker-beach {
      font-size: 0.8rem;
      color: #97a0a6;
    }
    .worker-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.25rem;
    }
    .rating-value {
      font-size: 0.85rem;
      font-weight: 600;
      color: #04303a;
    }
    .rating-count {
      font-size: 0.75rem;
      color: #97a0a6;
    }
    .view-profile-btn {
      margin-top: 0.5rem;
      padding: 0.5rem 1rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    .view-profile-btn:hover {
      background: #0096c7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkerCardComponent {
  private readonly router = inject(Router);

  @Input({ required: true }) worker!: WorkerProfileSearchResult & {
    averageRating?: number;
    totalReviews?: number;
  };

  get averageRating(): number {
    return this.worker.averageRating ?? 0;
  }

  get totalReviews(): number {
    return this.worker.totalReviews ?? 0;
  }

  goToProfile(): void {
    this.router.navigate(['/perfil', this.worker.id]);
  }
}
