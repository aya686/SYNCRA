import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// e-commerce modules
import { ResourcesModule } from './modules/resources/resources.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

// events modules
import { AdminLayoutModule } from './layouts/admin-layout/admin-layout.module';
import { PublicLayoutModule } from './layouts/public-layout/public-layout.module';
import { EventsModule } from './modules/events/events.module';
import { FormationsModule } from './modules/formations/formations.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { FrontOfficeModule } from './modules/frontoffice/frontoffice.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { FormateursModule } from './modules/formateurs/formateurs.module';
import { SharedModule } from './modules/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    AppComponent,
    ResourcesModule,
    RequestsModule,
    ReviewsModule,
    CartModule,
    OrdersModule,
    LoyaltyModule,
    MarketplaceModule,
    AdminLayoutModule,
    PublicLayoutModule,
    EventsModule,
    FormationsModule,
    ReportingModule,
    FrontOfficeModule,
    AuthModule,
    AdminModule,
    FormateursModule,
    SharedModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }