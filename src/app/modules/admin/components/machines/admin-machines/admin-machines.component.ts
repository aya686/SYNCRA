// src/app/modules/admin/components/machines/admin-machines.component.ts
// ✅ Ajout du tab AUTO_REJECTED pour les machines rejetées par le ML

import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, Machine } from '../../../../../services/admin.service';

@Component({
  selector: 'admin-machines',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-machines.component.html',
  styleUrls: ['./admin-machines.component.scss']
})
export class AdminMachinesComponent implements OnInit {
  machines: Machine[] = [];
  // ✅ Nouveau tab 'auto_rejected' pour les rejets ML
  activeTab: 'all' | 'pending' | 'approved' | 'rejected' | 'auto_rejected' = 'pending';
  loading = false;
  showRejectModal = false;
  selectedMachine: Machine | null = null;
  rejectReason = '';
  searchTerm = '';

  stats = { total: 0, pending: 0, approved: 0, rejected: 0, autoRejected: 0 };

  // Toast
  toastMessage = '';
  toastType = 'success';
  showToastFlag = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void { this.loadMachines(); }

  loadMachines(): void {
    this.loading = true;
    this.adminService.getAllMachines().subscribe({
      next: (data) => {
        this.machines = data;
        this.calculateStats();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  calculateStats(): void {
    this.stats.total        = this.machines.length;
    this.stats.pending      = this.machines.filter(m => m.validationStatus === 'PENDING').length;
    this.stats.approved     = this.machines.filter(m => m.validationStatus === 'APPROVED').length;
    this.stats.rejected     = this.machines.filter(m => m.validationStatus === 'REJECTED').length;
    // ✅ Compter les rejets ML
    this.stats.autoRejected = this.machines.filter(m => m.validationStatus === 'AUTO_REJECTED').length;
  }

  getDisplayedMachines(): Machine[] {
    let list: Machine[];

    if (this.activeTab === 'all') {
      list = [...this.machines];
    } else if (this.activeTab === 'auto_rejected') {
      list = this.machines.filter(m => m.validationStatus === 'AUTO_REJECTED');
    } else {
      list = this.machines.filter(m =>
        m.validationStatus?.toUpperCase() === this.activeTab.toUpperCase()
      );
    }

    if (this.searchTerm.trim()) {
      const s = this.searchTerm.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(s) ||
        (m.supplierName?.toLowerCase() || '').includes(s) ||
        (m.location?.toLowerCase() || '').includes(s)
      );
    }
    return list;
  }

  approveMachine(machine: Machine): void {
    if (!confirm(`Approuver la machine "${machine.name}" ?`)) return;
    this.adminService.approveMachine(machine.id).subscribe({
      next: () => {
        machine.validationStatus = 'APPROVED';
        machine.rejectionReason = undefined;
        this.calculateStats();
        this.showToast('Machine approuvée ✅', 'success');
      },
      error: () => this.showToast('Erreur approbation ❌', 'error')
    });
  }

  openRejectModal(machine: Machine): void {
    this.selectedMachine = machine;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (!this.selectedMachine || !this.rejectReason.trim()) return;
    this.adminService.rejectMachine(this.selectedMachine.id, this.rejectReason).subscribe({
      next: () => {
        if (this.selectedMachine) {
          this.selectedMachine.validationStatus = 'REJECTED';
          this.selectedMachine.rejectionReason = this.rejectReason;
          this.selectedMachine.rejectedAt = new Date();
        }
        this.showRejectModal = false;
        this.calculateStats();
        this.showToast('Machine rejetée', 'warning');
      },
      error: () => this.showToast('Erreur rejet ❌', 'error')
    });
  }

  deleteMachine(machine: Machine): void {
    if (!confirm(`Supprimer définitivement "${machine.name}" ?`)) return;
    this.adminService.deleteMachine(machine.id).subscribe({
      next: () => {
        this.machines = this.machines.filter(m => m.id !== machine.id);
        this.calculateStats();
        this.showToast('Machine supprimée', 'info');
      },
      error: () => this.showToast('Erreur suppression ❌', 'error')
    });
  }

  // ✅ L'admin peut forcer l'approbation d'une machine AUTO_REJECTED
  forceApprove(machine: Machine): void {
    if (!confirm(`⚠️ Forcer l'approbation de "${machine.name}" malgré le rejet automatique ?`)) return;
    this.adminService.approveMachine(machine.id).subscribe({
      next: () => {
        machine.validationStatus = 'APPROVED';
        machine.rejectionReason = undefined;
        this.calculateStats();
        this.showToast('Machine approuvée manuellement ✅', 'success');
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
      case 'AUTO_REJECTED': return 'dark';      // ✅ nouveau
      default: return 'secondary';
    }
  }

  getStatusText(status: string | undefined): string {
    switch(status) {
      case 'APPROVED':      return 'Approuvée';
      case 'PENDING':       return 'En attente';
      case 'REJECTED':      return 'Rejetée (admin)';
      case 'AUTO_REJECTED': return '🤖 Rejetée (ML)'; // ✅ nouveau
      default: return '—';
    }
  }

  isAutoRejected(machine: Machine): boolean {
    return machine.validationStatus === 'AUTO_REJECTED';
  }

  getAvailabilityBadge(a: string): string {
    switch(a) {
      case 'AVAILABLE':   return 'success';
      case 'UNAVAILABLE': return 'danger';
      case 'RESERVED':    return 'warning';
      default: return 'secondary';
    }
  }

  getAvailabilityText(a: string): string {
    switch(a) {
      case 'AVAILABLE':   return 'Disponible';
      case 'UNAVAILABLE': return 'Indisponible';
      case 'RESERVED':    return 'Réservé';
      default: return a;
    }
  }

  getMachineImage(machine: Machine): string {
    return machine.imageUrls?.length > 0 ? machine.imageUrls[0] : 'assets/images/default-machine.jpg';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-TN').format(price || 0);
  }

  showToast(msg: string, type: string): void {
    this.toastMessage = msg;
    this.toastType = type;
    this.showToastFlag = true;
    setTimeout(() => this.showToastFlag = false, 3500);
  }
}