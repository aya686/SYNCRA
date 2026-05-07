import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Retour, RemboursementRequest } from '../../livraisons';

@Component({
  selector: 'app-remboursement-dialog',
  template: `
    <h2 mat-dialog-title>Créer un remboursement</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Montant</mat-label>
          <input matInput type="number" formControlName="montant" placeholder="Montant à rembourser">
          <span matSuffix>€</span>
          <mat-error *ngIf="form.get('montant')?.hasError('required')">Montant requis</mat-error>
          <mat-error *ngIf="form.get('montant')?.hasError('min')">Montant doit être positif</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Méthode de remboursement</mat-label>
          <mat-select formControlName="methode">
            <mat-option value="CARTE">Carte bancaire</mat-option>
            <mat-option value="VIREMENT">Virement bancaire</mat-option>
            <mat-option value="AVOIR">Avoir / Crédit</mat-option>
          </mat-select>
          <mat-error *ngIf="form.get('methode')?.hasError('required')">Méthode requise</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="form.value" [disabled]="form.invalid">
        Créer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      min-width: 300px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .full-width {
      width: 100%;
    }
  `],
  standalone: false
})
export class RemboursementDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RemboursementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { retour: Retour }
  ) {
    this.form = this.fb.group({
      montant: ['', [Validators.required, Validators.min(0)]],
      methode: ['', Validators.required]
    });
  }
}
