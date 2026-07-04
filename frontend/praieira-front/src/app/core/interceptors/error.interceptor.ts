import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthStore } from '../auth/auth.store';
import { AuthApiService } from '../http/auth-api.service';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly authStore = inject(AuthStore);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);

  private isRefreshing = false;
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(req, next);
        }
        return throwError(() => error);
      }),
    );
  }

  private handle401Error(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const refreshToken = this.authStore.refreshToken();

    // If the failing request is already to /auth/refresh, don't retry
    if (req.url.includes('/auth/refresh')) {
      this.logout();
      return throwError(() => new Error('Session expired'));
    }

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authApi.refresh(refreshToken).pipe(
        switchMap((res) => {
          this.isRefreshing = false;
          this.authStore.setTokens(res.data.accessToken, res.data.refreshToken);
          this.refreshTokenSubject.next(res.data.accessToken);
          // Retry the original request with the new token
          return next.handle(this.addToken(req, res.data.accessToken));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.logout();
          return throwError(() => err);
        }),
      );
    } else {
      // Refresh already in progress — wait for it to complete
      return this.refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(req, token))),
      );
    }
  }

  private addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  private logout(): void {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
