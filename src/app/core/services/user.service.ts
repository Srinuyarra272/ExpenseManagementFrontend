import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface UserProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateUserProfileDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  // Assuming standard port 5000, consider using environment.ts in real apps
  private apiUrl = `${environment.apiUrl}/users`;

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.apiUrl}/profile`);
  }

  updateProfile(data: UpdateUserProfileDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.apiUrl}/profile`, data);
  }

  changePassword(data: ChangePasswordDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }
}
