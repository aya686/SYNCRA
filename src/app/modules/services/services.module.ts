// src/app/modules/services/services.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ServicesRoutingModule } from './services-routing.module';
import { ServiceListComponent } from './components/service-list/service-list.component';
import { ServiceDetailComponent } from './components/service-detail/service-detail.component';
import { CreateServiceComponent } from './components/create-service/create-service.component';
import { ReviewsModule } from '../reviews/reviews.module';

@NgModule({
  declarations: [
    ServiceListComponent,
    ServiceDetailComponent,
    CreateServiceComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ServicesRoutingModule,
      ReviewsModule
  ]
})
export class ServicesModule { }