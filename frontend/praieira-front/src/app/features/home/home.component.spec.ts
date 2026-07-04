import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthStore } from '../../core/auth/auth.store';

describe('HomeComponent', () => {
  let authStore: AuthStore;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule, HttpClientTestingModule],
    }).compileComponents();
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushStats(fixture: any, total = 0): void {
    const req = httpMock.expectOne('http://localhost:3002/catalog/search?limit=1');
    req.flush({
      data: [],
      meta: { page: 1, limit: 1, total, totalPages: Math.max(total, 1), requestId: 'r' },
    });
    fixture.detectChanges();
  }

  function flushFeatured(fixture: any): void {
    const req = httpMock.expectOne('http://localhost:3002/catalog/search?limit=6');
    req.flush({
      data: [{
        id: 'f1', name: 'Barraca do João', category: 'Restaurante', beach: 'Gaibu',
        latitude: -8.289, longitude: -34.948, phone: null, whatsapp: null,
        description: null, coverImage: null, gallery: [], tags: [], businessHours: null,
      }],
      meta: { page: 1, limit: 6, total: 1, totalPages: 1, requestId: 'r' },
    });
    fixture.detectChanges();
  }

  function flushAllPending(fixture: any): void {
    flushStats(fixture);
    flushFeatured(fixture);
  }

  function fullLoad(fixture: any, total = 0): void {
    flushStats(fixture, total);
    flushFeatured(fixture);
  }

  it('should show generic greeting when not authenticated', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const greeting = el.querySelector('[data-testid="greeting"]');
    expect(greeting).toBeTruthy();
    expect(greeting?.textContent).toContain('Bem-vindo ao Praieira App');
  });

  it('should show personalized greeting when authenticated', () => {
    authStore.login(
      { sub: 'u1', role: 'TOURIST', email: 'test@test.com', name: 'Camila' },
      'fake-token',
    );
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const greeting = el.querySelector('[data-testid="greeting"]');
    expect(greeting).toBeTruthy();
    expect(greeting?.textContent).toContain('Olá');
    expect(greeting?.textContent).toContain('Camila');
  });

  it('should render search bar with text input and beach select', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const searchInput = el.querySelector('[data-testid="search-input"]') as HTMLInputElement;
    expect(searchInput).toBeTruthy();

    const beachSelect = el.querySelector('[data-testid="search-beach"]') as HTMLSelectElement;
    expect(beachSelect).toBeTruthy();
    expect(beachSelect.options.length).toBe(5); // 'Todas as praias' + 4 beaches
  });

  it('should navigate to /explorar with text and beach query params on search submit', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const el = fixture.nativeElement as HTMLElement;
    const searchInput = el.querySelector('[data-testid="search-input"]') as HTMLInputElement;
    const beachSelect = el.querySelector('[data-testid="search-beach"]') as HTMLSelectElement;
    const searchBtn = el.querySelector('[data-testid="search-btn"]') as HTMLButtonElement;

    searchInput.value = 'buggy';
    searchInput.dispatchEvent(new Event('input'));
    beachSelect.value = 'Gaibu';
    beachSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    searchBtn.click();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/explorar'],
      { queryParams: { text: 'buggy', beach: 'Gaibu' } },
    );
  });

  it('should navigate to /explorar with only beach when text is empty on search submit', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const el = fixture.nativeElement as HTMLElement;
    const beachSelect = el.querySelector('[data-testid="search-beach"]') as HTMLSelectElement;
    const searchBtn = el.querySelector('[data-testid="search-btn"]') as HTMLButtonElement;

    beachSelect.value = 'Porto de Galinhas';
    beachSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    searchBtn.click();

    expect(navigateSpy).toHaveBeenCalledWith(
      ['/explorar'],
      { queryParams: { beach: 'Porto de Galinhas' } },
    );
  });

  it('should render 3 quick stats cards after API loads', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    // Flush the search API call
    const req = httpMock.expectOne('http://localhost:3002/catalog/search?limit=1');
    req.flush({
      data: [],
      meta: { page: 1, limit: 1, total: 42, totalPages: 42, requestId: 'r1' },
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const statCards = el.querySelectorAll('[data-testid="hero-stat-item"]');
    expect(statCards.length).toBe(3);

    // Establishments
    expect(statCards[0].textContent).toContain('42');
    expect(statCards[0].textContent).toContain('Estabelecimentos');

    // Beaches
    expect(statCards[1].textContent).toContain('4');
    expect(statCards[1].textContent).toContain('Praias');

    // Categories
    expect(statCards[2].textContent).toContain('Categorias');

    // Flush featured request too
    httpMock.expectOne('http://localhost:3002/catalog/search?limit=6').flush({
      data: [],
      meta: { page: 1, limit: 6, total: 0, totalPages: 1, requestId: 'r' },
    });
  });

  it('should show loading skeleton while stats are loading', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);

    // Flush both pending API requests
    flushAllPending(fixture);
  });

  it('should show error state with retry button on API failure', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    // Both API calls fire; fail them both
    const req1 = httpMock.expectOne('http://localhost:3002/catalog/search?limit=1');
    req1.error(new ProgressEvent('Network error'));
    httpMock.expectOne('http://localhost:3002/catalog/search?limit=6').error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const retryBtn = el.querySelector('[data-testid="retry-btn"]');
    expect(retryBtn).toBeTruthy();
  });

  it('should refetch stats when retry button is clicked', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();

    // First request fails; also flush featured to avoid pending
    const req = httpMock.expectOne('http://localhost:3002/catalog/search?limit=1');
    req.error(new ProgressEvent('Network error'));
    httpMock.expectOne('http://localhost:3002/catalog/search?limit=6').error(new ProgressEvent('Network error'));
    fixture.detectChanges();

    // Click retry
    const retryBtn = fixture.nativeElement.querySelector('[data-testid="retry-btn"]') as HTMLButtonElement;
    retryBtn.click();

    fixture.detectChanges();

    // Second request succeeds (only stats, not featured again)
    const retryReq = httpMock.expectOne('http://localhost:3002/catalog/search?limit=1');
    retryReq.flush({
      data: [],
      meta: { page: 1, limit: 1, total: 50, totalPages: 50, requestId: 'r2' },
    });
    fixture.detectChanges();

    const statCards = fixture.nativeElement.querySelectorAll('[data-testid="hero-stat-item"]');
    expect(statCards[0].textContent).toContain('50');
  });

  it('should render categories filter row with 8 chips', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    flushAllPending(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-testid="categories-section"]');
    expect(section).toBeTruthy();

    const chips = el.querySelectorAll('.chip');
    expect(chips.length).toBe(8);

    const chipNames = ['Todos', 'Restaurantes', 'Bares', 'Barracas', 'Passeios', 'Bugueiros', 'Comércio/Artes', 'Atrações'];
    chips.forEach((chip, i) => {
      expect(chip.textContent).toContain(chipNames[i]);
    });

    // First chip 'Todos' should be active
    expect(chips[0].classList.contains('chip-active')).toBe(true);
  });

  it('should render beach carousel section', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fullLoad(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const carousel = el.querySelector('app-beach-carousel');
    expect(carousel).toBeTruthy();
  });

  it('should render featured establishments section with worker cards', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fullLoad(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const sectionTitle = el.querySelector('[data-testid="featured-title"]');
    expect(sectionTitle).toBeTruthy();
    expect(sectionTitle?.textContent).toContain('Destaques em Porto de Galinhas');

    const seeAllLink = el.querySelector('.featured-see-all');
    expect(seeAllLink).toBeTruthy();
    expect(seeAllLink?.textContent).toContain('Ver todos');

    const cards = el.querySelectorAll('app-worker-card');
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it('should NOT render CTA section (not in tourist prototype)', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fullLoad(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const cta = el.querySelector('[data-testid="cta-section"]');
    expect(cta).toBeNull();
  });

  it('should render map preview section with header and expand button', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    fullLoad(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('[data-testid="map-preview-section"]');
    expect(section).toBeTruthy();

    const header = el.querySelector('.map-preview-header');
    expect(header).toBeTruthy();
    expect(header?.textContent).toContain('Porto de Galinhas');
    expect(header?.textContent).toContain('Abrir mapa');

    const expandBtn = el.querySelector('.map-expand-btn');
    expect(expandBtn).toBeTruthy();
    expect(expandBtn?.textContent).toContain('Expandir mapa');
  });
});
