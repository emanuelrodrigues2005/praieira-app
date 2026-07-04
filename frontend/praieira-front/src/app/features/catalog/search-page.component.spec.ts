import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
  let httpMock: HttpTestingController;
  let routeMock: { snapshot: { queryParams: Record<string, string> } };

  beforeEach(() => {
    TestBed.resetTestingModule();
    routeMock = { snapshot: { queryParams: {} } };

    TestBed.configureTestingModule({
      imports: [SearchPageComponent, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Expect + flush the initial search call. Call AFTER fixture.detectChanges(). */
  function flushSearch(
    data: any[] = [],
    overrides: Partial<{ page: number; limit: number; total: number }> = {},
  ) {
    const { page = 1, limit = 12, total = 0 } = overrides;
    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3002/catalog/search');
    req.flush({
      data,
      meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), requestId: 'r1' },
    });
  }

  // ── Tracer bullet 1: Filter bar renders ──

  it('should render filter bar with all elements', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    flushSearch();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="search-text-input"]')).toBeTruthy();
    expect(el.querySelector('app-beach-selector')).toBeTruthy();
    expect(el.querySelector('app-category-filter')).toBeTruthy();
    expect(el.querySelector('[data-testid="sort-select"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="clear-filters-btn"]')).toBeTruthy();
  });

  // ── Tracer bullet 2+3: Query params → API call ──

  it('should read query params and call search with correct params', () => {
    routeMock.snapshot.queryParams = {
      text: 'buggy',
      beach: 'Gaibu',
      category: 'Restaurante',
      sort: 'rating',
      page: '2',
    };

    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => {
      const p = r.params;
      return r.url === 'http://localhost:3002/catalog/search'
        && p.get('text') === 'buggy'
        && p.get('beach') === 'Gaibu'
        && p.get('category') === 'Restaurante'
        && p.get('sort') === 'rating'
        && p.get('page') === '2'
        && p.get('limit') === '12';
    });
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], meta: { page: 2, limit: 12, total: 0, totalPages: 1, requestId: 'r1' } });
    fixture.detectChanges();
  });

  // ── Tracer bullet 4: Results render as cards ──

  it('should render worker cards when results are returned', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    const workers = [
      {
        id: 'w1', name: 'Barraca do João', category: 'Restaurante', beach: 'Gaibu',
        latitude: -8.289, longitude: -34.948, phone: null, whatsapp: null,
        description: null, coverImage: null, gallery: [], tags: [], businessHours: null,
      },
      {
        id: 'w2', name: 'Quiosque da Maria', category: 'Quiosque', beach: 'Porto de Galinhas',
        latitude: -8.5, longitude: -35.0, phone: '81988888888', whatsapp: null,
        description: 'Petiscos', coverImage: null, gallery: [], tags: [], businessHours: null,
      },
    ];
    flushSearch(workers, { total: 2 });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('app-worker-card');
    expect(cards.length).toBe(2);
  });

  // ── Tracer bullet 5: Loading, empty, error states ──

  it('should show skeleton cards while loading', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="loading-state"]')).toBeTruthy();

    // Flush to cleanup pending request
    httpMock.expectOne((r) => r.url === 'http://localhost:3002/catalog/search').flush({
      data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1, requestId: 'r1' },
    });
  });

  it('should show empty state when no results', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    flushSearch();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="empty-state"]')).toBeTruthy();
    expect(el.textContent).toContain('Nenhum estabelecimento encontrado');
  });

  it('should show error state with retry button on API failure', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3002/catalog/search');
    req.error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="error-state"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="retry-btn"]')).toBeTruthy();
  });

  // ── Tracer bullet 6: Pagination ──

  it('should show pagination when there are multiple pages', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    const workers = Array.from({ length: 3 }, (_, i) => ({
      id: `w${i}`, name: `Worker ${i}`, category: 'Restaurante', beach: 'Gaibu',
      latitude: -8.289, longitude: -34.948, phone: null, whatsapp: null,
      description: null, coverImage: null, gallery: [], tags: [], businessHours: null,
    }));
    flushSearch(workers, { total: 25, limit: 12 }); // 3 pages
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-pagination')).toBeTruthy();
  });

  it('should not show pagination when only one page', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    const workers = Array.from({ length: 3 }, (_, i) => ({
      id: `w${i}`, name: `Worker ${i}`, category: 'Restaurante', beach: 'Gaibu',
      latitude: -8.289, longitude: -34.948, phone: null, whatsapp: null,
      description: null, coverImage: null, gallery: [], tags: [], businessHours: null,
    }));
    flushSearch(workers, { total: 5, limit: 12 }); // 1 page
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-pagination')).toBeFalsy();
  });

  it('should re-search when page changes', () => {
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    const workers = Array.from({ length: 3 }, (_, i) => ({
      id: `w${i}`, name: `Worker ${i}`, category: 'Restaurante', beach: 'Gaibu',
      latitude: -8.289, longitude: -34.948, phone: null, whatsapp: null,
      description: null, coverImage: null, gallery: [], tags: [], businessHours: null,
    }));
    flushSearch(workers, { total: 25, limit: 12 }); // 3 pages, page 1
    fixture.detectChanges();

    // Directly call onPageChange
    fixture.componentInstance.onPageChange(2);

    // Should trigger a new search with page=2
    const req = httpMock.expectOne((r) => r.params.get('page') === '2');
    expect(req.request.method).toBe('GET');
    req.flush({ data: [], meta: { page: 2, limit: 12, total: 25, totalPages: 3, requestId: 'r2' } });
    fixture.detectChanges();
  });

  // ── Tracer bullet 8: Clear filters ──

  it('should reset all filters and re-search when clear is clicked', () => {
    routeMock.snapshot.queryParams = {
      text: 'buggy', beach: 'Gaibu', category: 'Restaurante', sort: 'rating', page: '2',
    };
    const fixture = TestBed.createComponent(SearchPageComponent);
    fixture.detectChanges();
    // First flush initial search with params
    httpMock.expectOne((r) => r.url === 'http://localhost:3002/catalog/search').flush({
      data: [], meta: { page: 2, limit: 12, total: 0, totalPages: 1, requestId: 'r1' },
    });
    fixture.detectChanges();

    // Click clear
    const clearBtn = fixture.nativeElement.querySelector('[data-testid="clear-filters-btn"]') as HTMLButtonElement;
    clearBtn.click();

    // Should search with defaults (page=1, no filters, sort=proximity)
    const req = httpMock.expectOne((r) => {
      const p = r.params;
      return r.url === 'http://localhost:3002/catalog/search'
        && p.get('page') === '1'
        && p.get('sort') === 'proximity'
        && !p.get('text')
        && !p.get('beach')
        && !p.get('category');
    });
    req.flush({ data: [], meta: { page: 1, limit: 12, total: 0, totalPages: 1, requestId: 'r2' } });
    fixture.detectChanges();
  });
});
