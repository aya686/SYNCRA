import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.css'],
    standalone: false
})
export class AdminLayoutComponent {
  isSidebarCollapsed = false;
  navScrolled  = false;
  mobileMenuOpen = false;
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}