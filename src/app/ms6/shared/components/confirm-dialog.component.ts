import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="modal-content border-0 shadow">
      <div class="modal-header bg-light">
        <h5 class="modal-title fw-semibold">
          <i class="bi bi-question-circle-fill text-primary me-2"></i>
          {{ data.title }}
        </h5>
        <button type="button" class="btn-close" (click)="dialogRef.close()"></button>
      </div>
      <div class="modal-body p-4">
        <p class="mb-0 text-muted">{{ data.message }}</p>
      </div>
      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-outline-secondary" (click)="dialogRef.close()">
          {{ data.cancelText || 'Annuler' }}
        </button>
        <button 
          type="button" 
          class="btn" 
          [class.btn-primary]="!data.confirmColor || data.confirmColor === 'primary'"
          [class.btn-danger]="data.confirmColor === 'warn'"
          [class.btn-secondary]="data.confirmColor === 'accent'"
          (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirmer' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .modal-content {
      border-radius: 0.75rem;
      overflow: hidden;
    }
    
    .modal-header {
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    
    .modal-footer {
      border-top: 1px solid rgba(0,0,0,0.05);
    }
    
    .btn {
      border-radius: 0.5rem;
      padding: 0.5rem 1.25rem;
    }
  `],
  standalone: false
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
