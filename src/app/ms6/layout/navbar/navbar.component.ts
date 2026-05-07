import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
      <div class="container-fluid">
        <button class="btn btn-link text-white me-3" (click)="toggleSidebar()">
          <i class="bi bi-list fs-4"></i>
        </button>
        
        <a class="navbar-brand d-flex align-items-center" href="#">
          <i class="bi bi-shop me-2"></i>
          <span class="fw-semibold">E-Commerce</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button" data-bs-toggle="dropdown">
                <div class="bg-white rounded-circle d-flex align-items-center justify-content-center me-2" style="width: 32px; height: 32px;">
                  <i class="bi bi-person text-primary"></i>
                </div>
                <span class="d-none d-lg-inline"></span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <a class="dropdown-item d-flex align-items-center" href="#">
                    <i class="bi bi-gear me-2"></i>
                    Paramètres
                  </a>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a class="dropdown-item d-flex align-items-center text-danger" href="#">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Déconnexion
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-height, 64px);
      z-index: 1030;
    }
    
    .navbar-brand {
      font-size: 1.25rem;
    }
    
    .btn-link {
      text-decoration: none;
      padding: 0.25rem 0.5rem;
    }
    
    .btn-link:hover {
      background-color: rgba(255,255,255,0.1);
      border-radius: 0.375rem;
    }
    
    .dropdown-menu {
      border: none;
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    
    .dropdown-item {
      padding: 0.625rem 1rem;
      border-radius: 0.375rem;
      margin: 0.125rem 0.5rem;
    }
    
    .dropdown-item:hover {
      background-color: #f8f9fa;
    }
    
    @media (max-width: 991px) {
      .navbar-collapse {
        background-color: var(--primary-color, #1976d2);
        padding: 1rem;
        border-radius: 0.5rem;
        margin-top: 0.5rem;
      }
    }
  `],
  standalone: false
})
export class NavbarComponent {
  sidebarOpen = true;

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    const event = new CustomEvent('toggleSidebar', { detail: this.sidebarOpen });
    window.dispatchEvent(event);
  }
}
