// src/app/modules/cart/components/cart/cart.component.ts
// ✅ BUG CORRIGÉ : confirmCheckout() traite correctement la réponse JSON
// ✅ NOUVEAU : champ code promo avec validation avant checkout

import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  CartService, Cart, CartItem, DeliveryInfo,
  PromoValidation, CheckoutResult
} from '../../../../services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy, AfterViewInit {

  cart: Cart | null = null;
  loading          = false;
  errorMessage     = '';
  showCheckoutModal = false;
  checkoutLoading  = false;

  // ✅ NOUVEAU : gestion code promo
  promoCode        = '';
  promoValidation: PromoValidation | null = null;
  promoLoading     = false;
  appliedPromo: PromoValidation | null = null;  // code validé et retenu

  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  private cartUpdateListener: (() => void) | null = null;

  deliveryInfo: DeliveryInfo = { address: '', city: '', zipCode: '', phone: '' };

  private ctx!: CanvasRenderingContext2D;
  private animationId = 0;
  private particles: any[] = [];

  constructor(
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.ensureUserId();
    this.loadCart();
    this.cartUpdateListener = () => this.loadCart();
    window.addEventListener('cartUpdated', this.cartUpdateListener);
  }

  ngOnDestroy(): void {
    if (this.cartUpdateListener)
      window.removeEventListener('cartUpdated', this.cartUpdateListener);
    cancelAnimationFrame(this.animationId);
  }

  ngAfterViewInit(): void { this.initParticles(); }

  private ensureUserId(): void {
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', '1');
      localStorage.setItem('userName', 'Utilisateur Test');
    }
  }

  getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }

  loadCart(): void {
    this.loading = true;
    this.errorMessage = '';
    const userId = this.getCurrentUserId();

    this.cartService.getCart(userId).subscribe({
      next: (data: any) => {
        this.cart = {
          id: data.id, userId: data.userId,
          items: data.items || [],
          deliveryAddress: data.deliveryAddress || '',
          deliveryCity:    data.deliveryCity    || '',
          deliveryZipCode: data.deliveryZipCode || '',
          deliveryPhone:   data.deliveryPhone   || '',
          deliveryCost:    data.deliveryCost    || 0,
          totalAmount:     data.totalAmount     || 0,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        this.loading = false;
        localStorage.setItem('cartCount', String(this.cart?.items?.length || 0));
        if (this.cart?.deliveryAddress) {
          this.deliveryInfo = {
            address: this.cart.deliveryAddress,
            city:    this.cart.deliveryCity,
            zipCode: this.cart.deliveryZipCode,
            phone:   this.cart.deliveryPhone
          };
        }
      },
      error: (err: any) => {
        this.errorMessage = `Erreur ${err.status} — Impossible de charger le panier`;
        this.loading = false;
        if (err.status === 404) {
          this.cart = {
            id: 0, userId,
            items: [], deliveryAddress: '', deliveryCity: '',
            deliveryZipCode: '', deliveryPhone: '',
            deliveryCost: 0, totalAmount: 0,
            createdAt: new Date(), updatedAt: new Date()
          };
        }
      }
    });
  }

  // ─── ACTIONS ARTICLES ────────────────────────────────────────

  handleImageError(e: Event): void {
    (e.target as HTMLImageElement).src = 'assets/images/default-product.jpg';
  }

  updateQuantity(item: CartItem, newQty: number): void {
    if (newQty < 1) { this.removeItem(item); return; }
    this.loading = true;
    this.cartService.updateQuantity(this.getCurrentUserId(), item.id, newQty).subscribe({
      next: (cart: any) => {
        this.cart = cart;
        this.loading = false;
        localStorage.setItem('cartCount', String(cart?.items?.length || 0));
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: (err: any) => {
        this.loading = false;
        alert('Erreur quantité : ' + (err.error || err.message));
      }
    });
  }

  removeItem(item: CartItem): void {
    if (!confirm(`Retirer "${item.itemName}" du panier ?`)) return;
    this.loading = true;
    this.cartService.removeFromCart(this.getCurrentUserId(), item.id).subscribe({
      next: (cart: any) => {
        this.cart = cart;
        this.loading = false;
        localStorage.setItem('cartCount', String(cart?.items?.length || 0));
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: () => { this.loading = false; alert('Erreur suppression'); }
    });
  }

  clearCart(): void {
    if (!confirm('Vider tout le panier ?')) return;
    this.loading = true;
    this.cartService.clearCart(this.getCurrentUserId()).subscribe({
      next: () => {
        localStorage.setItem('cartCount', '0');
        window.dispatchEvent(new Event('cartUpdated'));
        this.loadCart();
      },
      error: () => { this.loading = false; alert('Erreur vidage'); }
    });
  }

  calculateSubtotal(): number {
    if (!this.cart?.items) return 0;
    return this.cart.items.reduce((s, i) => s + (i.totalPrice || i.unitPrice * i.quantity), 0);
  }

  calculateTotal(): number {
  const subtotal = this.calculateSubtotal();
  let deliveryCost = this.cart?.deliveryCost || 0;
  
  // Vérifier le type correctement
  if (this.appliedPromo?.type === 'FREE_DELIVERY') {
    deliveryCost = 0;
  }
  
  let discount = 0;
  if (this.appliedPromo?.type === 'DISCOUNT' && this.appliedPromo.discountPercent) {
    discount = subtotal * this.appliedPromo.discountPercent / 100;
  }
  
  return subtotal - discount + deliveryCost;
}

  getDiscountAmount(): number {
  if (this.appliedPromo?.type === 'DISCOUNT' && this.appliedPromo.discountPercent) {
    return this.calculateSubtotal() * this.appliedPromo.discountPercent / 100;
  }
  return 0;
}

  updateDeliveryInfo(): void {
    if (!this.deliveryInfo.address || !this.deliveryInfo.city || !this.deliveryInfo.phone) {
      alert('Veuillez remplir adresse, ville et téléphone');
      return;
    }
    this.loading = true;
    this.cartService.updateDeliveryInfo(this.getCurrentUserId(), this.deliveryInfo).subscribe({
      next: (cart: any) => { this.cart = cart; this.loading = false; },
      error: () => { this.loading = false; alert('Erreur mise à jour livraison'); }
    });
  }

  // ─── CODE PROMO ──────────────────────────────────────────────

  /** Vérifie le code promo saisi */
  checkPromoCode(): void {
    if (!this.promoCode.trim()) return;
    this.promoLoading    = true;
    this.promoValidation = null;

    this.cartService.applyPromoCode(this.getCurrentUserId(), this.promoCode.trim().toUpperCase()).subscribe({
      next: (result) => {
        this.promoValidation = result;
        this.promoLoading    = false;
        if (result.valid) {
          // Retenir le code validé pour l'affichage et le checkout
          this.appliedPromo = result;
        }
      },
      error: (err) => {
        this.promoLoading    = false;
        this.promoValidation = {
          valid: false,
          message: err.error?.message || 'Erreur lors de la vérification'
        };
      }
    });
  }

  /** Retire le code promo appliqué */
  removePromo(): void {
    this.promoCode       = '';
    this.promoValidation = null;
    this.appliedPromo    = null;
  }

  get promoTypeLabel(): string {
    switch(this.appliedPromo?.type) {
      case 'FREE_DELIVERY': return '🚚 Livraison gratuite';
      case 'DISCOUNT':      return `💸 -${this.appliedPromo.discountPercent}%`;
      case 'PREMIUM':       return '🎁 Accès Premium';
      default: return '';
    }
  }

  // ─── CHECKOUT ────────────────────────────────────────────────

  proceedToCheckout(): void {
    if (!this.deliveryInfo.address || !this.deliveryInfo.city || !this.deliveryInfo.phone) {
      alert('Veuillez remplir les informations de livraison');
      return;
    }
    this.showCheckoutModal = true;
  }

  /**
   * ✅ BUG CORRIGÉ :
   * - Avant : `next()` arrivait en réalité dans `error()` car la réponse
   *   n'était pas du JSON → "[object Object]"
   * - Après : le backend retourne { success, message, orderNumber, pointsEarned }
   *   → HttpClient parse correctement → next() est appelé → navigation correcte
   */
  confirmCheckout(): void {
    this.checkoutLoading = true;
    const userId = this.getCurrentUserId();
    const promo  = this.appliedPromo?.valid ? this.promoCode.trim() : undefined;

    this.cartService.checkout(userId, promo).subscribe({
      next: (result: CheckoutResult) => {
        this.checkoutLoading = false;
        this.showCheckoutModal = false;
        localStorage.setItem('cartCount', '0');
        window.dispatchEvent(new Event('cartUpdated'));

        // Construire le message de succès enrichi
        let msg = `✅ Commande ${result.orderNumber || ''} passée avec succès !\n`;
        if (result.pointsEarned && result.pointsEarned > 0) {
          msg += `⭐ Vous avez gagné ${result.pointsEarned} points de fidélité !`;
        }
        if (this.appliedPromo?.type === 'FREE_DELIVERY') {
          msg += '\n🚚 Livraison gratuite appliquée !';
        } else if (this.appliedPromo?.type === 'DISCOUNT') {
          msg += `\n💸 Réduction de ${this.appliedPromo.discountPercent}% appliquée !`;
        }

        alert(msg);
        this.appliedPromo = null;
        this.promoCode    = '';
        this.router.navigate(['/orders']);
      },
      error: (err: any) => {
        this.checkoutLoading = false;
        // ✅ Désormais err.error est bien un objet JSON { success: false, message: "..." }
        const msg = err.error?.message || err.message || 'Erreur inconnue';
        alert('❌ ' + msg);
      }
    });
  }

  continueShopping(): void { this.router.navigate(['/machines']); }

  getItemTypeLabel(type: string): string {
    return type === 'MACHINE' ? 'Machine' : 'Service';
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
    this.animate();
  }

  buildParticles(w: number, h: number): void {
    const n = Math.min(50, Math.floor(w * 0.05));
    this.particles = Array.from({ length: n }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      ox:Math.random()*w, oy:Math.random()*h,
      r: Math.random()*2+0.5, a: Math.random()*0.25+0.05,
      sx:(Math.random()-0.5)*0.1, sy:(Math.random()-0.5)*0.08
    }));
  }

  animate(): void {
    const canvas = this.particleCanvas?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i+1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const d  = Math.sqrt(dx*dx+dy*dy);
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
      this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      this.ctx.fillStyle = `rgba(10,110,189,${p.a})`;
      this.ctx.fill();
      p.x += p.sx; p.y += p.sy;
      p.x += (p.ox-p.x)*0.003; p.y += (p.oy-p.y)*0.003;
      const cw = canvas.width, ch = canvas.height;
      if (p.x<0) p.x=cw; if (p.x>cw) p.x=0;
      if (p.y<0) p.y=ch; if (p.y>ch) p.y=0;
    }
    this.animationId = requestAnimationFrame(() => this.animate());
  }
}