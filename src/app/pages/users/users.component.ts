import { Component, OnInit, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import {
  User,
  Role,
  UserCreationRequest,
  UserUpdateRequest,
  SearchRequest,
  UserFilterRequest,
} from '../../core/models/api.model';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, HasPermissionDirective],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private cdr = inject(ChangeDetectorRef);
  readonly Math = Math;

  users: User[] = [];
  availableRoles: Role[] = [];
  loading = false;
  message = '';
  errorMessage = '';

  searchTerm = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  // Dropdown hành động 3 chấm đứng
  activeMenuId: number | null = null;

  // State đóng/mở dropdown chọn Vai trò form Tạo mới
  isRoleDropdownOpen = false;

  // State đóng/mở dropdown chọn Vai trò form Chỉnh sửa
  isEditRoleDropdownOpen = false;

  // State cho Modal Xem Chi Tiết
  detailUser: User | null = null;

  // State cho Modal Chỉnh Sửa
  editingUser: {
    id: number;
    userName: string;
    email: string;
    passWord: string;
    roles: string[];
  } | null = null;

  // State cho Popup Modal Xóa
  userToDelete: { id: number; username: string } | null = null;

  newUser: UserCreationRequest = {
    userName: '',
    passWord: '',
    email: '',
    roles: [],
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    const req: SearchRequest<UserFilterRequest> = {
      pagination: {
        page: this.currentPage,
        size: this.pageSize,
      },
      sort: {
        field: 'id',
        order: 'DESC',
      },
      filter: {
        keyword: this.searchTerm ? this.searchTerm.trim() : undefined,
      },
    };
    this.userService.searchUsers(req).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.result) {
          this.users = res.result.data || [];
          this.totalCount = res.result.totalCount || 0;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize) || 1;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể tải danh sách người dùng!';
        this.cdr.detectChanges();
      },
    });
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (res) => {
        this.availableRoles = res.result || [];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    if (this.searchTerm) {
      this.searchTerm = '';
      this.currentPage = 1;
      this.loadUsers();
    }
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.loadUsers();
  }

  // Đóng mở Action Menu 3 chấm đứng
  toggleActionMenu(userId: number, event: Event): void {
    event.stopPropagation();
    this.activeMenuId = this.activeMenuId === userId ? null : userId;
    this.cdr.detectChanges();
  }

  // Tự động đóng các dropdown khi click ra ngoài
  @HostListener('document:click')
  onDocumentClick(): void {
    let changed = false;
    if (this.activeMenuId !== null) {
      this.activeMenuId = null;
      changed = true;
    }
    if (this.isRoleDropdownOpen) {
      this.isRoleDropdownOpen = false;
      changed = true;
    }
    if (this.isEditRoleDropdownOpen) {
      this.isEditRoleDropdownOpen = false;
      changed = true;
    }
    if (changed) {
      this.cdr.detectChanges();
    }
  }

  // Bật/tắt dropdown chọn Vai trò form Tạo
  toggleRoleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isRoleDropdownOpen = !this.isRoleDropdownOpen;
    this.cdr.detectChanges();
  }

  onRoleToggle(roleCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    const index = this.newUser.roles.indexOf(roleCode);
    if (index > -1) {
      this.newUser.roles.splice(index, 1);
    } else {
      this.newUser.roles.push(roleCode);
    }
    this.cdr.detectChanges();
  }

  removeRole(roleCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.newUser.roles = this.newUser.roles.filter((r) => r !== roleCode);
    this.cdr.detectChanges();
  }

  onCreateUser(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.newUser.userName || !this.newUser.passWord) {
      this.errorMessage = 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!';
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.message = 'Tạo tài khoản "' + this.newUser.userName + '" thành công!';
        this.newUser = { userName: '', passWord: '', email: '', roles: [] };
        this.isRoleDropdownOpen = false;
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi tạo người dùng!';
        this.cdr.detectChanges();
      },
    });
  }

  // --- HÀNH ĐỘNG 1: XEM CHI TIẾT ---
  openDetail(u: User, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.detailUser = u;
    this.cdr.detectChanges();
  }

  closeDetailModal(): void {
    this.detailUser = null;
    this.cdr.detectChanges();
  }

  // --- HÀNH ĐỘNG 2: CHỈNH SỬA ---
  openEdit(u: User, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.isEditRoleDropdownOpen = false;
    this.editingUser = {
      id: u.id,
      userName: u.userName,
      email: u.email || '',
      passWord: '',
      roles: u.roles ? u.roles.map((r) => r.roleCode) : [],
    };
    this.cdr.detectChanges();
  }

  closeEditModal(): void {
    this.editingUser = null;
    this.isEditRoleDropdownOpen = false;
    this.cdr.detectChanges();
  }

  toggleEditRoleDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isEditRoleDropdownOpen = !this.isEditRoleDropdownOpen;
    this.cdr.detectChanges();
  }

  onEditRoleToggle(roleCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.editingUser) return;
    const index = this.editingUser.roles.indexOf(roleCode);
    if (index > -1) {
      this.editingUser.roles.splice(index, 1);
    } else {
      this.editingUser.roles.push(roleCode);
    }
    this.cdr.detectChanges();
  }

  removeEditRole(roleCode: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.editingUser) return;
    this.editingUser.roles = this.editingUser.roles.filter((r) => r !== roleCode);
    this.cdr.detectChanges();
  }

  onUpdateUser(): void {
    if (!this.editingUser) return;
    this.message = '';
    this.errorMessage = '';

    const req: UserUpdateRequest = {
      email: this.editingUser.email,
      roles: this.editingUser.roles,
    };
    if (this.editingUser.passWord && this.editingUser.passWord.trim()) {
      req.passWord = this.editingUser.passWord.trim();
    }

    const targetId = this.editingUser.id;
    const targetUsername = this.editingUser.userName;

    this.userService.updateUser(targetId, req).subscribe({
      next: () => {
        this.message = 'Cập nhật người dùng "' + targetUsername + '" thành công!';
        this.closeEditModal();
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi cập nhật người dùng!';
        this.cdr.detectChanges();
      },
    });
  }

  // --- HÀNH ĐỘNG 3: XÓA ---
  openDeleteModal(userId: number, username: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.activeMenuId = null;
    this.userToDelete = { id: userId, username };
    this.cdr.detectChanges();
  }

  closeDeleteModal(): void {
    this.userToDelete = null;
    this.cdr.detectChanges();
  }

  confirmDeleteUser(): void {
    if (!this.userToDelete) return;
    const { id, username } = this.userToDelete;
    this.userToDelete = null;

    this.message = '';
    this.errorMessage = '';

    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.message = 'Đã xóa thành công người dùng "' + username + '"!';
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi xóa người dùng!';
        this.cdr.detectChanges();
      },
    });
  }
}
