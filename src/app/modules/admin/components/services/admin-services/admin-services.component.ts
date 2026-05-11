// src/app/modules/admin/components/services/admin-services.component.ts
// ✅ Ajout du tab AUTO_REJECTED pour les services rejetés par le ML

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../../../services/admin.service';
import { ServiceEntity } from '../../../../../services/service.service';

@Component({
  selector: 'app-admin-services',
   standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterModule],
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss']
})
export class AdminServicesComponent implements OnInit {
  services: ServiceEntity[] = [];
  // ✅ Nouveau tab 'auto_rejected'
  activeTab: 'all' | 'pending' | 'approved' | 'rejected' | 'auto_rejected' = 'pending';
  loading = false;
  searchTerm = '';

  showRejectModal = false;
  selectedService: ServiceEntity | null = null;
  rejectReason = '';

  // ✅ Ajout stat autoRejected
  stats = { total: 0, pending: 0, approved: 0, rejected: 0, autoRejected: 0 };

  toastMessage = '';
  toastType = 'success';
  showToastFlag = false;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadServices(); }

  loadServices(): void {
    this.loading = true;
    this.adminService.getAllServices().subscribe({
      next: (data) => {
        this.services = data;
        this.calculateStats();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calculateStats(): void {
    this.stats.total        = this.services.length;
    this.stats.pending      = this.services.filter(s => s.validationStatus === 'PENDING').length;
    this.stats.approved     = this.services.filter(s => s.validationStatus === 'APPROVED').length;
    this.stats.rejected     = this.services.filter(s => s.validationStatus === 'REJECTED').length;
    this.stats.autoRejected = this.services.filter(s => s.validationStatus === 'AUTO_REJECTED').length;
  }

  getDisplayedServices(): ServiceEntity[] {
    let list: ServiceEntity[];

    if (this.activeTab === 'all') {
      list = [...this.services];
    } else if (this.activeTab === 'auto_rejected') {
      list = this.services.filter(s => s.validationStatus === 'AUTO_REJECTED');
    } else {
      list = this.services.filter(s =>
        s.validationStatus?.toUpperCase() === this.activeTab.toUpperCase()
      );
    }

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.providerName?.toLowerCase() || '').includes(q) ||
        (s.location?.toLowerCase() || '').includes(q)
      );
    }
    return list;
  }

  approveService(service: ServiceEntity): void {
    if (!confirm(`Approuver le service "${service.name}" ?`)) return;
    this.adminService.approveService(service.id).subscribe({
      next: () => {
        service.validationStatus = 'APPROVED';
        service.rejectionReason = undefined;
        this.calculateStats();
        this.showToast('Service approuvé ✅', 'success');
      },
      error: () => this.showToast('Erreur approbation ❌', 'error')
    });
  }

  openRejectModal(service: ServiceEntity): void {
    this.selectedService = service;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedService || !this.rejectReason.trim()) return;
    this.adminService.rejectService(this.selectedService.id, this.rejectReason).subscribe({
      next: () => {
        if (this.selectedService) {
          this.selectedService.validationStatus = 'REJECTED';
          this.selectedService.rejectionReason = this.rejectReason;
          this.selectedService.rejectedAt = new Date();
        }
        this.showRejectModal = false;
        this.calculateStats();
        this.showToast('Service rejeté', 'warning');
      },
      error: () => this.showToast('Erreur rejet ❌', 'error')
    });
  }

  deleteService(service: ServiceEntity): void {
    if (!confirm(`Supprimer définitivement "${service.name}" ?`)) return;
    this.adminService.deleteService(service.id).subscribe({
      next: () => {
        this.services = this.services.filter(s => s.id !== service.id);
        this.calculateStats();
        this.showToast('Service supprimé', 'info');
      },
      error: () => this.showToast('Erreur suppression ❌', 'error')
    });
  }

  createService(): void { this.router.navigate(['/services/create']); }
  editService(service: ServiceEntity): void { this.router.navigate(['/services/edit', service.id]); }

  // ✅ L'admin peut forcer l'approbation d'un service AUTO_REJECTED
  forceApprove(service: ServiceEntity): void {
    if (!confirm(`⚠️ Forcer l'approbation de "${service.name}" malgré le rejet automatique ?`)) return;
    this.adminService.approveService(service.id).subscribe({
      next: () => {
        service.validationStatus = 'APPROVED';
        service.rejectionReason = undefined;
        this.calculateStats();
        this.showToast('Service approuvé manuellement ✅', 'success');
      },
      error: () => this.showToast('Erreur ❌', 'error')
    });
  }

  // ─── HELPERS ────────────────────────────────────────────────
  getStatusBadge(status: string | undefined): string {
    switch(status) {
      case 'APPROVED':      return 'success';
      case 'PENDING':       return 'warning';
      case 'REJECTED':      return 'danger';
      case 'AUTO_REJECTED': return 'dark';
      default: return 'secondary';
    }
  }

  getStatusText(status: string | undefined): string {
    switch(status) {
      case 'APPROVED':      return 'Approuvé';
      case 'PENDING':       return 'En attente';
      case 'REJECTED':      return 'Rejeté (admin)';
      case 'AUTO_REJECTED': return '🤖 Rejeté (IA)';
      default: return '—';
    }
  }

  isAutoRejected(s: ServiceEntity): boolean { return s.validationStatus === 'AUTO_REJECTED'; }

  getAvailabilityText(a: string): string {
    switch(a) {
      case 'AVAILABLE':   return 'Disponible';
      case 'UNAVAILABLE': return 'Indisponible';
      case 'RESERVED':    return 'Réservé';
      default: return a;
    }
  }

  getAvailabilityBadge(a: string): string {
    switch(a) {
      case 'AVAILABLE':   return 'success';
      case 'UNAVAILABLE': return 'danger';
      case 'RESERVED':    return 'warning';
      default: return 'secondary';
    }
  }

  getServiceTypeLabel(type: string): string {
    switch(type) {
      case 'FABRICATION':  return 'Fabrication';
      case 'REPARATION':   return 'Réparation';
      case 'CONSULTATION': return 'Consultation';
      case 'LIVRAISON':    return 'Livraison';
      default: return type || '—';
    }
  }

  getServiceImage(s: ServiceEntity): string {
    return s.imageUrls?.length > 0 ? s.imageUrls[0] : 'assets/images/default-service.jpg';
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  showToast(msg: string, type: string): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToastFlag = true;
    setTimeout(() => this.showToastFlag = false, 3500);
  }
}