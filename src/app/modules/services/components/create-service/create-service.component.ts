// src/app/modules/resources/components/create-service/create-service.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceService, CreateServiceRequest, ServiceEntity } from '../../../../services/service.service';

@Component({
  selector: 'app-create-service',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  isEditMode = false;
  serviceId: number | null = null;
  loading = false;
  submitted = false;
  
  categories = ['INDUSTRIELLE', 'DOMESTIQUE', 'AGRICOLE', 'ELECTRONIQUE', 'MEDICAL', 'BUREAUTIQUE', 'CONSTRUCTION', 'AUTRE'];
  serviceTypes = [
    { value: 'FABRICATION', label: 'Fabrication' },
    { value: 'REPARATION', label: 'Réparation' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'LIVRAISON', label: 'Livraison' },
    { value: 'AUTRE', label: 'Autre' }
  ];
  availabilityStatuses = ['AVAILABLE', 'UNAVAILABLE', 'RESERVED'];
  priceUnits = ['heure', 'jour', 'mois', 'unité', 'kg', 'mètre', 'projet', 'forfait'];

  businessTypes = [
    { value: 'MANUFACTURER',        label: 'Fabricant / Producteur' },
    { value: 'CUSTOM_MANUFACTURER', label: 'Fabricant spécifique au client' },
    { value: 'DISTRIBUTOR',         label: 'Distributeur' },
    { value: 'SERVICE_PROVIDER',    label: 'Prestataire de services' },
    { value: 'WHOLESALER',          label: 'Grossiste' }
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
      { label: 'Tracteurs et véhicules',   key: 'tractors' },
      { label: 'Matériel de récolte',      key: 'harvest' },
      { label: 'Irrigation',               key: 'irrigation' },
      { label: 'Protection des cultures',  key: 'crop_protection' },
      { label: 'Stockage et silo',         key: 'storage' },
      { label: 'Élevage',                  key: 'livestock' },
      { label: 'Matériel de semis',        key: 'seeding' },
      { label: 'Fertilisation',            key: 'fertilization' },
    ],
    CONSTRUCTION: [
      { label: 'Matériaux de construction', key: 'materials' },
      { label: 'Engins de chantier',        key: 'machines' },
      { label: 'Béton et ciment',           key: 'concrete' },
      { label: 'Charpente et toiture',      key: 'roofing' },
      { label: 'Isolation thermique',       key: 'insulation' },
      { label: 'Plomberie et sanitaire',    key: 'plumbing' },
      { label: 'Revêtements sols/murs',     key: 'coatings' },
      { label: 'Menuiserie',                key: 'carpentry' },
    ],
    ELECTRONIQUE: [
      { label: 'Composants électroniques',    key: 'components' },
      { label: "Technologie de l'énergie",   key: 'energy' },
      { label: 'Matériel informatique',       key: 'hardware' },
      { label: 'Services informatiques',      key: 'it_services' },
      { label: 'Logiciel',                    key: 'software' },
      { label: 'Technique de sécurité',       key: 'security' },
      { label: 'Automatisation industrielle', key: 'automation' },
      { label: 'Télécommunications',          key: 'telecom' },
    ],
    MEDICAL: [
      { label: 'Imagerie médicale',          key: 'imaging' },
      { label: 'Équipements chirurgicaux',   key: 'surgical' },
      { label: 'Diagnostic',                 key: 'diagnostic' },
      { label: 'Rééducation',                key: 'rehabilitation' },
      { label: 'Prothèses et implants',      key: 'prosthetics' },
      { label: 'Équipements de laboratoire', key: 'lab' },
      { label: 'Stérilisation',              key: 'sterilization' },
      { label: 'Santé dentaire',             key: 'dental' },
    ],
    BUREAUTIQUE: [
      { label: 'Logiciels professionnels',   key: 'software' },
      { label: 'Impression et copie',        key: 'printing' },
      { label: 'Mobilier de bureau',         key: 'furniture' },
      { label: 'Conseil aux entreprises',    key: 'consulting' },
      { label: 'Marketing et publicité',     key: 'marketing' },
      { label: 'Archivage et gestion docs',  key: 'archiving' },
      { label: 'Ressources humaines',        key: 'hr' },
      { label: 'Formation professionnelle',  key: 'training' },
    ],
    DOMESTIQUE: [
      { label: 'Nettoyage',                  key: 'cleaning' },
      { label: 'Électroménager',             key: 'appliances' },
      { label: 'Chauffage et climatisation', key: 'hvac' },
      { label: 'Sécurité maison',            key: 'home_security' },
      { label: 'Jardinage et extérieur',     key: 'gardening' },
      { label: 'Réparation et entretien',    key: 'maintenance' },
      { label: 'Décoration intérieure',      key: 'decoration' },
      { label: 'Déménagement',               key: 'moving' },
    ],
    AUTRE: [
      { label: 'Logistique et transport',    key: 'logistics' },
      { label: 'Conteneurs et stockage',     key: 'containers' },
      { label: "Matériel d'emballage",       key: 'packaging' },
      { label: 'Emballage alimentaire',      key: 'food_packaging' },
      { label: 'Emballage réutilisable',     key: 'reusable' },
      { label: 'Protection UV',              key: 'uv_protection' },
      { label: 'Transport réfrigéré',        key: 'temp_controlled' },
      { label: 'Matières dangereuses',       key: 'hazmat' },
    ],
  };

  get currentSubCategories(): { label: string; key: string }[] {
    const cat = this.serviceForm?.get('category')?.value;
    return this.SUB_CATEGORIES[cat] || [];
  }
  
  imageUrls: string[] = [];
  imageInputValue = '';
  
  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.serviceId = +params['id'];
        this.loadServiceData();
      }
    });
  }
  
  initForm(): void {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      category: ['INDUSTRIELLE', Validators.required],
      serviceType: ['FABRICATION', Validators.required],
      availability: ['AVAILABLE', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      priceUnit: ['heure', Validators.required],
      location: ['', [Validators.required, Validators.minLength(2)]],
      contactInfo: ['', [Validators.required, Validators.pattern(/^[0-9+\s]{8,15}$/)]],
      providerId: [this.getCurrentUserId(), Validators.required],
      providerName: [this.getCurrentUserName(), Validators.required],
      isInApp: [true],
      subCategory:  [''],
      businessType: ['', Validators.required]
    });

    // Réinitialiser sous-catégorie quand la catégorie change
    this.serviceForm.get('category')?.valueChanges.subscribe(() => {
      this.serviceForm.get('subCategory')?.setValue('');
    });
  }
  
  loadServiceData(): void {
    if (!this.serviceId) return;
    
    this.loading = true;
    this.serviceService.getServiceById(this.serviceId).subscribe({
      next: (service: ServiceEntity) => {
        this.serviceForm.patchValue({
          name: service.name,
          description: service.description,
          category: service.category,
          serviceType: service.serviceType,
          availability: service.availability,
          basePrice: service.basePrice,
          priceUnit: service.priceUnit,
          location: service.location,
          contactInfo: service.contactInfo,
          providerId: service.providerId,
          providerName: service.providerName,
          isInApp: service.isInApp,
          subCategory:  (service as any).subCategory  || '',
          businessType: (service as any).businessType || ''
        });
        this.imageUrls = service.imageUrls || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement service', err);
        this.loading = false;
        alert('Erreur lors du chargement des données');
      }
    });
  }
  
  addImage(): void {
    if (this.imageInputValue && this.imageInputValue.trim()) {
      const url = this.imageInputValue.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('assets/')) {
        this.imageUrls.push(url);
        this.imageInputValue = '';
      } else {
        alert('Veuillez entrer une URL valide (commençant par http://, https:// ou assets/)');
      }
    }
  }
  
  removeImage(index: number): void {
    this.imageUrls.splice(index, 1);
  }
  
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-service.jpg';
    }
  }
  
  getServiceTypeLabel(value: string): string {
    const found = this.serviceTypes.find(t => t.value === value);
    return found ? found.label : value;
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.serviceForm.invalid) {
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
      });
      
      const firstInvalid = document.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    const serviceData: CreateServiceRequest = {
      name: this.serviceForm.value.name,
      description: this.serviceForm.value.description,
      category: this.serviceForm.value.category,
      serviceType: this.serviceForm.value.serviceType,
      availability: this.serviceForm.value.availability,
      basePrice: this.serviceForm.value.basePrice,
      priceUnit: this.serviceForm.value.priceUnit,
      location: this.serviceForm.value.location,
      contactInfo: this.serviceForm.value.contactInfo,
      imageUrls: this.imageUrls,
      providerId: this.serviceForm.value.providerId,
      providerName: this.serviceForm.value.providerName,
      isInApp: this.serviceForm.value.isInApp,
      subCategory:  this.serviceForm.value.subCategory  || undefined,
      businessType: this.serviceForm.value.businessType || undefined
    };
    
    this.loading = true;
    
    if (this.isEditMode && this.serviceId) {
      this.serviceService.updateService(this.serviceId, serviceData).subscribe({
        next: () => {
          this.loading = false;
          alert('✅ Service modifié avec succès !');
          this.router.navigate(['/services', this.serviceId]);
        },
        error: (err: any) => {
          console.error('Erreur modification', err);
          this.loading = false;
          alert('❌ Erreur lors de la modification');
        }
      });
    } else {
      this.serviceService.createService(serviceData).subscribe({
        next: (response: ServiceEntity) => {
          this.loading = false;
          alert('✅ Service ajouté avec succès !');
          this.router.navigate(['/services', response.id]);
        },
        error: (err: any) => {
          console.error('Erreur création', err);
          this.loading = false;
          alert('❌ Erreur lors de la création');
        }
      });
    }
  }
  
  onCancel(): void {
    if (this.serviceForm.dirty || this.imageUrls.length > 0) {
      if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?')) {
        this.router.navigate(['/services']);
      }
    } else {
      this.router.navigate(['/services']);
    }
  }
  
  getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  
   getCurrentUserName(): string {
    const stored = localStorage.getItem('userName');
    return stored || 'Prestataire Test';
  }
  
  get f(): { [key: string]: AbstractControl } {
    return this.serviceForm.controls;
  }
  
}