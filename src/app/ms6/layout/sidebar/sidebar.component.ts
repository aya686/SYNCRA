import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  template: `
    <div class="d-flex" style="min-height: calc(100vh - var(--navbar-height, 64px)); margin-top: var(--navbar-height, 64px);">
      <!-- Sidebar -->
      <nav 
        class="sidebar bg-white shadow-sm"
        [class.collapsed]="!isOpen"
        [class.mobile-open]="isMobile && isOpen">
        
        <div class="sidebar-header p-3 border-bottom">
          <div class="d-flex align-items-center justify-content-between">
            <span class="fw-semibold text-dark" *ngIf="isOpen || !isMobile">Menu</span>
            <button 
              class="btn btn-sm btn-link text-dark p-1" 
              (click)="toggleSidebar()"
              *ngIf="!isMobile">
              <i class="bi" [class.bi-chevron-left]="isOpen" [class.bi-chevron-right]="!isOpen"></i>
            </button>
          </div>
        </div>

        <ul class="nav nav-pills flex-column p-2">
          <li class="nav-item" *ngFor="let item of menuItems">
            <a 
              class="nav-link d-flex align-items-center rounded-3 mb-1"
              [class.active]="router.isActive(item.route, true)"
              [routerLink]="item.route"
              (click)="isMobile ? isOpen = false : null">
              <i class="bi {{ item.icon }} fs-5" [class.me-3]="isOpen || !isMobile"></i>
              <span *ngIf="isOpen || !isMobile" class="text-truncate">{{ item.label }}</span>
              <span 
                *ngIf="item.badge && (isOpen || !isMobile)" 
                class="badge bg-danger rounded-pill ms-auto">
                {{ item.badge }}
              </span>
            </a>
          </li>
        </ul>

        <!-- Mobile overlay -->
        <div 
          class="sidebar-overlay d-lg-none" 
          *ngIf="isMobile && isOpen"
          (click)="isOpen = false">
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-grow-1 p-4" style="background-color: #f8f9fa;">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width, 260px);
      transition: all 0.3s ease;
      z-index: 1020;
    }
    
    .sidebar.collapsed {
      width: 70px;
    }
    
    .sidebar.mobile-open {
      position: fixed;
      left: 0;
      top: var(--navbar-height, 64px);
      height: calc(100vh - var(--navbar-height, 64px));
      z-index: 1040;
    }
    
    .nav-link {
      color: #6c757d;
      padding: 0.75rem 1rem;
      transition: all 0.2s ease;
    }
    
    .nav-link:hover {
      background-color: #f8f9fa;
      color: var(--primary-color, #1976d2);
    }
    
    .nav-link.active {
      background-color: rgba(25, 118, 210, 0.1);
      color: var(--primary-color, #1976d2);
      font-weight: 500;
    }
    
    .nav-link i {
      min-width: 24px;
      text-align: center;
    }
    
    .sidebar-overlay {
      position: fixed;
      top: var(--navbar-height, 64px);
      left: var(--sidebar-width, 260px);
      right: 0;
      bottom: 0;
      background-color: rgba(0,0,0,0.5);
      z-index: 1030;
    }
    
    .sidebar-header .btn-link {
      text-decoration: none;
    }
    
    @media (max-width: 991px) {
      .sidebar {
        position: fixed;
        left: -260px;
        height: calc(100vh - var(--navbar-height, 64px));
      }
      
      .sidebar.mobile-open {
        left: 0;
      }
    }
  `],
  standalone: false
})
export class SidebarComponent implements OnInit {
  isOpen = true;
  isMobile = false;

  menuItems: MenuItem[] = [
    { label: 'Tableau de bord', icon: 'bi-speedometer2', route: '/dashboard' },
    { label: 'Boutiques', icon: 'bi-shop', route: '/boutiques' },
    { label: 'Produits', icon: 'bi-box-seam', route: '/produits' },
    { label: 'Commandes', icon: 'bi-cart', route: '/commandes' },
    { label: 'Livraisons', icon: 'bi-truck', route: '/livraisons' },
    { label: 'Alertes Stock', icon: 'bi-exclamation-triangle-fill', route: '/admin/stock-alerts' },
  ];

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkMobile();
  }

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.checkMobile();
    window.addEventListener('toggleSidebar', (e: any) => {
      this.isOpen = e.detail;
    });
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 992;
    if (this.isMobile) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
    }
  }
}
