import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

export interface BeachInfo {
  name: string;
  establishments: number;
}

@Component({
  selector: 'app-beach-carousel',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="beach-carousel">
      <h2 class="section-title">Praias</h2>
      <div class="carousel-track">
        @for (beach of beaches; track beach.name) {
          <div
            class="beach-card"
            data-testid="beach-card"
            (click)="navigateToBeach(beach.name)"
          >
            <div class="beach-image-placeholder">
              <span class="beach-emoji">🏖️</span>
            </div>
            <div class="beach-info">
              <h3 class="beach-name">{{ beach.name }}</h3>
              <p class="beach-count" data-testid="beach-count">
                {{ beach.establishments }} estabelecimentos
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .beach-carousel { margin-bottom: 2rem; }
    .section-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #073642;
      margin-bottom: 1rem;
    }
    .carousel-track {
      display: flex;
      gap: 1rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
      scroll-snap-type: x mandatory;
    }
    .beach-card {
      flex: 0 0 240px;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      cursor: pointer;
      transition: box-shadow 0.2s, transform 0.2s;
      scroll-snap-align: start;
    }
    .beach-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
    .beach-image-placeholder {
      height: 120px;
      background: linear-gradient(135deg, #004e89, #0096c7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .beach-emoji { font-size: 2.5rem; }
    .beach-info { padding: 0.75rem 1rem; }
    .beach-name {
      font-size: 1rem;
      font-weight: 700;
      color: #04303a;
      margin: 0 0 0.25rem;
    }
    .beach-count {
      font-size: 0.8rem;
      color: #97a0a6;
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BeachCarouselComponent {
  private readonly router = inject(Router);

  @Input() beaches: BeachInfo[] = [
    { name: 'Gaibu', establishments: 18 },
    { name: 'Porto de Galinhas', establishments: 23 },
    { name: 'Praia dos Carneiros', establishments: 12 },
    { name: 'Boa Viagem', establishments: 30 },
  ];

  navigateToBeach(beach: string): void {
    this.router.navigate(['/explorar'], { queryParams: { beach } });
  }
}
