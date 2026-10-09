import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  User,
  UserCreationRequest,
  SearchRequest,
  SearchResponse,
  UserFilterRequest,
} from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/users';

  getUsers(): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(this.apiUrl);
  }

  createUser(request: UserCreationRequest): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.apiUrl, request);
  }

  deleteUser(userId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${userId}`);
  }
  searchUsers(
    request: SearchRequest<UserFilterRequest>,
  ): Observable<ApiResponse<SearchResponse<User>>> {
    return this.http.post<ApiResponse<SearchResponse<User>>>(`${this.apiUrl}/search`, request);
  }
}
