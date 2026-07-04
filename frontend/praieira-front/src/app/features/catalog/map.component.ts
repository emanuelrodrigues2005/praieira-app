import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogApiService, WorkerProfileSearchResult } from '../../core/http/catalog-api.service';
import { CategoryFilterComponent } from '../../shared/ui/category-filter.component';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import L from 'leaflet';

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [RouterModule, FormsModule, CategoryFilterComponent],
  template: `
    <div class="map-page" [class.sidebar-open]="sidebarOpen()">
      <div class="map-container" #mapContainer></div>

      @if (sidebarOpen()) {
        <aside class="map-sidebar" data-testid="map-sidebar">
          <div class="category-pills">
            <app-category-filter
              [selectedCategory]="selectedCategory()"
              (categoryChange)="onCategoryChange($event)"
            />
          </div>

          <div class="results-list" data-testid="results-list">
            @for (item of filteredResults(); track item.id) {
              <div
                class="result-item"
                data-testid="result-item"
                (click)="onSidebarItemClick(item.id)"
              >
                <div class="item-thumb">
                  @if (item.coverImage) {
                    <img [src]="item.coverImage" alt="" class="thumb-img" />
                  } @else {
                    <span class="thumb-placeholder">🏪</span>
                  }
                </div>
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-category">{{ item.category }}</span>
                  @if (item.distance != null) {
                    <span class="item-distance">{{ item.distance.toFixed(1) }} km</span>
                  }
                </div>
              </div>
            } @empty {
              @if (!loading() && !error()) {
                <div class="sidebar-empty" data-testid="empty-state">
                  <p class="empty-title">Nenhum estabelecimento encontrado nesta região</p>
                  <p class="empty-hint">Tente alterar os filtros ou explorar outra área do mapa</p>
                </div>
              }
            }
          </div>
        </aside>
      }

      @if (loading()) {
        <div class="overlay loading-overlay" data-testid="loading-state">
          <div class="spinner"></div>
          <p>Carregando mapa…</p>
        </div>
      }

      @if (error()) {
        <div class="overlay error-overlay" data-testid="error-state">
          <p>Não foi possível carregar os dados</p>
          <button class="retry-btn" data-testid="retry-btn" (click)="search()">
            Tentar novamente
          </button>
        </div>
      }

      @if (!sidebarOpen() && !loading() && !error() && filteredResults().length === 0) {
        <div class="overlay empty-overlay-closed" data-testid="empty-state-closed">
          <p>Nenhum estabelecimento encontrado nesta região</p>
          <button class="retry-btn" (click)="goBack()">
            ← Voltar para busca
          </button>
        </div>
      }

      <button class="map-back-btn" (click)="goBack()" data-testid="map-back-btn" title="Voltar para busca">
        ← Voltar
      </button>
    </div>
  `,
  styles: [`
    .map-page { position: relative; width: 100%; height: 100vh; overflow: hidden; }
    .map-container { width: 100%; height: 100%; }
    .map-sidebar {
      position: absolute; top: 0; left: 0; width: 320px;
      height: 100%; background: #ffffff; z-index: 1000;
      display: flex; flex-direction: column; box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    }
    .category-pills { padding: 0.75rem; border-bottom: 1px solid #e0e0e0; }
    .results-list { flex: 1; overflow-y: auto; padding: 0.5rem; }
    .result-item {
      display: flex; gap: 0.75rem; padding: 0.75rem;
      border-radius: 8px; cursor: pointer; transition: background 0.15s;
    }
    .result-item:hover { background: #f5f5f5; }
    .item-thumb {
      width: 48px; height: 48px; border-radius: 8px; overflow: hidden;
      background: #e0f4fd; display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .thumb-img { width: 100%; height: 100%; object-fit: cover; }
    .thumb-placeholder { font-size: 1.5rem; }
    .item-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .item-name { font-size: 0.9rem; font-weight: 600; color: #04303a; }
    .item-category { font-size: 0.75rem; color: #00a8e8; }
    .item-distance { font-size: 0.75rem; color: #97a0a6; }
    .sidebar-empty {
      text-align: center; padding: 3rem 1rem; color: #97a0a6;
    }
    .sidebar-empty .empty-title {
      font-size: 0.9rem; font-weight: 600; color: #04303a; margin: 0 0 0.25rem;
    }
    .sidebar-empty .empty-hint {
      font-size: 0.8rem; color: #97a0a6; margin: 0;
    }
    .overlay {
      position: absolute; inset: 0; z-index: 2000;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; background: rgba(255,255,255,0.85);
    }
    .loading-overlay, .empty-overlay-closed, .error-overlay { padding: 2rem; text-align: center; }
    .map-back-btn {
      position: absolute; top: 16px; left: 340px; z-index: 3000;
      padding: 0.5rem 1rem; border: none; border-radius: 8px;
      background: #ffffff; color: #04303a; font-size: 0.85rem;
      font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      transition: background 0.15s;
    }
    .map-back-btn:hover { background: #f5f5f5; }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #e0e0e0;
      border-top-color: #00a8e8; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-bottom: 0.5rem;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .retry-btn {
      margin-top: 0.5rem; padding: 0.5rem 1.5rem;
      background: #00a8e8; color: #fff; border: none; border-radius: 8px;
      font-size: 0.85rem; font-weight: 600; cursor: pointer;
    }
    .retry-btn:hover { background: #0096c7; }
    @media (max-width: 768px) {
      .map-sidebar { width: 100%; height: 40%; top: auto; bottom: 0; }
      .map-back-btn { left: 16px; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly catalogApi = inject(CatalogApiService);

  protected readonly mapContainer = viewChild<ElementRef<HTMLDivElement>>('mapContainer');

  protected results = signal<WorkerProfileSearchResult[]>([]);
  protected selectedCategory = signal('');
  protected filteredResults = signal<WorkerProfileSearchResult[]>([]);
  protected loading = signal(false);
  protected error = signal(false);
  protected sidebarOpen = signal(true);

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];
  private tileLayer: L.TileLayer | null = null;

  ngOnInit(): void {
    this.search();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    const container = this.mapContainer();
    if (!container) return;

    this.map = L.map(container.nativeElement, {
      center: [-8.28, -35.0],
      zoom: 10,
    });

    this.tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      },
    );
    this.tileLayer.addTo(this.map);

    // After map initialized, add markers from current results
    if (this.results().length > 0) {
      this.addMarkersToMap();
    }
  }

  private addMarkersToMap(): void {
    if (!this.map) return;

    this.clearMarkers();
    this.markers = this.results().map((worker) => {
      const marker = L.marker([worker.latitude, worker.longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<span style="color:#00a8e8;font-size:1.2rem;">📍</span>',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        }),
      });

      marker.bindPopup(this.buildPopupContent(worker));
      marker.on('click', () => this.onMarkerClick(worker.id));
      marker.addTo(this.map!);
      return marker;
    });
  }

  private clearMarkers(): void {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
  }

  private buildPopupContent(worker: WorkerProfileSearchResult): string {
    return `
      <div class="marker-popup" style="min-width:180px;">
        <strong style="font-size:0.95rem;">${worker.name}</strong><br/>
        <span style="font-size:0.8rem;color:#97a0a6;">
          ${worker.distance != null ? worker.distance.toFixed(1) + ' km' : ''}
        </span><br/>
        <a href="/perfil/${worker.id}" style="color:#00a8e8;font-size:0.85rem;font-weight:600;">
          Ver perfil
        </a>
      </div>
    `;
  }

  search(): void {
    this.loading.set(true);
    this.error.set(false);

    this.catalogApi.search({ lat: -8.28, lng: -35.0, radius: 100, limit: 50 })
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
          this.applyFilter();
          if (this.map) {
            this.addMarkersToMap();
          }
        }
        this.loading.set(false);
      });
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.applyFilter();

    if (this.map) {
      this.clearMarkers();
      this.markers = this.filteredResults().map((worker) => {
        const marker = L.marker([worker.latitude, worker.longitude], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<span style="color:#00a8e8;font-size:1.2rem;">📍</span>',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        });
        marker.bindPopup(this.buildPopupContent(worker));
        marker.on('click', () => this.onMarkerClick(worker.id));
        marker.addTo(this.map!);
        return marker;
      });
    }
  }

  private applyFilter(): void {
    const cat = this.selectedCategory();
    if (!cat) {
      this.filteredResults.set(this.results());
    } else {
      this.filteredResults.set(this.results().filter((w) => w.category === cat));
    }
  }

  onMarkerClick(id: string): void {
    const marker = this.markers.find((m, i) => this.results()[i]?.id === id);
    if (marker) {
      marker.openPopup();
    }
  }

  onSidebarItemClick(id: string): void {
    const worker = this.filteredResults().find((w) => w.id === id);
    if (worker && this.map) {
      this.map.panTo([worker.latitude, worker.longitude]);
    }
    this.onMarkerClick(id);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  goBack(): void {
    this.router.navigate(['/explorar']);
  }
}
