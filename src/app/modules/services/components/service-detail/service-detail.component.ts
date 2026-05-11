// src/app/modules/services/components/service-detail/service-detail.component.ts
// ✅ NOUVEAU : services similaires + services du même prestataire

import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService, ServiceEntity } from '../../../../services/service.service';
import { ReviewListComponent } from '../../../reviews/components/review-list/review-list.component';

@Component({
  selector: 'app-service-detail',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe,
    ReviewListComponent
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private particles: any[] = [];

  service: ServiceEntity | null = null;
  loading = false;
  selectedImageIndex = 0;
  showContactModal = false;
  showConfirmDelete = false;
  contactMessage = '';

  // ✅ NOUVEAU
  similarServices: ServiceEntity[]  = [];
  providerServices: ServiceEntity[] = [];
  loadingSimilar   = false;
  loadingProvider  = false;

  defaultImage = 'assets/images/default-service.jpg';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    // Recharger si navigation entre services similaires
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.selectedImageIndex = 0;
        this.loadService(id);
      }
    });
  }

  ngAfterViewInit(): void { this.initParticles(); }

  ngOnDestroy(): void { cancelAnimationFrame(this.animationId); }

  // ─── CHARGEMENT ──────────────────────────────────────────────

  loadService(id: number): void {
    this.loading = true;
    this.serviceService.getServiceById(id).subscribe({
      next: (data: ServiceEntity) => {
        this.service = data;
        this.loading = false;
        this.loadSimilarServices(data);
        this.loadProviderServices(data);
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement du service');
      }
    });
  }

  /**
   * ✅ Services similaires : même catégorie OU même type de service.
   * Exclure le service actuel. Limité à 6.
   */
  loadSimilarServices(current: ServiceEntity): void {
    this.loadingSimilar = true;
    this.serviceService.getAllServices().subscribe({
      next: (all: ServiceEntity[]) => {
        this.similarServices = all
          .filter(s =>
            s.id !== current.id &&
            s.validationStatus === 'APPROVED' &&
            (s.category === current.category || s.serviceType === current.serviceType)
          )
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        this.loadingSimilar = false;
      },
      error: () => { this.loadingSimilar = false; }
    });
  }

  /**
   * ✅ Autres services du même prestataire, excluant le service actuel. Limité à 4.
   */
  loadProviderServices(current: ServiceEntity): void {
    this.loadingProvider = true;
    this.serviceService.getServicesByProvider(current.providerId).subscribe({
      next: (all: ServiceEntity[]) => {
        this.providerServices = all
          .filter(s => s.id !== current.id && s.validationStatus === 'APPROVED')
          .slice(0, 4);
        this.loadingProvider = false;
      },
      error: () => { this.loadingProvider = false; }
    });
  }

  // ─── NAVIGATION ──────────────────────────────────────────────

  viewService(service: ServiceEntity): void {
    this.router.navigate(['/services', service.id]);
  }

  createRequest(): void {
    this.router.navigate(['/requests/create'], {
      queryParams: {
        serviceId:    this.service?.id,
        serviceName:  this.service?.name,
        providerId:   this.service?.providerId,
        providerName: this.service?.providerName
      }
    });
  }

  createRequestFor(service: ServiceEntity): void {
    this.router.navigate(['/requests/create'], {
      queryParams: {
        serviceId:    service.id,
        serviceName:  service.name,
        providerId:   service.providerId,
        providerName: service.providerName
      }
    });
  }

  sendContactRequest(): void {
    this.router.navigate(['/requests/create'], {
      queryParams: {
        serviceId:    this.service?.id,
        serviceName:  this.service?.name,
        providerId:   this.service?.providerId,
        providerName: this.service?.providerName,
        message: this.contactMessage
      }
    });
    this.showContactModal = false;
  }

  editService(): void { this.router.navigate(['/services/edit', this.service?.id]); }

  deleteService(): void {
    if (this.service) {
      this.serviceService.deleteService(this.service.id).subscribe({
        next: () => { alert('Service supprimé'); this.router.navigate(['/services']); },
        error: () => alert('Erreur suppression')
      });
    }
  }

  isCurrentUserProvider(): boolean {
    return this.service?.providerId === parseInt(localStorage.getItem('userId') || '1', 10);
  }

  // ─── GALERIE ─────────────────────────────────────────────────

  getCurrentImage(): string {
    if (!this.service) return this.defaultImage;
    return this.service.imageUrls?.length ? this.service.imageUrls[this.selectedImageIndex] : this.defaultImage;
  }

  nextImage(): void {
    if (this.service?.imageUrls && this.selectedImageIndex < this.service.imageUrls.length - 1)
      this.selectedImageIndex++;
  }
  prevImage(): void { if (this.selectedImageIndex > 0) this.selectedImageIndex--; }
  selectImage(i: number): void {
    if (this.service?.imageUrls && i < this.service.imageUrls.length) this.selectedImageIndex = i;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  getServiceImage(s: ServiceEntity): string {
    return s.imageUrls?.length ? s.imageUrls[0] : this.defaultImage;
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  getStars(rating: number): string[] {
    const s: string[] = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < full; i++) s.push('bi-star-fill');
    if ((rating % 1) >= 0.5) s.push('bi-star-half');
    while (s.length < 5) s.push('bi-star');
    return s;
  }

  getAvailabilityClass(status: string): string {
    return { 'AVAILABLE': 'bg-success', 'UNAVAILABLE': 'bg-danger', 'RESERVED': 'bg-warning' }[status] || 'bg-secondary';
  }

  getAvailabilityText(status: string): string {
    return { 'AVAILABLE': 'Disponible', 'UNAVAILABLE': 'Indisponible', 'RESERVED': 'Réservé' }[status] || status;
  }

  getServiceTypeLabel(type: string): string {
    return { 'FABRICATION': '🔧 Fabrication', 'REPARATION': '🛠️ Réparation',
             'CONSULTATION': '💡 Consultation', 'LIVRAISON': '🚚 Livraison' }[type] || '📋 Autre';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-TN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  getProviderEmail(name: string | null | undefined): string {
    return name ? name.toLowerCase().replace(/\s/g, '') + '@example.com' : 'contact@prestataire.com';
  }

  // ─── PARTICULES ──────────────────────────────────────────────

  initParticles(): void {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      this.buildParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    this.animateParticles();
  }

  buildParticles(w: number, h: number): void {
    this.particles = Array.from({ length: Math.min(60, Math.floor(w * 0.06)) }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      ox: Math.random()*w, oy: Math.random()*h,
      r: Math.random()*2+0.5, a: Math.random()*0.25+0.05,
      sx: (Math.random()-0.5)*0.1, sy: (Math.random()-0.5)*0.08
    }));
  }

  animateParticles(): void {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.particles.length; i++) for (let j = i+1; j < this.particles.length; j++) {
      const dx = this.particles[i].x - this.particles[j].x, dy = this.particles[i].y - this.particles[j].y;
      const d = Math.sqrt(dx*dx+dy*dy);
      if (d < 100) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(10,110,189,${0.04*(1-d/100)})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
        this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
        this.ctx.stroke();
      }
    }
    for (const p of this.particles) {
      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fillStyle = `rgba(10,110,189,${p.a})`; this.ctx.fill();
      p.x += p.sx; p.y += p.sy;
      p.x += (p.ox-p.x)*0.003; p.y += (p.oy-p.y)*0.003;
      if (p.x<0) p.x=canvas.width; if (p.x>canvas.width) p.x=0;
      if (p.y<0) p.y=canvas.height; if (p.y>canvas.height) p.y=0;
    }
    this.animationId = requestAnimationFrame(() => this.animateParticles());
  }
}