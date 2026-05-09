import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminMachinesComponent } from './components/machines/admin-machines/admin-machines.component';
import { AdminServicesComponent } from './components/services/admin-services/admin-services.component';
import { AdminOrdersComponent } from './components/orders/admin-orders/admin-orders.component';
import { AdminRequestsComponent } from './components/requests/admin-requests/admin-requests.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AdminRoutingModule,
    NgbModule,
    DashboardComponent,
    AdminMachinesComponent,
    AdminServicesComponent,
    AdminOrdersComponent,
    AdminRequestsComponent
  ]
})
export class AdminModule { }