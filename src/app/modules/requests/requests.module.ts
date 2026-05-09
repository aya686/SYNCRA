import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RequestsRoutingModule } from './requests-routing.module';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { CreateRequestComponent } from './components/create-request/create-request.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RequestsRoutingModule,
    RequestListComponent,
    RequestDetailComponent,
    CreateRequestComponent
  ]
})
export class RequestsModule { }