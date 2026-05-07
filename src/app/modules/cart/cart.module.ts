// src/app/modules/cart/cart.module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './components/cart/cart.component';
import { NotificationBellComponent } from './components/notification-bell/notification-bell.component';


@NgModule({
  declarations: [
    CartComponent,
    NotificationBellComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CartRoutingModule
  ],
  exports: [
    NotificationBellComponent  // 👈 TRÈS IMPORTANT
  ]

})
export class CartModule { }