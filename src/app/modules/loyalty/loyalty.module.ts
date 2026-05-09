import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoyaltyRoutingModule } from './loyalty-routing.module';
import { LoyaltyDashboardComponent } from './components/loyalty-dashboard/loyalty-dashboard.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoyaltyRoutingModule,
    LoyaltyDashboardComponent
  ],
  exports: [
    LoyaltyDashboardComponent
  ]
})
export class LoyaltyModule {}