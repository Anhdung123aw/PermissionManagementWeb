import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';
import {
  Role,
  Permission,
  RoleRequest,
  RoleUpdateRequest,
  SearchRequest,
  RoleFilterRequest,
} from '../../core/models/api.model';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule,HasPermissionDirective],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  readonly Math = Math;

  roles: Role[] = [];
  availablePermissions: Permission[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  // Dropdown hành động 3 chấm đứng
  activeMenuId: string | null = null;

  // Dropdown chọn Quyền hạn form Tạo mới
  isPermDropdownOpen = false;

  // Dropdown chọn Quyền hạn form Chỉnh sửa
  isEditPermDropdownOpen = false;

  // State cho Modal Xem Chi Tiết
  detailRole: Role | null = null;

  // State cho Modal Chỉnh Sửa
  editingRole: {
    roleCode: string;
    roleName: string;
    description: string;
    permissions: string[];
  } | null = null;

  // State cho Modal Xóa
  roleToDelete: string | null = null;

  newRole: RoleRequest = {
    roleCode: '',
    roleName: '',
    description: '',
    permissions: []
  };

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.loading = true;
    this.errorMessage = '';
    const req: SearchRequest<RoleFilterRequest> = {
      pagination: {
        page: this.currentPage,
        size: this.pageSize,
      },
      sort: {
        field: 'roleCode',
        order: 'ASC',
      },
      filter: {
        keyword: this.searchTerm ? this.searchTerm.trim() : undefined,
      },
    };

    this.roleService.searchRoles(req).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.result) {
          this.roles = res.result.data || [];
          this.totalCount = res.result.totalCount || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách vai trò!';
        this.cdr.detectChanges();
      }
    });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (res) => {
        this.availablePermissions = res.result || [];
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  clearSearch(): void {
    if (this.searchTerm) {
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadRoles();
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadRoles();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadRoles();
  }

  // Đóng mở Action Menu 3 chấm đứng
  toggleActionMenu(roleCode: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === roleCode ? null : roleCode;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    let changed = false;
    if (this.activeMenuId !== null) {
      this.activeMenuId = null;
      changed = true;
    }
    if (this.isPermDropdownOpen) {
      this.isPermDropdownOpen = false;
      changed = true;
    }
    if (this.isEditPermDropdownOpen) {
      this.isEditPermDropdownOpen = false;
      changed = true;
    }
    if (changed) {
      this.cdr.detectChanges();
    }
  }

  togglePermDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isPermDropdownOpen = !this.isPermDropdownOpen;
    this.cdr.detectChanges();
  }

  onPermissionToggle(permCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    const index = this.newRole.permissions.indexOf(permCode);
    if (index > -1) {
      this.newRole.permissions.splice(index, 1);
    } else {
      this.newRole.permissions.push(permCode);
    }
    this.cdr.detectChanges();
  }

  removePermission(permCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.newRole.permissions = this.newRole.permissions.filter(p => p !== permCode);
    this.cdr.detectChanges();
  }

  onCreateRole(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.newRole.roleCode || !this.newRole.roleName) {
      this.errorMessage = 'Vui lòng nhập Mã vai trò và Tên vai trò!';
      return;
    }

    this.roleService.createRole(this.newRole).subscribe({
      next: () => {
        this.message = 'Tạo vai trò "' + this.newRole.roleCode + '" thành công!';
        this.newRole = { roleCode: '', roleName: '', description: '', permissions: [] };
        this.isPermDropdownOpen = false;
        this.loadRoles();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi tạo vai trò!';
        this.cdr.detectChanges();
      }
    });
  }

  // --- HÀNH ĐỘNG 1: XEM CHI TIẾT ---
  openDetail(r: Role, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.detailRole = r;
    this.cdr.detectChanges();
  }

  closeDetailModal(): void {
    this.detailRole = null;
    this.cdr.detectChanges();
  }

  // --- HÀNH ĐỘNG 2: CHỈNH SỬA ---
  openEdit(r: Role, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.isEditPermDropdownOpen = false;
    this.editingRole = {
      roleCode: r.roleCode,
      roleName: r.roleName,
      description: r.description || '',
      permissions: r.permissions ? r.permissions.map(p => p.permissionCode) : []
    };
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.editingRole = null;
    this.isEditPermDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleEditPermDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditPermDropdownOpen = !this.isEditPermDropdownOpen;
    this.cdr.detectChanges();
  }

  onEditPermToggle(permCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.editingRole) return;
    const index = this.editingRole.permissions.indexOf(permCode);
    if (index > -1) {
      this.editingRole.permissions.splice(index, 1);
    } else {
      this.editingRole.permissions.push(permCode);
    }
    this.cdr.detectChanges();
  }

  removeEditPerm(permCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.editingRole) return;
    this.editingRole.permissions = this.editingRole.permissions.filter(p => p !== permCode);
    this.cdr.detectChanges();
  }

  onUpdateRole(): void {
    if (!this.editingRole) return;
    this.message = '';
    this.errorMessage = '';

    if (!this.editingRole.roleName) {
      this.errorMessage = 'Vui lòng nhập Tên vai trò!';
      return;
    }

    const req: RoleUpdateRequest = {
      roleName: this.editingRole.roleName,
      description: this.editingRole.description,
      permissions: this.editingRole.permissions
    };

    const roleCode = this.editingRole.roleCode;

    this.roleService.updateRole(roleCode, req).subscribe({
      next: () => {
        this.message = 'Cập nhật vai trò "' + roleCode + '" thành công!';
        this.closeEditModal();
        this.loadRoles();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi cập nhật vai trò!';
        this.cdr.detectChanges();
      }
    });
  }

  // --- HÀNH ĐỘNG 3: XÓA ---
  openDeleteModal(roleCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.roleToDelete = roleCode;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.roleToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteRole(): void {
    if (!this.roleToDelete) return;
    const roleCode = this.roleToDelete;
    this.roleToDelete = null;

    this.message = '';
    this.errorMessage = '';

    this.roleService.deleteRole(roleCode).subscribe({
      next: () => {
        this.message = 'Đã xóa thành công vai trò "' + roleCode + '"!';
        this.loadRoles();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi xóa vai trò!';
        this.cdr.detectChanges();
      }
    });
  }
}
