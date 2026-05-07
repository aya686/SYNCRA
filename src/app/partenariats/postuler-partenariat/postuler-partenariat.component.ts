import { Component, OnInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DemandePartenariatService } from '../../services/demande-partenariat.service';
import { DemandePartenariat, StatutDemandePartenariat } from '../../models/partenariat.model';

@Component({
  selector: 'app-postuler-partenariat',
  templateUrl: './postuler-partenariat.component.html',
  styleUrls: ['./postuler-partenariat.component.scss'],
  standalone: false
})
export class PostulerPartenariatComponent implements OnInit, AfterViewInit {
  partenariatForm!: FormGroup;
  loading = false;
  error = '';
  showError = false;
  success = false;
  imageUrl = '';
  isDragging = false;
  @ViewChild('errorBanner') errorBanner!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private demandePartenariatService: DemandePartenariatService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.initForm();
    // Initialiser showError à true puis le mettre à false après un délai
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 0);
  }

  ngAfterViewInit(): void {
    // Initialiser la visibilité de la bannière d'erreur
    if (this.errorBanner) {
      this.errorBanner.nativeElement.style.opacity = '0';
    }
  }

  initForm(): void {
    this.partenariatForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nomSociete: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      dateCreationSociete: [''], // Non requis dans le backend
      email: ['', [Validators.required, Validators.email]], // Requis dans le backend
      telephone: [''],
      imageUrl: [''] // Optionnel - ne bloque pas la soumission
    });
  }

  onFileSelected(event: any): void {
    console.log('Fichier sélectionné:', event.target.files);
    const file: File = event.target.files[0];
    if (file) {
      console.log('Traitement du fichier:', file.name, file.size, file.type);
      this.processFile(file);
    } else {
      console.log('Aucun fichier sélectionné');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file: File = event.dataTransfer?.files[0];
    if (file) {
      console.log('Fichier déposé:', file.name, file.size, file.type);
      this.processFile(file);
    }
  }

  processFile(file: File): void {
    console.log('Début du traitement du fichier');
    if (!file.type.startsWith('image/')) {
      this.error = 'Veuillez sélectionner une image valide.';
      console.error('Type de fichier invalide:', file.type);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      console.log('Image convertie en base64, longueur:', e.target.result?.length);
      this.imageUrl = e.target.result;
      this.partenariatForm.patchValue({ imageUrl: this.imageUrl });
      this.error = '';
      console.log('imageUrl mis à jour dans le formulaire');
    };
    reader.onerror = (error) => {
      console.error('Erreur lors de la lecture du fichier:', error);
      this.error = 'Erreur lors de la lecture de l\'image.';
    };
    reader.readAsDataURL(file);
  }

  triggerFileInput(): void {
    console.log('Tentative de déclenchement de l\'input file');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      console.log('Input file trouvé, clic en cours');
      fileInput.click();
    } else {
      console.error('Input file non trouvé');
    }
  }

  onSubmit(): void {
    console.log('Tentative de soumission du formulaire');
    console.log('Formulaire valide:', !this.partenariatForm.invalid);
    console.log('Valeurs du formulaire:', this.partenariatForm.value);
    console.log('Erreurs du formulaire:', this.partenariatForm.errors);
    
    if (this.partenariatForm.invalid) {
      console.log('Formulaire invalide, champs avec erreurs:');
      Object.keys(this.partenariatForm.controls).forEach(key => {
        const control = this.partenariatForm.get(key);
        if (control?.invalid) {
          console.log(`- ${key}:`, control.errors);
        }
      });
      this.error = 'Veuillez remplir tous les champs requis.';
      if (this.errorBanner) {
        this.errorBanner.nativeElement.style.opacity = '1';
      }
      return;
    }

    this.loading = true;
    this.error = '';
    if (this.errorBanner) {
      this.errorBanner.nativeElement.style.opacity = '0';
    }

    const formValue = this.partenariatForm.value;
    const demande: DemandePartenariat = {
      nom: formValue.nom,
      prenom: formValue.prenom,
      nomSociete: formValue.nomSociete,
      description: formValue.description,
      dateCreationSociete: null, // Envoyer null pour éviter les erreurs de désérialisation
      email: formValue.email,
      telephone: formValue.telephone,
      imageUrl: formValue.imageUrl || null,
      statut: StatutDemandePartenariat.EN_ATTENTE,
      userId: 1, // À remplacer par l'ID de l'utilisateur connecté
      dateSoumission: null // Le backend le génère automatiquement
    };

    console.log('Demande à envoyer:', demande);

    this.demandePartenariatService.createDemande(demande).subscribe({
      next: (response) => {
        console.log('Demande créée avec succès:', response);
        this.loading = false;
        this.success = true;
        setTimeout(() => {
          this.router.navigate(['/partenariats/recherche-partenariat']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur lors de la création de la demande:', err);
        this.loading = false;
        this.error = 'Erreur lors de la soumission de la demande de partenariat. Veuillez réessayer.';
        if (this.errorBanner) {
          this.errorBanner.nativeElement.style.opacity = '1';
        }
        console.error('Erreur:', err);
      }
    });
  }

  annuler(): void {
    this.router.navigate(['/']);
  }
}
