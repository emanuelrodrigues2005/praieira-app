import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuccessResponse } from '../models';

export interface UserProfileData {
  id: string;
  email: string;
  role: 'TOURIST' | 'WORKER' | 'CURATOR' | 'ADMIN';
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    userId: string;
    name: string;
    bio: string | null;
    phone: string | null;
    avatarUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
}

export type GetProfileResponse = SuccessResponse<UserProfileData>;
export type UpdateProfileResponse = SuccessResponse<{
  id: string;
  name: string;
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
}>;

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<GetProfileResponse> {
    return this.http.get<GetProfileResponse>('/auth/me');
  }

  updateProfile(dto: UpdateProfileRequest): Observable<UpdateProfileResponse> {
    return this.http.patch<UpdateProfileResponse>('/profiles/me', dto);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>('/auth/account');
  }
}
