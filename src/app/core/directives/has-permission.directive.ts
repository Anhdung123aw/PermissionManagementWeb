import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnInit {
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private authService = inject(AuthService);
  @Input('hasPermission') requiredPermissions: string | string[] = [];
  ngOnInit(): void {
    this.updateView();
  }
  private updateView(): void {
    const userPermissions = this.authService.getUserPermissions() || [];

    // Nếu user là ADMIN thì luôn cho phép xem
    if (this.authService.isAdmin()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      return;
    }
    const perms = Array.isArray(this.requiredPermissions)
      ? this.requiredPermissions
      : [this.requiredPermissions];
    // 2. So khớp: User chỉ cần có ít nhất 1 quyền trong danh sách yêu cầu
    const hasPerm = perms.some(p => userPermissions.includes(p));
    if (hasPerm) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear(); // Ẩn khỏi DOM
    }
  }

}
