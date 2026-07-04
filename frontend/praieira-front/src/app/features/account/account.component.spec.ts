import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AccountComponent } from './account.component';
import { AuthStore } from '../../core/auth/auth.store';

describe('AccountComponent', () => {
  let httpMock: HttpTestingController;
  let authStore: AuthStore;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AccountComponent, HttpClientTestingModule, RouterTestingModule],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function flushProfile(fixture: any, overrides: any = {}) {
    const req = httpMock.expectOne('/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({
      data: {
        id: 'u1',
        email: 'camila@email.com',
        role: 'TOURIST',
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
        profile: {
          id: 'p1',
          userId: 'u1',
          name: overrides.name ?? 'Camila Torres',
          bio: overrides.bio ?? 'Apaixonada por praias',
          phone: overrides.phone ?? '+55 (81) 99999-9999',
          avatarUrl: null,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-06-01T00:00:00Z',
        },
        ...overrides,
      },
      meta: { requestId: 'req-1' },
    });
    fixture.detectChanges();
  }

  it('should render page title', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('[data-testid="page-title"]');
    expect(title).toBeTruthy();
    expect(title?.textContent?.trim()).toBe('Perfil');
  });

  it('should show loading skeleton on init while profile loads', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const skeleton = el.querySelector('[data-testid="profile-skeleton"]');
    expect(skeleton).toBeTruthy();

    // Flush to complete loading
    flushProfile(fixture);

    const skeletonAfter = el.querySelector('[data-testid="profile-skeleton"]');
    expect(skeletonAfter).toBeFalsy();
  });

  it('should pre-fill form fields with profile data', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture, {
      profile: {
        name: 'Camila Torres',
        bio: 'Apaixonada por praias',
        phone: '+55 (81) 99999-9999',
        avatarUrl: null,
      },
    });

    const el = fixture.nativeElement as HTMLElement;

    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe('Camila Torres');

    const emailInput = el.querySelector('[data-testid="email-input"]') as HTMLInputElement;
    expect(emailInput).toBeTruthy();
    expect(emailInput.value).toBe('camila@email.com');
    expect(emailInput.disabled).toBe(true);

    const phoneInput = el.querySelector('[data-testid="phone-input"]') as HTMLInputElement;
    expect(phoneInput).toBeTruthy();
    expect(phoneInput.value).toBe('+55 (81) 99999-9999');

    const bioTextarea = el.querySelector('[data-testid="bio-input"]') as HTMLTextAreaElement;
    expect(bioTextarea).toBeTruthy();
    expect(bioTextarea.value).toBe('Apaixonada por praias');
  });

  it('should call updateProfile on save with changed fields', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Change name
    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    nameInput.value = 'Camila Atualizada';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click save
    const saveBtn = el.querySelector('[data-testid="save-btn"]') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();

    const req = httpMock.expectOne('/profiles/me');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ name: 'Camila Atualizada' });
    req.flush({
      data: { id: 'p1', name: 'Camila Atualizada', bio: null, phone: null, avatarUrl: null },
      meta: { requestId: 'req-2' },
    });
    fixture.detectChanges();
  });

  it('should show success feedback after profile update', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Change name
    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    nameInput.value = 'Camila Atualizada';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click save
    const saveBtn = el.querySelector('[data-testid="save-btn"]') as HTMLButtonElement;
    saveBtn.click();

    const req = httpMock.expectOne('/profiles/me');
    req.flush({
      data: { id: 'p1', name: 'Camila Atualizada', bio: null, phone: null, avatarUrl: null },
      meta: { requestId: 'req-2' },
    });
    fixture.detectChanges();

    const successMsg = el.querySelector('[data-testid="success-message"]');
    expect(successMsg).toBeTruthy();
  });

  it('should show error feedback on save failure and allow retry', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Change name
    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    nameInput.value = 'Camila Atualizada';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click save
    const saveBtn = el.querySelector('[data-testid="save-btn"]') as HTMLButtonElement;
    saveBtn.click();

    const req = httpMock.expectOne('/profiles/me');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    const errorMsg = el.querySelector('[data-testid="error-message"]');
    expect(errorMsg).toBeTruthy();
  });

  it('should show loading state on save button during update', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    nameInput.value = 'Camila Atualizada';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const saveBtn = el.querySelector('[data-testid="save-btn"]') as HTMLButtonElement;
    saveBtn.click();
    fixture.detectChanges();

    expect(saveBtn.disabled).toBe(true);
    expect(saveBtn.textContent?.toLowerCase()).toContain('salvando');

    const req = httpMock.expectOne('/profiles/me');
    req.flush({
      data: { id: 'p1', name: 'Camila Atualizada', bio: null, phone: null, avatarUrl: null },
      meta: { requestId: 'req-2' },
    });
    fixture.detectChanges();

    expect(saveBtn.disabled).toBe(false);
  });

  it('should reset form to saved values on cancel', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Change name
    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    nameInput.value = 'Nome Temporário';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click cancel
    const cancelBtn = el.querySelector('[data-testid="cancel-btn"]') as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(nameInput.value).toBe('Camila Torres');
  });

  it('should show error state with retry on profile fetch failure', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    const req = httpMock.expectOne('/auth/me');
    req.flush('Network Error', { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const errorState = el.querySelector('[data-testid="error-state"]');
    expect(errorState).toBeTruthy();

    const retryBtn = el.querySelector('[data-testid="retry-btn"]');
    expect(retryBtn).toBeTruthy();
  });

  it('should retry profile fetch when retry button is clicked', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();

    // First request fails
    const req1 = httpMock.expectOne('/auth/me');
    req1.flush('Network Error', { status: 0, statusText: 'Unknown Error' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const retryBtn = el.querySelector('[data-testid="retry-btn"]') as HTMLButtonElement;
    retryBtn.click();
    fixture.detectChanges();

    // Second request succeeds
    flushProfile(fixture);

    const nameInput = el.querySelector('[data-testid="name-input"]') as HTMLInputElement;
    expect(nameInput.value).toBe('Camila Torres');
  });

  // ─── Danger Zone Tests ──────────────────────────────────────

  it('should render danger zone section with delete button', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;
    const dangerZone = el.querySelector('[data-testid="danger-zone"]');
    expect(dangerZone).toBeTruthy();

    const title = dangerZone?.querySelector('.danger-title');
    expect(title?.textContent?.trim()).toBe('Zona de perigo');

    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.textContent?.trim()).toBe('Excluir minha conta');
  });

  it('should open delete confirmation modal when delete button is clicked', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Modal should not be visible initially
    expect(el.querySelector('[data-testid="delete-modal"]')).toBeFalsy();

    // Click delete button
    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    deleteBtn.click();
    fixture.detectChanges();

    // Modal should be visible
    const modal = el.querySelector('[data-testid="delete-modal"]');
    expect(modal).toBeTruthy();

    const confirmInput = el.querySelector('[data-testid="confirm-input"]') as HTMLInputElement;
    expect(confirmInput).toBeTruthy();

    const modalCancelBtn = el.querySelector('[data-testid="modal-cancel-btn"]') as HTMLButtonElement;
    expect(modalCancelBtn).toBeTruthy();

    const modalConfirmBtn = el.querySelector('[data-testid="modal-confirm-btn"]') as HTMLButtonElement;
    expect(modalConfirmBtn).toBeTruthy();
  });

  it('should disable confirm button until EXCLUIR is typed', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Open modal
    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    deleteBtn.click();
    fixture.detectChanges();

    const confirmBtn = el.querySelector('[data-testid="modal-confirm-btn"]') as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);

    // Type partial text
    const confirmInput = el.querySelector('[data-testid="confirm-input"]') as HTMLInputElement;
    confirmInput.value = 'EXCLU';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(confirmBtn.disabled).toBe(true);

    // Type full text
    confirmInput.value = 'EXCLUIR';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(confirmBtn.disabled).toBe(false);
  });

  it('should close modal when cancel is clicked', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    deleteBtn.click();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="delete-modal"]')).toBeTruthy();

    const cancelBtn = el.querySelector('[data-testid="modal-cancel-btn"]') as HTMLButtonElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(el.querySelector('[data-testid="delete-modal"]')).toBeFalsy();
  });

  it('should call deleteAccount, clear auth store, and redirect on confirm', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    const originalLocation = window.location;

    // Mock window.location.href assignment
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: '' },
      writable: true,
    });

    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Log user in first
    authStore.login(
      { sub: 'u1', role: 'TOURIST', email: 'camila@email.com' },
      'test-token',
    );
    expect(authStore.isAuthenticated()).toBe(true);

    // Open modal and type confirmation
    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    deleteBtn.click();
    fixture.detectChanges();

    const confirmInput = el.querySelector('[data-testid="confirm-input"]') as HTMLInputElement;
    confirmInput.value = 'EXCLUIR';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click confirm
    const confirmBtn = el.querySelector('[data-testid="modal-confirm-btn"]') as HTMLButtonElement;
    confirmBtn.click();
    fixture.detectChanges();

    const req = httpMock.expectOne('/auth/account');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    // Should clear auth
    expect(authStore.isAuthenticated()).toBe(false);

    // Should redirect
    expect(window.location.href).toBe('/login');

    // Restore location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('should show error message on delete failure and keep modal open', () => {
    const fixture = TestBed.createComponent(AccountComponent);
    fixture.detectChanges();
    flushProfile(fixture);

    const el = fixture.nativeElement as HTMLElement;

    // Open modal and type confirmation
    const deleteBtn = el.querySelector('[data-testid="delete-account-btn"]') as HTMLButtonElement;
    deleteBtn.click();
    fixture.detectChanges();

    const confirmInput = el.querySelector('[data-testid="confirm-input"]') as HTMLInputElement;
    confirmInput.value = 'EXCLUIR';
    confirmInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Click confirm
    const confirmBtn = el.querySelector('[data-testid="modal-confirm-btn"]') as HTMLButtonElement;
    confirmBtn.click();
    fixture.detectChanges();

    const req = httpMock.expectOne('/auth/account');
    req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    // Modal should still be open
    expect(el.querySelector('[data-testid="delete-modal"]')).toBeTruthy();

    // Error text should be visible
    const errorText = el.querySelector('.modal-content .error-text');
    expect(errorText).toBeTruthy();
  });
});
