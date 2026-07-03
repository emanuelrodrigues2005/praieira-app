import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ErrorInterceptor } from './error.interceptor';
import { AuthStore } from '../auth/auth.store';

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

  it('should logout and navigate to /login on 401', () => {
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
});
