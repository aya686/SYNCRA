import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
<<<<<<< HEAD
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
=======
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
>>>>>>> events

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

<<<<<<< HEAD
import { ResourcesModule } from './modules/resources/resources.module';
import { RequestsModule } from './modules/requests/requests.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AppComponent,
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
=======
// Layout Modules
import { AdminLayoutModule } from './layouts/admin-layout/admin-layout.module';
import { PublicLayoutModule } from './layouts/public-layout/public-layout.module';

// Feature Modules
import { EventsModule } from './modules/events/events.module';
import { FormationsModule } from './modules/formations/formations.module';
import { ReportingModule } from './modules/reporting/reporting.module';
import { FrontOfficeModule } from './modules/frontoffice/frontoffice.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { FormateursModule } from './modules/formateurs/formateurs.module';

// Shared Module
import { SharedModule } from './modules/shared/shared.module';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        AppRoutingModule,
        AdminLayoutModule,
        PublicLayoutModule,
        EventsModule,
        FormationsModule,
        ReportingModule,
        FrontOfficeModule,
        AuthModule,
        AdminModule,
        FormateursModule,
        SharedModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
>>>>>>> events
export class AppModule { }