import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MyReviewsComponent } from './my-reviews.component';

describe('MyReviewsComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MyReviewsComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /** Flush the initial GET /reviews/me call */
  function flushInitial(
    data: any[] = [],
    overrides: Partial<{ page: number; limit: number; total: number }> = {},
  ) {
    const { page = 1, limit = 10, total = 0 } = overrides;
    const req = httpMock.expectOne(`/reviews/me?page=${page}&limit=${limit}`);
    expect(req.request.method).toBe('GET');
    req.flush({
      data,
      meta: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1), requestId: 'r1' },
    });
  }

  function makeReview(overrides: Partial<any> = {}) {
    return {
      id: 'r1',
      workerProfileId: 'w1',
      touristUserId: 't1',
      touristName: null,
      rating: 4,
      comment: 'Muito bom! Atendimento excelente.',
      status: 'PUBLISHED',
      createdAt: '2026-06-15T12:00:00Z',
      updatedAt: '2026-06-15T00:00:00Z',
      establishmentName: 'Barraca do João',
      ...overrides,
    };
  }

  // ── Loading state ──

  it('should show skeleton cards while loading', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeletons = el.querySelectorAll('[data-testid="skeleton-card"]');
    expect(skeletons.length).toBeGreaterThanOrEqual(3);

    // Flush to complete
    flushInitial();
    fixture.detectChanges();
    expect(el.querySelector('[data-testid="skeleton-card"]')).toBeFalsy();
  });

  // ── Empty state ──

  it('should show empty state when no reviews', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const empty = el.querySelector('[data-testid="empty-state"]');
    expect(empty).toBeTruthy();
    expect(empty?.textContent).toContain('Você ainda não fez nenhuma avaliação');
    expect(el.querySelector('[data-testid="explorar-link"]')).toBeTruthy();
  });

  // ── Error state ──

  it('should show error state with retry on API failure', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('/reviews/me?page=1&limit=10');
    req.error(new ProgressEvent('error'));
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const errorState = el.querySelector('[data-testid="error-state"]');
    expect(errorState).toBeTruthy();
    expect(el.querySelector('[data-testid="retry-btn"]')).toBeTruthy();
  });

  // ── Success: render review cards ──

  it('should render review cards when reviews are returned', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const cards = el.querySelectorAll('[data-testid="review-card"]');
    expect(cards.length).toBe(1);
  });

  it('should display establishment name as a link', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const nameLink = el.querySelector('[data-testid="establishment-link"]');
    expect(nameLink).toBeTruthy();
    expect(nameLink?.textContent?.trim()).toBe('Barraca do João');
    expect(nameLink?.getAttribute('href')).toBe('/perfil/w1'); // routerLink directive translates to href in testing
  });

  it('should display star rating, comment, date, and status badge on each card', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const card = el.querySelector('[data-testid="review-card"]');
    expect(card).toBeTruthy();
    expect(el.querySelector('app-rating-stars')).toBeTruthy();
    expect(card?.textContent).toContain('Muito bom!');
    expect(card?.textContent).toContain('15 de junho, 2026');
    expect(card?.textContent).toContain('Publicada');
  });

  it('should render edit and delete action buttons on each card', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="edit-btn"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="delete-btn"]')).toBeTruthy();
  });

  // ── Pagination ──

  it('should render pagination when there are multiple pages', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()], { page: 1, limit: 10, total: 30 });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-pagination')).toBeTruthy();
  });

  it('should NOT render pagination when only one page', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()], { page: 1, limit: 10, total: 1 });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-pagination')).toBeFalsy();
  });

  // ── Edit flow ──

  it('should enter edit mode when edit button is clicked', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const editBtn = fixture.nativeElement.querySelector('[data-testid="edit-btn"]') as HTMLElement;
    editBtn.click();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="edit-save-btn"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="edit-cancel-btn"]')).toBeTruthy();
  });

  it('should save edit and refresh list', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    // Enter edit mode
    const editBtn = fixture.nativeElement.querySelector('[data-testid="edit-btn"]') as HTMLElement;
    editBtn.click();
    fixture.detectChanges();

    // Click save
    const saveBtn = fixture.nativeElement.querySelector('[data-testid="edit-save-btn"]') as HTMLElement;
    saveBtn.click();
    fixture.detectChanges();

    // Expect PATCH call
    const patchReq = httpMock.expectOne('/reviews/r1');
    expect(patchReq.request.method).toBe('PATCH');
    patchReq.flush({ data: makeReview(), meta: { requestId: 'r2' } });
    fixture.detectChanges();

    // Expect list refresh (GET /reviews/me again)
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="review-card"]')).toBeTruthy();
  });

  it('should cancel edit and revert changes', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview({ comment: 'Original comment' })]);
    fixture.detectChanges();

    // Enter edit mode
    const editBtn = fixture.nativeElement.querySelector('[data-testid="edit-btn"]') as HTMLElement;
    editBtn.click();
    fixture.detectChanges();

    // Click cancel
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="edit-cancel-btn"]') as HTMLElement;
    cancelBtn.click();
    fixture.detectChanges();

    // Should exit edit mode and show original comment
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="edit-save-btn"]')).toBeFalsy();
    expect(el.textContent).toContain('Original comment');
  });

  // ── Delete flow ──

  it('should show confirmation dialog when delete is clicked', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]') as HTMLElement;
    deleteBtn.click();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const confirmDialog = el.querySelector('[data-testid="confirm-dialog"]');
    expect(confirmDialog).toBeTruthy();
    expect(confirmDialog?.textContent).toContain('Tem certeza que deseja excluir sua avaliação?');
  });

  it('should cancel deletion when clicking cancel on confirmation', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    // Open confirm dialog
    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]') as HTMLElement;
    deleteBtn.click();
    fixture.detectChanges();

    // Click cancel
    const cancelBtn = fixture.nativeElement.querySelector('[data-testid="confirm-cancel-btn"]') as HTMLElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="confirm-dialog"]')).toBeFalsy();
  });

  it('should confirm deletion and remove card', () => {
    const fixture = TestBed.createComponent(MyReviewsComponent);
    fixture.detectChanges();
    flushInitial([makeReview()]);
    fixture.detectChanges();

    // Open confirm dialog
    const deleteBtn = fixture.nativeElement.querySelector('[data-testid="delete-btn"]') as HTMLElement;
    deleteBtn.click();
    fixture.detectChanges();

    // Click confirm
    const confirmBtn = fixture.nativeElement.querySelector('[data-testid="confirm-yes-btn"]') as HTMLElement;
    confirmBtn.click();
    fixture.detectChanges();

    // Expect DELETE call
    const deleteReq = httpMock.expectOne('/reviews/r1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);
    fixture.detectChanges();

    // Expect list refresh (GET /reviews/me again)
    flushInitial([]);
    fixture.detectChanges();

    // Should show empty state now
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-testid="empty-state"]')).toBeTruthy();
  });
});
