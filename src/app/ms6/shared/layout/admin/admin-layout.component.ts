import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false
})
export class AdminLayoutComponent {
  constructor(public router: Router) {}

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  goToClient(): void {
    this.router.navigate(['/']);
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('boutiques')) return 'Gestion des Boutiques';
    if (url.includes('produits')) return 'Gestion des Produits';
    if (url.includes('commandes')) return 'Gestion des Commandes';
    if (url.includes('livraisons')) return 'Gestion des Livraisons';
    if (url.includes('promotions')) return 'Gestion des Promotions';
    return 'Administration';
  }
}
