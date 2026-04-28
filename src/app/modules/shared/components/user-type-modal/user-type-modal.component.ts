// src/app/modules/shared/components/user-type-modal/user-type-modal.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type UserType = 'etudiant' | 'professionnel' | 'curieux' | 'expert';

@Component({
  selector: 'app-user-type-modal',
  template: `
    <div class="modal-overlay" *ngIf="visible" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon">🧠</div>
          <h3>Quel type de participant êtes-vous ?</h3>
          <p>Aidez notre IA à mieux vous recommander des événements</p>
        </div>
        
        <div class="user-types">
          <div class="user-type-card" 
               [class.selected]="selectedType === 'etudiant'"
               (click)="selectType('etudiant')">
            <div class="card-icon">🎓</div>
            <div class="card-title">Étudiant</div>
            <div class="card-desc">Budget limité, recherche de formations gratuites ou abordables</div>
          </div>
          
          <div class="user-type-card" 
               [class.selected]="selectedType === 'professionnel'"
               (click)="selectType('professionnel')">
            <div class="card-icon">💼</div>
            <div class="card-title">Professionnel</div>
            <div class="card-desc">Budget confortable, cherche des conférences et networking</div>
          </div>
          
          <div class="user-type-card" 
               [class.selected]="selectedType === 'curieux'"
               (click)="selectType('curieux')">
            <div class="card-icon">🔍</div>
            <div class="card-title">Curieux</div>
            <div class="card-desc">Explore tous les sujets, aime découvrir</div>
          </div>
          
          <div class="user-type-card" 
               [class.selected]="selectedType === 'expert'"
               (click)="selectType('expert')">
            <div class="card-icon">🧠</div>
            <div class="card-title">Expert</div>
            <div class="card-desc">Recherche des formations avancées et workshops techniques</div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-confirm" [disabled]="!selectedType" (click)="confirm()">
            Confirmer →
          </button>
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
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease;
    }
    
    .modal-container {
      background: white;
      border-radius: 32px;
      max-width: 800px;
      width: 90%;
      padding: 32px;
      animation: slideUp 0.3s ease;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    .modal-header {
      text-align: center;
      margin-bottom: 32px;
    }
    
    .modal-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .modal-header h3 {
      font-size: 24px;
      font-weight: 700;
      color: #0d1f33;
      margin-bottom: 8px;
    }
    
    .modal-header p {
      color: #607a96;
      font-size: 14px;
    }
    
    .user-types {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .user-type-card {
      padding: 20px;
      border: 2px solid #eaf2fb;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }
    
    .user-type-card:hover {
      border-color: #0a6ebd;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(10,110,189,0.1);
    }
    
    .user-type-card.selected {
      border-color: #0a6ebd;
      background: linear-gradient(135deg, #e8f4fd, #ffffff);
      box-shadow: 0 4px 12px rgba(10,110,189,0.15);
    }
    
    .card-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }
    
    .card-title {
      font-weight: 700;
      font-size: 18px;
      color: #0d1f33;
      margin-bottom: 8px;
    }
    
    .card-desc {
      font-size: 12px;
      color: #607a96;
      line-height: 1.4;
    }
    
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
    }
    
    .btn-skip {
      padding: 12px 24px;
      background: transparent;
      border: 1px solid #eaf2fb;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 500;
      color: #607a96;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-skip:hover {
      background: #f4f8fd;
    }
    
    .btn-confirm {
      padding: 12px 32px;
      background: linear-gradient(135deg, #0a6ebd, #00c2d4);
      border: none;
      border-radius: 40px;
      font-size: 14px;
      font-weight: 600;
      color: white;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-confirm:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(10,110,189,0.3);
    }
    
    .btn-confirm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @media (max-width: 640px) {
      .user-types {
        grid-template-columns: 1fr;
      }
      
      .modal-container {
        padding: 24px;
      }
    }
  `]
})
export class UserTypeModalComponent {
  @Output() typeSelected = new EventEmitter<UserType>();
  @Output() skipped = new EventEmitter<void>();
  
  visible = true;
  selectedType: UserType | null = null;
  
  selectType(type: UserType) {
    this.selectedType = type;
  }
  
  confirm() {
    if (this.selectedType) {
      this.typeSelected.emit(this.selectedType);
      this.visible = false;
    }
  }
  
  skip() {
    this.skipped.emit();
    this.visible = false;
  }
  
  close() {
    this.visible = false;
    this.skipped.emit();
  }
}