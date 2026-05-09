// src/app/modules/reviews/components/review-list/review-list.component.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReviewService, Review } from '../../../../services/review.service';
import { ReviewFormComponent } from '../review-form/review-form.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    ReviewFormComponent
  ],
  templateUrl: './review-list.component.html',
  styleUrls: ['./review-list.component.css']
})
export class ReviewListComponent implements OnInit {
  @Input() machineId: number | null = null;
  @Input() serviceId: number | null = null;
  @Input() entityName: string = '';
  @Input() entityType: 'machine' | 'service' = 'machine';
  
  reviews: Review[] = [];
  averageRating: number = 0;
  loading = false;
  showReviewForm = false;
  
  constructor(private reviewService: ReviewService) {}
  
  ngOnInit(): void {
    this.loadReviews();
    this.loadAverageRating();
  }
  
  loadReviews(): void {
    this.loading = true;
    
    let observable;
    if (this.machineId) {
      observable = this.reviewService.getReviewsByMachine(this.machineId);
    } else if (this.serviceId) {
      observable = this.reviewService.getReviewsByService(this.serviceId);
    } else {
      this.loading = false;
      return;
    }
    
    observable.subscribe({
      next: (data: Review[]) => {
        this.reviews = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement avis', err);
        this.loading = false;
      }
    });
  }
  
  loadAverageRating(): void {
    let observable;
    if (this.machineId) {
      observable = this.reviewService.getAverageRatingForMachine(this.machineId);
    } else if (this.serviceId) {
      observable = this.reviewService.getAverageRatingForService(this.serviceId);
    } else {
      return;
    }
    
    observable.subscribe({
      next: (data: number) => {
        this.averageRating = data;
      },
      error: (err: any) => {
        console.error('Erreur chargement note moyenne', err);
      }
    });
  }
  
  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars: string[] = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('bi-star-fill');
    }
    if (hasHalfStar) {
      stars.push('bi-star-half');
    }
    while (stars.length < 5) {
      stars.push('bi-star');
    }
    return stars;
  }
  
  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-TN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  onReviewAdded(): void {
    this.showReviewForm = false;
    this.loadReviews();
    this.loadAverageRating();
  }
  
  // ✅ Méthode ajoutée
  getCurrentUserId(): number {
    const stored = localStorage.getItem('userId');
    return stored ? parseInt(stored, 10) : 1;
  }
  
  // ✅ Méthode ajoutée
  deleteReview(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      this.reviewService.deleteReview(id).subscribe({
        next: () => {
          alert('Avis supprimé avec succès');
          this.loadReviews();
          this.loadAverageRating();
        },
        error: (err: any) => {
          console.error('Erreur suppression', err);
          alert('Erreur lors de la suppression');
        }
      });
    }
  }
  
  // ✅ Méthode pour gérer l'erreur d'image
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = 'assets/images/default-avatar.png';
    }
  }
  
  getRatingLabel(rating: number): string {
    const labels: { [key: number]: string } = {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bien',
      5: 'Excellent'
    };
    return labels[rating] || '';
  }
}