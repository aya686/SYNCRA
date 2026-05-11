// src/app/modules/loyalty/components/loyalty-dashboard/loyalty-dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoyaltyService, LoyaltyAccount, TopItem } from '../../../../services/loyalty.service';

@Component({
  selector: 'app-loyalty-dashboard',
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe, DatePipe],
  templateUrl: './loyalty-dashboard.component.html',
  styleUrls: ['./loyalty-dashboard.component.scss']
})
export class LoyaltyDashboardComponent implements OnInit {

  // ✅ EXPOSER Math POUR LE TEMPLATE
  Math = Math;

  account: LoyaltyAccount | null = null;
  topMachines: TopItem[] = [];
  topServices: TopItem[] = [];
  loading     = false;
  topLoading  = false;
  errorMsg    = '';

  // Contrôles top
  topLimit    = 10;
  topCategory = '';
  activeTopTab: 'machines' | 'services' = 'machines';

  // Contrôle récompenses
  discountPoints = 100;  // points à utiliser pour réduction
  redeemLoading  = false;

  categories = ['INDUSTRIELLE','DOMESTIQUE','AGRICOLE','ELECTRONIQUE',
                'MEDICAL','BUREAUTIQUE','CONSTRUCTION','AUTRE'];
  limits = [5, 10, 20];

  // Toast
  toastMsg  = '';
  toastType = 'success';
  showToast = false;

  constructor(
    private loyaltyService: LoyaltyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccount();
    this.loadTopMachines();
    this.loadTopServices();
  }

  // ─── COMPTE ────────────────────────────────────────────────
  loadAccount(): void {
    const userId = this.getCurrentUserId();
    this.loading = true;
    this.loyaltyService.getAccount(userId).subscribe({
      next: acc => { this.account = acc; this.loading = false; },
      error: () => {
        // Créer le compte s'il n'existe pas
        this.loyaltyService.initAccount(userId, this.getCurrentUserName()).subscribe({
          next: acc => { this.account = acc; this.loading = false; },
          error: () => { this.errorMsg = 'Impossible de charger le compte fidélité'; this.loading = false; }
        });
      }
    });
  }

  // ─── TOP CLASSEMENTS ──────────────────────────────────────
  loadTopMachines(): void {
    this.topLoading = true;
    this.loyaltyService.getTopMachines(this.topLimit, this.topCategory || undefined).subscribe({
      next: data => { this.topMachines = data; this.topLoading = false; },
      error: ()   => { this.topLoading = false; }
    });
  }

  loadTopServices(): void {
    this.topLoading = true;
    this.loyaltyService.getTopServices(this.topLimit, this.topCategory || undefined).subscribe({
      next: data => { this.topServices = data; this.topLoading = false; },
      error: ()   => { this.topLoading = false; }
    });
  }

  onTopFilterChange(): void {
    this.loadTopMachines();
    this.loadTopServices();
  }

  get activeTopItems(): TopItem[] {
    return this.activeTopTab === 'machines' ? this.topMachines : this.topServices;
  }

  // ─── RÉDEMPTIONS ───────────────────────────────────────────
  redeemDiscount(): void {
    if (!this.account || this.account.points < this.discountPoints) {
      this.toast('Points insuffisants', 'error');
      return;
    }
    if (!confirm(`Utiliser ${this.discountPoints} points pour une réduction de ${Math.floor(this.discountPoints/100)}% ?`)) return;
    this.redeemLoading = true;
    this.loyaltyService.redeemDiscount(this.getCurrentUserId(), this.discountPoints).subscribe({
      next: res => {
        this.redeemLoading = false;
        this.toast(`✅ ${res.discountPercent}% de réduction appliqué !`, 'success');
        this.loadAccount();
      },
      error: err => {
        this.redeemLoading = false;
        this.toast(err.error?.message || 'Erreur', 'error');
      }
    });
  }

  redeemDelivery(): void {
    if (!this.account || this.account.points < 300) {
      this.toast('Il faut au moins 300 points pour la livraison gratuite', 'error');
      return;
    }
    if (!confirm('Utiliser 300 points pour une livraison gratuite ?')) return;
    this.redeemLoading = true;
    this.loyaltyService.redeemFreeDelivery(this.getCurrentUserId()).subscribe({
      next: () => {
        this.redeemLoading = false;
        this.toast('🚚 Livraison gratuite activée !', 'success');
        this.loadAccount();
      },
      error: err => {
        this.redeemLoading = false;
        this.toast(err.error?.message || 'Erreur', 'error');
      }
    });
  }

  redeemPremium(): void {
    if (!this.account || this.account.points < 800) {
      this.toast('Il faut au moins 800 points pour l\'accès premium', 'error');
      return;
    }
    if (!confirm('Utiliser 800 points pour l\'accès premium (30 jours) ?')) return;
    this.redeemLoading = true;
    this.loyaltyService.redeemPremium(this.getCurrentUserId()).subscribe({
      next: () => {
        this.redeemLoading = false;
        this.toast('🎁 Accès premium activé pour 30 jours !', 'success');
        this.loadAccount();
      },
      error: err => {
        this.redeemLoading = false;
        this.toast(err.error?.message || 'Erreur', 'error');
      }
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────
  getTierGradient(tier: string): string { return this.loyaltyService.getTierGradient(tier); }
  getTierEmoji(tier: string): string    { return this.loyaltyService.getTierEmoji(tier); }
  getTxIcon(type: string): string       { return this.loyaltyService.getTxIcon(type); }
  getTxColor(delta: number): string     { return this.loyaltyService.getTxColor(delta); }
  getRankMedal(rank: number): string    { return this.loyaltyService.getRankMedal(rank); }
  formatRev(n: number): string          { return this.loyaltyService.formatRevenue(n); }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  getStars(r: number): string[] {
    const out: string[] = [];
    for (let i = 1; i <= 5; i++) {
      out.push(i <= Math.round(r || 0) ? 'bi-star-fill' : 'bi-star');
    }
    return out;
  }

  handleImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'assets/images/default-machine.jpg';
  }

  viewItem(item: TopItem): void {
    const route = item.resourceType === 'MACHINE' ? `/machines/${item.id}` : `/services/${item.id}`;
    this.router.navigateByUrl(route);
  }

  get discountPreview(): number { return Math.min(15, Math.floor(this.discountPoints / 100)); }

  toast(msg: string, type: string): void {
    this.toastMsg = msg;
    this.toastType = type;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 3500);
  }

  getCurrentUserId(): number  { return parseInt(localStorage.getItem('userId') || '1', 10); }
  getCurrentUserName(): string { return localStorage.getItem('userName') || 'Utilisateur'; }
}