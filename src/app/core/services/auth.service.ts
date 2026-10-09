import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiResponse, AuthenticationResponse, LoginRequest } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://localhost:8080/auth';

  login(request: LoginRequest): Observable<ApiResponse<AuthenticationResponse>> {
    return this.http.post<ApiResponse<AuthenticationResponse>>(`${this.apiUrl}/token`, request).pipe(
      tap(res => {
        if (res.result && res.result.token) {
          this.saveToken(res.result.token, request.userName);
        }
      })
    );
  }

  saveToken(token: string, username: string): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('username', username);
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Parse payload JWT lấy danh sách roles (scope)
  getUserRoles(): string[] {
    const token = this.getToken();
    if (!token) return [];
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.scope) {
          return payload.scope.split(' ').filter(Boolean);
        }
      }
    } catch {
      // ignore
    }
    return [];
  }

  isAdmin(): boolean {
    return this.getUserRoles().includes('ROLE_ADMIN');
  }
}
