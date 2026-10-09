import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../core/services/permission.service';
import { Permission } from '../../core/models/api.model';

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

  permissions: Permission[] = [];
  message = '';
  errorMessage = '';

  newPerm: Permission = {
    permissionCode: '',
    permissionName: '',
    description: ''
  };

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.errorMessage = '';
    this.permissionService.getPermissions().subscribe({
      next: (res) => {
        this.permissions = res.result || [];
        this.cdr.detectChanges(); // Render tức thì khi có dữ liệu
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Không thể tải danh sách quyền hạn!';
        this.cdr.detectChanges();
      }
    });
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
        this.message = `Tạo quyền "${this.newPerm.permissionCode}" thành công!`;
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

  onDeletePermission(permCode: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa quyền "${permCode}"?`)) return;

    this.message = '';
    this.errorMessage = '';

    this.permissionService.deletePermission(permCode).subscribe({
      next: () => {
        this.message = `Đã xóa thành công quyền "${permCode}"!`;
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
