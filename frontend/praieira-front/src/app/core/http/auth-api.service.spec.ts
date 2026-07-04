import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should POST to /auth/login with email and password', () => {
    service.login('test@test.com', 'password123').subscribe();

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@test.com',
      password: 'password123',
    });
    req.flush({
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'uuid-refresh',
        user: { id: 'u1', email: 'test@test.com', role: 'TOURIST' },
      },
      meta: { requestId: 'req-1' },
    });
  });

  it('should POST to /auth/register with name, email, password and role', () => {
    service.register({
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      role: 'TOURIST',
    }).subscribe();

    const req = httpMock.expectOne('/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      role: 'TOURIST',
    });
    req.flush({
      data: {
        accessToken: 'jwt-register',
        refreshToken: 'uuid-refresh',
        user: { id: 'u2', email: 'joao@email.com', role: 'TOURIST', isActive: true },
      },
      meta: { requestId: 'req-2' },
    });
  });

  it('should return the register success response body', () => {
    const mockResponse = {
      data: {
        accessToken: 'jwt-register',
        refreshToken: 'uuid-refresh',
        user: { id: 'u2', email: 'joao@email.com', role: 'TOURIST', isActive: true },
      },
      meta: { requestId: 'req-2' },
    };

    service.register({
      name: 'João',
      email: 'joao@email.com',
      password: 'senha123',
      role: 'TOURIST',
    }).subscribe((res) => {
      expect(res.data.accessToken).toBe('jwt-register');
      expect(res.data.user.email).toBe('joao@email.com');
      expect(res.data.user.role).toBe('TOURIST');
    });

    const req = httpMock.expectOne('/auth/register');
    req.flush(mockResponse);
  });

  it('should return the success response body', () => {
    const mockResponse = {
      data: {
        accessToken: 'jwt-token',
        refreshToken: 'uuid-refresh',
        user: { id: 'u1', email: 'test@test.com', role: 'TOURIST' },
      },
      meta: { requestId: 'req-1' },
    };

    service.login('test@test.com', 'password123').subscribe((res) => {
      expect(res.data.accessToken).toBe('jwt-token');
      expect(res.data.user.email).toBe('test@test.com');
    });

    const req = httpMock.expectOne('/auth/login');
    req.flush(mockResponse);
  });
});
