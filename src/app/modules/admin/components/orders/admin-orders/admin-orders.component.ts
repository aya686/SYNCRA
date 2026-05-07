// src/app/modules/admin/components/orders/admin-orders.component.ts
// ✅ CORRIGÉ : utilise AdminService.getAllOrders() qui appelle le bon endpoint

import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../../../services/admin.service';
import { Order } from '../../../../../services/order.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  activeTab: 'all' | 'pending' | 'confirmed' | 'in_delivery' | 'delivered' | 'cancelled' = 'all';

  // Modal statut
  showStatusModal = false;
  selectedOrder: Order | null = null;
  newStatus = '';
  adminNote = '';

  stats = {
    total: 0, pending: 0, confirmed: 0,
    in_delivery: 0, delivered: 0, cancelled: 0,
    revenue: 0
  };

  toastMessage = '';
  toastType = 'success';
  showToastFlag = false;

  statusOptions = [
    { value: 'CONFIRMED',   label: '✅ Confirmer',           color: 'success' },
    { value: 'IN_DELIVERY', label: '🚚 Marquer en livraison', color: 'primary' },
    { value: 'DELIVERED',   label: '🎉 Marquer livrée',       color: 'success' },
    { value: 'CANCELLED',   label: '❌ Annuler',              color: 'danger'  },
    { value: 'REFUNDED',    label: '💸 Rembourser',           color: 'warning' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.errorMessage = '';

    // ✅ Appel via AdminService qui a la méthode getAllOrders()
    this.adminService.getAllOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commandes:', err);
        this.errorMessage = 'Impossible de charger les commandes';
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total       = this.orders.length;
    this.stats.pending     = this.orders.filter(o => o.status === 'PENDING').length;
    this.stats.confirmed   = this.orders.filter(o => o.status === 'CONFIRMED').length;
    this.stats.in_delivery = this.orders.filter(o => o.status === 'IN_DELIVERY').length;
    this.stats.delivered   = this.orders.filter(o => o.status === 'DELIVERED').length;
    this.stats.cancelled   = this.orders.filter(o => o.status === 'CANCELLED').length;
    this.stats.revenue     = this.orders
      .filter(o => o.status === 'DELIVERED')
      .reduce((s, o) => s + (o.totalAmount || 0), 0);
  }

  getDisplayedOrders(): Order[] {
    let list = this.activeTab === 'all'
      ? [...this.orders]
      : this.orders.filter(o => o.status === this.activeTab.toUpperCase());

    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(o =>
        o.orderNumber?.toLowerCase().includes(s) ||
        (o.userName?.toLowerCase()    || '').includes(s) ||
        (o.deliveryCity?.toLowerCase() || '').includes(s)
      );
    }
    return list;
  }

  openStatusModal(order: Order): void {
    this.selectedOrder = order;
    this.newStatus  = '';
    this.adminNote  = '';
    this.showStatusModal = true;
  }

  confirmStatusChange(): void {
    if (!this.selectedOrder || !this.newStatus) return;

    this.adminService.updateOrderStatus(this.selectedOrder.id, this.newStatus, this.adminNote || undefined)
      .subscribe({
        next: (updated) => {
          const idx = this.orders.findIndex(o => o.id === this.selectedOrder!.id);
          if (idx !== -1) this.orders[idx] = updated;
          this.showStatusModal = false;
          this.calculateStats();
          this.showToast('Statut mis à jour ✅', 'success');
        },
        error: () => this.showToast('Erreur lors de la mise à jour ❌', 'error')
      });
  }

  quickConfirm(order: Order): void {
    this.adminService.updateOrderStatus(order.id, 'CONFIRMED').subscribe({
      next: (updated) => {
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx !== -1) this.orders[idx] = updated;
        this.calculateStats();
        this.showToast('Commande confirmée ✅', 'success');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  deleteOrder(order: Order): void {
    if (!confirm(`Supprimer la commande "${order.orderNumber}" ?`)) return;
    this.adminService.deleteOrder(order.id).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== order.id);
        this.calculateStats();
        this.showToast('Commande supprimée', 'info');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  // ─── HELPERS ────────────────────────────────────────────────

  getStatusLabel(status: string): string {
    switch(status) {
      case 'PENDING':     return 'En attente';
      case 'CONFIRMED':   return 'Confirmée';
      case 'IN_DELIVERY': return 'En livraison';
      case 'DELIVERED':   return 'Livrée';
      case 'CANCELLED':   return 'Annulée';
      case 'REFUNDED':    return 'Remboursée';
      default: return status;
    }
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  formatDate(d: Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-TN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  showToast(msg: string, type: string): void {
    this.toastMessage  = msg;
    this.toastType     = type;
    this.showToastFlag = true;
    setTimeout(() => this.showToastFlag = false, 3000);
  }
}