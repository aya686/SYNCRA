import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { NotificationBellComponent } from './modules/cart/components/notification-bell/notification-bell.component';

import { ResourcesModule } from './modules/resources/resources.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { EventsModule } from './modules/events/events.module';
import { FormationsModule } from './modules/formations/formations.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { FrontOfficeModule } from './modules/frontoffice/frontoffice.module';
import { AuthModule } from './modules/auth/auth.module';
import { FormateursModule } from './modules/formateurs/formateurs.module';
import { SharedModule } from './modules/shared/shared.module';
import { Ms6Module } from './ms6/ms6.module';

@NgModule({
  declarations: [
    AppComponent  // ← SEUL non-standalone ici
  ],
 imports: [
  BrowserModule,
  HttpClientModule,
  Ms6Module,

  FormsModule,
  ReactiveFormsModule,
  // RouterModule,  ← SUPPRIMER cette ligne
  AppRoutingModule,  // ← contient déjà RouterModule.forRoot
  SpinnerComponent,
  AdminLayoutComponent,
  PublicLayoutComponent,
  NotificationBellComponent,
  ResourcesModule,
  RequestsModule,
  ReviewsModule,
  CartModule,
  OrdersModule,
  LoyaltyModule,
  MarketplaceModule,
  EventsModule,
  FormationsModule,
  ReportingModule,
  FrontOfficeModule,
  AuthModule,
  FormateursModule,
  SharedModule
],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    DatePipe,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}