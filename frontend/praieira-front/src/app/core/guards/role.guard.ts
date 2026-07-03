import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private readonly authStore: AuthStore,
    private readonly router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authStore.isAuthenticated()) {
      return this.router.parseUrl('/login');
    }

    const requiredRole = route.data['role'] as string;
    if (requiredRole && this.authStore.role() !== requiredRole) {
      return this.router.parseUrl('/');
    }

    return true;
  }
}
