import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface TableColumn {
  name: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'date' | 'currency' | 'status' | 'actions';
}

@Component({
  selector: 'app-data-table',
  template: `
    <div class="table-container">
      <mat-form-field appearance="outline" class="filter-field" *ngIf="enableFilter">
        <mat-label>Rechercher</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="Filtrer...">
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <div class="table-wrapper">
        <table mat-table [dataSource]="dataSource" matSort class="data-table">
          <ng-container *ngFor="let column of columns" [matColumnDef]="column.name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header [disabled]="!column.sortable">
              {{ column.label }}
            </th>
            <td mat-cell *matCellDef="let row">
              <ng-container [ngSwitch]="column.type">
                <span *ngSwitchCase="'date'">{{ row[column.name] | date:'dd/MM/yyyy HH:mm' }}</span>
                <span *ngSwitchCase="'currency'">{{ row[column.name] | currency:'EUR' }}</span>
                <span *ngSwitchCase="'status'" class="status-badge" [class]="'status-' + (row[column.name] | lowercase)">
                  {{ row[column.name] }}
                </span>
                <span *ngSwitchDefault>{{ row[column.name] }}</span>
              </ng-container>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;" (click)="onRowClick(row)"></tr>
        </table>
      </div>

      <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons></mat-paginator>
    </div>
  `,
  styles: [`
    .table-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .filter-field {
      width: 100%;
      max-width: 400px;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .data-table {
      width: 100%;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-actif, .status-active, .status-livre, .status-expedie, .status-termine {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-inactif, .status-suspendu, .status-annule, .status-refuse {
      background: #ffebee;
      color: #c62828;
    }

    .status-enattente, .status-en-attente, .status-pending, .status-en-cours {
      background: #fff3e0;
      color: #ef6c00;
    }

    .mat-mdc-row:hover {
      background: #f5f5f5;
      cursor: pointer;
    }
  `],
  standalone: false
})
export class DataTableComponent<T> implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<T>([]);
  columns: TableColumn[] = [];
  enableFilter = true;

  get displayedColumns(): string[] {
    return this.columns.map(c => c.name);
  }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setData(data: T[]): void {
    this.dataSource.data = data;
  }

  setColumns(columns: TableColumn[]): void {
    this.columns = columns;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  onRowClick(row: T): void {
    // To be implemented by parent
  }
}
