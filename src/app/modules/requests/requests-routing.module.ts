// src/app/modules/requests/requests-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { CreateRequestComponent } from './components/create-request/create-request.component';

const routes: Routes = [
  { path: '', component: RequestListComponent },
  { path: 'create', component: CreateRequestComponent },
  { path: ':id', component: RequestDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RequestsRoutingModule { }