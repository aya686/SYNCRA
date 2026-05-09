//import { enableProdMode, importProvidersFrom } from '@angular/core';
//import { environment } from './environments/environment';
//import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
//import { AppRoutingModule } from './app/app-routing.module';
//import { AppComponent } from './app/app.component';
//import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; // 👈 AJOUTER

//if (environment.production) {
 // enableProdMode();
//}

//bootstrapApplication(AppComponent, {
  //providers: [
    //importProvidersFrom(BrowserModule, AppRoutingModule),
    //provideHttpClient(withInterceptorsFromDi()) // 👈 AJOUTER
  //]
//}).catch((err) => console.error(err));
import { enableProdMode } from '@angular/core';
import { environment } from './app/ms6/environments/environment';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/ms6/app.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch((err) => console.error(err));