// src/app/modules/services/services-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceListComponent } from './components/service-list/service-list.component';
import { ServiceDetailComponent } from './components/service-detail/service-detail.component';
import { CreateServiceComponent } from './components/create-service/create-service.component';

const routes: Routes = [
  { path: '', component: ServiceListComponent },
  { path: 'create', component: CreateServiceComponent },
  { path: ':id', component: ServiceDetailComponent },
  { path: 'edit/:id', component: CreateServiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicesRoutingModule { }