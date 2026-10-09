import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import {
  User,
  Role,
  UserCreationRequest,
  SearchRequest,
  UserFilterRequest,
} from '../../core/models/api.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  onRoleToggle(roleCode: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.newUser.roles.push(roleCode);
    } else {
      this.newUser.roles = this.newUser.roles.filter((r) => r !== roleCode);
    }
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
        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Lỗi khi tạo người dùng!';
        this.cdr.detectChanges();
      },
    });
  }

  onDeleteUser(userId: number, username: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng "' + username + '" (ID: ' + userId + ')?')) return;

    this.message = '';
    this.errorMessage = '';

    this.userService.deleteUser(userId).subscribe({
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
