import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { WorkerDetailComponent } from './worker-detail.component';

describe('WorkerDetailComponent', () => {
  let httpMock: HttpTestingController;

  function configureModule() {
    TestBed.configureTestingModule({
      imports: [WorkerDetailComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'worker-1' }),
            },
          },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  }

  function flushWorkerProfile(overrides: any = {}) {
    const val = (key: string, fallback: any) => key in overrides ? overrides[key] : fallback;
    const req = httpMock.expectOne('/catalog/workers/worker-1');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        id: 'worker-1',
        ownerUserId: 'u1',
        name: val('name', 'Barraca do João'),
        description: val('description', 'Comida típica e petiscos na praia'),
        category: val('category', 'Restaurante'),
        phone: val('phone', '+55 (81) 99999-9999'),
        whatsapp: val('whatsapp', '+55 (81) 99999-9999'),
        latitude: val('latitude', -8.289),
        longitude: val('longitude', -34.948),
        beach: val('beach', 'Gaibu'),
        status: val('status', 'APPROVED'),
        coverImage: val('coverImage', null),
        gallery: val('gallery', []),
        tags: val('tags', []),
        businessHours: val('businessHours', null),
        averageRating: val('averageRating', 4.5),
        totalReviews: val('totalReviews', 10),
        services: val('services', []),
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      },
      meta: { requestId: 'req-1' },
    });
  }

  function flushReviews(workerId: string = 'worker-1') {
    // Flush review summary
    const summaryReq = httpMock.expectOne(`/reviews/worker/${workerId}/summary`);
    expect(summaryReq.request.method).toBe('GET');
    summaryReq.flush({
      data: { averageRating: 4.5, totalReviews: 10, distribution: { '1': 1, '2': 0, '3': 1, '4': 2, '5': 6 } },
      meta: { requestId: 'req-2' },
    });

    // Flush reviews list
    const reviewsReq = httpMock.expectOne(`/reviews/worker/${workerId}?page=1&limit=5`);
    expect(reviewsReq.request.method).toBe('GET');
    reviewsReq.flush({
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 1, requestId: 'req-3' },
    });
  }

  function flushAll() {
    flushWorkerProfile();
    flushReviews();
  }

  afterEach(() => {
    httpMock?.verify();
  });

  it('should create the component', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
    flushAll();
  });

  it('should show loading skeleton on init while worker profile loads', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeleton = el.querySelector('[data-testid="detail-skeleton"]');
    expect(skeleton).toBeTruthy();

    // Flush worker profile
    flushWorkerProfile();
    fixture.detectChanges();

    const skeletonAfter = el.querySelector('[data-testid="detail-skeleton"]');
    expect(skeletonAfter).toBeFalsy();

    // Flush remaining review requests
    flushReviews();
  });

  // ── Breadcrumb ──

  it('should render breadcrumb with worker name', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const breadcrumb = el.querySelector('[data-testid="breadcrumb"]');
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb?.textContent).toContain('Barraca do João');
  });

  // ── Hero Section ──

  it('should render hero section with establishment name, category, location, rating', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const name = el.querySelector('[data-testid="hero-name"]');
    expect(name).toBeTruthy();
    expect(name?.textContent?.trim()).toBe('Barraca do João');

    const category = el.querySelector('[data-testid="hero-category"]');
    expect(category).toBeTruthy();
    expect(category?.textContent?.trim()).toBe('Restaurante');

    const location = el.querySelector('[data-testid="hero-location"]');
    expect(location).toBeTruthy();
    expect(location?.textContent).toContain('Gaibu');

    const rating = el.querySelector('[data-testid="hero-rating"]');
    expect(rating).toBeTruthy();
    expect(rating?.textContent).toContain('4.5');
  });

  it('should show placeholder gradient when coverImage is null', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ coverImage: null });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const heroSection = el.querySelector('[data-testid="hero-section"]');
    expect(heroSection).toBeTruthy();

    // Should not render img tag
    const img = heroSection?.querySelector('img');
    expect(img).toBeFalsy();
  });

  it('should render cover image when present', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ coverImage: 'https://example.com/cover.jpg' });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const img = el.querySelector('.cover-image') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('example.com/cover.jpg');
  });

  // ── Profile Info ──

  it('should render profile info section with status, location, category, rating', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const infoSection = el.querySelector('[data-testid="info-section"]');
    expect(infoSection).toBeTruthy();

    const location = el.querySelector('[data-testid="info-location"]');
    expect(location?.textContent).toContain('Gaibu');

    const category = el.querySelector('[data-testid="info-category"]');
    expect(category?.textContent?.trim()).toBe('Restaurante');

    const rating = el.querySelector('[data-testid="info-rating"]');
    expect(rating).toBeTruthy();
  });

  it('should render tags as pills when tags array is not empty', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ tags: ['peixe', 'praia', 'petiscos'] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tagsSection = el.querySelector('[data-testid="tags-section"]');
    expect(tagsSection).toBeTruthy();

    const pills = tagsSection?.querySelectorAll('.tag-pill');
    expect(pills?.length).toBe(3);
    expect(pills?.[0]?.textContent?.trim()).toBe('peixe');
  });

  it('should not render tags section when tags array is empty', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ tags: [] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tagsSection = el.querySelector('[data-testid="tags-section"]');
    expect(tagsSection).toBeFalsy();
  });

  // ── Description ──

  it('should render description section when description is present', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ description: 'Comida típica e petiscos na praia' });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const descSection = el.querySelector('[data-testid="description-section"]');
    expect(descSection).toBeTruthy();

    const descText = el.querySelector('[data-testid="description-text"]');
    expect(descText?.textContent?.trim()).toBe('Comida típica e petiscos na praia');
  });

  it('should not render description section when description is null', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ description: null });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const descSection = el.querySelector('[data-testid="description-section"]');
    expect(descSection).toBeFalsy();
  });

  // ── Services Section ──

  it('should render services list with title, description, price, availability', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({
      services: [
        { id: 's1', title: 'Porção de camarão', description: 'Camarão frito com molho', price: 45.00, isAvailable: true },
        { id: 's2', title: 'Caipirinha', description: null, price: 15.00, isAvailable: false },
      ],
    });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const servicesSection = el.querySelector('[data-testid="services-section"]');
    expect(servicesSection).toBeTruthy();

    const cards = servicesSection?.querySelectorAll('[data-testid="service-card"]');
    expect(cards?.length).toBe(2);

    const firstTitle = cards?.[0]?.querySelector('[data-testid="service-title"]');
    expect(firstTitle?.textContent?.trim()).toBe('Porção de camarão');

    const firstDesc = cards?.[0]?.querySelector('[data-testid="service-description"]');
    expect(firstDesc?.textContent?.trim()).toBe('Camarão frito com molho');

    const firstPrice = cards?.[0]?.querySelector('[data-testid="service-price"]');
    expect(firstPrice?.textContent?.trim()).toBe('R$ 45.00');

    const firstAvail = cards?.[0]?.querySelector('[data-testid="service-availability"]');
    expect(firstAvail?.textContent?.trim()).toBe('Disponível');

    const secondAvail = cards?.[1]?.querySelector('[data-testid="service-availability"]');
    expect(secondAvail?.textContent?.trim()).toBe('Indisponível');
  });

  it('should not render services section when services array is empty', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ services: [] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="services-section"]')).toBeFalsy();
  });

  // ── Contact Buttons ──

  it('should render WhatsApp and Phone buttons when available', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ whatsapp: '+55 (81) 99999-9999', phone: '+55 (81) 88888-8888' });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="btn-whatsapp"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="btn-phone"]')).toBeTruthy();
  });

  it('should hide WhatsApp button when whatsapp is null', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ whatsapp: null, phone: '+55 (81) 88888-8888' });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="btn-whatsapp"]')).toBeFalsy();
    expect(el.querySelector('[data-testid="btn-phone"]')).toBeTruthy();
  });

  it('should open contact modal when WhatsApp button is clicked', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ whatsapp: '+55 (81) 99999-9999' });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const whatsappBtn = el.querySelector('[data-testid="btn-whatsapp"]') as HTMLButtonElement;
    whatsappBtn.click();
    fixture.detectChanges();

    const contactReq = httpMock.expectOne('/interactions/contact/worker-1');
    expect(contactReq.request.method).toBe('POST');
    expect(contactReq.request.body).toEqual({ channel: 'whatsapp' });
    contactReq.flush({ data: { id: 'c1' }, meta: { requestId: 'req-4' } });
    fixture.detectChanges();

    const modal = el.querySelector('[data-testid="contact-modal"]');
    expect(modal).toBeTruthy();
    expect(modal?.textContent).toContain('WhatsApp');
  });

  // ── Reviews Section ──

  it('should render reviews summary with average rating and distribution', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="reviews-summary"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="summary-average"]')?.textContent).toContain('4.5');
    expect(el.querySelector('[data-testid="summary-total"]')?.textContent).toContain('10');
    expect(el.querySelector('[data-testid="summary-distribution"]')).toBeTruthy();
  });

  it('should render individual reviews with author, rating, date, comment', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();

    const summaryReq = httpMock.expectOne('/reviews/worker/worker-1/summary');
    summaryReq.flush({
      data: { averageRating: 4.0, totalReviews: 2, distribution: { '1': 0, '2': 0, '3': 0, '4': 2, '5': 0 } },
      meta: { requestId: 'req-2' },
    });

    const reviewsReq = httpMock.expectOne('/reviews/worker/worker-1?page=1&limit=5');
    reviewsReq.flush({
      data: [
        { id: 'r1', workerProfileId: 'w1', touristUserId: 't1', touristName: 'Maria', rating: 4, comment: 'Muito bom!', status: 'PUBLISHED', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
        { id: 'r2', workerProfileId: 'w1', touristUserId: 't2', touristName: 'João', rating: 4, comment: 'Adorei', status: 'PUBLISHED', createdAt: '2025-02-10T00:00:00Z', updatedAt: '2025-02-10T00:00:00Z' },
      ],
      meta: { page: 1, limit: 5, total: 2, totalPages: 1, requestId: 'req-3' },
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('[data-testid="review-card"]');
    expect(cards.length).toBe(2);
    expect(cards[0]?.querySelector('[data-testid="review-author"]')?.textContent?.trim()).toBe('Maria');
    expect(cards[0]?.querySelector('[data-testid="review-comment"]')?.textContent?.trim()).toBe('Muito bom!');
  });

  it('should show empty state when no reviews exist', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile();
    fixture.detectChanges();

    const summaryReq = httpMock.expectOne('/reviews/worker/worker-1/summary');
    summaryReq.flush({
      data: { averageRating: 0, totalReviews: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } },
      meta: { requestId: 'req-2' },
    });

    const reviewsReq = httpMock.expectOne('/reviews/worker/worker-1?page=1&limit=5');
    reviewsReq.flush({
      data: [],
      meta: { page: 1, limit: 5, total: 0, totalPages: 1, requestId: 'req-3' },
    });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const emptyState = el.querySelector('[data-testid="reviews-empty"]');
    expect(emptyState).toBeTruthy();
    expect(emptyState?.textContent).toContain('Nenhuma avaliação');
  });

  // ── Photo Gallery ──

  it('should render gallery thumbnails when gallery has images', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ gallery: ['https://example.com/foto1.jpg', 'https://example.com/foto2.jpg'] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const gallerySection = el.querySelector('[data-testid="gallery-section"]');
    expect(gallerySection).toBeTruthy();

    const thumbs = gallerySection?.querySelectorAll('[data-testid="gallery-thumb"]');
    expect(thumbs?.length).toBe(2);
  });

  it('should not render gallery section when gallery is empty', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ gallery: [] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="gallery-section"]')).toBeFalsy();
  });

  it('should open lightbox when gallery thumbnail is clicked', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ gallery: ['https://example.com/foto1.jpg'] });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('[data-testid="gallery-thumb"]') as HTMLImageElement).click();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="gallery-lightbox"]')).toBeTruthy();
  });

  // ── Mini-map ──

  it('should render mini-map with coordinates and Google Maps link', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();
    flushWorkerProfile({ latitude: -8.2890, longitude: -34.9480 });
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="map-section"]')).toBeTruthy();

    const mapLink = el.querySelector('[data-testid="map-link"]') as HTMLAnchorElement;
    expect(mapLink).toBeTruthy();
    expect(mapLink.href).toContain('google.com/maps');
    expect(mapLink.href).toContain('-8.289');
    expect(mapLink.href).toContain('-34.948');
  });

  // ── Error States ──

  it('should show error state with retry button on API failure', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('/catalog/workers/worker-1');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="error-state"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="retry-btn"]')).toBeTruthy();
  });

  it('should retry and load profile when retry button is clicked', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();

    const req1 = httpMock.expectOne('/catalog/workers/worker-1');
    req1.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const retryBtn = el.querySelector('[data-testid="retry-btn"]') as HTMLButtonElement;
    retryBtn.click();
    fixture.detectChanges();

    flushWorkerProfile();
    fixture.detectChanges();
    flushReviews();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="hero-name"]')?.textContent?.trim()).toBe('Barraca do João');
  });

  it('should show not found state on 404 response', () => {
    configureModule();
    const fixture = TestBed.createComponent(WorkerDetailComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('/catalog/workers/worker-1');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const notFoundState = el.querySelector('[data-testid="not-found-state"]');
    expect(notFoundState).toBeTruthy();
    expect(notFoundState?.textContent).toContain('Estabelecimento não encontrado');
  });
});
