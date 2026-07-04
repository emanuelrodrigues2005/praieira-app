import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthStore } from '../../core/auth/auth.store';

describe('RegisterComponent', () => {
  let httpMock: HttpTestingController;
  let authStore: AuthStore;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function setFormValues(fixture: any, values: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
  }) {
    const component = fixture.componentInstance as any;
    component.registerForm.patchValue({
      name: values.name ?? 'João Silva',
      email: values.email ?? 'joao@email.com',
      password: values.password ?? 'senha1234',
      confirmPassword: values.confirmPassword ?? 'senha1234',
      role: values.role ?? 'TOURIST',
    });
    fixture.detectChanges();
  }

  function submitForm(fixture: any) {
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.click();
    fixture.detectChanges();
  }

  it('should render a form with name, email, password, confirm password, and role selector', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const nameInput = el.querySelector('input#name');
    expect(nameInput).toBeTruthy();

    const emailInput = el.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();

    const passwordInput = el.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();

    const confirmPasswordInput = el.querySelector('input#confirmPassword');
    expect(confirmPasswordInput).toBeTruthy();

    const roleSelect = el.querySelector('select#role');
    expect(roleSelect).toBeTruthy();

    const submitBtn = el.querySelector('button[type="submit"]');
    expect(submitBtn).toBeTruthy();
    expect(submitBtn?.textContent?.toLowerCase()).toContain('criar minha conta');
  });

  it('should have role selector defaulting to Turista', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as any;
    expect(component.registerForm.get('role').value).toBe('TOURIST');

    const roleSelect = fixture.nativeElement.querySelector('select#role') as HTMLSelectElement;
    expect(roleSelect.value).toBe('TOURIST');
  });

  it('should disable submit button when form is invalid (empty)', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('should enable submit button when form is valid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    setFormValues(fixture, {});

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);
  });

  it('should show field error when email is invalid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    setFormValues(fixture, { email: 'invalid-email' });
    const emailInput = fixture.nativeElement.querySelector('input#email') as HTMLInputElement;
    emailInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.field-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.toLowerCase()).toContain('e-mail inválido');
  });

  it('should show field error when password is too short', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as any;
    component.registerForm.get('password').setValue('123');
    component.registerForm.get('password').markAsTouched();
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.field-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.toLowerCase()).toContain('mínimo 8');
  });

  it('should show error when passwords do not match', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    setFormValues(fixture, { password: 'senha1234', confirmPassword: 'different' });
    const confirmInput = fixture.nativeElement.querySelector('input#confirmPassword') as HTMLInputElement;
    confirmInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.field-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.toLowerCase()).toContain('senhas não conferem');
  });

  it('should call register API and navigate home on success', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const navigateSpy = vi.spyOn(router, 'navigate');
    fixture.detectChanges();

    setFormValues(fixture, {});
    submitForm(fixture);

    const req = httpMock.expectOne('http://localhost:3001/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'João Silva',
      email: 'joao@email.com',
      password: 'senha1234',
      role: 'TOURIST',
    });

    req.flush({
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-uuid',
        user: { id: 'u1', email: 'joao@email.com', role: 'TOURIST', isActive: true },
      },
      meta: { requestId: 'req-1' },
    });

    expect(authStore.isAuthenticated()).toBe(true);
    expect(authStore.user()?.email).toBe('joao@email.com');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show error message on 409 conflict (email already registered)', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    setFormValues(fixture, {});
    submitForm(fixture);

    const req = httpMock.expectOne('http://localhost:3001/auth/register');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });

    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('.error-message');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent?.toLowerCase()).toContain('email já está cadastrado');
  });

  it('should show loading state during API call', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    setFormValues(fixture, {});
    submitForm(fixture);

    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.textContent?.toLowerCase()).toContain('criando conta');

    const req = httpMock.expectOne('http://localhost:3001/auth/register');
    req.flush({
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-uuid',
        user: { id: 'u1', email: 'joao@email.com', role: 'TOURIST', isActive: true },
      },
      meta: { requestId: 'req-1' },
    });

    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(false);
    expect(submitBtn.textContent?.toLowerCase()).toContain('criar minha conta');
  });

  it('should redirect authenticated users to home', () => {
    authStore.login(
      { sub: 'existing', role: 'TOURIST', email: 'existing@test.com' },
      'existing-token',
    );
    const navigateSpy = vi.spyOn(router, 'navigate');

    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should show a link to login page', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const loginLink = el.querySelector('a[routerLink="/login"]');
    expect(loginLink).toBeTruthy();
  });

  it('should render the hero section with branding content', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;

    const heroSection = el.querySelector('.hero-section');
    expect(heroSection).toBeTruthy();

    const heading = el.querySelector('.hero-heading');
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toContain('Descubra o melhor');

    const badge = el.querySelector('.hero-badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain('Bem-vindo às praias de PE');
  });

  it('should render entrepreneur info card', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const card = el.querySelector('.entrepreneur-card');
    expect(card).toBeTruthy();
    expect(card?.textContent).toContain('É empreendedor?');
  });

  it('should render tab navigation with Entrar and Criar conta', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const tabs = el.querySelectorAll('.tab');
    expect(tabs.length).toBe(2);
    expect(tabs[0]?.textContent?.toLowerCase()).toContain('entrar');
    expect(tabs[1]?.textContent?.toLowerCase()).toContain('criar conta');
  });
});
