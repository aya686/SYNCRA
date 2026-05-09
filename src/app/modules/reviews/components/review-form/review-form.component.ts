// src/app/modules/reviews/components/review-form/review-form.component.ts

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewService, CreateReviewRequest } from '../../../../services/review.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './review-form.component.html',
  styleUrls: ['./review-form.component.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() machineId: number | null = null;
  @Input() serviceId: number | null = null;
  @Input() entityName: string = '';
  @Output() reviewSubmitted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  
  reviewForm!: FormGroup;
  submitting = false;
  selectedRating = 0;
  
  ratingOptions = [
    { value: 5, label: 'Excellent', icon: 'bi-star-fill' },
    { value: 4, label: 'Très bien', icon: 'bi-star-fill' },
    { value: 3, label: 'Bien', icon: 'bi-star-fill' },
    { value: 2, label: 'Moyen', icon: 'bi-star' },
    { value: 1, label: 'Mauvais', icon: 'bi-star' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService
  ) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }
  
  setRating(rating: number): void {
    this.selectedRating = rating;
    this.reviewForm.patchValue({ rating: rating });
    // Marquer le champ comme touché pour afficher/masquer l'erreur
    this.reviewForm.get('rating')?.markAsTouched();
  }
  
  onSubmit(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      
      // Scroll vers le premier champ invalide
      const firstInvalid = document.querySelector('.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    this.submitting = true;
    
    const reviewData: CreateReviewRequest = {
      rating: this.reviewForm.value.rating,
      comment: this.reviewForm.value.comment,
      userId: this.getCurrentUserId(),
      userName: this.getCurrentUserName(),
      machineId: this.machineId,
      serviceId: this.serviceId
    };
    
    let observable;
    if (this.machineId) {
      observable = this.reviewService.createMachineReview(reviewData);
    } else if (this.serviceId) {
      observable = this.reviewService.createServiceReview(reviewData);
    } else {
      this.submitting = false;
      console.error('Ni machineId ni serviceId fourni');
      alert('Erreur: Impossible d\'identifier la ressource à évaluer');
      return;
    }
    
    observable.subscribe({
      next: () => {
        this.submitting = false;
        alert('✅ Votre avis a été publié avec succès !');
        this.reviewSubmitted.emit();
      },
      error: (err: any) => {
        console.error('Erreur publication avis', err);
        this.submitting = false;
        
        let errorMessage = '❌ Erreur lors de la publication de votre avis';
        if (err.status === 401) {
          errorMessage = '❌ Vous devez être connecté pour publier un avis';
        } else if (err.status === 403) {
          errorMessage = '❌ Vous n\'avez pas les droits nécessaires';
        } else if (err.error?.message) {
          errorMessage = `❌ ${err.error.message}`;
        }
        
        alert(errorMessage);
      }
    });
  }
  
  onCancel(): void {
    // Confirmation si le formulaire a été modifié
    if (this.reviewForm.dirty && this.reviewForm.get('comment')?.value) {
      if (confirm('Voulez-vous vraiment annuler ? Les modifications seront perdues.')) {
        this.cancel.emit();
      }
    } else {
      this.cancel.emit();
    }
  }
  
  private getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  
  private getCurrentUserName(): string {
    const stored = localStorage.getItem('userName');
    return stored || 'Utilisateur';
  }
}