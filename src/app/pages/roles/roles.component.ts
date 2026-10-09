import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../core/services/role.service';
import { PermissionService } from '../../core/services/permission.service';
import { Role, Permission, RoleRequest } from '../../core/models/api.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.css'
})
export class RolesComponent implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private cdr = inject(ChangeDetectorRef);

  roles: Role[] = [];
  availablePermissions: Permission[] = [];
  message = '';
  errorMessage = '';

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
    this.errorMessage = '';
    this.roleService.getRoles().subscribe({
      next: (res) => {
        this.roles = res.result || [];
        this.cdr.detectChanges(); // Render tức thì khi có dữ liệu
      },
      error: (err: any) => {
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

  onPermissionToggle(permCode: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.newRole.permissions.push(permCode);
    } else {
      this.newRole.permissions = this.newRole.permissions.filter(p => p !== permCode);
    }
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
        this.message = `Tạo vai trò "${this.newRole.roleCode}" thành công!`;
        this.newRole = { roleCode: '', roleName: '', description: '', permissions: [] };
        this.loadRoles();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi tạo vai trò!';
        this.cdr.detectChanges();
      }
    });
  }

  onDeleteRole(roleCode: string): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${roleCode}"?`)) return;

    this.message = '';
    this.errorMessage = '';

    this.roleService.deleteRole(roleCode).subscribe({
      next: () => {
        this.message = `Đã xóa thành công vai trò "${roleCode}"!`;
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
