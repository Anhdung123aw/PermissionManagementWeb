import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HasPermissionDirective } from '../../core/directives/has-permission.directive';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HasPermissionDirective],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent {
  authService = inject(AuthService);

  onLogout(): void {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
      this.authService.logout();
    }
  }
}
