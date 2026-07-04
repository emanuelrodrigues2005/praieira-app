import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../auth/auth.store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authStore: AuthStore,
    private readonly router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (this.authStore.isAuthenticated()) {
      return true;
    }
    return this.router.parseUrl('/login');
  }
}
