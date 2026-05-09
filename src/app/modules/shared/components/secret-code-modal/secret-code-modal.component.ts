// src/app/modules/shared/components/secret-code-modal/secret-code-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-secret-code-modal',
    template: `
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-icon">🔐</div>
        <h3>Code secret requis</h3>
        <p>Cette session est protégée. Veuillez entrer le code secret pour démarrer le live.</p>
        <input 
          type="password" 
          [(ngModel)]="secretCode" 
          placeholder="Entrez le code secret"
          (keyup.enter)="validate()"
          autofocus
        >
        <div class="modal-actions">
          <button class="btn-cancel" (click)="cancel()">Annuler</button>
          <button class="btn-confirm" (click)="validate()">Valider</button>
        </div>
        <div *ngIf="errorMessage" class="error-message">
          ❌ {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.8);
      z-index: 3000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-content {
      background: var(--surface);
      border-radius: 24px;
      padding: 32px;
      width: 400px;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    }
    .modal-icon { font-size: 48px; margin-bottom: 16px; }
    h3 { margin-bottom: 12px; color: var(--text); }
    p { margin-bottom: 24px; color: var(--text-muted); font-size: 14px; }
    input {
      width: 100%;
      padding: 14px;
      border: 2px solid var(--border);
      border-radius: 12px;
      font-size: 16px;
      margin-bottom: 24px;
      background: var(--surface-2);
      color: var(--text);
      text-align: center;
      letter-spacing: 4px;
    }
    .modal-actions {
      display: flex;
      gap: 12px;
    }
    button {
      flex: 1;
      padding: 12px;
      border-radius: 30px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-cancel {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-muted);
    }
    .btn-confirm {
      background: var(--primary);
      border: none;
      color: white;
    }
    .btn-confirm:hover { transform: translateY(-2px); }
    .error-message {
      margin-top: 16px;
      color: #e74c3c;
      font-size: 13px;
    }
  `],
    standalone: false
})
export class SecretCodeModalComponent {
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  
  secretCode: string = '';
  errorMessage: string = '';
  
  private readonly SECRET_CODE = 'ADMIN123';  // ← Code secret (à changer)
  
  validate() {
    if (this.secretCode === this.SECRET_CODE) {
      this.onSuccess.emit();
    } else {
      this.errorMessage = 'Code secret incorrect';
      this.secretCode = '';
    }
  }
  
  cancel() {
    this.onCancel.emit();
  }
}