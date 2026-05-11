import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CardAction {
  icon: string;
  label: string;
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline-primary' | 'outline-secondary' | 'outline-success' | 'outline-danger' | 'outline-warning';
  action: () => void;
  show: boolean;
}

@Component({
  selector: 'app-berry-card',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="berry-card" [class.archived]="archived">
      <div class="card-header" *ngIf="imageUrl || icon">
        <div class="card-image" *ngIf="imageUrl">
          <img [src]="imageUrl" [alt]="title" />
        </div>
        <div class="card-icon" *ngIf="icon && !imageUrl">
          <i [class]="'bi bi-' + icon"></i>
        </div>
        <span class="badge" [class]="'badge-' + badgeType" *ngIf="badgeText">
          {{ badgeText }}
        </span>
      </div>
      
      <div class="card-body">
        <h5 class="card-title" [title]="title">{{ title }}</h5>
        <p class="card-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        
        <div class="card-content">
          <ng-content select="[cardContent]"></ng-content>
        </div>
        
        <div class="card-stats" *ngIf="stats && stats.length > 0">
          <div class="stat-item" *ngFor="let stat of stats">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
      
      <div class="card-footer" *ngIf="actions && actions.length > 0">
        <button 
          *ngFor="let action of visibleActions"
          class="btn btn-sm"
          [class]="'btn-' + action.type"
          (click)="action.action()"
          [title]="action.label">
          <i [class]="'bi bi-' + action.icon"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .berry-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      overflow: hidden;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    
    .berry-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    
    .berry-card.archived {
      opacity: 0.7;
    }
    
    .card-header {
      position: relative;
      height: 160px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .card-image {
      width: 100%;
      height: 100%;
    }
    
    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .card-icon {
      font-size: 3rem;
      color: rgba(255,255,255,0.9);
    }
    
    .badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .badge-success { background: #10b981; color: #fff; }
    .badge-warning { background: #f59e0b; color: #fff; }
    .badge-danger { background: #ef4444; color: #fff; }
    .badge-secondary { background: #6b7280; color: #fff; }
    .badge-info { background: #3b82f6; color: #fff; }
    
    .card-body {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    
    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 0.25rem;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .card-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0 0 1rem;
    }
    
    .card-content {
      flex: 1;
    }
    
    .card-stats {
      display: flex;
      gap: 1.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .stat-item {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: uppercase;
    }
    
    .card-footer {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.25rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }
    
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
    }
    
    .btn-primary { background: #3b82f6; color: #fff; }
    .btn-primary:hover { background: #2563eb; }
    
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .btn-secondary:hover { background: #d1d5db; }
    
    .btn-success { background: #10b981; color: #fff; }
    .btn-success:hover { background: #059669; }
    
    .btn-danger { background: #ef4444; color: #fff; }
    .btn-danger:hover { background: #dc2626; }
    
    .btn-warning { background: #f59e0b; color: #fff; }
    .btn-warning:hover { background: #d97706; }
  `]
})
export class BerryCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() imageUrl?: string;
  @Input() icon?: string;
  @Input() badgeText?: string;
  @Input() badgeType: 'success' | 'warning' | 'danger' | 'secondary' | 'info' = 'secondary';
  @Input() archived: boolean = false;
  @Input() stats: { value: string | number; label: string }[] = [];
  @Input() actions: CardAction[] = [];
  
  get visibleActions(): CardAction[] {
    return this.actions.filter(a => a.show !== false);
  }
}
