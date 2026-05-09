import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Promotion } from '../models/promotion.model';
import { Produit } from '../../produits/models/produit.model';

@Component({
  selector: 'app-apply-promotion-dialog',
  template: `
    <h2 mat-dialog-title>Appliquer la promotion</h2>
    <mat-dialog-content>
      <p>Sélectionnez un produit pour appliquer cette promotion:</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Produit</mat-label>
        <mat-select [(value)]="selectedProduitId">
          <mat-option *ngFor="let produit of data.produits" [value]="produit.produitId">
            {{ produit.nom }} - {{ produit.prix | currency:'EUR' }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="selectedProduitId" [disabled]="!selectedProduitId">
        Appliquer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      min-width: 300px;
    }
  `],
  standalone: false
})
export class ApplyPromotionDialogComponent {
  selectedProduitId?: number;

  constructor(
    public dialogRef: MatDialogRef<ApplyPromotionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { promotion: Promotion; produits: Produit[] }
  ) {}
}
