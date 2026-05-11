// src/app/modules/resources/components/machine-detail/machine-detail.component.ts
// ✅ NOUVEAU : produits similaires + produits du même fournisseur

import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineService, Machine } from '../../../../services/machine.service';
import { CartService } from '../../../../services/cart.service';
import { ReviewService, Review, CreateReviewRequest } from '../../../../services/review.service';

@Component({
  selector: 'app-machine-detail',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './machine-detail.component.html',
  styleUrls: ['./machine-detail.component.scss']
})
export class MachineDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private animationFrameId: number | null = null;

  machine: Machine | null = null;
  reviews: Review[] = [];
  loading = false;
  selectedImageIndex = 0;
  showContactModal = false;
  showConfirmDelete = false;

  // ✅ NOUVEAU : produits similaires et fournisseur
  similarMachines: Machine[] = [];
  supplierMachines: Machine[] = [];
  loadingSimilar    = false;
  loadingSupplier   = false;

  newRating = 0;
  newComment = '';
  isSubmittingReview = false;

  defaultImage = 'assets/images/default-machine.jpg';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private cartService: CartService,
    private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    // Recharger quand l'id change (navigation entre produits similaires)
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.selectedImageIndex = 0;
        this.loadMachine(id);
        this.loadReviews(id);
      }
    });
  }

  ngAfterViewInit(): void { this.initParticleCanvas(); }

  ngOnDestroy(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }

  // ─── CHARGEMENT ──────────────────────────────────────────────

  loadMachine(id: number): void {
    this.loading = true;
    this.machineService.getMachineById(id).subscribe({
      next: (data: Machine) => {
        this.machine = data;
        this.loading = false;
        // ✅ Charger similaires et fournisseur une fois la machine chargée
        this.loadSimilarMachines(data);
        this.loadSupplierMachines(data);
      },
      error: () => {
        this.loading = false;
        alert('Erreur lors du chargement de la machine');
      }
    });
  }

  loadReviews(id: number): void {
    this.reviewService.getReviewsByMachine(id).subscribe({
      next: (data: Review[]) => { this.reviews = data; },
      error: (err: any) => console.error('Erreur avis', err)
    });
  }

  /**
   * ✅ Produits similaires : même catégorie, même type de transaction,
   * exclure la machine actuelle. Limité à 6 max.
   */
  loadSimilarMachines(current: Machine): void {
    this.loadingSimilar = true;
    this.machineService.getPublicMachines().subscribe({
      next: (all: Machine[]) => {
        this.similarMachines = all
          .filter(m =>
            m.id !== current.id &&
            m.validationStatus === 'APPROVED' &&
            (m.category === current.category || m.type === current.type)
          )
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 6);
        this.loadingSimilar = false;
      },
      error: () => { this.loadingSimilar = false; }
    });
  }

  /**
   * ✅ Autres machines du même fournisseur, exclure la machine actuelle.
   * Limité à 4 max.
   */
  loadSupplierMachines(current: Machine): void {
    this.loadingSupplier = true;
    this.machineService.getMachinesBySupplier(current.supplierId).subscribe({
      next: (all: Machine[]) => {
        this.supplierMachines = all
          .filter(m => m.id !== current.id && m.validationStatus === 'APPROVED')
          .slice(0, 4);
        this.loadingSupplier = false;
      },
      error: () => { this.loadingSupplier = false; }
    });
  }

  // ─── PANIER ──────────────────────────────────────────────────

  addToCart(): void {
    if (!this.machine) return;
    if (this.machine.availability !== 'AVAILABLE') { alert('Machine non disponible'); return; }
    const userId = this.getCurrentUserId();
    this.cartService.addToCart(userId, { itemType: 'MACHINE', itemId: this.machine.id, quantity: 1 }).subscribe({
      next: () => {
        alert(`✅ "${this.machine?.name}" ajouté au panier !`);
        this.updateCartCount();
      },
      error: (err: any) => alert('❌ Erreur ajout panier : ' + (err.error || err.message))
    });
  }

  addSimilarToCart(machine: Machine): void {
    if (machine.availability !== 'AVAILABLE') { alert('Machine non disponible'); return; }
    const userId = this.getCurrentUserId();
    this.cartService.addToCart(userId, { itemType: 'MACHINE', itemId: machine.id, quantity: 1 }).subscribe({
      next: () => {
        alert(`✅ "${machine.name}" ajouté au panier !`);
        this.updateCartCount();
      },
      error: (err: any) => alert('❌ ' + (err.error || err.message))
    });
  }

  private updateCartCount(): void {
    this.cartService.getCart(this.getCurrentUserId()).subscribe({
      next: cart => {
        localStorage.setItem('cartCount', String(cart?.items?.length || 0));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    });
  }

  // ─── NAVIGATION VERS UN PRODUIT SIMILAIRE ────────────────────

  viewMachine(machine: Machine): void {
    this.router.navigate(['/machines', machine.id]);
  }

  // ─── AVIS ─────────────────────────────────────────────────────

  submitReview(): void {
    if (this.newRating === 0) { alert('Veuillez donner une note'); return; }
    if (!this.newComment.trim()) { alert('Veuillez écrire un commentaire'); return; }
    this.isSubmittingReview = true;
    const reviewData: CreateReviewRequest = {
      rating: this.newRating, comment: this.newComment,
      userId: this.getCurrentUserId(),
      userName: localStorage.getItem('userName') || 'Utilisateur',
      machineId: this.machine?.id, serviceId: null
    };
    this.reviewService.createMachineReview(reviewData).subscribe({
      next: () => {
        alert('✅ Merci pour votre avis !');
        this.newRating = 0; this.newComment = '';
        this.isSubmittingReview = false;
        if (this.machine) { this.loadReviews(this.machine.id); this.loadMachine(this.machine.id); }
      },
      error: () => { alert('❌ Erreur envoi avis'); this.isSubmittingReview = false; }
    });
  }

  // ─── ACTIONS PROPRIÉTAIRE ─────────────────────────────────────

  editMachine(): void { this.router.navigate(['/machines/edit', this.machine?.id]); }

  deleteMachine(): void {
    if (!this.machine) return;
    this.machineService.deleteMachine(this.machine.id).subscribe({
      next: () => { alert('Machine supprimée'); this.router.navigate(['/machines']); },
      error: () => alert('Erreur suppression')
    });
  }

  isCurrentUserSupplier(): boolean {
    return this.machine?.supplierId === this.getCurrentUserId();
  }

  // ─── GALERIE ─────────────────────────────────────────────────

  selectImage(index: number): void {
    if (this.machine?.imageUrls && index < this.machine.imageUrls.length)
      this.selectedImageIndex = index;
  }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultImage;
  }

  getMachineImage(m: Machine): string {
    return m.imageUrls?.length ? m.imageUrls[0] : this.defaultImage;
  }

  // ─── HELPERS ─────────────────────────────────────────────────

  isLowStock(m: Machine): boolean {
    return m.stockQuantity != null && m.stockQuantity > 0 && m.stockQuantity <= 3;
  }

  getStars(rating: number): string[] {
    const s: string[] = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < full; i++) s.push('bi-star-fill');
    if ((rating % 1) >= 0.5) s.push('bi-star-half');
    while (s.length < 5) s.push('bi-star');
    return s;
  }

  getAvailabilityText(status: string): string {
    return { 'AVAILABLE': 'Disponible', 'UNAVAILABLE': 'Indisponible', 'RESERVED': 'Réservé' }[status] || status;
  }

  getAvailabilityClass(status: string): string {
    return { 'AVAILABLE': 'bg-success', 'UNAVAILABLE': 'bg-danger', 'RESERVED': 'bg-warning' }[status] || 'bg-secondary';
  }

  getTransactionTypeText(type: string): string {
    return { 'SALE': '💰 À vendre', 'RENT': '🔑 À louer', 'BOTH': '🔄 Vente & Location' }[type] || type;
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-TN', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  getUserInitial(name: string): string { return name?.charAt(0).toUpperCase() || 'U'; }

  getSupplierEmail(name: string | null | undefined): string {
    return name ? name.toLowerCase().replace(/\s/g, '') + '@example.com' : 'contact@fournisseur.com';
  }

  private getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }

  // ─── PARTICULES ──────────────────────────────────────────────

  private initParticleCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    interface Particle { x: number; y: number; vx: number; vy: number; r: number; }
    const N = 65;
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.45,   vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.8,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(10,110,189,${0.09*(1-dist/130)})`;
          ctx.lineWidth = 0.6;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
      for (const p of particles) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(10,110,189,0.3)'; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      this.animationFrameId = requestAnimationFrame(draw);
    };
    draw();
  }
}