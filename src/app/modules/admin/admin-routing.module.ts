// src/app/modules/admin/admin-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminMachinesComponent } from './components/machines/admin-machines/admin-machines.component';
import { AdminServicesComponent } from './components/services/admin-services/admin-services.component';
import { AdminOrdersComponent } from './components/orders/admin-orders/admin-orders.component';
import { AdminRequestsComponent } from './components/requests/admin-requests/admin-requests.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'machines', component: AdminMachinesComponent },
  { path: 'services', component: AdminServicesComponent },
  { path: 'orders', component: AdminOrdersComponent },
  { path: 'requests', component: AdminRequestsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }