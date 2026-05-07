// src/app/modules/requests/requests.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { RequestsRoutingModule } from './requests-routing.module';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { CreateRequestComponent } from './components/create-request/create-request.component';

@NgModule({
  declarations: [
    RequestListComponent,
    RequestDetailComponent,
    CreateRequestComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RequestsRoutingModule
  ]
})
export class RequestsModule { }