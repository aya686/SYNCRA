// src/app/modules/requests/components/create-request/create-request.component.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { RequestType, CreateServiceRequest, Provider } from '../../../../models/service-request.model';
import { MachineService } from '../../../../services/machine.service';
import { ServiceService } from '../../../../services/service.service';
import { Machine } from '../../../../models/machine.model';
import { ServiceEntity } from '../../../../models/service.model';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.component.html',
  styleUrls: ['./create-request.component.scss']
})
export class CreateRequestComponent implements OnInit {
  requestForm!: FormGroup;
  loading = false;
  submitted = false;
  
  requestTypes = Object.values(RequestType);
  
  // Recherche de fournisseurs
  searchResults: Provider[] = [];
  selectedProvider: Provider | null = null;
  isExternalProvider = false;
  searchTerm = '';
  searching = false;
  
  // Ressources disponibles
  machines: Machine[] = [];
  services: ServiceEntity[] = [];
  selectedResourceType: 'machine' | 'service' = 'service';
  
  // Fichiers joints
  attachments: { file: File; preview: string; name: string }[] = [];
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private requestService: ServiceRequestService,
    private machineService: MachineService,
    private serviceService: ServiceService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
  
  }
  
  initForm(): void {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
      requestType: [RequestType.FABRICATION, Validators.required],
      resourceType: ['service', Validators.required],
      machineServiceId: [null],
      machineServiceName: [''],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(999999)]],
      material: [''],
      deadline: ['', Validators.required],
      specifications: [''],
      budget: [null, [Validators.min(0)]],
      
      // Fournisseur
      providerType: ['internal'], // internal / external
      selectedProviderId: [null],
      externalProviderName: [''],
      externalProviderPhone: [''],
      externalProviderEmail: [''],
      externalProviderCompany: ['']
    });
    
    // Réagir au changement de type de ressource
    this.requestForm.get('resourceType')?.valueChanges.subscribe(() => {
      this.requestForm.patchValue({ machineServiceId: null, machineServiceName: '' });
    });
  }
  
  
  
  searchProviders(): void {
    if (!this.searchTerm || this.searchTerm.length < 2) return;
    
    this.searching = true;
    // Appel API pour chercher des prestataires
    // Simuler une recherche
    setTimeout(() => {
      this.searchResults = [
        { id: 1, name: 'Ahmed Ben Ali', companyName: 'TN-Tech Repair', phone: '+216 98 123 456', email: 'contact@tntech.com', location: 'Nabeul', rating: 4.5, isInApp: true },
        { id: 2, name: 'Sonia Mejri', companyName: 'SOTUMAG SARL', phone: '+216 71 234 567', email: 'info@sotumag.com', location: 'Sousse', rating: 4.2, isInApp: true },
        { id: 3, name: 'Karim Ben Salah', companyName: 'Atelier Mécanique Tunis', phone: '+216 29 876 543', email: 'karim@atelier.tn', location: 'Tunis', rating: 3.8, isInApp: true },
        { id: 4, name: 'Hatem Gharbi', companyName: 'Plastimold', phone: '+216 52 345 678', email: 'hatem@plastimold.com', location: 'Ben Arous', rating: 4.7, isInApp: false }
      ];
      this.searching = false;
    }, 500);
  }
  
  selectProvider(provider: Provider): void {
    this.selectedProvider = provider;
    this.isExternalProvider = !provider.isInApp;
    
    if (provider.isInApp) {
      this.requestForm.patchValue({ 
        selectedProviderId: provider.id,
        providerType: 'internal'
      });
    } else {
      this.requestForm.patchValue({
        providerType: 'external',
        externalProviderName: provider.name,
        externalProviderPhone: provider.phone,
        externalProviderEmail: provider.email,
        externalProviderCompany: provider.companyName
      });
    }
    
    this.searchResults = [];
    this.searchTerm = '';
  }
  
  onResourceSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    
    if (this.requestForm.get('resourceType')?.value === 'machine') {
      const machine = this.machines.find(m => m.id === +value);
      if (machine) {
        this.requestForm.patchValue({ machineServiceName: machine.name });
      }
    } else {
      const service = this.services.find(s => s.id === +value);
      if (service) {
        this.requestForm.patchValue({ machineServiceName: service.name });
      }
    }
  }
  
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert('Fichier trop volumineux (max 10MB)');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.attachments.push({
            file: file,
            preview: e.target?.result as string,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    }
    input.value = '';
  }
  
  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }
  
  onSubmit(): void {
    this.submitted = true;
    
    if (this.requestForm.invalid) {
      Object.keys(this.requestForm.controls).forEach(key => {
        this.requestForm.get(key)?.markAsTouched();
      });
      
      const firstInvalid = document.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    const formValue = this.requestForm.value;
    
    const requestData: CreateServiceRequest = {
      title: formValue.title,
      description: formValue.description,
      requesterId: this.getCurrentUserId(),
      requesterName: this.getCurrentUserName(),
      requesterEmail: this.getCurrentUserEmail(),
      requesterPhone: this.getCurrentUserPhone(),
      targetProviderId: formValue.selectedProviderId,
      isExternalProvider: this.isExternalProvider,
      externalProviderName: formValue.externalProviderName,
      externalProviderPhone: formValue.externalProviderPhone,
      externalProviderEmail: formValue.externalProviderEmail,
      externalProviderCompany: formValue.externalProviderCompany,
      requestType: formValue.requestType,
      machineServiceId: formValue.machineServiceId,
      machineServiceName: formValue.machineServiceName,
      quantity: formValue.quantity,
      material: formValue.material,
      deadline: formValue.deadline,
      specifications: formValue.specifications,
      budget: formValue.budget,
      attachments: this.attachments.map(att => ({
        fileName: att.name,
        fileUrl: att.preview,
        fileType: att.file.type,
        fileSize: att.file.size,
        uploadedAt: new Date()
      }))
    };
    
    this.loading = true;
    
    this.requestService.createRequest(requestData).subscribe({
      next: (response) => {
        this.loading = false;
        alert('✅ Demande envoyée avec succès !');
        this.router.navigate(['/requests', response.id]);
      },
      error: (err) => {
        console.error('Erreur création demande', err);
        this.loading = false;
        alert('❌ Erreur lors de l\'envoi de la demande');
      }
    });
  }
  
  onCancel(): void {
    if (this.requestForm.dirty || this.attachments.length > 0) {
      if (confirm('Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ?')) {
        this.router.navigate(['/requests']);
      }
    } else {
      this.router.navigate(['/requests']);
    }
  }
  
  getRequestTypeLabel(type: RequestType): string {
    switch(type) {
      case RequestType.FABRICATION: return 'Fabrication';
      case RequestType.SERVICE: return 'Service';
      case RequestType.MACHINE_RENT: return 'Location de machine';
      case RequestType.MACHINE_PURCHASE: return 'Achat de machine';
      case RequestType.REPARATION: return 'Réparation';
      case RequestType.CONSULTATION: return 'Consultation';
      default: return type;
    }
  }
  
  
  private getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  
 // Ajoutez ces méthodes si elles n'existent pas

getCurrentUserName(): string {
  const stored = localStorage.getItem('userName');
  return stored || 'Utilisateur Test';
}

getCurrentUserEmail(): string {
  const stored = localStorage.getItem('userEmail');
  return stored || 'user@test.com';
}

getCurrentUserPhone(): string {
  const stored = localStorage.getItem('userPhone');
  return stored || '+216 XX XXX XXX';
}
  get f(): { [key: string]: AbstractControl } {
    return this.requestForm.controls;
  }
  
}