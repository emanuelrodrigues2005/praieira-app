import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorInterceptor } from './error.interceptor';
import { AuthStore } from '../auth/auth.store';
import { AuthApiService } from '../http/auth-api.service';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authStore: AuthStore;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        AuthApiService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should logout and navigate to /login on 401 when no refresh token', () => {
    authStore.login({ sub: '1', role: 'TOURIST', email: 't@t.com' }, 'token');
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/test').subscribe({
      error: () => {
        expect(authStore.isAuthenticated()).toBe(false);
        expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      },
    });

    const req = httpMock.expectOne('/test');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should attempt token refresh on 401 when refresh token exists', () => {
    authStore.login(
      { sub: '1', role: 'TOURIST', email: 't@t.com' },
      'expired-token',
      'valid-refresh-token',
    );

    http.get('/test').subscribe({
      error: () => {
        // Refresh attempt was made (it will fail), so user is logged out
        expect(authStore.isAuthenticated()).toBe(false);
      },
    });

    // The original request fails with 401
    const originalReq = httpMock.expectOne('/test');
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // The interceptor should have issued a refresh request
    const refreshReq = httpMock.expectOne('/auth/refresh');
    expect(refreshReq.request.method).toBe('POST');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'valid-refresh-token' });

    // Make the refresh fail -> should logout
    refreshReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
  });

  it('should retry original request after successful token refresh', () => {
    authStore.login(
      { sub: '1', role: 'TOURIST', email: 't@t.com' },
      'expired-token',
      'valid-refresh-token',
    );
    const navigateSpy = vi.spyOn(router, 'navigate');

    http.get('/test').subscribe({
      next: () => {
        // Request succeeded after token refresh
        expect(authStore.isAuthenticated()).toBe(true);
        expect(authStore.token()).toBe('new-access-token');
        expect(authStore.refreshToken()).toBe('new-refresh-token');
      },
      error: () => {
        // Should not fail
        expect(true).toBe(false);
      },
    });

    // Original request fails with 401
    const originalReq = httpMock.expectOne('/test');
    originalReq.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Interceptor should call refresh
    const refreshReq = httpMock.expectOne('/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'valid-refresh-token' });

    // Refresh succeeds
    refreshReq.flush({
      data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
      meta: { requestId: 'req-2' },
    });

    // Original request is retried with new token
    const retriedReq = httpMock.expectOne('/test');
    retriedReq.flush({ data: { ok: true }, meta: { requestId: 'req-3' } });

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
