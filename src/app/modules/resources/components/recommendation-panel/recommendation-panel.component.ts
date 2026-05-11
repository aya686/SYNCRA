// src/app/modules/resources/components/recommendation-panel/recommendation-panel.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  RecommendationService,
  RecommendationCriteria,
  ScoredResult
} from '../../../../services/recommandation.service';
import { CartService } from '../../../../services/cart.service';

@Component({
  selector: 'app-recommendation-panel',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DecimalPipe
  ],
  templateUrl: './recommendation-panel.component.html',
  styleUrls: ['./recommendation-panel.component.scss']
})
export class RecommendationPanelComponent implements OnInit {

  // ─── État ──────────────────────────────────────────────────
  results: ScoredResult[] = [];
  loading = false;
  searched = false;
  errorMessage = '';

  // ─── Formulaire de critères ────────────────────────────────
  criteria: RecommendationCriteria = {
    resourceType:          null as 'MACHINE' | 'SERVICE' | null,
    category:              '',
    machineType:           '',
    serviceType:           '',
    transactionType:       '',
    subCategory:           '',
    businessType:          '',
    maxBudget:             null,
    minBudget:             null,
    preferredLocation:     '',
    minRating:             null,
    requiresAvailability:  false,
    requiredQuantity:      null
  };

  resourceTypes = [
    { value: null as 'MACHINE' | 'SERVICE' | null, label: 'Tout (Machines + Services)' },
    { value: 'MACHINE' as 'MACHINE' | 'SERVICE' | null, label: 'Machines uniquement' },
    { value: 'SERVICE' as 'MACHINE' | 'SERVICE' | null, label: 'Services uniquement' }
  ];

  // ─── Poids avancés (affiché si l'utilisateur ouvre le panneau) ──
  showWeights = false;
  weights: {
  type: number;
  budget: number;
  location: number;
  rating: number;
  availability: number;
  [key: string]: number;  // ← Index signature pour permettre l'accès dynamique
} = { 
  type: 30, 
  budget: 25, 
  location: 20, 
  rating: 15, 
  availability: 10 
};

  // ─── Options de filtres ────────────────────────────────────


  categories = ['INDUSTRIELLE', 'DOMESTIQUE', 'AGRICOLE', 'ELECTRONIQUE',
                'MEDICAL', 'BUREAUTIQUE', 'CONSTRUCTION', 'AUTRE'];

  machineTypes    = ['EQUIPMENT', 'RAW_MATERIAL', 'PART_ACCESSORY'];
  serviceTypes    = ['FABRICATION', 'REPARATION', 'CONSULTATION', 'LIVRAISON', 'AUTRE'];
  transactionTypes= ['SALE', 'RENT', 'BOTH'];

  businessTypeOptions = [
    { value: 'MANUFACTURER',        label: '🏭 Fabricant / Producteur' },
    { value: 'CUSTOM_MANUFACTURER', label: '⚙️ Fabricant spécifique client' },
    { value: 'DISTRIBUTOR',         label: '📦 Distributeur' },
    { value: 'SERVICE_PROVIDER',    label: '🔧 Prestataire de services' },
    { value: 'WHOLESALER',          label: '🏪 Grossiste' }
  ];

  private readonly SUB_CATEGORIES: Record<string, { label: string; key: string }[]> = {
    INDUSTRIELLE: [
      { label: 'Construction de machines',     key: 'machine_construction' },
      { label: 'Machines-outils et appareils', key: 'machine_tools' },
      { label: 'Robotique et automatisation',  key: 'robotics' },
      { label: 'Pièces de machine',            key: 'parts' },
      { label: 'Électrotechnique',             key: 'electrotechnics' },
      { label: 'Coulée et moulage',            key: 'casting' },
      { label: 'Enlèvement de copeaux',        key: 'machining' },
      { label: 'Réparation et entretien',      key: 'maintenance' },
    ],
    AGRICOLE: [
      { label: 'Tracteurs et véhicules',  key: 'tractors' },
      { label: 'Matériel de récolte',     key: 'harvest' },
      { label: 'Irrigation',              key: 'irrigation' },
      { label: 'Protection des cultures', key: 'crop_protection' },
      { label: 'Stockage et silo',        key: 'storage' },
      { label: 'Élevage',                 key: 'livestock' },
      { label: 'Matériel de semis',       key: 'seeding' },
      { label: 'Fertilisation',           key: 'fertilization' },
    ],
    CONSTRUCTION: [
      { label: 'Matériaux de construction', key: 'materials' },
      { label: 'Engins de chantier',        key: 'machines' },
      { label: 'Béton et ciment',           key: 'concrete' },
      { label: 'Charpente et toiture',      key: 'roofing' },
      { label: 'Isolation thermique',       key: 'insulation' },
      { label: 'Plomberie et sanitaire',    key: 'plumbing' },
      { label: 'Revêtements sols/murs',     key: 'coatings' },
      { label: 'Menuiserie',               key: 'carpentry' },
    ],
    ELECTRONIQUE: [
      { label: 'Composants électroniques',    key: 'components' },
      { label: "Technologie de l'énergie",   key: 'energy' },
      { label: 'Matériel informatique',       key: 'hardware' },
      { label: 'Services informatiques',      key: 'it_services' },
      { label: 'Automatisation industrielle', key: 'automation' },
      { label: 'Télécommunications',          key: 'telecom' },
      { label: 'Technique de sécurité',       key: 'security' },
      { label: 'Logiciel',                    key: 'software' },
    ],
    MEDICAL: [
      { label: 'Imagerie médicale',          key: 'imaging' },
      { label: 'Équipements chirurgicaux',   key: 'surgical' },
      { label: 'Diagnostic',                 key: 'diagnostic' },
      { label: 'Rééducation',                key: 'rehabilitation' },
      { label: 'Équipements de laboratoire', key: 'lab' },
      { label: 'Stérilisation',              key: 'sterilization' },
    ],
    BUREAUTIQUE: [
      { label: 'Logiciels professionnels', key: 'software' },
      { label: 'Impression et copie',      key: 'printing' },
      { label: 'Mobilier de bureau',       key: 'furniture' },
      { label: 'Conseil aux entreprises',  key: 'consulting' },
      { label: 'Formation professionnelle',key: 'training' },
    ],
    DOMESTIQUE: [
      { label: 'Nettoyage',                  key: 'cleaning' },
      { label: 'Électroménager',             key: 'appliances' },
      { label: 'Chauffage et climatisation', key: 'hvac' },
      { label: 'Sécurité maison',            key: 'home_security' },
      { label: 'Jardinage et extérieur',     key: 'gardening' },
    ],
    AUTRE: [
      { label: 'Logistique et transport', key: 'logistics' },
      { label: "Matériel d'emballage",    key: 'packaging' },
      { label: 'Emballage alimentaire',   key: 'food_packaging' },
      { label: 'Transport réfrigéré',     key: 'temp_controlled' },
    ],
  };

  get currentSubCategories(): { label: string; key: string }[] {
    return this.SUB_CATEGORIES[this.criteria.category || ''] || [];
  }

  tunisianCities = [
    'Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana',
    'Ben Arous', 'Monastir', 'Kairouan', 'Gafsa', 'Jendouba',
    'Gabès', 'Mahdia', 'Kélibia', 'Hammamet', 'La Marsa'
  ];

  ratingOptions = [
    { value: null, label: 'Toutes les notes' },
    { value: 4.5,  label: '⭐ 4.5+ (Excellent)' },
    { value: 4.0,  label: '⭐ 4.0+ (Très bien)' },
    { value: 3.5,  label: '⭐ 3.5+ (Bien)' },
    { value: 3.0,  label: '⭐ 3.0+ (Correct)' }
  ];

  // ─── Tri et filtrage des résultats ─────────────────────────
  sortBy: 'score' | 'price_asc' | 'price_desc' | 'rating' = 'score';
  filterLevel: '' | 'TOP' | 'GOOD' | 'AVERAGE' = '';

  constructor(
    private recommendationService: RecommendationService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  // ─── RECHERCHE ─────────────────────────────────────────────

  search(): void {
    this.loading = true;
    this.searched = true;
    this.errorMessage = '';

    const payload: RecommendationCriteria = {
      ...this.criteria,
      weightType:         this.showWeights ? this.weights.type         : undefined,
      weightBudget:       this.showWeights ? this.weights.budget       : undefined,
      weightLocation:     this.showWeights ? this.weights.location     : undefined,
      weightRating:       this.showWeights ? this.weights.rating       : undefined,
      weightAvailability: this.showWeights ? this.weights.availability : undefined
    };

    // Nettoyer les valeurs vides
    if (!payload.category)         delete payload.category;
    if (!payload.machineType)      delete payload.machineType;
    if (!payload.serviceType)      delete payload.serviceType;
    if (!payload.transactionType)  delete payload.transactionType;
    if (!payload.preferredLocation)delete payload.preferredLocation;

    this.recommendationService.getRecommendations(payload).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du calcul des recommandations';
        this.loading = false;
        console.error(err);
      }
    });
  }

  reset(): void {
    this.criteria = {
      resourceType: null, category: '', machineType: '',
      serviceType: '', transactionType: '',
      subCategory: '', businessType: '',
      maxBudget: null, minBudget: null,
      preferredLocation: '', minRating: null,
      requiresAvailability: false, requiredQuantity: null
    };
    this.weights = { type: 30, budget: 25, location: 20, rating: 15, availability: 10 };
    this.results = [];
    this.searched = false;
    this.filterLevel = '';
    this.sortBy = 'score';
  }

  // ─── RÉSULTATS FILTRÉS/TRIÉS ──────────────────────────────

  get displayedResults(): ScoredResult[] {
    let list = [...this.results];

    if (this.filterLevel) {
      list = list.filter(r => r.recommendationLevel === this.filterLevel);
    }

    switch (this.sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'score':
      default:           list.sort((a, b) => b.totalScore - a.totalScore); break;
    }

    return list;
  }

  // Compteurs par niveau
  countByLevel(level: string): number {
    return this.results.filter(r => r.recommendationLevel === level).length;
  }

  // ─── ACTIONS CARTES ────────────────────────────────────────

  viewDetails(result: ScoredResult): void {
    const route = result.resourceType === 'MACHINE'
      ? ['/machines', result.id]
      : ['/services', result.id];
    this.router.navigate(route);
  }

  addToCart(result: ScoredResult): void {
    if (result.resourceType !== 'MACHINE') return;
    const userId = parseInt(localStorage.getItem('userId') || '1', 10);
    this.cartService.addToCart(userId, {
      itemType: 'MACHINE', itemId: result.id, quantity: 1
    }).subscribe({
      next: () => {
        alert(`✅ "${result.name}" ajouté au panier !`);
        window.dispatchEvent(new Event('cartUpdated'));
      },
      error: () => alert('❌ Erreur lors de l\'ajout au panier')
    });
  }

  makeRequest(result: ScoredResult): void {
    this.router.navigate(['/requests/create'], {
      queryParams: {
        serviceId:    result.resourceType === 'SERVICE' ? result.id : null,
        providerId:   result.supplierId,
        providerName: result.supplierName,
        serviceName:  result.name
      }
    });
  }

  // ─── HELPERS ──────────────────────────────────────────────

  getLevelColor(level: string): string {
    return this.recommendationService.getLevelColor(level);
  }

  getLevelLabel(level: string): string {
    return this.recommendationService.getLevelLabel(level);
  }

  getScoreGradient(score: number): string {
    return this.recommendationService.getScoreGradient(score);
  }

  getScoreBarWidth(score: number): string {
    return Math.min(100, score) + '%';
  }

  getStars(rating: number): string[] {
    const stars: string[] = [];
    const full = Math.floor(rating || 0);
    for (let i = 0; i < full; i++) stars.push('full');
    if ((rating % 1) >= 0.5) stars.push('half');
    while (stars.length < 5) stars.push('empty');
    return stars;
  }

  formatPrice(p: number): string {
    return new Intl.NumberFormat('fr-TN').format(p || 0);
  }

  getAvailabilityText(avail: string): string {
    return this.recommendationService.getAvailabilityText(avail);
  }

  getImage(result: ScoredResult): string {
    return result.imageUrls?.length ? result.imageUrls[0] : 'assets/images/default-machine.jpg';
  }

  handleImageError(e: Event): void {
    (e.target as HTMLImageElement).src = 'assets/images/default-machine.jpg';
  }

  // Poids : le total doit rester proche de 100
  get weightsTotal(): number {
    return this.weights.type + this.weights.budget + this.weights.location
         + this.weights.rating + this.weights.availability;
  }
}