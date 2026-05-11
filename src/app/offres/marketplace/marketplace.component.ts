import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Offre, OffreFilter, StatutOffre } from '../../models/offre.model';
import { Categorie } from '../../models/categorie.model';
import { OffreService } from '../../services/offre.service';
import { CategorieService } from '../../services/categorie.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  imports: [CommonModule, FormsModule],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})
export class MarketplaceComponent implements OnInit {
  offres: Offre[] = [];
  categories: Categorie[] = [];
  loading = false;
  error = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalItems = 0;
  paginatedOffres: Offre[] = [];

  // Filtres
  filter: OffreFilter = {};
  searchText = '';
  selectedCategorie: number | null = null;
  budgetMin: number | null = null;
  budgetMax: number | null = null;

  // Utilisateur connecté (simulé)
  currentUserId = 1;
  isFreelance = true;

  // Share menu state
  showShareMenu: number | null = null;

  constructor(
    private offreService: OffreService,
    private categorieService: CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadActiveOffres();
  }

  loadCategories(): void {
    this.categorieService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => console.error('Erreur chargement catégories:', err)
    });
  }

  loadActiveOffres(): void {
    this.loading = true;
    this.error = '';

    this.offreService.getAllOffres().subscribe({
      next: (data) => {
        this.offres = data.filter(o => o.statut === 'ACTIVE');
        this.totalItems = this.offres.length;
        this.updatePaginatedOffres();
        this.loading = false;

        if (data.length === 0) {
          this.error = 'Aucune offre trouvée.';
        }
      },
      error: (err) => {
        console.error('Erreur chargement offres:', err);
        this.error = 'Erreur lors du chargement des offres';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.error = '';
    this.currentPage = 1;

    this.offreService.getAllOffres().subscribe({
      next: (data) => {
        let filtered = data.filter(o => o.statut === 'ACTIVE');

        if (this.selectedCategorie) {
          filtered = filtered.filter(o => o.categorie?.id === this.selectedCategorie);
        }

        if (this.searchText) {
          const searchLower = this.searchText.toLowerCase();
          filtered = filtered.filter(o =>
            o.titre?.toLowerCase().includes(searchLower) ||
            o.description?.toLowerCase().includes(searchLower)
          );
        }

        if (this.budgetMin) {
          filtered = filtered.filter(o => o.budgetMin >= this.budgetMin);
        }

        if (this.budgetMax) {
          filtered = filtered.filter(o =>
            !o.budgetMax || o.budgetMin <= this.budgetMax
          );
        }

        this.offres = filtered;
        this.totalItems = filtered.length;
        this.updatePaginatedOffres();

        if (filtered.length === 0) {
          this.error = 'Aucune offre ne correspond à vos critères.';
        }
      },
      error: (err) => {
        console.error('Erreur lors du filtrage:', err);
        this.error = 'Erreur lors du chargement des offres';
      }
    });
  }

  resetFilters(): void {
    this.searchText = '';
    this.selectedCategorie = null;
    this.budgetMin = null;
    this.budgetMax = null;
    this.filter = {};
    this.currentPage = 1;
    this.loadActiveOffres();
  }

  updatePaginatedOffres(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOffres = this.offres.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedOffres();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getMaxDisplayedItems(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
  }

  voirDetail(offreId: number | undefined): void {
    if (offreId) {
      this.router.navigate(['/offres/detail', offreId]);
    }
  }

  postuler(offreId: number | undefined): void {
    if (offreId) {
      this.router.navigate(['/candidatures/postuler', offreId]);
    }
  }

  getStatutLabel(statut: StatutOffre | undefined): string {
    return statut ? this.offreService.getStatutLabel(statut) : '';
  }

  getStatutBadgeClass(statut: StatutOffre): string {
    return this.offreService.getStatutBadgeClass(statut);
  }

  formatBudget(budgetMin: number, budgetMax: number | null): string {
    if (budgetMax) {
      return `${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()} TND`;
    }
    return `À partir de ${budgetMin.toLocaleString()} TND`;
  }

  getCategorieNom(offre: Offre): string {
    if (offre.categorie?.nom) return offre.categorie.nom;
    if (offre.categorieNom) return offre.categorieNom;
    return 'Non catégorisé';
  }

  calculerJoursRestants(deadline: string): number {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  toggleShareMenu(offreId: number | undefined): void {
    if (this.showShareMenu === offreId) {
      this.showShareMenu = null;
    } else {
      this.showShareMenu = offreId || null;
    }
  }

  getShareText(offre: Offre): string {
    return `🔥 Nouvelle opportunité !\n\n${offre.titre}\n\n💰 Budget: ${this.formatBudget(offre.budgetMin, offre.budgetMax)}\n📂 Catégorie: ${this.getCategorieNom(offre)}\n\n📅 Deadline: ${offre.deadline ? new Date(offre.deadline).toLocaleDateString('fr-FR') : 'N/A'}\n\nPostulez maintenant sur TAIB Marketplace !`;
  }

  getShareUrl(offreId: number | undefined): string {
    return `http://localhost:4200/offres/detail/${offreId}`;
  }

  shareOnFacebook(offre: Offre): void {
    const shareText = encodeURIComponent(this.getShareText(offre));
    const shareUrl = encodeURIComponent(this.getShareUrl(offre.id));
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    this.showShareMenu = null;
  }

  shareOnInstagram(offre: Offre): void {
    // Copy text to clipboard then redirect to Instagram
    const shareText = this.getShareText(offre);
    const shareUrl = this.getShareUrl(offre.id);
    const fullText = `${shareText}\n\nLien: ${shareUrl}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Texte copié ! Vous allez être redirigé vers Instagram. Collez le texte dans votre story ou post.');
      // Redirect to Instagram
      window.open('https://www.instagram.com/', '_blank');
    }).catch(() => {
      // If clipboard fails, still redirect to Instagram
      alert('Vous allez être redirigé vers Instagram. Copiez manuellement ce texte:\n\n' + fullText);
      window.open('https://www.instagram.com/', '_blank');
    });
    this.showShareMenu = null;
  }

  shareOnWhatsApp(offre: Offre): void {
    const shareText = encodeURIComponent(this.getShareText(offre));
    const shareUrl = encodeURIComponent(this.getShareUrl(offre.id));
    const whatsappUrl = `https://wa.me/?text=${shareText}%0A%0ALien:%20${shareUrl}`;
    window.open(whatsappUrl, '_blank');
    this.showShareMenu = null;
  }

  shareOnMessenger(offre: Offre): void {
    const shareText = encodeURIComponent(this.getShareText(offre));
    const shareUrl = encodeURIComponent(this.getShareUrl(offre.id));
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${shareUrl}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`;
    window.open(messengerUrl, '_blank', 'width=600,height=400');
    this.showShareMenu = null;
  }
}
