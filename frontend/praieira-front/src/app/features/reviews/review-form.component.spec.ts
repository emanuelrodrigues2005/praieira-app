import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewFormComponent } from './review-form.component';

describe('ReviewFormComponent', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  let route: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReviewFormComponent,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function setRouteId(fixture: any, id: string) {
    (fixture.componentInstance as any)['routeId'] = id;
    fixture.detectChanges();
  }

  it('should render the review form with heading, star selector, textarea and submit button', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const heading = el.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading!.textContent).toContain('Avaliar');

    const starButtons = el.querySelectorAll('[data-testid="star-btn"]');
    expect(starButtons.length).toBe(5);

    const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.placeholder).toBe('Compartilhe sua experiência...');

    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
    expect(submitBtn).toBeTruthy();
    expect(submitBtn.textContent).toContain('Enviar');
  });

  // ── Star Selector ──

  it('should highlight stars up to the clicked star and mark it active', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');

    // Click the 4th star
    (stars[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    // Stars 0-3 should be active, star 4 should not
    expect(stars[0].classList.contains('active')).toBe(true);
    expect(stars[1].classList.contains('active')).toBe(true);
    expect(stars[2].classList.contains('active')).toBe(true);
    expect(stars[3].classList.contains('active')).toBe(true);
    expect(stars[4].classList.contains('active')).toBe(false);

    // Click the 1st star
    (stars[0] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(stars[0].classList.contains('active')).toBe(true);
    expect(stars[1].classList.contains('active')).toBe(false);
    expect(stars[2].classList.contains('active')).toBe(false);
    expect(stars[3].classList.contains('active')).toBe(false);
    expect(stars[4].classList.contains('active')).toBe(false);
  });

  it('should show validation error when submitting without selecting a rating', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;

    // Submit without selecting rating
    submitBtn.click();
    fixture.detectChanges();

    const ratingError = el.querySelector('[data-testid="rating-error"]');
    expect(ratingError).toBeTruthy();
    expect(ratingError!.textContent).toContain('Selecione uma nota');
  });

  it('should not show validation error once a rating is selected', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');

    // Submit without selecting rating to trigger validation
    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    // Now select a star
    (stars[2] as HTMLButtonElement).click();
    fixture.detectChanges();

    // Submit again — rating is valid now, so a POST happens
    submitBtn.click();
    fixture.detectChanges();

    // Flush the pending POST /reviews
    httpMock.expectOne('/reviews').flush({
      data: { id: 'r1', workerProfileId: 'w1', touristUserId: 't1', touristName: null, rating: 3, comment: '', status: 'PUBLISHED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      meta: { requestId: 'req-1' },
    });
    fixture.detectChanges();

    const ratingError = el.querySelector('[data-testid="rating-error"]');
    expect(ratingError).toBeFalsy();
  });

  // ── Comment Field & Char Counter ──

  it('should display character counter with correct count as user types', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const counter = el.querySelector('[data-testid="char-counter"]');

    // Initial state
    expect(counter!.textContent).toContain('0/1000');

    // Simulate typing by calling the component's onCommentChange
    const component = fixture.componentInstance as any;
    component.onCommentChange('Bom');
    fixture.detectChanges();

    expect(counter!.textContent).toContain('3/1000');

    // Longer text
    component.onCommentChange('Excelente atendimento!');
    fixture.detectChanges();

    expect(counter!.textContent).toContain('22/1000');
  });

  // ── Submit - Success ──

  it('should show success message and back-to-profile button after successful submission', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');

    // Select a rating
    (stars[4] as HTMLButtonElement).click();
    fixture.detectChanges();

    // Submit
    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    // Flush the POST request with success
    httpMock.expectOne('/reviews').flush({
      data: { id: 'r1', workerProfileId: 'w1', touristUserId: 't1', touristName: null, rating: 5, comment: null, status: 'PUBLISHED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      meta: { requestId: 'req-1' },
    });
    fixture.detectChanges();

    // Check success state
    expect(el.querySelector('[data-testid="success-state"]')).toBeTruthy();
    expect(el.textContent).toContain('Avaliação enviada com sucesso!');

    const backBtn = el.querySelector('[data-testid="back-to-profile-btn"]');
    expect(backBtn).toBeTruthy();
    expect(backBtn!.textContent).toContain('Voltar ao perfil');
  });

  // ── Submit - Duplicate (409) ──

  it('should show duplicate review message on 409 conflict', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');

    // Select rating and submit
    (stars[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    // Flush with 409 error
    const req = httpMock.expectOne('/reviews');
    req.flush({ message: 'Review already exists' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    // Check error state
    expect(el.querySelector('[data-testid="error-banner"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="error-409"]')).toBeTruthy();
    expect(el.textContent).toContain('Você já avaliou este estabelecimento');

    const link = el.querySelector('[data-testid="error-409"] a');
    expect(link).toBeTruthy();
    expect(link!.getAttribute('routerLink')).toBe('/minhas-reviews');
    expect(link!.textContent).toContain('Minhas Reviews');
  });

  // ── Submit - Generic Error & Retry ──

  it('should show generic error message and retry button on server error', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');

    // Select rating and submit
    (stars[4] as HTMLButtonElement).click();
    fixture.detectChanges();

    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();

    // Flush with 500 error
    const req = httpMock.expectOne('/reviews');
    req.flush({ message: 'Internal server error' }, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    // Check generic error state
    expect(el.querySelector('[data-testid="error-banner"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="error-generic"]')).toBeTruthy();
    expect(el.textContent).toContain('Não foi possível enviar sua avaliação');

    const retryBtn = el.querySelector('[data-testid="retry-btn"]');
    expect(retryBtn).toBeTruthy();
    expect(retryBtn!.textContent).toContain('Tentar novamente');

    // Click retry — should submit again
    (retryBtn as HTMLButtonElement).click();
    fixture.detectChanges();

    // Flush the new POST (retry)
    httpMock.expectOne('/reviews').flush({
      data: { id: 'r2', workerProfileId: 'w1', touristUserId: 't1', touristName: null, rating: 5, comment: null, status: 'PUBLISHED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      meta: { requestId: 'req-2' },
    });
    fixture.detectChanges();

    // Should show success after retry
    expect(el.querySelector('[data-testid="success-state"]')).toBeTruthy();
  });

  // ── Submitting State ──

  it('should disable form and show spinner while submitting', () => {
    const fixture = TestBed.createComponent(ReviewFormComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const stars = el.querySelectorAll('[data-testid="star-btn"]');
    const textarea = el.querySelector('[data-testid="comment-input"]') as HTMLTextAreaElement;
    const submitBtn = el.querySelector('[data-testid="submit-btn"]') as HTMLButtonElement;

    // Select rating
    (stars[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    // Initial state — everything enabled
    expect(submitBtn.disabled).toBe(false);
    expect(textarea.disabled).toBe(false);
    stars.forEach((star) => expect((star as HTMLButtonElement).disabled).toBe(false));

    // Submit
    submitBtn.click();
    fixture.detectChanges();

    // Submitting state — elements disabled, spinner visible
    expect(submitBtn.disabled).toBe(true);
    expect(el.querySelector('[data-testid="spinner"]')).toBeTruthy();
    expect(textarea.disabled).toBe(true);
    stars.forEach((star) => expect((star as HTMLButtonElement).disabled).toBe(true));

    // Flush the request to clean up
    httpMock.expectOne('/reviews').flush({
      data: { id: 'r1', workerProfileId: 'w1', touristUserId: 't1', touristName: null, rating: 4, comment: null, status: 'PUBLISHED', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      meta: { requestId: 'req-1' },
    });
    fixture.detectChanges();
  });
});
