import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AuthStore } from '../auth/auth.store';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authStore: AuthStore;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AuthGuard);
    authStore = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  it('should block unauthenticated access and redirect to /login', () => {
    const result = guard.canActivate();
    expect(result.toString()).toBe('/login');
  });

  it('should allow access when authenticated', () => {
    authStore.login({ sub: '1', role: 'TOURIST', email: 't@t.com' }, 'token');
    expect(guard.canActivate()).toBe(true);
  });
});
