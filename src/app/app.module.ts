// src/app/app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Importer les modules
import { ResourcesModule } from './modules/resources/resources.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { MyOrdersComponent } from './modules/orders/components/my-orders/my-orders.component';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

@NgModule({
  declarations: [
    AppComponent,
   
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ResourcesModule,
    RequestsModule,
    ReviewsModule,
    CartModule,
    OrdersModule,
    LoyaltyModule,
    MarketplaceModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }