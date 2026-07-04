import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountApiService, UpdateProfileRequest } from './account-api.service';

describe('AccountApiService', () => {
  let service: AccountApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AccountApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getProfile', () => {
    it('should GET /auth/me and return user profile', () => {
      const mockResponse = {
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
            name: 'Camila Torres',
            bio: 'Apaixonada por praias',
            phone: '+55 (81) 99999-9999',
            avatarUrl: null,
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2025-06-01T00:00:00Z',
          },
        },
        meta: { requestId: 'req-1' },
      };

      service.getProfile().subscribe((res) => {
        expect(res.data.id).toBe('u1');
        expect(res.data.email).toBe('camila@email.com');
        expect(res.data.profile.name).toBe('Camila Torres');
        expect(res.data.profile.bio).toBe('Apaixonada por praias');
        expect(res.data.profile.phone).toBe('+55 (81) 99999-9999');
      });

      const req = httpMock.expectOne('/auth/me');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should PATCH /profiles/me with name, bio, phone, avatarUrl', () => {
      const dto: UpdateProfileRequest = {
        name: 'Camila Torres Atualizada',
        bio: 'Nova bio',
        phone: '+55 (81) 98888-8888',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const mockResponse = {
        data: {
          id: 'p1',
          userId: 'u1',
          name: 'Camila Torres Atualizada',
          bio: 'Nova bio',
          phone: '+55 (81) 98888-8888',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
        meta: { requestId: 'req-2' },
      };

      service.updateProfile(dto).subscribe((res) => {
        expect(res.data.name).toBe('Camila Torres Atualizada');
        expect(res.data.phone).toBe('+55 (81) 98888-8888');
      });

      const req = httpMock.expectOne('/profiles/me');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should PATCH /profiles/me with partial data', () => {
      const dto: UpdateProfileRequest = { name: 'Só Nome' };

      service.updateProfile(dto).subscribe();

      const req = httpMock.expectOne('/profiles/me');
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Só Nome' });
      req.flush({
        data: { id: 'p1', name: 'Só Nome' },
        meta: { requestId: 'req-3' },
      });
    });
  });

  describe('deleteAccount', () => {
    it('should DELETE /auth/account and return void', () => {
      service.deleteAccount().subscribe({
        next: (res) => {
          // HttpClient returns null for 204 No Content
          expect(res).toBeNull();
        },
      });

      const req = httpMock.expectOne('/auth/account');
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
