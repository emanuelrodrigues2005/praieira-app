import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthStore } from '../auth/auth.store';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let authStore: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    authStore = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Authorization header when token exists', () => {
    authStore.login({ sub: '1', role: 'TOURIST', email: 't@t.com' }, 'my-jwt-token');

    http.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('should not attach Authorization header when no token', () => {
    http.get('/test').subscribe();
    const req = httpMock.expectOne('/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
