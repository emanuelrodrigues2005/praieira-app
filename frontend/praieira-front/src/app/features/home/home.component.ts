import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../core/auth/auth.store';
import { CatalogApiService } from '../../core/http/catalog-api.service';
import { BeachCarouselComponent } from '../../shared/ui/beach-carousel.component';
import { WorkerCardComponent } from '../../shared/ui/worker-card.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, FormsModule, BeachCarouselComponent, WorkerCardComponent],
  template: `
    <div class="home-page">
      <!-- Greeting + Hero Section -->
      <section class="hero-section">
        <p class="greeting" data-testid="greeting">
          @if (authStore.isAuthenticated()) {
            Olá, {{ authStore.user()?.name ?? 'Turista' }} 👋
          } @else {
            Bem-vindo ao Praieira App 👋
          }
        </p>
        <h1 class="hero-title">Descubra o melhor da orla pernambucana</h1>
        <p class="hero-subtitle">Restaurantes, passeios, quiosques e muito mais</p>

        <!-- Search Bar -->
        <div class="search-bar">
          <input
            class="search-input"
            data-testid="search-input"
            type="text"
            placeholder="O que você está procurando?"
            [(ngModel)]="searchQuery"
          />
          <div class="search-divider"></div>
          <select
            class="search-beach-select"
            data-testid="search-beach"
            [(ngModel)]="selectedBeach"
          >
            <option value="">Todas as praias</option>
            <option value="Gaibu">Gaibu</option>
            <option value="Porto de Galinhas">Porto de Galinhas</option>
            <option value="Praia dos Carneiros">Praia dos Carneiros</option>
            <option value="Boa Viagem">Boa Viagem</option>
          </select>
          <button
            class="search-btn"
            data-testid="search-btn"
            aria-label="Buscar"
            (click)="onSearch()"
          >
            🔍
          </button>
        </div>

        <!-- Quick Stats (inside hero) -->
        <div class="hero-stats">
          @if (statsLoading() && !statsError()) {
            <div class="hero-stats-grid">
              @for (item of [1,2,3]; track item) {
                <div class="hero-stat-skeleton" data-testid="skeleton">
                  <div class="hero-skeleton-number"></div>
                  <div class="hero-skeleton-label"></div>
                </div>
              }
            </div>
          } @else if (statsError()) {
            <div class="hero-stats-error">
              <p>Não foi possível carregar as estatísticas</p>
              <button class="retry-btn" data-testid="retry-btn" (click)="loadStats()">Tentar novamente</button>
            </div>
          } @else {
            <div class="hero-stats-grid">
              <div class="hero-stat-item" data-testid="hero-stat-item">
                <span class="hero-stat-number">{{ stats().establishments }}+</span>
                <span class="hero-stat-label">Estabelecimentos</span>
              </div>
              <div class="hero-stat-divider"></div>
              <div class="hero-stat-item" data-testid="hero-stat-item">
                <span class="hero-stat-number">{{ stats().beaches }}</span>
                <span class="hero-stat-label">Praias</span>
              </div>
              <div class="hero-stat-divider"></div>
              <div class="hero-stat-item" data-testid="hero-stat-item">
                <span class="hero-stat-number">{{ stats().categories }}</span>
                <span class="hero-stat-label">Categorias</span>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Categories Row -->
      <section class="categories-section" data-testid="categories-section">
        <h2 class="categories-title">Categorias</h2>
        <div class="categories-chips">
          <button class="chip chip-active">Todos</button>
          <button class="chip">Restaurantes</button>
          <button class="chip">Bares</button>
          <button class="chip">Barracas</button>
          <button class="chip">Passeios</button>
          <button class="chip">Bugueiros</button>
          <button class="chip">Comércio/Artes</button>
          <button class="chip">Atrações</button>
        </div>
      </section>

      <!-- Beach Carousel -->
      <section class="section-container">
        <app-beach-carousel />
      </section>

      <!-- Featured Establishments -->
      <section class="section-container featured-section">
        <div class="featured-header">
          <h2 class="section-title" data-testid="featured-title">Destaques em Porto de Galinhas</h2>
          <a class="featured-see-all" routerLink="/explorar">Ver todos →</a>
        </div>
        <div class="featured-grid">
          @for (worker of featuredWorkers(); track worker.id) {
            <app-worker-card [worker]="worker" />
          }
        </div>
      </section>

      <!-- Map Preview -->
      <section class="section-container map-preview-section" data-testid="map-preview-section">
        <div class="map-preview-header">
          <h2 class="section-title">Porto de Galinhas</h2>
          <a class="map-header-link" routerLink="/explorar/mapa">Abrir mapa →</a>
        </div>
        <div class="map-card">
          <div class="map-image-placeholder">
            <span class="map-emoji">🗺️</span>
          </div>
          <div class="map-overlay">
            <span class="map-beach-name">Porto de Galinhas</span>
            <span class="map-beach-count">23 estabelecimentos próximos</span>
          </div>
          <button class="map-expand-btn" routerLink="/explorar/mapa">
            Expandir mapa
          </button>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .home-page { max-width: 1200px; margin: 0 auto; }
    .hero-section {
      background: linear-gradient(135deg, #004e89, #0096c7, #48cae4);
      border-radius: 0 0 24px 24px;
      padding: 2rem;
      margin: -1.5rem -1.5rem 2rem;
      color: #ffffff;
    }
    .greeting {
      font-size: 0.9rem;
      opacity: 0.75;
      margin: 0 0 0.5rem;
    }
    .hero-title {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
      margin: 0 0 0.5rem;
    }
    .hero-subtitle {
      font-size: 0.9rem;
      opacity: 0.75;
      margin: 0 0 1.25rem;
    }
    .search-bar {
      display: flex;
      align-items: center;
      background: #ffffff;
      border-radius: 12px;
      padding: 0 0.5rem 0 1rem;
      max-width: 600px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .search-input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0.85rem 0;
      font-size: 0.9rem;
      color: #04303a;
      background: transparent;
    }
    .search-input::placeholder { color: #97a0a6; }
    .search-divider {
      width: 1px;
      height: 24px;
      background: #e0e0e0;
      margin: 0 0.5rem;
    }
    .search-beach-select {
      border: none;
      outline: none;
      padding: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #00a8e8;
      background: transparent;
      cursor: pointer;
    }
    .search-btn {
      width: 36px;
      height: 36px;
      margin-left: 0.25rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .search-btn:hover { background: #0096c7; }

    .hero-stats {
      margin-top: 1.25rem;
      padding-top: 1rem;
    }
    .hero-stats-grid {
      display: flex;
      align-items: center;
      gap: 0;
    }
    .hero-stat-item {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .hero-stat-number {
      font-size: 1.375rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
    }
    .hero-stat-label {
      font-size: 0.8rem;
      color: #ffffff;
      opacity: 0.65;
    }
    .hero-stat-divider {
      width: 1px;
      height: 32px;
      background: #ffffff;
      opacity: 0.2;
      margin: 0 2rem;
    }
    .hero-stat-skeleton {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .hero-skeleton-number {
      width: 60px;
      height: 22px;
      background: rgba(255,255,255,0.3);
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .hero-skeleton-label {
      width: 100px;
      height: 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .hero-stats-error {
      font-size: 0.8rem;
      opacity: 0.75;
    }
    .hero-stats-error p {
      margin: 0 0 0.5rem;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .retry-btn {
      padding: 0.35rem 0.75rem;
      background: #ffffff;
      color: #004e89;
      border: none;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }
    .retry-btn:hover { background: #e0f4fd; }

    .categories-section {
      padding: 0 2rem;
      margin-bottom: 1.5rem;
    }
    .categories-title {
      font-size: 1rem;
      font-weight: 700;
      color: #073642;
      margin: 0 0 0.75rem;
    }
    .categories-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .chip {
      padding: 0.4rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(0,0,0,0.08);
      background: #ffffff;
      color: #073642;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .chip:hover {
      background: #fff8ee;
    }
    .chip-active {
      background: #00a8e8;
      color: #ffffff;
      border-color: #00a8e8;
    }
    .chip-active:hover {
      background: #0096c7;
    }

    .section-container {
      padding: 0 2rem;
      margin-bottom: 2rem;
    }
    .section-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: #073642;
      margin-bottom: 1rem;
    }
    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }
    .featured-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .featured-header .section-title {
      margin-bottom: 0;
    }
    .featured-see-all {
      font-size: 0.85rem;
      color: #00a8e8;
      text-decoration: none;
      font-weight: 500;
      white-space: nowrap;
    }
    .featured-see-all:hover { text-decoration: underline; }
    .map-preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .map-preview-header .section-title { margin-bottom: 0; }
    .map-header-link {
      font-size: 0.85rem;
      color: #00a8e8;
      text-decoration: none;
      font-weight: 500;
    }
    .map-header-link:hover { text-decoration: underline; }
    .map-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      border: 1px solid #e0e0e0;
    }
    .map-image-placeholder {
      height: 200px;
      background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .map-emoji { font-size: 3rem; opacity: 0.6; }
    .map-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.6));
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    .map-beach-name {
      font-size: 1rem;
      font-weight: 700;
      color: #ffffff;
    }
    .map-beach-count {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.8);
    }
    .map-expand-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.4rem 0.8rem;
      background: rgba(255,255,255,0.9);
      color: #00a8e8;
      border: none;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }
    .map-expand-btn:hover { background: #ffffff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);
  protected readonly catalogApi = inject(CatalogApiService);

  protected searchQuery = signal('');
  protected selectedBeach = signal('');

  protected onSearch(): void {
    const queryParams: Record<string, string> = {};
    if (this.searchQuery().trim()) {
      queryParams['text'] = this.searchQuery().trim();
    }
    if (this.selectedBeach()) {
      queryParams['beach'] = this.selectedBeach();
    }
    this.router.navigate(['/explorar'], { queryParams });
  }

  protected stats = signal<{ establishments: number; beaches: number; categories: number }>({
    establishments: 0,
    beaches: 4,
    categories: 0,
  });
  protected statsLoading = signal(true);
  protected statsError = signal(false);

  protected featuredWorkers = signal<any[]>([]);

  ngOnInit(): void {
    this.loadStats();
    this.loadFeatured();
  }

  protected loadStats(): void {
    this.statsLoading.set(true);
    this.statsError.set(false);

    this.catalogApi.search({ limit: 1 })
      .pipe(
        catchError(() => {
          this.statsError.set(true);
          return of(null);
        }),
        finalize(() => this.statsLoading.set(false)),
      )
      .subscribe((res) => {
        if (res) {
          // Count unique categories from all results (use meta.total for establishments estimate)
          // For categories, we use a fixed estimate from the search space
          this.stats.set({
            establishments: res.meta.total,
            beaches: 4,
            categories: 8,
          });
        }
      });
  }

  protected loadFeatured(): void {
    this.catalogApi.search({ limit: 6 })
      .pipe(catchError(() => of(null)))
      .subscribe((res) => {
        if (res) {
          this.featuredWorkers.set(res.data);
        }
      });
  }
}
