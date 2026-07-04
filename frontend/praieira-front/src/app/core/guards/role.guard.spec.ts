import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RoleGuard } from './role.guard';
import { AuthStore } from '../auth/auth.store';

describe('RoleGuard', () => {
  let guard: RoleGuard;
  let authStore: AuthStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RoleGuard);
    authStore = TestBed.inject(AuthStore);
  });

  function makeRouteSnapshot(role: string): ActivatedRouteSnapshot {
    return { data: { role } } as unknown as ActivatedRouteSnapshot;
  }

  it('should redirect unauthenticated to /login', () => {
    const result = guard.canActivate(makeRouteSnapshot('TOURIST'));
    expect(result.toString()).toBe('/login');
  });

  it('should allow TOURIST on TOURIST route', () => {
    authStore.login({ sub: '1', role: 'TOURIST', email: 't@t.com' }, 'token');
    expect(guard.canActivate(makeRouteSnapshot('TOURIST'))).toBe(true);
  });

  it('should block WORKER on TOURIST route', () => {
    authStore.login({ sub: '2', role: 'WORKER', email: 'w@w.com' }, 'token');
    const result = guard.canActivate(makeRouteSnapshot('TOURIST'));
    expect(result.toString()).toBe('/');
  });
});
