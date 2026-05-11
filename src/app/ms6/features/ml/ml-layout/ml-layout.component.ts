import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ml-layout',
  templateUrl: './ml-layout.component.html',
  styleUrls: ['./ml-layout.component.scss'],
  imports: [CommonModule, RouterModule, RouterOutlet]
})
export class MlLayoutComponent {
  navItems = [
    {
      label: 'Prédiction Livraison',
      icon: '🚚',
      route: '/admin/ml/delivery',
      description: 'Régression Logistique',
      color: '#e74c3c'
    },
    {
      label: 'Recommandation',
      icon: '🎯',
      route: '/admin/ml/recommendation',
      description: 'k-NN Collaborative',
      color: '#3498db'
    },
    {
      label: 'Prévision Demande',
      icon: '📊',
      route: '/admin/ml/forecast',
      description: 'Holt-Winters',
      color: '#2ecc71'
    }
  ];

  constructor(public router: Router) {}

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
