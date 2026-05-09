import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrdersRoutingModule } from './orders-routing.module';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    OrdersRoutingModule,
    MyOrdersComponent
  ],
  exports: [
    MyOrdersComponent
  ]
})
export class OrdersModule { }