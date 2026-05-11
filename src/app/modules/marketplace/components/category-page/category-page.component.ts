// src/app/modules/marketplace/components/category-page/category-page.component.ts
// Page résultat d'une catégorie avec filtres spécifiques

import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineService, Machine } from '../../../../services/machine.service';
import { ServiceService, ServiceEntity } from '../../../../services/service.service';
import { CartService } from '../../../../services/cart.service';



export type ItemType = 'machine' | 'service';

export interface CatItem {
  id: number;
  type: ItemType;
  name: string;
  description: string;
  category: string;
  location: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  availability: string;
  providerName: string;
  transactionType?: string;
  serviceType?: string;
  stockQuantity?: number;
  subCategory?: string;
  businessType?: string;
}

export interface SpecificFilter {
  label: string;
  key: string;
  count: number;
  active: boolean;
}

@Component({
  selector: 'app-category-page',
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe],
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.scss']
})
export class CategoryPageComponent implements OnInit, OnDestroy {

  categoryKey  = '';
  categoryLabel = '';
  searchQuery  = '';
  loading      = false;
  activeTab: 'all' | 'machines' | 'services' = 'all';
  sortBy = 'rating';

  allItems:      CatItem[] = [];
  filteredItems: CatItem[] = [];
  specificFilters: SpecificFilter[] = [];

  // Filtres classiques
  filters = {
    location:    '',
    minPrice:    null as number | null,
    maxPrice:    null as number | null,
    availability: '',
    transactionType: '',
    serviceType:  '',
    businessType: ''
  };

  businessTypeOptions = [
    { value: 'MANUFACTURER',        label: '🏭 Fabricant / Producteur' },
    { value: 'CUSTOM_MANUFACTURER', label: '⚙️ Fabricant spécifique client' },
    { value: 'DISTRIBUTOR',         label: '📦 Distributeur' },
    { value: 'SERVICE_PROVIDER',    label: '🔧 Prestataire de services' },
    { value: 'WHOLESALER',          label: '🏪 Grossiste' }
  ];
headerVisible = true;
  private lastScrollTop = 0;
  // Pagination
  currentPage  = 1;
  itemsPerPage = 12;

  // ─── Config filtres spécifiques par catégorie ────────────────
  private readonly SPECIFIC_FILTERS: Record<string, { label: string; key: string }[]> = {
    INDUSTRIELLE: [
      { label: 'Construction de machines', key: 'machine_construction' },
      { label: 'Métal et produits métalliques', key: 'metal' },
      { label: 'Machines-outils et appareils', key: 'machine_tools' },
      { label: 'Pièces de machine', key: 'parts' },
      { label: 'Électrotechnique', key: 'electrotechnics' },
      { label: 'Robotique et automatisation', key: 'robotics' },
      { label: 'Coulée et moulage', key: 'casting' },
      { label: 'Enlèvement de copeaux', key: 'machining' },
      { label: 'Techniques de brasage', key: 'brazing' },
      { label: 'Réparation et entretien', key: 'maintenance' },
    ],
    AGRICOLE: [
      { label: 'Tracteurs et véhicules', key: 'tractors' },
      { label: 'Matériel de récolte', key: 'harvest' },
      { label: 'Semis et plantation', key: 'seeding' },
      { label: 'Irrigation', key: 'irrigation' },
      { label: 'Protection des cultures', key: 'crop_protection' },
      { label: 'Fertilisation', key: 'fertilization' },
      { label: 'Stockage et silo', key: 'storage' },
      { label: 'Élevage', key: 'livestock' },
      { label: 'Serres', key: 'greenhouses' },
      { label: 'Transport agricole', key: 'agri_transport' },
    ],
    CONSTRUCTION: [
      { label: 'Matériaux de construction', key: 'materials' },
      { label: 'Engins de chantier', key: 'machines' },
      { label: 'Béton et ciment', key: 'concrete' },
      { label: 'Charpente et toiture', key: 'roofing' },
      { label: 'Isolation thermique', key: 'insulation' },
      { label: 'Plomberie et sanitaire', key: 'plumbing' },
      { label: 'Électricité du bâtiment', key: 'electrical' },
      { label: 'Revêtements sols/murs', key: 'coatings' },
      { label: 'Menuiserie', key: 'carpentry' },
      { label: 'Ingénierie et conception', key: 'engineering' },
    ],
    ELECTRONIQUE: [
      { label: 'Composants électroniques', key: 'components' },
      { label: 'Technologie de l\'énergie', key: 'energy' },
      { label: 'Matériel informatique', key: 'hardware' },
      { label: 'Services informatiques', key: 'it_services' },
      { label: 'Logiciel', key: 'software' },
      { label: 'Technique de sécurité', key: 'security' },
      { label: 'Automatisation industrielle', key: 'automation' },
      { label: 'Services de mesure', key: 'measurement' },
      { label: 'Télécommunications', key: 'telecom' },
      { label: 'Énergie renouvelable', key: 'renewable' },
    ],
    MEDICAL: [
      { label: 'Imagerie médicale', key: 'imaging' },
      { label: 'Équipements chirurgicaux', key: 'surgical' },
      { label: 'Diagnostic', key: 'diagnostic' },
      { label: 'Rééducation', key: 'rehabilitation' },
      { label: 'Prothèses et implants', key: 'prosthetics' },
      { label: 'Équipements de laboratoire', key: 'lab' },
      { label: 'Optique médicale', key: 'optics' },
      { label: 'Urgence et soins intensifs', key: 'emergency' },
      { label: 'Stérilisation', key: 'sterilization' },
      { label: 'Santé dentaire', key: 'dental' },
    ],
    BUREAUTIQUE: [
      { label: 'Logiciels professionnels', key: 'software' },
      { label: 'Impression et copie', key: 'printing' },
      { label: 'Mobilier de bureau', key: 'furniture' },
      { label: 'Services informatiques', key: 'it_services' },
      { label: 'Conseil aux entreprises', key: 'consulting' },
      { label: 'Marketing et publicité', key: 'marketing' },
      { label: 'Planification et développement', key: 'planning' },
      { label: 'Archivage et gestion docs', key: 'archiving' },
      { label: 'Ressources humaines', key: 'hr' },
      { label: 'Formation professionnelle', key: 'training' },
    ],
    DOMESTIQUE: [
      { label: 'Nettoyage', key: 'cleaning' },
      { label: 'Électroménager', key: 'appliances' },
      { label: 'Chauffage et climatisation', key: 'hvac' },
      { label: 'Sécurité maison', key: 'home_security' },
      { label: 'Jardinage et extérieur', key: 'gardening' },
      { label: 'Réparation et entretien', key: 'maintenance' },
      { label: 'Décoration intérieure', key: 'decoration' },
      { label: 'Plomberie', key: 'plumbing' },
      { label: 'Loisirs et culture', key: 'leisure' },
      { label: 'Déménagement', key: 'moving' },
    ],
    AUTRE: [
      { label: 'Logistique et transport', key: 'logistics' },
      { label: 'Conteneurs et stockage', key: 'containers' },
      { label: 'Matériel d\'emballage', key: 'packaging' },
      { label: 'Emballage imprimable', key: 'printable' },
      { label: 'Emballage alimentaire', key: 'food_packaging' },
      { label: 'Emballage réutilisable', key: 'reusable' },
      { label: 'Protection UV', key: 'uv_protection' },
      { label: 'Emballage à température contrôlée', key: 'temp_controlled' },
      { label: 'Emballage jetable', key: 'disposable' },
      { label: 'Autorisation matières dangereuses', key: 'hazmat' },
    ],
    ALL: [
      { label: 'Industrielle', key: 'INDUSTRIELLE' },
      { label: 'Agricole', key: 'AGRICOLE' },
      { label: 'Construction', key: 'CONSTRUCTION' },
      { label: 'Électronique', key: 'ELECTRONIQUE' },
      { label: 'Médical', key: 'MEDICAL' },
      { label: 'Bureautique', key: 'BUREAUTIQUE' },
      { label: 'Domestique', key: 'DOMESTIQUE' },
      { label: 'Autre', key: 'AUTRE' },
    ]
  };

  private readonly CAT_LABELS: Record<string, string> = {
    INDUSTRIELLE: 'Industrielle', AGRICOLE: 'Agricole', CONSTRUCTION: 'Construction',
    ELECTRONIQUE: 'Électronique', MEDICAL: 'Médical', BUREAUTIQUE: 'Bureautique',
    DOMESTIQUE: 'Domestique', AUTRE: 'Autre', ALL: 'Tous les produits & services'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService,
    private serviceService: ServiceService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.categoryKey   = (params['key'] || 'ALL').toUpperCase();
      this.categoryLabel = this.CAT_LABELS[this.categoryKey] || this.categoryKey;
      this.route.queryParams.subscribe(qp => {
        this.searchQuery = qp['q'] || '';
        this.loadItems();
        window.addEventListener('scroll', this.onScroll.bind(this));
      });
    });
  }

  ngOnDestroy(): void {
   window.removeEventListener('scroll', this.onScroll.bind(this));
  }

  // ─── Chargement ──────────────────────────────────────────────
  loadItems(): void {
    this.loading = true;
    let done = 0;
    const allM: Machine[]       = [];
    const allS: ServiceEntity[] = [];

    const tryDone = () => {
      if (++done < 2) return;
      this.buildItems(allM, allS);
      this.buildSpecificFilters();
      this.applyAll();
      this.loading = false;
    };

    this.machineService.getAllMachines().subscribe({
      next: d => { allM.push(...d.filter(m => m.validationStatus === 'APPROVED')); tryDone(); },
      error: () => tryDone()
    });
    this.serviceService.getAllServices().subscribe({
      next: d => { allS.push(...d.filter(s => (s as any).validationStatus === 'APPROVED')); tryDone(); },
      error: () => tryDone()
    });
  }

  buildItems(machines: Machine[], services: ServiceEntity[]): void {
    const mFiltered = this.categoryKey === 'ALL'
      ? machines
      : machines.filter(m => m.category === this.categoryKey);

    const sFiltered = this.categoryKey === 'ALL'
      ? services
      : services.filter(s => s.category === this.categoryKey);

    const mItems: CatItem[] = mFiltered.map(m => ({
      id: m.id, type: 'machine' as ItemType,
      name: m.name, description: m.description,
      category: m.category, location: m.location,
      price: m.price, priceUnit: m.priceUnit,
      rating: m.rating || 0, reviewCount: m.reviewCount || 0,
      imageUrl: m.imageUrls?.[0] || '', availability: m.availability,
      providerName: m.supplierName, transactionType: m.transactionType,
      stockQuantity: m.stockQuantity,
      subCategory: (m as any).subCategory || '',
      businessType: (m as any).businessType || ''
    }));

    const sItems: CatItem[] = sFiltered.map(s => ({
      id: s.id, type: 'service' as ItemType,
      name: s.name, description: s.description,
      category: s.category, location: s.location,
      price: s.basePrice, priceUnit: s.priceUnit,
      rating: s.rating || 0, reviewCount: s.reviewCount || 0,
      imageUrl: s.imageUrls?.[0] || '', availability: s.availability,
      providerName: s.providerName, serviceType: s.serviceType,
      subCategory: (s as any).subCategory || '',
      businessType: (s as any).businessType || ''
    }));

    this.allItems = [...mItems, ...sItems];
  }

  buildSpecificFilters(): void {
    const filterDefs = this.SPECIFIC_FILTERS[this.categoryKey] || this.SPECIFIC_FILTERS['ALL'];
    this.specificFilters = filterDefs.map(f => ({
      ...f,
      // Compter les vrais items ayant cette sous-catégorie
      count: this.allItems.filter(i => (i as any).subCategory === f.key).length,
      active: false
    }));
  }

  // ─── Filtrage ────────────────────────────────────────────────
  applyAll(): void {
    let items = [...this.allItems];

    // Recherche texte
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      items = items.filter(it =>
        it.name.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q) ||
        it.location?.toLowerCase().includes(q)
      );
    }

    // Onglet type
    if (this.activeTab === 'machines') items = items.filter(i => i.type === 'machine');
    if (this.activeTab === 'services') items = items.filter(i => i.type === 'service');

    // Filtres classiques
    if (this.filters.location)         items = items.filter(i => i.location?.toLowerCase().includes(this.filters.location.toLowerCase()));
    if (this.filters.minPrice != null) items = items.filter(i => i.price >= this.filters.minPrice!);
    if (this.filters.maxPrice != null) items = items.filter(i => i.price <= this.filters.maxPrice!);
    if (this.filters.availability)     items = items.filter(i => i.availability === this.filters.availability);
    if (this.filters.transactionType)  items = items.filter(i => i.transactionType === this.filters.transactionType);
    if (this.filters.serviceType)      items = items.filter(i => i.serviceType === this.filters.serviceType);

    // Filtre type d'entreprise
    if (this.filters.businessType) {
      items = items.filter(i => (i as any).businessType === this.filters.businessType);
    }

    // Filtres de sous-catégorie (sidebar gauche)
    const activeSubFilters = this.specificFilters.filter(f => f.active).map(f => f.key);
    if (activeSubFilters.length > 0) {
      items = items.filter(i => activeSubFilters.includes((i as any).subCategory));
    }

    // Tri
    if (this.sortBy === 'rating')     items.sort((a, b) => b.rating - a.rating);
    if (this.sortBy === 'price_asc')  items.sort((a, b) => a.price - b.price);
    if (this.sortBy === 'price_desc') items.sort((a, b) => b.price - a.price);
    if (this.sortBy === 'name')       items.sort((a, b) => a.name.localeCompare(b.name));

    this.filteredItems = items;
    this.currentPage = 1;
  }

  toggleSpecificFilter(f: SpecificFilter): void {
    f.active = !f.active;
    // En vraie implémentation, filtrer par sous-type ici
    this.applyAll();
  }

  resetFilters(): void {
    this.filters = { location:'', minPrice:null, maxPrice:null, availability:'', transactionType:'', serviceType:'', businessType:'' };
    this.specificFilters.forEach(f => f.active = false);
    this.searchQuery = '';
    this.applyAll();
  }

  onTabChange(tab: 'all' | 'machines' | 'services'): void {
    this.activeTab = tab;
    this.applyAll();
  }

  onSortChange(): void { this.applyAll(); }

  isFilterActive(): boolean {
    return !!(this.filters.location || this.filters.minPrice || this.filters.maxPrice ||
              this.filters.availability || this.filters.transactionType || this.filters.serviceType ||
              this.specificFilters.some(f => f.active) || this.searchQuery);
  }

  // ─── Pagination ──────────────────────────────────────────────
  get paginatedItems(): CatItem[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredItems.slice(start, start + this.itemsPerPage);
  }
  get totalPages(): number { return Math.ceil(this.filteredItems.length / this.itemsPerPage); }
  getPageNumbers(): number[] {
    const arr: number[] = [];
    let s = Math.max(1, this.currentPage - 2);
    let e = Math.min(this.totalPages, s + 4);
    if (e - s < 4) s = Math.max(1, e - 4);
    for (let i = s; i <= e; i++) arr.push(i);
    return arr;
  }
  onPage(p: number): void { if (p >= 1 && p <= this.totalPages) { this.currentPage = p; window.scrollTo({ top: 0, behavior: 'smooth' }); } }

  // ─── Navigation ──────────────────────────────────────────────
  goToItem(item: CatItem): void {
    if (item.type === 'machine') this.router.navigate(['/machines', item.id]);
    else this.router.navigate(['/services', item.id]);
  }

  goBack(): void { this.router.navigate(['/marketplace']); }

  // ─── Helpers ─────────────────────────────────────────────────
  getStars(r: number): string[] {
    const s: string[] = [];
    const f = Math.floor(r || 0);
    for (let i = 0; i < f; i++) s.push('full');
    if ((r % 1) >= 0.5) s.push('half');
    while (s.length < 5) s.push('empty');
    return s;
  }
  handleImgErr(e: Event): void { (e.target as HTMLImageElement).src = 'assets/images/default-machine.jpg'; }

  get machineCount(): number { return this.filteredItems.filter(i => i.type === 'machine').length; }
  get serviceCount(): number { return this.filteredItems.filter(i => i.type === 'service').length; }
  onScroll(): void {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Cacher quand on descend, montrer quand on remonte
    if (currentScroll > this.lastScrollTop && currentScroll > 100) {
      // Scroll vers le bas - CACHER
      this.headerVisible = false;
    } else {
      // Scroll vers le haut - MONTRER
      this.headerVisible = true;
    }
    
    this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  // ─── PANIER ──────────────────────────────────────────────────
  addToCart(item: CatItem): void {
    if (item.type !== 'machine') {
      alert('Seules les machines peuvent être ajoutées au panier');
      return;
    }
    if (item.availability !== 'AVAILABLE') {
      alert('Machine non disponible');
      return;
    }
    const userId = this.getCurrentUserId();
    this.cartService.addToCart(userId, { itemType: 'MACHINE', itemId: item.id, quantity: 1 }).subscribe({
      next: () => {
        alert(`✅ "${item.name}" ajouté au panier !`);
        this.updateCartCount();
      },
      error: (err: any) => alert('❌ Erreur ajout panier : ' + (err.error || err.message))
    });
  }

  private updateCartCount(): void {
    this.cartService.getCart(this.getCurrentUserId()).subscribe({
      next: cart => {
        localStorage.setItem('cartCount', String(cart?.items?.length || 0));
        // Émettre un événement pour mettre à jour la navbar en temps réel
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: () => {}
    });
  }

  private getCurrentUserId(): number {
    return parseInt(localStorage.getItem('userId') || '1', 10);
  }
}