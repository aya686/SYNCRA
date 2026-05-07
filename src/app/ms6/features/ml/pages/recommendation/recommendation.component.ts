import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MLService } from '../../../../core/services/ml.service';

@Component({
  selector: 'app-recommendation',
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RecommendationComponent {
  // Simple inputs - only what user needs to enter
  userId = 1;
  searchProductName = '';  // For similar products search
  
  // Results
  recommendations: any = null;
  similarProducts: any = null;
  popularProducts: any = null;
  
  // Loading states
  loadingRecs = false;
  loadingSimilar = false;
  loadingPopular = false;
  
  error = '';
  stats: any = null;

  constructor(private mlService: MLService) {
    this.loadStats();
    this.getPopularProducts();
  }

  loadStats() {
    this.mlService.getMLStats().subscribe({
      next: (data: any) => {
        this.stats = data.recommendation;
      }
    });
  }

  // Get personalized recommendations for a user
  getRecommendations() {
    this.loadingRecs = true;
    this.error = '';
    
    this.mlService.getRecommendationsForUser(this.userId).subscribe({
      next: (data: any) => {
        this.recommendations = data;
        this.loadingRecs = false;
      },
      error: () => {
        this.error = 'Erreur lors de la récupération des recommandations';
        this.loadingRecs = false;
      }
    });
  }

  // Search similar products by product name (auto-finds product ID)
  getSimilarProducts() {
    if (!this.searchProductName.trim()) {
      this.error = 'Veuillez entrer un nom de produit';
      return;
    }
    
    this.loadingSimilar = true;
    this.error = '';
    
    // Use the by-product-name endpoint which searches by name and returns similar products
    this.mlService.getRecommendationsByProductName(this.searchProductName).subscribe({
      next: (data: any) => {
        if (data.productId) {
          // Found product, now get similar products
          this.mlService.getSimilarProducts(data.productId).subscribe({
            next: (similarData: any) => {
              this.similarProducts = similarData;
              this.loadingSimilar = false;
            },
            error: () => {
              this.error = 'Erreur lors de la recherche de produits similaires';
              this.loadingSimilar = false;
            }
          });
        } else {
          this.similarProducts = null;
          this.error = 'Produit non trouvé: ' + this.searchProductName;
          this.loadingSimilar = false;
        }
      },
      error: () => {
        this.error = 'Erreur lors de la recherche du produit';
        this.loadingSimilar = false;
      }
    });
  }

  // Load popular products on init
  getPopularProducts() {
    this.loadingPopular = true;
    this.error = '';
    
    this.mlService.getPopularProducts().subscribe({
      next: (data: any) => {
        this.popularProducts = data;
        this.loadingPopular = false;
      },
      error: () => {
        this.error = 'Erreur lors de la récupération des produits populaires';
        this.loadingPopular = false;
      }
    });
  }
}
