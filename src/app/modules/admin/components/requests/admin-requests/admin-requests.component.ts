// src/app/modules/admin/components/requests/admin-requests.component.ts

import { Component, OnInit } from '@angular/core';
import { AdminService, ServiceRequest } from '../../../../../services/admin.service';

@Component({
  selector: 'app-admin-requests',
  templateUrl: './admin-requests.component.html',
  styleUrls: ['./admin-requests.component.scss']
})
export class AdminRequestsComponent implements OnInit {
  requests: ServiceRequest[] = [];
  loading = false;
  searchTerm = '';
  activeTab: 'all' | 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled' = 'all';

  // Modal réponse
  showResponseModal = false;
  selectedRequest: ServiceRequest | null = null;
  responseMessage = '';
  responseAction: 'accept' | 'reject' | null = null;

  // Stats
  stats = {
    total: 0, pending: 0, accepted: 0,
    rejected: 0, in_progress: 0, completed: 0, cancelled: 0
  };

  // Toast
  toastMessage = '';
  toastType = 'success';
  showToastFlag = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.adminService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.calculateStats();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calculateStats(): void {
    this.stats.total       = this.requests.length;
    this.stats.pending     = this.requests.filter(r => r.status === 'PENDING').length;
    this.stats.accepted    = this.requests.filter(r => r.status === 'ACCEPTED').length;
    this.stats.rejected    = this.requests.filter(r => r.status === 'REJECTED').length;
    this.stats.in_progress = this.requests.filter(r => r.status === 'IN_PROGRESS').length;
    this.stats.completed   = this.requests.filter(r => r.status === 'COMPLETED').length;
    this.stats.cancelled   = this.requests.filter(r => r.status === 'CANCELLED').length;
  }

  getDisplayedRequests(): ServiceRequest[] {
    let list: ServiceRequest[];

    if (this.activeTab === 'all') {
      list = [...this.requests];
    } else {
      list = this.requests.filter(r => r.status.toLowerCase() === this.activeTab.toUpperCase());
    }

    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(r =>
        r.title.toLowerCase().includes(s) ||
        (r.requesterName?.toLowerCase() || '').includes(s) ||
        (r.machineServiceName?.toLowerCase() || '').includes(s)
      );
    }
    return list;
  }

  // ─── ACTIONS ADMIN ──────────────────────────────────────────

  /**
   * Admin peut changer le statut de n'importe quelle demande.
   * ⚠️  L'admin NE fait PAS de matching automatique, mais peut
   *     manuellement valider/refuser/marquer en cours/terminer.
   */
  openResponseModal(request: ServiceRequest, action: 'accept' | 'reject'): void {
    this.selectedRequest = request;
    this.responseAction = action;
    this.responseMessage = '';
    this.showResponseModal = true;
  }

  confirmResponse(): void {
    if (!this.selectedRequest || !this.responseAction) return;

    const newStatus = this.responseAction === 'accept' ? 'ACCEPTED' : 'REJECTED';
    const msg = this.responseMessage.trim() || undefined;

    this.adminService.updateRequestStatus(this.selectedRequest.id, newStatus, msg).subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex(r => r.id === this.selectedRequest!.id);
        if (idx !== -1) this.requests[idx] = updated;
        this.showResponseModal = false;
        this.calculateStats();
        this.showToast(
          this.responseAction === 'accept' ? 'Demande acceptée ✅' : 'Demande refusée',
          this.responseAction === 'accept' ? 'success' : 'warning'
        );
      },
      error: () => this.showToast('Erreur lors de la mise à jour ❌', 'error')
    });
  }

  markInProgress(request: ServiceRequest): void {
    this.adminService.updateRequestStatus(request.id, 'IN_PROGRESS').subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex(r => r.id === request.id);
        if (idx !== -1) this.requests[idx] = updated;
        this.calculateStats();
        this.showToast('Demande marquée en cours', 'info');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  markCompleted(request: ServiceRequest): void {
    if (!confirm('Marquer cette demande comme terminée ?')) return;
    this.adminService.updateRequestStatus(request.id, 'COMPLETED').subscribe({
      next: (updated) => {
        const idx = this.requests.findIndex(r => r.id === request.id);
        if (idx !== -1) this.requests[idx] = updated;
        this.calculateStats();
        this.showToast('Demande terminée ✅', 'success');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  deleteRequest(request: ServiceRequest): void {
    if (!confirm(`Supprimer définitivement la demande "${request.title}" ?`)) return;
    this.adminService.deleteRequest(request.id).subscribe({
      next: () => {
        this.requests = this.requests.filter(r => r.id !== request.id);
        this.calculateStats();
        this.showToast('Demande supprimée', 'info');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  // ─── HELPERS ────────────────────────────────────────────────
  getStatusBadge(status: string): string {
    switch(status) {
      case 'PENDING':     return 'warning';
      case 'ACCEPTED':    return 'info';
      case 'REJECTED':    return 'danger';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED':   return 'success';
      case 'CANCELLED':   return 'secondary';
      default: return 'secondary';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'PENDING':     return 'En attente';
      case 'ACCEPTED':    return 'Acceptée';
      case 'REJECTED':    return 'Refusée';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED':   return 'Terminée';
      case 'CANCELLED':   return 'Annulée';
      default: return status;
    }
  }

  getRequestTypeLabel(type: string): string {
    switch(type) {
      case 'FABRICATION':       return 'Fabrication';
      case 'SERVICE':           return 'Service';
      case 'MACHINE_RENT':      return 'Location machine';
      case 'MACHINE_PURCHASE':  return 'Achat machine';
      case 'REPARATION':        return 'Réparation';
      case 'CONSULTATION':      return 'Consultation';
      default: return type || '—';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-TN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }

  showToast(msg: string, type: string): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToastFlag = true;
    setTimeout(() => this.showToastFlag = false, 3000);
  }
}