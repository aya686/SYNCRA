import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-berry-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="berry-table-container">
      <div class="table-responsive">
        <table class="berry-table">
          <thead>
            <tr>
              <th 
                *ngFor="let col of columns" 
                [style.width]="col.width"
                [class.sortable]="col.sortable"
                (click)="col.sortable && sort(col.key)">
                {{ col.header }}
                <span class="sort-icon" *ngIf="col.sortable">
                  <i class="bi bi-arrow-up" *ngIf="sortColumn === col.key && sortDirection === 'asc'"></i>
                  <i class="bi bi-arrow-down" *ngIf="sortColumn === col.key && sortDirection === 'desc'"></i>
                  <i class="bi bi-arrow-down-up" *ngIf="sortColumn !== col.key"></i>
                </span>
              </th>
              <th *ngIf="actionsTemplate" class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of paginatedData" (click)="rowClick.emit(item)" [class.clickable]="rowClick.observed">
              <td *ngFor="let col of columns">
                <ng-container *ngIf="col.template">
                  <ng-container *ngTemplateOutlet="col.template; context: { $implicit: item, value: getValue(item, col.key), item: item }"></ng-container>
                </ng-container>
                <ng-container *ngIf="!col.template">
                  {{ getValue(item, col.key) }}
                </ng-container>
              </td>
              <td *ngIf="actionsTemplate" class="actions-cell">
                <ng-container *ngTemplateOutlet="actionsTemplate; context: { $implicit: item, item: item }"></ng-container>
              </td>
            </tr>
            <tr *ngIf="data.length === 0">
              <td [attr.colspan]="columns.length + (actionsTemplate ? 1 : 0)" class="empty-state">
                <div class="empty-content">
                  <i class="bi bi-inbox fs-1 text-muted"></i>
                  <p class="text-muted">{{ emptyMessage }}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="table-pagination" *ngIf="pagination && totalPages > 1">
        <div class="pagination-info">
          Affichage {{ startIndex + 1 }} - {{ endIndex }} sur {{ data.length }}
        </div>
        <div class="pagination-controls">
          <button class="btn btn-sm btn-outline" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button 
            *ngFor="let page of visiblePages" 
            class="btn btn-sm"
            [class.btn-primary]="page === currentPage"
            [class.btn-outline]="page !== currentPage"
            (click)="goToPage(page)">
            {{ page }}
          </button>
          <button class="btn btn-sm btn-outline" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .berry-table-container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    
    .table-responsive {
      overflow-x: auto;
    }
    
    .berry-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    
    .berry-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 1rem;
      border-bottom: 2px solid #e2e8f0;
      white-space: nowrap;
    }
    
    .berry-table th.sortable {
      cursor: pointer;
      user-select: none;
    }
    
    .berry-table th.sortable:hover {
      background: #f1f5f9;
    }
    
    .sort-icon {
      margin-left: 0.5rem;
      opacity: 0.5;
    }
    
    .berry-table th.sortable:hover .sort-icon {
      opacity: 1;
    }
    
    .berry-table td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    
    .berry-table tbody tr {
      transition: background 0.2s;
    }
    
    .berry-table tbody tr:hover {
      background: #f8fafc;
    }
    
    .berry-table tbody tr.clickable {
      cursor: pointer;
    }
    
    .actions-col {
      width: 1%;
      text-align: center;
    }
    
    .actions-cell {
      white-space: nowrap;
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }
    
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    
    .table-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    
    .pagination-info {
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .pagination-controls {
      display: flex;
      gap: 0.25rem;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    
    .btn-sm {
      padding: 0.375rem 0.625rem;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background: #3b82f6;
      color: #fff;
      border-color: #3b82f6;
    }
    
    .btn-outline {
      background: #fff;
      color: #64748b;
      border-color: #d1d5db;
    }
    
    .btn-outline:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .table-pagination {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class BerryTableComponent {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() pagination: boolean = true;
  @Input() pageSize: number = 10;
  @Input() emptyMessage: string = 'Aucune donnée disponible';
  @Output() rowClick = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  
  @ContentChild('actions', { static: false }) actionsTemplate?: TemplateRef<any>;
  
  currentPage = 1;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  get totalPages(): number {
    return Math.ceil(this.data.length / this.pageSize);
  }
  
  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }
  
  get endIndex(): number {
    return Math.min(this.startIndex + this.pageSize, this.data.length);
  }
  
  get paginatedData(): any[] {
    let sorted = [...this.data];
    
    if (this.sortColumn) {
      sorted.sort((a, b) => {
        const valA = this.getValue(a, this.sortColumn);
        const valB = this.getValue(b, this.sortColumn);
        
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    if (!this.pagination) return sorted;
    return sorted.slice(this.startIndex, this.endIndex);
  }
  
  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
  
  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageChange.emit(page);
    }
  }
  
  getValue(item: any, key: string): any {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }
}
