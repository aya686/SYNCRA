import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './components/cart/cart.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CartRoutingModule,
    CartComponent,
    NotificationBellComponent
  ],
  exports: [
    NotificationBellComponent
  ]
})
export class CartModule { }