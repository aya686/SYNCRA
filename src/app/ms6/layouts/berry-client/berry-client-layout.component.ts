import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { BerryFooterComponent } from '../../shared/components/berry-footer/berry-footer.component';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
}

@Component({
  selector: 'app-berry-client-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, BerryFooterComponent],
  template: `
    <div class="berry-client-layout">
      <!-- Sidebar Navigation -->
      <aside class="client-sidebar" [class.collapsed]="sidebarCollapsed" [class.mobile-open]="mobileMenuOpen">
        <div class="sidebar-header">
          <a class="brand" [routerLink]="['/']" (click)="closeMobileMenu()">
            <i class="bi bi-grid-3x3-gap-fill brand-icon"></i>
            <span class="brand-name" *ngIf="!sidebarCollapsed">SYNCRA</span>
          </a>
          <button class="sidebar-toggle" (click)="toggleSidebar()" title="Réduire/Agrandir">
            <i class="bi" [class.bi-chevron-left]="!sidebarCollapsed" [class.bi-chevron-right]="sidebarCollapsed"></i>
          </button>
        </div>
        
        <nav class="sidebar-nav">
          <a 
            *ngFor="let item of navItems"
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{exact: false}"
            (click)="closeMobileMenu()"
            [title]="sidebarCollapsed ? item.label : ''">
            <div class="nav-icon">
              <i [class]="'bi bi-' + item.icon"></i>
              <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>
            </div>
            <span class="nav-label" *ngIf="!sidebarCollapsed">{{ item.label }}</span>
          </a>
        </nav>
        
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <button class="btn-admin" (click)="goToAdmin()">
            <i class="bi bi-shield-lock"></i>
            <span>Administration</span>
          </button>
        </div>
      </aside>
      
      <!-- Overlay pour mobile -->
      <div class="sidebar-overlay" *ngIf="mobileMenuOpen" (click)="closeMobileMenu()"></div>
      
      <!-- Main Content Area -->
      <div class="client-main" [class.sidebar-collapsed]="sidebarCollapsed">
        <!-- Top Header -->
        <header class="client-header">
          <button class="mobile-menu-toggle" (click)="toggleMobileMenu()" [class.open]="mobileMenuOpen">
            <i class="bi bi-list"></i>
          </button>
          
          <div class="header-content">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
            <p class="page-subtitle">{{ getPageSubtitle() }}</p>
          </div>
          
          <div class="header-actions">
            <button class="btn-icon" title="Notifications">
              <i class="bi bi-bell"></i>
              <span class="notification-badge" *ngIf="hasNotifications">3</span>
            </button>
            <button class="btn-icon" title="Mon Compte">
              <i class="bi bi-person-circle"></i>
            </button>
          </div>
        </header>
        
        <!-- Page Content -->
        <main class="client-content">
          <router-outlet></router-outlet>
        </main>
        
        <!-- Footer -->
        <app-berry-footer 
          [compact]="true"
          [showBrand]="false"
          [socialLinks]="socialLinks">
        </app-berry-footer>
      </div>
    </div>
  `,
  styles: [`
    .berry-client-layout {
      display: flex;
      min-height: 100vh;
      background: #f1f5f9;
    }
    
    /* Sidebar */
    .client-sidebar {
      width: 260px;
      background: #fff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      position: fixed;
      height: 100vh;
      z-index: 100;
      transition: width 0.3s ease;
    }
    
    .client-sidebar.collapsed {
      width: 70px;
    }
    
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem;
      border-bottom: 1px solid #e2e8f0;
      height: 70px;
    }
    
    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      overflow: hidden;
    }
    
    .brand-icon {
      font-size: 1.75rem;
      color: #6366f1;
      flex-shrink: 0;
    }
    
    .brand-name {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      white-space: nowrap;
    }
    
    .sidebar-toggle {
      background: #f1f5f9;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      transition: all 0.2s;
    }
    
    .sidebar-toggle:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    
    .client-sidebar.collapsed .sidebar-toggle {
      display: none;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      overflow-y: auto;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      color: #64748b;
      text-decoration: none;
      border-radius: 10px;
      margin-bottom: 0.375rem;
      transition: all 0.2s;
      position: relative;
    }
    
    .nav-item:hover {
      background: #f8fafc;
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
      font-size: 1.25rem;
    }
    
    .nav-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      min-width: 18px;
      height: 18px;
      background: #ef4444;
      color: #fff;
      font-size: 0.625rem;
      font-weight: 600;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
    }
    
    .nav-label {
      font-size: 0.9375rem;
      font-weight: 500;
      white-space: nowrap;
    }
    
    .sidebar-footer {
      padding: 1rem 0.75rem;
      border-top: 1px solid #e2e8f0;
    }
    
    .btn-admin {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 10px;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-admin:hover {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #3b82f6;
    }
    
    /* Main Area */
    .client-main {
      flex: 1;
      margin-left: 260px;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }
    
    .client-main.sidebar-collapsed {
      margin-left: 70px;
    }
    
    /* Header */
    .client-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 1.5rem;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 50;
      height: 70px;
    }
    
    .mobile-menu-toggle {
      display: none;
      background: #f1f5f9;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #64748b;
      font-size: 1.25rem;
    }
    
    .header-content {
      flex: 1;
    }
    
    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.2;
    }
    
    .page-subtitle {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0;
    }
    
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .btn-icon {
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
      font-size: 1.125rem;
      transition: all 0.2s;
    }
    
    .btn-icon:hover {
      background: #e2e8f0;
      color: #1e293b;
    }
    
    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      min-width: 18px;
      height: 18px;
      background: #ef4444;
      color: #fff;
      font-size: 0.625rem;
      font-weight: 600;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
    }
    
    /* Content */
    .client-content {
      flex: 1;
      padding: 1.5rem;
    }
    
    /* Mobile Styles */
    @media (max-width: 1024px) {
      .sidebar-toggle {
        display: none;
      }
      
      .client-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .client-sidebar.mobile-open {
        transform: translateX(0);
      }
      
      .client-main {
        margin-left: 0 !important;
      }
      
      .mobile-menu-toggle {
        display: flex;
      }
      
      .sidebar-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 99;
      }
    }
    
    @media (max-width: 640px) {
      .client-header {
        padding: 1rem;
        gap: 1rem;
      }
      
      .page-title {
        font-size: 1.25rem;
      }
      
      .page-subtitle {
        display: none;
      }
      
      .client-content {
        padding: 1rem;
      }
    }
  `]
})
export class BerryClientLayoutComponent {
  sidebarCollapsed = false;
  mobileMenuOpen = false;
  hasNotifications = true;
  
  navItems: NavItem[] = [
    { label: 'Boutiques', icon: 'shop', route: '/boutiques' },
    { label: 'Produits', icon: 'box-seam', route: '/produits'},
    { label: 'Commandes', icon: 'cart', route: '/commandes' },
    { label: 'Livraisons', icon: 'truck', route: '/livraisons' },
    { label: 'Assistant IA', icon: 'chat-dots', route: '/chatbot' },
  ];
  
  socialLinks = [
    { icon: 'facebook', label: 'Facebook', url: '#' },
    { icon: 'twitter-x', label: 'Twitter', url: '#' },
    { icon: 'linkedin', label: 'LinkedIn', url: '#' },
    { icon: 'instagram', label: 'Instagram', url: '#' },
  ];
  
  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth > 1024) {
      this.mobileMenuOpen = false;
    }
  }
  
  constructor(private router: Router) {}
  
  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
  
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
  
  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
  
  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('boutiques')) return 'Boutiques';
    if (url.includes('produits')) return 'Produits';
    if (url.includes('commandes')) return 'Commandes';
    if (url.includes('livraisons')) return 'Livraisons';
    if (url.includes('chatbot')) return 'Assistant IA';
    return 'Découvrir';
  }
  
  getPageSubtitle(): string {
    const url = this.router.url;
    if (url.includes('boutiques')) return 'Explorez nos boutiques partenaires';
    if (url.includes('produits')) return 'Découvrez nos produits disponibles';
    if (url.includes('commandes')) return 'Gérez vos commandes';
    if (url.includes('livraisons')) return 'Suivez vos livraisons';
    if (url.includes('chatbot')) return 'Chatbot NLP avec TF-IDF et Similarité Cosinus';
    return 'Bienvenue sur SYNCRA';
  }
}
