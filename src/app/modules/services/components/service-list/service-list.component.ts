// src/app/modules/resources/components/service-list/service-list.component.ts
// ✅ Logique : APPROVED → visible par tous | PENDING/REJECTED → seulement propriétaire

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService, ServiceEntity } from '../../../../services/service.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;

  allServices: ServiceEntity[] = [];
  filteredServices: ServiceEntity[] = [];
  loading = false;
  errorMessage = '';

  filters = {
    category: '',
    serviceType: '',
    location: '',
    searchTerm: '',
    minPrice: null as number | null,
    maxPrice: null as number | null
  };

  categories   = ['INDUSTRIELLE', 'DOMESTIQUE', 'AGRICOLE', 'ELECTRONIQUE', 'MEDICAL', 'BUREAUTIQUE', 'CONSTRUCTION', 'AUTRE'];
  serviceTypes = ['FABRICATION', 'REPARATION', 'CONSULTATION', 'LIVRAISON', 'AUTRE'];

  currentPage   = 1;
  itemsPerPage  = 9;
  totalItems    = 0;

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private particles: any[] = [];

  constructor(
    private router: Router,
    private serviceService: ServiceService
  ) {}

  ngOnInit():     void { this.loadServices(); }
  ngAfterViewInit(): void { this.initParticles(); }
  ngOnDestroy():  void { cancelAnimationFrame(this.animationId); }

  // ─── CHARGEMENT ─────────────────────────────────────────────

  loadServices(): void {
    this.loading = true;
    this.errorMessage = '';

    this.serviceService.getAllServices().subscribe({
      next: (data: ServiceEntity[]) => {
        const userId = this.getCurrentUserId();

        /*
         * Règles de visibilité (identiques aux machines) :
         *  APPROVED  → visible par tous
         *  PENDING   → seulement le prestataire propriétaire
         *  REJECTED  → seulement le prestataire propriétaire (grisé + motif)
         */
        this.allServices = data.filter(s => {
          if (s.validationStatus === 'APPROVED') return true;
          return s.providerId === userId;
        });

        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les services';
        this.loading = false;
      }
    });
  }

  // ─── STATUTS ────────────────────────────────────────────────

  isOwner(service: ServiceEntity): boolean {
    return service.providerId === this.getCurrentUserId();
  }
  isRejected(s: ServiceEntity): boolean  { return s.validationStatus === 'REJECTED'; }
  isPending(s: ServiceEntity):  boolean  { return s.validationStatus === 'PENDING';  }
  isApproved(s: ServiceEntity): boolean  { return s.validationStatus === 'APPROVED'; }

  getRejectReason(s: ServiceEntity): string {
    return s.rejectionReason || 'Aucune raison fournie';
  }

  // ─── FILTRES ─────────────────────────────────────────────────

  applyFilters(): void {
    this.filteredServices = this.allServices.filter(s => {
      if (this.filters.category    && s.category    !== this.filters.category)    return false;
      if (this.filters.serviceType && s.serviceType !== this.filters.serviceType) return false;
      if (this.filters.location    && !s.location?.toLowerCase().includes(this.filters.location.toLowerCase())) return false;
      if (this.filters.searchTerm  && !s.name.toLowerCase().includes(this.filters.searchTerm.toLowerCase())) return false;
      if (this.filters.minPrice != null && s.basePrice < this.filters.minPrice)  return false;
      if (this.filters.maxPrice != null && s.basePrice > this.filters.maxPrice)  return false;
      return true;
    });
    this.totalItems  = this.filteredServices.length;
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.filters = { category:'', serviceType:'', location:'', searchTerm:'', minPrice:null, maxPrice:null };
    this.applyFilters();
  }

  isFilterActive(): boolean {
    return !!(this.filters.category || this.filters.serviceType || this.filters.location ||
              this.filters.searchTerm || this.filters.minPrice   || this.filters.maxPrice);
  }

  // ─── PAGINATION ──────────────────────────────────────────────

  get paginatedServices(): ServiceEntity[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredServices.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number { return Math.ceil(this.totalItems / this.itemsPerPage); }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    let start = Math.max(1, this.currentPage - 2);
    let end   = Math.min(this.totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // ─── ACTIONS ────────────────────────────────────────────────

  viewServiceDetails(id: number): void {
    this.router.navigate(['/services', id]);
  }

  createRequest(service: ServiceEntity): void {
    this.router.navigate(['/requests/create'], {
      queryParams: { serviceId: service.id, serviceName: service.name,
                     providerId: service.providerId, providerName: service.providerName }
    });
  }

  editService(service: ServiceEntity): void {
    if (!this.isOwner(service)) { alert('Vous ne pouvez modifier que vos propres services'); return; }
    this.router.navigate(['/services/edit', service.id]);
  }

  deleteService(service: ServiceEntity): void {
    if (!this.isOwner(service)) { alert('Vous ne pouvez supprimer que vos propres services'); return; }
    if (!confirm(`Supprimer "${service.name}" ?`)) return;

    this.serviceService.deleteService(service.id).subscribe({
      next: () => {
        this.allServices = this.allServices.filter(s => s.id !== service.id);
        this.applyFilters();
      },
      error: () => alert('❌ Erreur lors de la suppression')
    });
  }

  private getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }

  // ─── UTILITAIRES ────────────────────────────────────────────

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < full; i++) stars.push('bi-star-fill');
    if ((rating % 1) >= 0.5) stars.push('bi-star-half');
    while (stars.length < 5) stars.push('bi-star');
    return stars;
  }

  getAvailabilityClass(status: string): string {
    switch(status) {
      case 'AVAILABLE':   return 'status-available';
      case 'UNAVAILABLE': return 'status-unavailable';
      case 'RESERVED':    return 'status-reserved';
      default: return 'status-unknown';
    }
  }

  getAvailabilityText(status: string): string {
    switch(status) {
      case 'AVAILABLE':   return 'Disponible';
      case 'UNAVAILABLE': return 'Indisponible';
      case 'RESERVED':    return 'Réservé';
      default: return status;
    }
  }

  getServiceTypeLabel(type: string): string {
    switch(type) {
      case 'FABRICATION':  return '🔧 Fabrication';
      case 'REPARATION':   return '🛠️ Réparation';
      case 'CONSULTATION': return '💡 Consultation';
      case 'LIVRAISON':    return '🚚 Livraison';
      default: return '📋 Autre';
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = 'assets/images/default-service.jpg';
  }

  // ─── PARTICULES ──────────────────────────────────────────────

  initParticles(): void {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      this.buildParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    this.animateParticles();
  }

  buildParticles(w: number, h: number): void {
    const n = Math.min(60, Math.floor(w * 0.05));
    this.particles = Array.from({length: n}, () => ({
      x: Math.random() * w, y: Math.random() * h,
      ox: Math.random() * w, oy: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      a: Math.random() * 0.2 + 0.05,
      sx: (Math.random() - 0.5) * 0.1,
      sy: (Math.random() - 0.5) * 0.08
    }));
  }

  animateParticles(): void {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(10,110,189,${0.04*(1-d/100)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(10,110,189,${p.a})`;
      this.ctx.fill();
      p.x += p.sx; p.y += p.sy;
      p.x += (p.ox - p.x) * 0.003;
      p.y += (p.oy - p.y) * 0.003;
      if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
    }
    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }
}