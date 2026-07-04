import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthStore } from '../../core/auth/auth.store';

describe('LoginComponent', () => {
  let httpMock: HttpTestingController;
  let authStore: AuthStore;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function setFormValues(fixture: any, email: string, password: string) {
    const component = fixture.componentInstance as any;
    component.loginForm.setValue({ email, password });
    fixture.detectChanges();
  }

  function submitForm(fixture: any) {
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();
  }

  it('should render a form with email input, password input, and submit button', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const emailInput = el.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();

    const passwordInput = el.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();

    const submitBtn = el.querySelector('button[type="submit"]');
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent?.toLowerCase()).toContain('entrar');
  });

  it('should disable submit button when form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    setFormValues(fixture, 'test@test.com', 'correct-password');

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
  });

  it('should call login API and navigate home on success', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const navigateSpy = vi.spyOn(router, 'navigate');

    setFormValues(fixture, 'test@test.com', 'correct-password');
    submitForm(fixture);

    const req = httpMock.expectOne('http://localhost:3001/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@test.com', password: 'correct-password' });

    req.flush({
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-uuid',
        user: { id: 'u1', email: 'test@test.com', role: 'TOURIST' },
      },
      meta: { requestId: 'req-1' },
    });

    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.user()?.email).toBe('test@test.com');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show error message on login failure', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    setFormValues(fixture, 'test@test.com', 'wrong-password');
    submitForm(fixture);

    const req = httpMock.expectOne('http://localhost:3001/auth/login');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.toLowerCase()).toContain('inválidos');
  });

  it('should show loading state during API call', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    setFormValues(fixture, 'test@test.com', 'correct-password');
    submitForm(fixture);

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.textContent?.toLowerCase()).toContain('entrando');

    const req = httpMock.expectOne('http://localhost:3001/auth/login');
    req.flush({
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-uuid',
        user: { id: 'u1', email: 'test@test.com', role: 'TOURIST' },
      },
      meta: { requestId: 'req-1' },
    });

    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(false);
    expect(submitBtn.textContent?.toLowerCase()).toContain('entrar');
  });

  it('should show a link to registration page', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const registerLink = el.querySelector('a[routerLink="/cadastro"]');
    expect(registerLink).toBeTruthy();
  });
});
