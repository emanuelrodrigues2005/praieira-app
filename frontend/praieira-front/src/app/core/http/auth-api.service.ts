import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuccessResponse } from '../models';

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'TOURIST' | 'WORKER';
  };
}

export type LoginResponse = SuccessResponse<LoginResponseData>;

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'TOURIST' | 'WORKER';
}

export interface RegisterResponseData {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: 'TOURIST' | 'WORKER';
    isActive: boolean;
  };
}

export type RegisterResponse = SuccessResponse<RegisterResponseData>;

export interface RefreshResponseData {
  accessToken: string;
  refreshToken: string;
}

export type RefreshResponse = SuccessResponse<RefreshResponseData>;

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, {
      email,
      password,
    });
  }

  register(dto: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, dto);
  }

  refresh(refreshToken: string): Observable<RefreshResponse> {
    return this.http.post<RefreshResponse>(`${this.baseUrl}/auth/refresh`, {
      refreshToken,
    });
  }
}
