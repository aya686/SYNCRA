// src/app/modules/resources/components/create-machine/create-machine.component.ts
// ✅ Affiche le résultat de modération IA immédiatement après la soumission
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MachineService, Machine } from '../../../../services/machine.service';

@Component({
  selector: 'app-create-machine',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './create-machine.component.html',
  styleUrls: ['./create-machine.component.scss']
})
export class CreateMachineComponent implements OnInit {
  machineForm!: FormGroup;
  isEditMode = false;
  machineId: number | null = null;
  loading = false;
  submitted = false;

  // ✅ Résultat de modération à afficher après soumission
  moderationResult: {
    status: 'AUTO_REJECTED' | 'PENDING' | null;
    message: string | null;
  } = { status: null, message: null };

  categories       = ['INDUSTRIELLE','DOMESTIQUE','AGRICOLE','ELECTRONIQUE','MEDICAL','BUREAUTIQUE','CONSTRUCTION','AUTRE'];
  machineTypes     = ['EQUIPMENT','RAW_MATERIAL','PART_ACCESSORY'];
  transactionTypes = ['SALE','RENT','BOTH'];
  availabilityStatuses = ['AVAILABLE','UNAVAILABLE','RESERVED'];
  priceUnits       = ['unité','heure','jour','mois','kg','mètre','lot'];

  businessTypes = [
    { value: 'MANUFACTURER',        label: 'Fabricant / Producteur' },
    { value: 'CUSTOM_MANUFACTURER', label: 'Fabricant spécifique au client' },
    { value: 'DISTRIBUTOR',         label: 'Distributeur' },
    { value: 'SERVICE_PROVIDER',    label: 'Prestataire de services' },
    { value: 'WHOLESALER',          label: 'Grossiste' }
  ];
  private readonly SUB_CATEGORIES: Record<string, { label: string; key: string }[]> = {
    INDUSTRIELLE: [
      { label: 'Construction de machines', key: 'machine_construction' },
      { label: 'Machines-outils et appareils', key: 'machine_tools' },
      { label: 'Robotique et automatisation', key: 'robotics' },
      { label: 'Pièces de machine', key: 'parts' },
      { label: 'Électrotechnique', key: 'electrotechnics' },
      { label: 'Coulée et moulage', key: 'casting' },
      { label: 'Enlèvement de copeaux', key: 'machining' },
      { label: 'Réparation et entretien', key: 'maintenance' },
    ],
    AGRICOLE: [
      { label: 'Tracteurs et véhicules', key: 'tractors' },
      { label: 'Matériel de récolte', key: 'harvest' },
      { label: 'Irrigation', key: 'irrigation' },
      { label: 'Protection des cultures', key: 'crop_protection' },
      { label: 'Stockage et silo', key: 'storage' },
      { label: 'Élevage', key: 'livestock' },
      { label: 'Matériel de semis', key: 'seeding' },
      { label: 'Fertilisation', key: 'fertilization' },
    ],
    CONSTRUCTION: [
      { label: 'Matériaux de construction', key: 'materials' },
      { label: 'Engins de chantier', key: 'machines' },
      { label: 'Béton et ciment', key: 'concrete' },
      { label: 'Charpente et toiture', key: 'roofing' },
      { label: 'Isolation thermique', key: 'insulation' },
      { label: 'Plomberie et sanitaire', key: 'plumbing' },
      { label: 'Revêtements sols/murs', key: 'coatings' },
      { label: 'Menuiserie', key: 'carpentry' },
    ],
    ELECTRONIQUE: [
      { label: 'Composants électroniques', key: 'components' },
      { label: 'Technologie de l\'énergie', key: 'energy' },
      { label: 'Matériel informatique', key: 'hardware' },
      { label: 'Services informatiques', key: 'it_services' },
      { label: 'Logiciel', key: 'software' },
      { label: 'Technique de sécurité', key: 'security' },
      { label: 'Automatisation industrielle', key: 'automation' },
      { label: 'Télécommunications', key: 'telecom' },
    ],
    MEDICAL: [
      { label: 'Imagerie médicale', key: 'imaging' },
      { label: 'Équipements chirurgicaux', key: 'surgical' },
      { label: 'Diagnostic', key: 'diagnostic' },
      { label: 'Rééducation', key: 'rehabilitation' },
      { label: 'Prothèses et implants', key: 'prosthetics' },
      { label: 'Équipements de laboratoire', key: 'lab' },
      { label: 'Stérilisation', key: 'sterilization' },
      { label: 'Santé dentaire', key: 'dental' },
    ],
    BUREAUTIQUE: [
      { label: 'Logiciels professionnels', key: 'software' },
      { label: 'Impression et copie', key: 'printing' },
      { label: 'Mobilier de bureau', key: 'furniture' },
      { label: 'Conseil aux entreprises', key: 'consulting' },
      { label: 'Marketing et publicité', key: 'marketing' },
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
      { label: 'Déménagement', key: 'moving' },
    ],
    AUTRE: [
      { label: 'Logistique et transport', key: 'logistics' },
      { label: 'Conteneurs et stockage', key: 'containers' },
      { label: 'Matériel d\'emballage', key: 'packaging' },
      { label: 'Emballage alimentaire', key: 'food_packaging' },
      { label: 'Emballage réutilisable', key: 'reusable' },
      { label: 'Protection UV', key: 'uv_protection' },
      { label: 'Transport réfrigéré', key: 'temp_controlled' },
      { label: 'Matières dangereuses', key: 'hazmat' },
    ],
  };

  get currentSubCategories(): { label: string; key: string }[] {
    const cat = this.machineForm?.get('category')?.value;
    return this.SUB_CATEGORIES[cat] || [];
  }

  imageUrls: string[] = [];
  imageInputValue = '';

  constructor(
    private fb: FormBuilder,
    private machineService: MachineService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.machineId = +params['id'];
        this.loadMachineData();
      }
    });
  }

  initForm(): void {
    this.machineForm = this.fb.group({
      name:           ['', [Validators.required, Validators.minLength(3)]],
      description:    ['', [Validators.required, Validators.minLength(10)]],
      category:       ['INDUSTRIELLE', Validators.required],
      type:           ['EQUIPMENT', Validators.required],
      availability:   ['AVAILABLE', Validators.required],
      transactionType:['SALE', Validators.required],
      price:          [0, [Validators.required, Validators.min(0)]],
      priceUnit:      ['unité', Validators.required],
      location:       ['', Validators.required],
      contactInfo:    ['', Validators.required],
      stockQuantity:  [1, [Validators.required, Validators.min(0)]],
      supplierId:     [this.getCurrentUserId(), Validators.required],
      supplierName:   [this.getCurrentUserName(), Validators.required],
      isInApp:        [true],
      subCategory:    [''],
      businessType:   ['', Validators.required]
    });

    // Réinitialiser sous-catégorie quand la catégorie change
    this.machineForm.get('category')?.valueChanges.subscribe(() => {
      this.machineForm.get('subCategory')?.setValue('');
    });
  }

  loadMachineData(): void {
    if (!this.machineId) return;
    this.loading = true;
    this.machineService.getMachineById(this.machineId).subscribe({
      next: (machine: Machine) => {
        this.machineForm.patchValue({
          name: machine.name, description: machine.description,
          category: machine.category, type: machine.type,
          availability: machine.availability, transactionType: machine.transactionType,
          price: machine.price, priceUnit: machine.priceUnit,
          location: machine.location, contactInfo: machine.contactInfo,
          stockQuantity: machine.stockQuantity,
          supplierId: machine.supplierId, supplierName: machine.supplierName,
          isInApp: machine.isInApp,
          subCategory: (machine as any).subCategory || '',
          businessType: (machine as any).businessType || ''
        });
        this.imageUrls = machine.imageUrls || [];
        this.loading = false;
      },
      error: () => { this.loading = false; alert('Erreur lors du chargement'); }
    });
  }

  addImage(): void {
    if (this.imageInputValue?.trim()) {
      const url = this.imageInputValue.trim();
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('assets/')) {
        this.imageUrls.push(url);
        this.imageInputValue = '';
      } else {
        alert('Veuillez entrer une URL valide');
      }
    }
  }

  removeImage(i: number): void { this.imageUrls.splice(i, 1); }

  handleImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/default-machine.jpg';
  }

  onSubmit(): void {
    this.submitted = true;
    this.moderationResult = { status: null, message: null };

    if (this.machineForm.invalid) {
      Object.keys(this.machineForm.controls).forEach(k => this.machineForm.get(k)?.markAsTouched());
      return;
    }

    const machineData = {
      ...this.machineForm.value,
      imageUrls: this.imageUrls
    };

    this.loading = true;

    const operation = this.isEditMode && this.machineId
      ? this.machineService.updateMachine(this.machineId, machineData)
      : this.machineService.createMachine(machineData);

    operation.subscribe({
      next: (response: Machine) => {
        this.loading = false;

        // ✅ Vérifier le validationStatus retourné par le backend
        if (response.validationStatus === 'AUTO_REJECTED') {
          // Le ML a rejeté automatiquement
          this.moderationResult = {
            status: 'AUTO_REJECTED',
            message: response.rejectionReason ||
              'Votre machine contient un contenu qui ne respecte pas nos règles de bonne conduite.'
          };
          // Ne pas naviguer — rester sur la page pour montrer le message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Contenu propre → en attente de validation admin
          this.moderationResult = {
            status: 'PENDING',
            message: this.isEditMode
              ? 'Machine modifiée avec succès. Elle est en attente de validation par l\'administrateur.'
              : 'Machine soumise avec succès ! Elle sera visible une fois approuvée par l\'administrateur.'
          };
          setTimeout(() => this.router.navigate(['/machines']), 2500);
        }
      },
      error: (err: any) => {
        console.error('Erreur', err);
        this.loading = false;
        alert('❌ Erreur lors de la soumission');
      }
    });
  }

  onCancel(): void {
    if (this.machineForm.dirty || this.imageUrls.length > 0) {
      if (confirm('Voulez-vous vraiment quitter ?')) this.router.navigate(['/machines']);
    } else {
      this.router.navigate(['/machines']);
    }
  }

  getCurrentUserId(): number  { return parseInt(localStorage.getItem('userId') || '1', 10); }
  getCurrentUserName(): string { return localStorage.getItem('userName') || 'Fournisseur Test'; }

  get f(): { [key: string]: AbstractControl } { return this.machineForm.controls; }
}