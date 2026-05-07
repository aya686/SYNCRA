// src/app/modules/requests/components/request-list/request-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { ServiceRequest, RequestStatus, RequestType } from '../../../../models/service-request.model';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit {
  requests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];
  loading = false;
  
  // Filtres
  filters = {
    status: '',
    requestType: '',
    searchTerm: ''
  };
  
  // Options pour les filtres
  statuses = Object.values(RequestStatus);
  requestTypes = Object.values(RequestType);
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Tabs
  activeTab: 'all' | 'sent' | 'received' = 'all';
  
  // ID utilisateur courant
  currentUserId = 1;
  
  constructor(
    private router: Router,
    private requestService: ServiceRequestService
  ) {}
  
  ngOnInit(): void {
    this.currentUserId = this.getCurrentUserId();
    this.loadRequests();
  }
  
  loadRequests(): void {
    this.loading = true;
    
    if (this.activeTab === 'sent') {
      this.requestService.getRequestsByRequester(this.currentUserId).subscribe({
        next: (data: ServiceRequest[]) => {
          this.requests = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Erreur chargement demandes envoyées', err);
          this.loading = false;
        }
      });
    } else if (this.activeTab === 'received') {
      this.requestService.getRequestsByProvider(this.currentUserId).subscribe({
        next: (data: ServiceRequest[]) => {
          this.requests = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Erreur chargement demandes reçues', err);
          this.loading = false;
        }
      });
    } else {
      // Pour 'all', on combine les deux
      Promise.all([
        this.requestService.getRequestsByRequester(this.currentUserId).toPromise(),
        this.requestService.getRequestsByProvider(this.currentUserId).toPromise()
      ]).then(([sent, received]) => {
        this.requests = [...(sent || []), ...(received || [])];
        // Enlever les doublons
        this.requests = this.requests.filter((req, index, self) => 
          index === self.findIndex(r => r.id === req.id)
        );
        this.applyFilters();
        this.loading = false;
      }).catch(err => {
        console.error('Erreur chargement demandes', err);
        this.loading = false;
      });
    }
  }
  
  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      let match = true;
      
      if (this.filters.status && request.status !== this.filters.status) {
        match = false;
      }
      if (this.filters.requestType && request.requestType !== this.filters.requestType) {
        match = false;
      }
      if (this.filters.searchTerm && !request.title.toLowerCase().includes(this.filters.searchTerm.toLowerCase())) {
        match = false;
      }
      
      return match;
    });
    
    // Trier par date de création (plus récent d'abord)
    this.filteredRequests.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    this.totalItems = this.filteredRequests.length;
    this.currentPage = 1;
  }
  
  resetFilters(): void {
    this.filters = {
      status: '',
      requestType: '',
      searchTerm: ''
    };
    this.applyFilters();
  }
  
  changeTab(tab: 'all' | 'sent' | 'received'): void {
    this.activeTab = tab;
    this.resetFilters();
    this.loadRequests();
  }
  
  get paginatedRequests(): ServiceRequest[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredRequests.slice(start, end);
  }
  
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
  
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  getStatusBadgeClass(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.PENDING:
        return 'bg-warning text-dark';
      case RequestStatus.ACCEPTED:
        return 'bg-info';
      case RequestStatus.REJECTED:
        return 'bg-danger';
      case RequestStatus.IN_PROGRESS:
        return 'bg-primary';
      case RequestStatus.COMPLETED:
        return 'bg-success';
      case RequestStatus.CANCELLED:
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  }
  
  getStatusLabel(status: RequestStatus): string {
    switch(status) {
      case RequestStatus.PENDING: return 'En attente';
      case RequestStatus.ACCEPTED: return 'Acceptée';
      case RequestStatus.REJECTED: return 'Refusée';
      case RequestStatus.IN_PROGRESS: return 'En cours';
      case RequestStatus.COMPLETED: return 'Terminée';
      case RequestStatus.CANCELLED: return 'Annulée';
      default: return status;
    }
  }
  
  getRequestTypeLabel(type: RequestType): string {
    switch(type) {
      case RequestType.FABRICATION: return 'Fabrication';
      case RequestType.SERVICE: return 'Service';
      case RequestType.MACHINE_RENT: return 'Location machine';
      case RequestType.MACHINE_PURCHASE: return 'Achat machine';
      case RequestType.REPARATION: return 'Réparation';
      case RequestType.CONSULTATION: return 'Consultation';
      default: return type;
    }
  }
  
  isRequester(request: ServiceRequest): boolean {
    return request.requesterId === this.currentUserId;
  }
  
  getOtherPartyName(request: ServiceRequest): string {
    if (this.isRequester(request)) {
      if (request.isExternalProvider) {
        return request.externalProviderName || 'Fournisseur externe';
      }
      return `Fournisseur #${request.targetProviderId}`;
    } else {
      return request.requesterName;
    }
  }
  
  getOtherPartyInfo(request: ServiceRequest): string {
    if (this.isRequester(request)) {
      if (request.isExternalProvider) {
        return request.externalProviderPhone || '';
      }
      return 'Fournisseur inscrit';
    } else {
      return request.requesterEmail;
    }
  }
  
  viewRequestDetails(id: number): void {
    this.router.navigate(['/requests', id]);
  }
  
  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  private getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  // Dans request-list.component.ts, ajoutez ces méthodes :

getStatusClass(status: RequestStatus): string {
  switch(status) {
    case RequestStatus.PENDING: return 'status-pending';
    case RequestStatus.ACCEPTED: return 'status-accepted';
    case RequestStatus.REJECTED: return 'status-rejected';
    case RequestStatus.IN_PROGRESS: return 'status-in_progress';
    case RequestStatus.COMPLETED: return 'status-completed';
    case RequestStatus.CANCELLED: return 'status-cancelled';
    default: return '';
  }
}

isFilterActive(): boolean {
  return !!(this.filters.status || this.filters.requestType || this.filters.searchTerm);
}

getAllCount(): number {
  return this.requests.length;
}

getSentCount(): number {
  return this.requests.filter(r => r.requesterId === this.currentUserId).length;
}

getReceivedCount(): number {
  return this.requests.filter(r => r.requesterId !== this.currentUserId).length;
}

getPendingCount(): number {
  return this.requests.filter(r => r.status === RequestStatus.PENDING).length;
}
}