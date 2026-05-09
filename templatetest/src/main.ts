// main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { environment } from './environments/environment';

// Modules du projet
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { HttpClientModule } from '@angular/common/http';

// Composant principal
import { AppComponent } from './app/app.component';

// Activer le mode production si nécessaire
if (environment.production) {
  enableProdMode();
}

// Lancer l'application Angular
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,    // nécessaire pour le navigateur
      AppRoutingModule, // pour gérer le routing
      HttpClientModule  // pour les requêtes HTTP vers ton backend Spring
    )
  ]
}).catch((err) => console.error(err));