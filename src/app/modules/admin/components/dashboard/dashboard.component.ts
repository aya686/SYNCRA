// src/app/modules/admin/components/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, DashboardStats } from '../../../../services/admin.service';

@Component({
  selector: 'app-dashboard',
 standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalMachines: 0,
    pendingMachines: 0,
    approvedMachines: 0,
    rejectedMachines: 0,
    totalServices: 0,
    pendingServices: 0,
    approvedServices: 0,
    rejectedServices: 0,
    totalRequests: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0
  };

  recentMachines: any[] = [];
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentMachines();
  }

  loadStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (s) => this.stats = s,
      error: (e) => console.error('Stats error', e)
    });
  }

  loadRecentMachines(): void {
    this.loading = true;
    this.adminService.getAllMachines().subscribe({
      next: (machines) => {
        // Dernières 5 machines ajoutées
        this.recentMachines = machines
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusBadge(status: string | undefined): string {
    switch(status) {
      case 'APPROVED': return 'success';
      case 'PENDING':  return 'warning';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusText(status: string | undefined): string {
    switch(status) {
      case 'APPROVED': return 'Approuvée';
      case 'PENDING':  return 'En attente';
      case 'REJECTED': return 'Rejetée';
      default: return '—';
    }
  }
}