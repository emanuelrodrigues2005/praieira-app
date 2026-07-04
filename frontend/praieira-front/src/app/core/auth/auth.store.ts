import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly tokenSignal = signal<string | null>(this.loadToken());
  private readonly refreshTokenSignal = signal<string | null>(this.loadRefreshToken());
  private readonly userSignal = signal<User | null>(this.loadUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly role = computed(() => this.userSignal()?.role ?? null);

  login(user: User, token: string, refreshToken?: string): void {
    this.tokenSignal.set(token);
    this.refreshTokenSignal.set(refreshToken ?? null);
    this.userSignal.set(user);
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /** Update access & refresh tokens after a successful refresh (keep user). */
  setTokens(accessToken: string, newRefreshToken: string): void {
    this.tokenSignal.set(accessToken);
    this.refreshTokenSignal.set(newRefreshToken);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private loadRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
