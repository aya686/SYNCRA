import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  link?: string;
  icon?: string;
}

@Component({
  selector: 'app-berry-breadcrumb',
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="berry-breadcrumb" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <li 
          *ngFor="let item of items; let last = last; let first = first"
          class="breadcrumb-item"
          [class.active]="last"
          [class.first]="first">
          
          <a *ngIf="!last && item.link" [routerLink]="item.link" class="breadcrumb-link">
            <i *ngIf="first && item.icon" [class]="'bi bi-' + item.icon"></i>
            <span>{{ item.label }}</span>
          </a>
          
          <span *ngIf="last || !item.link" class="breadcrumb-current">
            <i *ngIf="first && item.icon" [class]="'bi bi-' + item.icon"></i>
            <span>{{ item.label }}</span>
          </span>
          
          <i *ngIf="!last" class="bi bi-chevron-right separator"></i>
        </li>
      </ol>
      
      <div class="breadcrumb-actions" *ngIf="showActions">
        <ng-content select="[breadcrumbActions]"></ng-content>
      </div>
    </nav>
  `,
  styles: [`
    .berry-breadcrumb {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 1.5rem;
    }
    
    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    
    .breadcrumb-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    
    .breadcrumb-link:hover {
      color: #2563eb;
      text-decoration: underline;
    }
    
    .breadcrumb-current {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1f2937;
      font-weight: 600;
    }
    
    .breadcrumb-item i.bi {
      font-size: 1rem;
    }
    
    .separator {
      color: #9ca3af;
      font-size: 0.75rem;
    }
    
    .breadcrumb-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    @media (max-width: 768px) {
      .berry-breadcrumb {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .breadcrumb-list {
        font-size: 0.8125rem;
      }
    }
  `]
})
export class BerryBreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
  @Input() showActions: boolean = false;
}
