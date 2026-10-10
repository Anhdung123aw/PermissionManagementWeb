import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiResponse, 
  Role, 
  RoleRequest, 
  SearchRequest, 
  SearchResponse, 
  RoleFilterRequest,
  RoleUpdateRequest
} from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/roles';

  searchRoles(request: SearchRequest<RoleFilterRequest>): Observable<ApiResponse<SearchResponse<Role>>> {
    return this.http.post<ApiResponse<SearchResponse<Role>>>(`${this.apiUrl}/search`, request);
  }

  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(this.apiUrl);
  }

  createRole(request: RoleRequest): Observable<ApiResponse<Role>> {
    return this.http.post<ApiResponse<Role>>(this.apiUrl, request);
  }

  updateRole(roleCode: string, request: RoleUpdateRequest): Observable<ApiResponse<Role>> {
    return this.http.put<ApiResponse<Role>>(`${this.apiUrl}/${roleCode}`, request);
  }

  deleteRole(roleCode: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${roleCode}`);
  }
}
