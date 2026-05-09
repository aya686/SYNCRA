import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BerryFooterComponent } from '../../shared/components/berry-footer/berry-footer.component';

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export interface AdminNavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeColor?: 'danger' | 'warning' | 'success' | 'info' | 'secondary';
}

@Component({
  selector: 'app-berry-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BerryFooterComponent],
  template: `
    <div class="berry-admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar" [class.collapsed]="sidebarCollapsed" [class.mobile-open]="mobileMenuOpen">
        <div class="sidebar-header">
          <a class="brand" [routerLink]="['/admin/dashboard']" (click)="closeMobileMenu()">
            <div class="brand-icon-wrap">
              <i class="bi bi-shield-lock"></i>
            </div>
            <div class="brand-text" *ngIf="!sidebarCollapsed">
              <span class="brand-name">Admin</span>
              <span class="brand-tagline">SYNCRA</span>
            </div>
          </a>
          <button class="collapse-btn" (click)="toggleSidebar()">
            <i class="bi" [class.bi-chevron-left]="!sidebarCollapsed" [class.bi-chevron-right]="sidebarCollapsed"></i>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-group" *ngFor="let group of navGroups">
            <h6 class="group-title" *ngIf="!sidebarCollapsed">{{ group.title }}</h6>
            <div class="group-items">
              <a 
                *ngFor="let item of group.items"
                class="nav-item"
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{exact: item.route === '/admin/dashboard'}"
                (click)="closeMobileMenu()"
                [title]="sidebarCollapsed ? item.label : ''">
                <div class="nav-icon">
                  <i [class]="'bi bi-' + item.icon"></i>
                  <span class="nav-badge" *ngIf="item.badge" [class]="'badge-' + (item.badgeColor || 'danger')">
                    {{ item.badge }}
                  </span>
                </div>
                <span class="nav-label" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
              </a>
            </div>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <button class="btn-back" (click)="goToClient()" [title]="sidebarCollapsed ? 'Retour au site' : ''">
            <i class="bi bi-arrow-left"></i>
            <span *ngIf="!sidebarCollapsed">Retour au site</span>
          </button>
        </div>
      </aside>
      
      <!-- Overlay mobile -->
      <div class="sidebar-overlay" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>
      
      <!-- Main Content -->
      <div class="admin-main" [class.sidebar-collapsed]="sidebarCollapsed">
        <!-- Header -->
        <header class="admin-header">
          <div class="header-left">
            <button class="mobile-toggle" (click)="toggleMobileMenu()">
              <i class="bi bi-list"></i>
            </button>
            <div class="breadcrumb">
              <span class="breadcrumb-item active">{{ getPageTitle() }}</span>
            </div>
          </div>
          
          <div class="header-right">
            <div class="header-search">
              <i class="bi bi-search"></i>
              <input type="text" placeholder="Rechercher...">
            </div>
            
            <button class="header-btn" title="Notifications">
              <i class="bi bi-bell"></i>
              <span class="btn-badge">5</span>
            </button>
            
            <button class="header-btn" title="Paramètres">
              <i class="bi bi-gear"></i>
            </button>
            
            <div class="user-menu">
              <button class="user-btn">
                <div class="user-avatar">
                  <i class="bi bi-person"></i>
                </div>
                <span class="user-name" *ngIf="!sidebarCollapsed || windowWidth > 768">Admin</span>
                <i class="bi bi-chevron-down"></i>
              </button>
            </div>
          </div>
        </header>
        
        <!-- Content -->
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
        
        <!-- Footer -->
        <app-berry-footer 
          [compact]="true"
          [showBrand]="false">
        </app-berry-footer>
      </div>
    </div>
  `,
  styles: [`
    .berry-admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }
    
    /* Sidebar - Berry Light Theme */
    .admin-sidebar {
      width: 280px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: width 0.3s ease;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
    }
    
    .admin-sidebar.collapsed {
      width: 70px;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      height: 70px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      text-decoration: none;
    }
    
    .brand-icon-wrap {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .brand-icon-wrap i {
      font-size: 1.25rem;
      color: #fff;
    }
    
    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .brand-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .brand-tagline {
      font-size: 0.75rem;
      color: #64748b;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .collapse-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .collapse-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    
    .admin-sidebar.collapsed .collapse-btn {
      display: none;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }
    
    .nav-group {
      margin-bottom: 1.5rem;
    }
    
    .group-title {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #94a3b8;
      padding: 0 0.75rem;
      margin: 0 0 0.75rem;
    }
    
    .group-items {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem;
      color: #475569;
      text-decoration: none;
      border-radius: 10px;
      transition: all 0.2s;
      position: relative;
    }

    .nav-item:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .nav-item.active {
      background: #eff6ff;
      color: #3b82f6;
    }

    .nav-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: #3b82f6;
      border-radius: 0 2px 2px 0;
    }
    
    .nav-icon {
      position: relative;
      flex-shrink: 0;
    }
    
    .nav-icon i {
      font-size: 1.125rem;
    }
    
    .nav-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      min-width: 16px;
      height: 16px;
      font-size: 0.625rem;
      font-weight: 600;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    
    .badge-danger { background: #ef4444; color: #fff; }
    .badge-warning { background: #f59e0b; color: #fff; }
    .badge-success { background: #10b981; color: #fff; }
    .badge-info { background: #3b82f6; color: #fff; }
    .badge-secondary { background: #6b7280; color: #fff; }
    
    .nav-label {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid #e2e8f0;
    }
    
    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.625rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      color: #64748b;
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #e2e8f0;
      border-color: #94a3b8;
      color: #1e293b;
    }
    
    /* Main Area */
    .admin-main {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }
    
    .admin-main.sidebar-collapsed {
      margin-left: 70px;
    }
    
    /* Header */
    .admin-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      height: 70px;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .mobile-toggle {
      display: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1.25rem;
    }
    
    .breadcrumb {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .header-search {
      position: relative;
      display: flex;
      align-items: center;
    }
    
    .header-search i {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 0.875rem;
    }
    
    .header-search input {
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 200px;
      transition: all 0.2s;
    }
    
    .header-search input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .header-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      background: #f1f5f9;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s;
    }
    
    .header-btn:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    
    .btn-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 16px;
      height: 16px;
      background: #ef4444;
      color: #fff;
      font-size: 0.625rem;
      font-weight: 600;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    
    .user-menu {
      margin-left: 0.5rem;
    }
    
    .user-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.375rem 0.75rem 0.375rem 0.375rem;
      background: #f1f5f9;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .user-btn:hover {
      background: #e2e8f0;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .user-avatar i {
      font-size: 1rem;
      color: #fff;
    }
    
    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }
    
    .user-btn > i {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    
    /* Content */
    .admin-content {
      flex: 1;
      padding: 1.5rem;
    }
    
    /* Overlay */
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
    }
    
    /* Responsive */
    @media (max-width: 1024px) {
      .admin-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .admin-sidebar.mobile-open {
        transform: translateX(0);
      }
      
      .admin-main {
        margin-left: 0 !important;
      }
      
      .mobile-toggle {
        display: flex;
      }
      
      .collapse-btn {
        display: none;
      }
    }
    
    @media (max-width: 768px) {
      .header-search {
        display: none;
      }
      
      .admin-content {
        padding: 1rem;
      }
    }
    
    @media (max-width: 640px) {
      .user-name {
        display: none;
      }
    }
  `]
})
export class BerryAdminLayoutComponent {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  windowWidth = window.innerWidth;
  
  navGroups: AdminNavGroup[] = [
    {
      title: 'Principal',
      items: [
        { label: 'Dashboard', icon: 'speedometer2', route: '/admin/dashboard' },
        { label: 'Alertes Stock', icon: 'exclamation-triangle', route: '/admin/stock-alerts', badge: '3', badgeColor: 'secondary' },
        { label: 'Machine Learning', icon: 'robot', route: '/admin/ml', badge: '3 ML', badgeColor: 'secondary' },
        { label: 'Chatbot NLP', icon: 'chat-dots', route: '/admin/chatbot', badge: 'NLP', badgeColor: 'secondary' },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Boutiques', icon: 'shop', route: '/admin/boutiques' },
        { label: 'Produits', icon: 'box-seam', route: '/admin/produits' },
        { label: 'Commandes', icon: 'cart', route: '/admin/commandes' },
        { label: 'Livraisons', icon: 'truck', route: '/admin/livraisons' },
        { label: 'Routes Opt.', icon: 'map', route: '/admin/routes-optimisation', badge: 'Algo', badgeColor: 'secondary' },
        { label: 'Pricing IA', icon: 'graph-up-arrow', route: '/admin/pricing-dynamique', badge: 'AI', badgeColor: 'secondary' },
      ]
    },
    {
      title: 'Marketing',
      items: [
        { label: 'Promotions', icon: 'tag', route: '/admin/promotions' },
        { label: 'Statistiques', icon: 'graph-up', route: '/admin/stats' },
      ]
    }
  ];
  
  @HostListener('window:resize')
  onResize() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 1024) {
      this.mobileMenuOpen = false;
    }
  }
  
  constructor(private router: Router) {
    this.windowWidth = window.innerWidth;
    this.sidebarCollapsed = this.windowWidth < 1200 && this.windowWidth > 1024;
  }
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
  
  goToClient(): void {
    this.router.navigate(['/']);
  }
  
  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('stock-alerts')) return 'Alertes de Stock';
    if (url.includes('ml/delivery')) return 'ML - Prédiction Livraison';
    if (url.includes('ml/recommendation')) return 'ML - Recommandation';
    if (url.includes('ml/forecast')) return 'ML - Prévision Demande';
    if (url.includes('ml')) return 'Machine Learning';
    if (url.includes('chatbot')) return 'Chatbot NLP - Assistant Virtuel';
    if (url.includes('boutiques')) return 'Gestion des Boutiques';
    if (url.includes('produits')) return 'Gestion des Produits';
    if (url.includes('commandes')) return 'Gestion des Commandes';
    if (url.includes('livraisons')) return 'Gestion des Livraisons';
    if (url.includes('promotions')) return 'Gestion des Promotions';
    if (url.includes('stats')) return 'Statistiques';
    return 'Administration';
  }
}
