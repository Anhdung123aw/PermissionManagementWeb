import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiResponse, 
  Permission, 
  SearchRequest, 
  SearchResponse, 
  PermissionFilterRequest,
  PermissionUpdateRequest
} from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/permissions';

  searchPermissions(request: SearchRequest<PermissionFilterRequest>): Observable<ApiResponse<SearchResponse<Permission>>> {
    return this.http.post<ApiResponse<SearchResponse<Permission>>>(`${this.apiUrl}/search`, request);
  }

  getPermissions(): Observable<ApiResponse<Permission[]>> {
    return this.http.get<ApiResponse<Permission[]>>(this.apiUrl);
  }

  createPermission(request: Permission): Observable<ApiResponse<Permission>> {
    return this.http.post<ApiResponse<Permission>>(this.apiUrl, request);
  }

  updatePermission(permissionCode: string, request: PermissionUpdateRequest): Observable<ApiResponse<Permission>> {
    return this.http.put<ApiResponse<Permission>>(`${this.apiUrl}/${permissionCode}`, request);
  }

  deletePermission(permissionCode: string): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.apiUrl}/${permissionCode}`);
  }
}
