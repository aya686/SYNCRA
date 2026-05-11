// src/app/modules/orders/components/my-orders/my-orders.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService, Order } from '../../../../services/order.service';

@Component({
  selector: 'app-my-orders',
  imports: [CommonModule, RouterModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';

  // Ordre des statuts pour la timeline
  private readonly statusOrder = ['PENDING', 'CONFIRMED', 'IN_DELIVERY', 'DELIVERED'];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadMyOrders();
  }

  loadMyOrders(): void {
    const userId = parseInt(localStorage.getItem('userId') || '1', 10);
    this.loading = true;

    this.orderService.getMyOrders(userId).subscribe({
      next: (data) => {
        // Trier par date décroissante (plus récent en premier)
        this.orders = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos commandes. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  /**
   * Vérifie si un statut donné a été atteint ou dépassé dans la timeline.
   * Utilisé pour colorer les étapes de la progression.
   */
  isStatusPassed(currentStatus: string, checkStatus: string): boolean {
    const currentIndex = this.statusOrder.indexOf(currentStatus);
    const checkIndex   = this.statusOrder.indexOf(checkStatus);
    if (currentIndex === -1 || checkIndex === -1) return false;
    return currentIndex >= checkIndex;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-product.jpg';
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    return this.orderService.getStatusColor(status);
  }

  formatDate(d: Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-TN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  goBack(): void {
    this.router.navigate(['/machines']);
  }
}