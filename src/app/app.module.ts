import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Modules Back Office seulement (Front Office est en composants standalone)
import { EventsModule } from './modules/events/events.module';
import { FormationsModule } from './modules/formations/formations.module';
import { ReportingModule } from './modules/reporting/reporting.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    EventsModule,
    FormationsModule,
    ReportingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }