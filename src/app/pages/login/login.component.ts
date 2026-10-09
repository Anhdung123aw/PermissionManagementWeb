import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  userName = '';
  passWord = '';
  loading = false;
  errorMessage = '';

  fillQuickAccount(user: string, pass: string): void {
    this.userName = user;
    this.passWord = pass;
    this.errorMessage = '';
  }

  onLogin(): void {
    if (!this.userName || !this.passWord) {
      this.errorMessage = 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu!';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ userName: this.userName, passWord: this.passWord }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.result && res.result.authenticated) {
          this.router.navigate(['/users']);
        } else {
          this.errorMessage = 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Lỗi xác thực: Không thể kết nối hoặc sai thông tin đăng nhập!';
      }
    });
  }
}
