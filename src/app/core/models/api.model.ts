export interface ApiResponse<T> {
  code?: number;
  message?: string;
  result: T;
}

export interface LoginRequest {
  userName: string;
  passWord: string;
}

export interface AuthenticationResponse {
  token: string;
  authenticated: boolean;
}

export interface Permission {
  permissionCode: string;
  permissionName: string;
  description?: string;
}

export interface Role {
  roleCode: string;
  roleName: string;
  description?: string;
  permissions?: Permission[];
}

export interface RoleRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  permissions: string[];
}

export interface User {
  id: number;
  userName: string;
  email?: string;
  roles?: Role[];
}

export interface UserCreationRequest {
  userName: string;
  passWord: string;
  email?: string;
  roles: string[];
}
export interface Pagination {
  page: number;
  size: number;
}
export interface Sort {
  field?: string;
  order?: 'ASC' | 'DESC' | string;
}
export interface SearchRequest<T> {
  pagination: Pagination;
  sort?: Sort;
  filter?: T;
}
export interface SearchResponse<T> {
  data: T[];
  totalCount: number;
}
export interface UserFilterRequest {
  keyword?: string;
}


export interface RoleFilterRequest {
  keyword?: string;
}

export interface PermissionFilterRequest {
  keyword?: string;
}

export interface UserUpdateRequest {
  passWord?: string;
  email?: string;
  roles?: string[];
}

export interface RoleUpdateRequest {
  roleName?: string;
  description?: string;
  permissions?: string[];
}

export interface PermissionUpdateRequest {
  permissionName?: string;
  description?: string;
}
export interface UserProfile {
  id: number;
  userName: string;
  email?: string;
  roles: string[];
  permissions: string[];
}

