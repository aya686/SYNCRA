import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
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
    SharedModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }