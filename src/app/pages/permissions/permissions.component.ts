import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../core/services/permission.service';
import {
  Permission,
  PermissionUpdateRequest,
  SearchRequest,
  PermissionFilterRequest,
} from '../../core/models/api.model';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.css'
})
export class PermissionsComponent implements OnInit {
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);
  readonly Math = Math;

  permissions: Permission[] = [];
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

  // State cho Modal Xem Chi Tiết
  detailPermission: Permission | null = null;

  // State cho Modal Chỉnh Sửa
  editingPermission: {
    permissionCode: string;
    permissionName: string;
    description: string;
  } | null = null;

  // State cho Modal Xóa
  permToDelete: string | null = null;

  newPerm: Permission = {
    permissionCode: '',
    permissionName: '',
    description: ''
  };

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.loading = true;
    this.errorMessage = '';
    const req: SearchRequest<PermissionFilterRequest> = {
      pagination: {
        page: this.currentPage,
        size: this.pageSize,
      },
      sort: {
        field: 'permissionCode',
        order: 'ASC',
      },
      filter: {
        keyword: this.searchTerm ? this.searchTerm.trim() : undefined,
      },
    };

    this.permissionService.searchPermissions(req).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.result) {
          this.permissions = res.result.data || [];
          this.totalCount = res.result.totalCount || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách quyền hạn!';
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPermissions();
  }

  clearSearch(): void {
    if (this.searchTerm) {
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadPermissions();
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadPermissions();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadPermissions();
  }

  // Đóng mở Action Menu 3 chấm đứng
  toggleActionMenu(permCode: string, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === permCode ? null : permCode;
    this.cdr.detectChanges();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.activeMenuId !== null) {
      this.activeMenuId = null;
      this.cdr.detectChanges();
    }
  }

  onCreatePermission(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.newPerm.permissionCode || !this.newPerm.permissionName) {
      this.errorMessage = 'Vui lòng nhập Mã quyền và Tên quyền!';
      return;
    }

    this.newPerm.permissionCode = this.newPerm.permissionCode.toUpperCase().trim();

    this.permissionService.createPermission(this.newPerm).subscribe({
      next: () => {
        this.message = 'Tạo quyền "' + this.newPerm.permissionCode + '" thành công!';
        this.newPerm = { permissionCode: '', permissionName: '', description: '' };
        this.loadPermissions();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi tạo quyền hạn!';
        this.cdr.detectChanges();
      }
    });
  }

  // --- HÀNH ĐỘNG 1: XEM CHI TIẾT ---
  openDetail(p: Permission, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.detailPermission = p;
    this.cdr.detectChanges();
  }

  closeDetailModal(): void {
    this.detailPermission = null;
    this.cdr.detectChanges();
  }

  // --- HÀNH ĐỘNG 2: CHỈNH SỬA ---
  openEdit(p: Permission, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.editingPermission = {
      permissionCode: p.permissionCode,
      permissionName: p.permissionName,
      description: p.description || ''
    };
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.editingPermission = null;
    this.cdr.detectChanges();
  }

  onUpdatePermission(): void {
    if (!this.editingPermission) return;
    this.message = '';
    this.errorMessage = '';

    if (!this.editingPermission.permissionName) {
      this.errorMessage = 'Vui lòng nhập Tên quyền hạn!';
      return;
    }

    const req: PermissionUpdateRequest = {
      permissionName: this.editingPermission.permissionName,
      description: this.editingPermission.description
    };

    const permCode = this.editingPermission.permissionCode;

    this.permissionService.updatePermission(permCode, req).subscribe({
      next: () => {
        this.message = 'Cập nhật quyền hạn "' + permCode + '" thành công!';
        this.closeEditModal();
        this.loadPermissions();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi cập nhật quyền hạn!';
        this.cdr.detectChanges();
      }
    });
  }

  // --- HÀNH ĐỘNG 3: XÓA ---
  openDeleteModal(permCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.permToDelete = permCode;
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.permToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeletePermission(): void {
    if (!this.permToDelete) return;
    const permCode = this.permToDelete;
    this.permToDelete = null;

    this.message = '';
    this.errorMessage = '';

    this.permissionService.deletePermission(permCode).subscribe({
      next: () => {
        this.message = 'Đã xóa thành công quyền "' + permCode + '"!';
        this.loadPermissions();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi xóa quyền hạn!';
        this.cdr.detectChanges();
      }
    });
  }
}
