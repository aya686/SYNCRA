// src/app/modules/marketplace/components/marketplace/marketplace.component.ts
// Page marketplace style Europages : Hero photo + Catégories grille + Tendances

import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MachineService, Machine } from '../../../../services/machine.service';
import { ServiceService, ServiceEntity } from '../../../../services/service.service';



export interface CategoryData {
  key: string;
  label: string;
  description: string;
  image: string;
  machineCount: number;
  serviceCount: number;
  featured?: boolean;
  // Filtres spécifiques à la catégorie
  subFilters: SubFilter[];
}

export interface SubFilter {
  label: string;
  key: string;
  count?: number;
}
@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe],
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss']
})

export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('heroCanvas') heroCanvas!: ElementRef<HTMLCanvasElement>;
  private animId: number | null = null;
  private scrollObs: IntersectionObserver | null = null;

  searchTerm    = '';
  loading       = false;
  allMachines:  Machine[]       = [];
  allServices:  ServiceEntity[] = [];
  categories:   CategoryData[]  = [];
  trendingAll:  (Machine | ServiceEntity)[] = [];

  stats = { machines: 0, services: 0, suppliers: 0, categories: 0 };

  // ─── Filtre type d'entreprise ─────────────────────────────
  selectedBusinessType = '';
  businessTypeOptions = [
    { value: '',                    label: 'Tous les types' },
    { value: 'MANUFACTURER',        label: '🏭 Fabricant / Producteur' },
    { value: 'CUSTOM_MANUFACTURER', label: '⚙️ Fabricant spécifique client' },
    { value: 'DISTRIBUTOR',         label: '📦 Distributeur' },
    { value: 'SERVICE_PROVIDER',    label: '🔧 Prestataire de services' },
    { value: 'WHOLESALER',          label: '🏪 Grossiste' }
  ];

  // ─── Définition des catégories enrichies avec filtres spécifiques ────
  private readonly CAT_CONFIG: Record<string, {
    label: string; image: string;
    subFilters: { label: string; key: string }[];
  }> = {
    INDUSTRIELLE: {
      label: 'Industrielle',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
      subFilters: [
        { label: 'Construction de machines', key: 'machine_construction' },
        { label: 'Machines-outils et appareils', key: 'machine_tools' },
        { label: 'Robotique et automatisation', key: 'robotics' },
        { label: 'Pièces de machine', key: 'parts' },
        { label: 'Électrotechnique', key: 'electrotechnics' },
        { label: 'Coulée et moulage', key: 'casting' },
        { label: 'Enlèvement de copeaux', key: 'machining' },
        { label: 'Techniques de brasage', key: 'brazing' },
      ]
    },
    AGRICOLE: {
      label: 'Agricole',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80',
      subFilters: [
        { label: 'Tracteurs et véhicules', key: 'tractors' },
        { label: 'Matériel de récolte', key: 'harvest' },
        { label: 'Irrigation', key: 'irrigation' },
        { label: 'Protection des cultures', key: 'crop_protection' },
        { label: 'Stockage et silo', key: 'storage' },
        { label: 'Élevage', key: 'livestock' },
        { label: 'Matériel de semis', key: 'seeding' },
        { label: 'Fertilisation', key: 'fertilization' },
      ]
    },
    CONSTRUCTION: {
      label: 'Construction',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
      subFilters: [
        { label: 'Matériaux de construction', key: 'materials' },
        { label: 'Engins de chantier', key: 'machines' },
        { label: 'Outillage', key: 'tools' },
        { label: 'Béton et ciment', key: 'concrete' },
        { label: 'Ingénierie sanitaire', key: 'sanitary' },
        { label: 'Charpente et toiture', key: 'roofing' },
        { label: 'Revêtements', key: 'coatings' },
        { label: 'Isolation', key: 'insulation' },
      ]
    },
    ELECTRONIQUE: {
      label: 'Électronique',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
      subFilters: [
        { label: 'Composants électroniques', key: 'components' },
        { label: 'Technologie de l\'énergie', key: 'energy' },
        { label: 'Matériel informatique', key: 'hardware' },
        { label: 'Services informatiques', key: 'it_services' },
        { label: 'Logiciel', key: 'software' },
        { label: 'Technique de sécurité', key: 'security' },
        { label: 'Automatisation', key: 'automation' },
        { label: 'Mesure et contrôle', key: 'measurement' },
      ]
    },
    MEDICAL: {
      label: 'Médical',
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80',
      subFilters: [
        { label: 'Imagerie médicale', key: 'imaging' },
        { label: 'Équipements chirurgicaux', key: 'surgical' },
        { label: 'Diagnostic', key: 'diagnostic' },
        { label: 'Rééducation', key: 'rehabilitation' },
        { label: 'Prothèses et implants', key: 'prosthetics' },
        { label: 'Laboratoire', key: 'lab' },
        { label: 'Optique médicale', key: 'optics' },
        { label: 'Pharmaceutique', key: 'pharma' },
      ]
    },
    BUREAUTIQUE: {
      label: 'Bureautique',
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600&q=80',
      subFilters: [
        { label: 'Logiciels professionnels', key: 'software' },
        { label: 'Impression et copie', key: 'printing' },
        { label: 'Mobilier de bureau', key: 'furniture' },
        { label: 'Services informatiques', key: 'it_services' },
        { label: 'Conseil', key: 'consulting' },
        { label: 'Marketing et distribution', key: 'marketing' },
        { label: 'Planification et développement', key: 'planning' },
        { label: 'Archivage', key: 'archiving' },
      ]
    },
    DOMESTIQUE: {
      label: 'Domestique',
      image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80',
      subFilters: [
        { label: 'Nettoyage', key: 'cleaning' },
        { label: 'Électroménager', key: 'appliances' },
        { label: 'Chauffage et climatisation', key: 'hvac' },
        { label: 'Sécurité maison', key: 'home_security' },
        { label: 'Jardinage', key: 'gardening' },
        { label: 'Réparation et entretien', key: 'maintenance' },
        { label: 'Décoration', key: 'decoration' },
        { label: 'Loisirs et culture', key: 'leisure' },
      ]
    },
    AUTRE: {
      label: 'Autre',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
      subFilters: [
        { label: 'Logistique et transport', key: 'logistics' },
        { label: 'Conteneurs et stockage', key: 'containers' },
        { label: 'Matériel d\'emballage', key: 'packaging' },
        { label: 'Emballage imprimable', key: 'printable' },
        { label: 'Emballage alimentaire', key: 'food_packaging' },
        { label: 'Emballage réutilisable', key: 'reusable' },
        { label: 'Protection UV', key: 'uv_protection' },
        { label: 'Emballage à température contrôlée', key: 'temp_controlled' },
      ]
    }
  };

  constructor(
    private machineService: MachineService,
    private serviceService: ServiceService,
    private router: Router
  ) {}

  ngOnInit(): void { this.loadData(); }
  ngAfterViewInit(): void { this.initHeroCanvas(); this.initScrollReveal(); }
  ngOnDestroy(): void {
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.scrollObs) this.scrollObs.disconnect();
  }

  // ─── Données ─────────────────────────────────────────────────
  loadData(): void {
    this.loading = true;
    let done = 0;
    const tryDone = () => {
      if (++done === 2) {
        this.buildCategories();
        this.buildTrending();
        this.loading = false;
      }
    };
    this.machineService.getAllMachines().subscribe({
      next: d => {
        this.allMachines = d.filter(m => m.validationStatus === 'APPROVED');
        tryDone();
      },
      error: () => tryDone()
    });
    this.serviceService.getAllServices().subscribe({
      next: d => {
        this.allServices = d.filter(s => (s as any).validationStatus === 'APPROVED');
        tryDone();
      },
      error: () => tryDone()
    });
  }

  get filteredMachines(): Machine[] {
    if (!this.selectedBusinessType) return this.allMachines;
    return this.allMachines.filter(m => (m as any).businessType === this.selectedBusinessType);
  }

  get filteredServices(): ServiceEntity[] {
    if (!this.selectedBusinessType) return this.allServices;
    return this.allServices.filter(s => (s as any).businessType === this.selectedBusinessType);
  }

  onBusinessTypeChange(): void {
    this.buildCategories();
    this.buildTrending();
  }

  buildCategories(): void {
    const keys = Object.keys(this.CAT_CONFIG);
    const machines = this.filteredMachines;
    const services = this.filteredServices;
    this.categories = keys.map((key, i) => {
      const cfg = this.CAT_CONFIG[key];
      const mc  = machines.filter(m => m.category === key).length;
      const sc  = services.filter(s => s.category === key).length;
      return {
        key, label: cfg.label, description: `${mc + sc} offres`,
        image: cfg.image, machineCount: mc, serviceCount: sc,
        featured: i === 0,
        subFilters: cfg.subFilters.map(sf => ({ ...sf, count: 0 }))
      };
    });
    this.stats = {
      machines:   machines.length,
      services:   services.length,
      categories: this.categories.filter(c => c.machineCount + c.serviceCount > 0).length || keys.length,
      suppliers:  new Set([
        ...machines.map(m => m.supplierId),
        ...services.map(s => s.providerId)
      ]).size
    };
  }

  buildTrending(): void {
    const machines = this.filteredMachines;
    const services = this.filteredServices;
    const mTop = [...machines].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);
    const sTop = [...services].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
    this.trendingAll = [...mTop, ...sTop].slice(0, 12);
  }

  // ─── Navigation ──────────────────────────────────────────────
  onSearch(): void {
    if (!this.searchTerm.trim()) return;
    this.router.navigate(['/marketplace/category', 'ALL'], {
      queryParams: { q: this.searchTerm.trim() }
    });
  }

  openCategory(cat: CategoryData): void {
    this.router.navigate(['/marketplace/category', cat.key]);
  }

  openTrendingItem(item: any): void {
    if ('basePrice' in item) this.router.navigate(['/services', item.id]);
    else this.router.navigate(['/machines', item.id]);
  }

  onKeySearch(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.onSearch();
  }

  // ─── Helpers ──────────────────────────────────────────────────
  isMachine(item: any): boolean { return !('basePrice' in item); }
  getTotal(cat: CategoryData): number { return cat.machineCount + cat.serviceCount; }
  getPrice(item: any): number { return 'basePrice' in item ? item.basePrice : item.price; }
  getPriceUnit(item: any): string { return item.priceUnit || 'unité'; }
  getName(item: any): string { return item.name; }
  getImage(item: any): string { return item.imageUrls?.[0] || ''; }
  getLocation(item: any): string { return item.location || ''; }
  getCategory(item: any): string { return item.category || ''; }
  getRating(item: any): number { return item.rating || 0; }

  getStars(r: number): string[] {
    const s: string[] = [];
    const f = Math.floor(r || 0);
    for (let i = 0; i < f; i++) s.push('full');
    if ((r % 1) >= 0.5) s.push('half');
    while (s.length < 5) s.push('empty');
    return s;
  }

  handleImgErr(e: Event): void {
    (e.target as HTMLImageElement).src = 'assets/images/default-machine.jpg';
  }

  get featuredCat(): CategoryData | null {
    return this.categories.find(c => c.featured) || this.categories[0] || null;
  }

  get otherCats(): CategoryData[] {
    return this.categories.filter(c => !c.featured);
  }

  // ─── Canvas hero ─────────────────────────────────────────────
  private initHeroCanvas(): void {
    const canvas = this.heroCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = (canvas.parentElement?.clientHeight || 600);
    };
    resize();
    window.addEventListener('resize', resize);

    const N = 40;
    const pts = Array.from({ length: N }, () => ({
      x:  Math.random() * window.innerWidth,
      y:  Math.random() * 600,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.5
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255,255,255,${0.07 * (1 - d / 100)})`;
          ctx.lineWidth   = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      for (const p of pts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }

  private initScrollReveal(): void {
    this.scrollObs = new IntersectionObserver(
      e => e.forEach(en => { if (en.isIntersecting) en.target.classList.add('visible'); }),
      { threshold: 0.07, rootMargin: '0px 0px -30px 0px' }
    );
    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach(el => this.scrollObs!.observe(el));
    }, 200);
  }
}