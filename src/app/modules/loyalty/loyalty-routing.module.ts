// src/app/modules/loyalty/loyalty-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoyaltyDashboardComponent } from './components/loyalty-dashboard/loyalty-dashboard.component';

const routes: Routes = [
  { path: '', component: LoyaltyDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoyaltyRoutingModule {}