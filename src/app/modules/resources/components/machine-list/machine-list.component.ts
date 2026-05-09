// src/app/modules/resources/components/machine-list/machine-list.component.ts
// ✅ Ajout de isAutoRejected() + visibilité AUTO_REJECTED pour propriétaire
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MachineService, Machine } from '../../../../services/machine.service';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-machine-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './machine-list.component.html',
  styleUrls: ['./machine-list.component.scss']
})
export class MachineListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animationFrameId: number | null = null;

  allMachines: Machine[] = [];
  filteredMachines: Machine[] = [];
  loading = false;
  errorMessage = '';

  defaultImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="%236c757d" stroke-width="1"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Cpath d="M9 9h6M9 12h6M9 15h4"/%3E%3C/svg%3E';

  filters = {
    category: '', type: '', transactionType: '',
    location: '', searchTerm: '',
    minPrice: null as number | null,
    maxPrice: null as number | null
  };

  categories     = ['INDUSTRIELLE','DOMESTIQUE','AGRICOLE','ELECTRONIQUE','MEDICAL','BUREAUTIQUE','CONSTRUCTION','AUTRE'];
  machineTypes   = ['EQUIPMENT','RAW_MATERIAL','PART_ACCESSORY'];
  transactionTypes = ['SALE','RENT','BOTH'];

  constructor(
    private machineService: MachineService,
    private cartService: CartService
  ) {}

  ngOnInit():      void { this.loadMachines(); }
  ngAfterViewInit(): void { this.initParticleCanvas(); }
  ngOnDestroy():   void { if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId); }

  // ─── CHARGEMENT ─────────────────────────────────────────────
  loadMachines(): void {
    this.loading = true;
    this.errorMessage = '';

    this.machineService.getAllMachines().subscribe({
      next: (data: Machine[]) => {
        const userId = this.getCurrentUserId();

        /*
         * Règles de visibilité :
         * APPROVED      → visible par TOUS
         * PENDING       → seulement propriétaire
         * REJECTED      → seulement propriétaire (grisé + motif admin)
         * AUTO_REJECTED → seulement propriétaire (grisé + message IA)
         */
        this.allMachines = data.filter(m => {
          if (m.validationStatus === 'APPROVED') return true;
          return m.supplierId === userId;
        });

        this.filteredMachines = [...this.allMachines];
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.message || 'Impossible de charger les machines';
        this.loading = false;
      }
    });
  }

  // ─── STATUTS ─────────────────────────────────────────────────
  isOwner(m: Machine):       boolean { return m.supplierId === this.getCurrentUserId(); }
  isApproved(m: Machine):    boolean { return m.validationStatus === 'APPROVED'; }
  isPending(m: Machine):     boolean { return m.validationStatus === 'PENDING'; }
  isRejected(m: Machine):    boolean { return m.validationStatus === 'REJECTED'; }
  // ✅ NOUVEAU : rejet par IA
  isAutoRejected(m: Machine): boolean { return m.validationStatus === 'AUTO_REJECTED'; }

  getRejectReason(m: Machine): string {
    return m.rejectionReason || 'Aucune raison fournie';
  }

  // ─── FILTRES ─────────────────────────────────────────────────
  applyFilters(): void {
    this.filteredMachines = this.allMachines.filter(m => {
      if (this.filters.category      && m.category !== this.filters.category) return false;
      if (this.filters.type          && m.type !== this.filters.type) return false;
      if (this.filters.transactionType && m.transactionType !== this.filters.transactionType) return false;
      if (this.filters.location      && !m.location?.toLowerCase().includes(this.filters.location.toLowerCase())) return false;
      if (this.filters.searchTerm    && !m.name.toLowerCase().includes(this.filters.searchTerm.toLowerCase())) return false;
      if (this.filters.minPrice != null && m.price < this.filters.minPrice) return false;
      if (this.filters.maxPrice != null && m.price > this.filters.maxPrice) return false;
      return true;
    });
  }

  isFilterActive(): boolean {
    return !!(this.filters.category || this.filters.type || this.filters.transactionType ||
              this.filters.location || this.filters.searchTerm || this.filters.minPrice || this.filters.maxPrice);
  }

  resetFilters(): void {
    this.filters = { category:'', type:'', transactionType:'', location:'', searchTerm:'', minPrice:null, maxPrice:null };
    this.applyFilters();
  }

  // ─── PANIER ──────────────────────────────────────────────────
  addToCart(machine: Machine): void {
    if (!this.isApproved(machine) || machine.availability !== 'AVAILABLE') {
      alert('Cette machine n\'est pas disponible');
      return;
    }
    const userId = this.getCurrentUserId();
    this.cartService.addToCart(userId, { itemType:'MACHINE', itemId:machine.id, quantity:1 }).subscribe({
      next: () => {
        alert(`✅ "${machine.name}" ajouté au panier !`);
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: () => alert('❌ Erreur lors de l\'ajout au panier')
    });
  }

  deleteMachine(machine: Machine): void {
    if (!this.isOwner(machine)) { alert('Vous ne pouvez supprimer que vos propres machines'); return; }
    if (!confirm(`Supprimer "${machine.name}" ?`)) return;
    this.machineService.deleteMachine(machine.id).subscribe({
      next: () => {
        this.allMachines = this.allMachines.filter(m => m.id !== machine.id);
        this.applyFilters();
        alert('✅ Machine supprimée');
      },
      error: () => alert('❌ Erreur lors de la suppression')
    });
  }

  private getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }

  // ─── AFFICHAGE ───────────────────────────────────────────────
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) img.src = this.defaultImage;
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < full; i++) stars.push('bi-star-fill');
    if ((rating % 1) >= 0.5) stars.push('bi-star-half');
    while (stars.length < 5) stars.push('bi-star');
    return stars;
  }

  getAvailabilityText(status: string): string {
    switch(status) {
      case 'AVAILABLE':   return 'Disponible';
      case 'UNAVAILABLE': return 'Indisponible';
      case 'RESERVED':    return 'Réservé';
      default: return status;
    }
  }

  getAvailabilityClass(status: string): string {
    switch(status) {
      case 'AVAILABLE':   return 'status-available';
      case 'UNAVAILABLE': return 'status-unavailable';
      case 'RESERVED':    return 'status-reserved';
      default: return 'status-unknown';
    }
  }

  // ─── PARTICULES ──────────────────────────────────────────────
  private initParticleCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({length:40}, () => ({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      vx:(Math.random()-0.5)*0.4,   vy:(Math.random()-0.5)*0.4,
      r: Math.random()*2+1,         alpha:Math.random()*0.3+0.05
    }));
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>canvas.width)  p.vx*=-1;
        if (p.y<0||p.y>canvas.height) p.vy*=-1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
      });
      this.animationFrameId = requestAnimationFrame(animate);
    };
    animate();
  }
}