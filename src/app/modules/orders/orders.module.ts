import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    MyOrdersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    OrdersRoutingModule
  ],
  exports: [
    MyOrdersComponent  // ← Optionnel, si utilisé ailleurs
  ]
})
export class OrdersModule { }
