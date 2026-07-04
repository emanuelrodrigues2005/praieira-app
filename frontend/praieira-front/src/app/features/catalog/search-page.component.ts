import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, SearchFilters, WorkerProfileSearchResult, PaginationMeta } from '../../core/http/catalog-api.service';
import { BeachSelectorComponent } from '../../shared/ui/beach-selector.component';
import { CategoryFilterComponent } from '../../shared/ui/category-filter.component';
import { PaginationComponent } from '../../shared/ui/pagination.component';
import { WorkerCardComponent } from '../../shared/ui/worker-card.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterModule,
    BeachSelectorComponent,
    CategoryFilterComponent,
    PaginationComponent,
    WorkerCardComponent,
  ],
  template: `
    <div class="search-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">Buscar na orla</h1>
          <p class="hero-subtitle">Restaurantes, passeios, barracas e mais</p>

          <div class="hero-search-bar">
            <input
              class="hero-search-input"
              data-testid="search-text-input"
              type="text"
              placeholder="O que você está procurando?"
              [ngModel]="textFilter()"
              (ngModelChange)="onTextChange($event)"
            />
          </div>

          @if (beachFilter() || categoryFilter()) {
            <div class="active-filters">
              @if (beachFilter()) {
                <span class="active-filter-chip">
                  {{ beachFilter() }}
                  <button class="chip-remove" (click)="onBeachChange('')">&times;</button>
                </span>
              }
              @if (categoryFilter()) {
                <span class="active-filter-chip">
                  {{ categoryFilter() }}
                  <button class="chip-remove" (click)="onCategoryChange('')">&times;</button>
                </span>
              }
            </div>
          }
        </div>
      </section>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-row">
          <select
            class="sort-select"
            data-testid="sort-select"
            [ngModel]="sortFilter()"
            (ngModelChange)="onSortChange($event)"
          >
            <option value="proximity">Proximidade</option>
            <option value="rating">Avaliação</option>
          </select>

          <app-beach-selector
            [selectedBeach]="beachFilter()"
            (beachChange)="onBeachChange($event)"
          />

          <button
            class="clear-btn"
            data-testid="clear-filters-btn"
            (click)="clearFilters()"
          >
            Limpar filtros
          </button>
        </div>

        <div class="filter-row">
          <app-category-filter
            [selectedCategory]="categoryFilter()"
            (categoryChange)="onCategoryChange($event)"
          />
        </div>
      </div>

      <!-- Results -->
      @if (loading()) {
        <div class="results-grid" data-testid="loading-state">
          @for (s of [1,2,3,4,5,6]; track s) {
            <div class="skeleton-card" data-testid="skeleton-card">
              <div class="skeleton-image"></div>
              <div class="skeleton-line"></div>
              <div class="skeleton-line short"></div>
            </div>
          }
        </div>
      } @else if (error()) {
        <div class="state-container" data-testid="error-state">
          <p class="state-message">Não foi possível carregar os resultados</p>
          <button class="retry-btn" data-testid="retry-btn" (click)="search()">
            Tentar novamente
          </button>
        </div>
      } @else if (results().length === 0) {
        <div class="state-container" data-testid="empty-state">
          <span class="state-icon">🔍</span>
          <p class="state-message">Nenhum estabelecimento encontrado</p>
          <p class="state-hint">Tente alterar os filtros</p>
        </div>
      } @else {
        <div class="results-grid" data-testid="results-grid">
          @for (worker of results(); track worker.id) {
            <app-worker-card [worker]="worker" />
          }
        </div>

        @if (pagination() && pagination()!.totalPages > 1) {
          <app-pagination
            [page]="pagination()!.page"
            [totalPages]="pagination()!.totalPages"
            (pageChange)="onPageChange($event)"
          />
        }
      }
    </div>
  `,
  styles: [`
    .search-page {
      max-width: 1200px;
      margin: 0 auto;
    }
    .hero-section {
      background: linear-gradient(135deg, #004e89, #0096c7, #48cae4);
      border-radius: 0 0 24px 24px;
      padding: 1.5rem 2rem;
      margin: -1.5rem -1.5rem 1rem;
    }
    .hero-content {
      max-width: 1128px;
      margin: 0 auto;
    }
    .hero-title {
      font-size: 1.625rem;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 0.25rem;
    }
    .hero-subtitle {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.72);
      margin: 0 0 1rem;
    }
    .hero-search-bar {
      background: #ffffff;
      border-radius: 12px;
      padding: 0 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .hero-search-input {
      width: 100%;
      border: none;
      outline: none;
      padding: 0.85rem 0;
      font-size: 0.9rem;
      color: #04303a;
      background: transparent;
    }
    .hero-search-input::placeholder {
      color: #97a0a6;
    }
    .active-filters {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .active-filter-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.5rem 0.25rem 0.75rem;
      background: #ffb74d;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #00a8e8;
    }
    .chip-remove {
      background: none;
      border: none;
      color: #00a8e8;
      font-size: 1rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.7;
    }
    .chip-remove:hover {
      opacity: 1;
    }
    .filter-bar {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .filter-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .search-input {
      flex: 1;
      min-width: 200px;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #04303a;
      outline: none;
    }
    .search-input:focus {
      border-color: #00a8e8;
      box-shadow: 0 0 0 2px rgba(0, 168, 232, 0.15);
    }
    .sort-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #04303a;
      background: #ffffff;
      cursor: pointer;
      outline: none;
    }
    .sort-select:focus {
      border-color: #00a8e8;
    }
    .clear-btn {
      padding: 0.5rem 1rem;
      border: 1px solid #d0d5dd;
      border-radius: 8px;
      background: #ffffff;
      color: #97a0a6;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .clear-btn:hover {
      border-color: #e55a2b;
      color: #e55a2b;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .skeleton-card {
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      overflow: hidden;
    }
    .skeleton-image {
      height: 120px;
      background: #e0e0e0;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line {
      height: 14px;
      margin: 0.75rem 1rem;
      background: #e0e0e0;
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }
    .skeleton-line.short {
      width: 60%;
    }
    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }
    .state-container {
      text-align: center;
      padding: 3rem 1rem;
      color: #97a0a6;
    }
    .state-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .state-message {
      font-size: 1rem;
      font-weight: 600;
      color: #04303a;
      margin: 0 0 0.5rem;
    }
    .state-hint {
      font-size: 0.85rem;
      color: #97a0a6;
      margin: 0;
    }
    .retry-btn {
      padding: 0.5rem 1.5rem;
      background: #00a8e8;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    .retry-btn:hover {
      background: #0096c7;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly catalogApi = inject(CatalogApiService);

  protected textFilter = signal('');
  protected beachFilter = signal('');
  protected categoryFilter = signal('');
  protected sortFilter = signal<'proximity' | 'rating'>('proximity');
  protected currentPage = signal(1);

  protected results = signal<WorkerProfileSearchResult[]>([]);
  protected pagination = signal<PaginationMeta | null>(null);
  protected loading = signal(false);
  protected error = signal(false);

  ngOnInit(): void {
    this.readQueryParams();
    this.search();
  }

  private readQueryParams(): void {
    const params = this.route.snapshot.queryParams;
    if (params['text']) this.textFilter.set(params['text']);
    if (params['beach']) this.beachFilter.set(params['beach']);
    if (params['category']) this.categoryFilter.set(params['category']);
    if (params['sort'] === 'proximity' || params['sort'] === 'rating') {
      this.sortFilter.set(params['sort']);
    }
    if (params['page']) this.currentPage.set(Number(params['page']));
  }

  protected search(): void {
    this.loading.set(true);
    this.error.set(false);

    const filters: SearchFilters = {
      text: this.textFilter() || undefined,
      beach: this.beachFilter() || undefined,
      category: this.categoryFilter() || undefined,
      sort: this.sortFilter(),
      page: this.currentPage(),
      limit: 12,
    };

    this.catalogApi.search(filters)
      .pipe(
        catchError(() => {
          this.error.set(true);
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.results.set(res.data);
          this.pagination.set(res.meta);
        }
        this.loading.set(false);
      });
  }

  onTextChange(value: string): void {
    this.textFilter.set(value);
  }

  onBeachChange(value: string): void {
    this.beachFilter.set(value);
  }

  onCategoryChange(value: string): void {
    this.categoryFilter.set(value);
  }

  onSortChange(value: string): void {
    if (value === 'proximity' || value === 'rating') {
      this.sortFilter.set(value);
    }
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.search();
  }

  clearFilters(): void {
    this.textFilter.set('');
    this.beachFilter.set('');
    this.categoryFilter.set('');
    this.sortFilter.set('proximity');
    this.currentPage.set(1);
    this.search();
  }
}
