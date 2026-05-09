import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';

import { AppRoutingModule } from './app-routing.module';
import { HttpErrorInterceptor } from './core/interceptors/http-error.interceptor';

// Berry Layouts (New Design)
import { BerryClientLayoutComponent } from './layouts/berry-client/berry-client-layout.component';
import { BerryAdminLayoutComponent } from './layouts/berry-admin/berry-admin-layout.component';

// Berry UI Components (Standalone)
import { BerryCardComponent } from './shared/components/berry-card/berry-card.component';
import { BerryTableComponent } from './shared/components/berry-table/berry-table.component';
import { BerryBreadcrumbComponent } from './shared/components/berry-breadcrumb/berry-breadcrumb.component';
import { BerryFooterComponent } from './shared/components/berry-footer/berry-footer.component';

// Components
import { App } from './app.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';

import { DataTableComponent } from './shared/components/data-table.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog.component';
import { StatusColorPipe } from './shared/pipes/status-color.pipe';

import { BoutiqueListComponent } from './features/boutiques/components/boutique-list.component';
import { BoutiqueFormComponent } from './features/boutiques/components/boutique-form.component';
import { BoutiqueDetailComponent } from './features/boutiques/components/boutique-detail.component';
import { BoutiqueStatsComponent } from './features/boutiques/components/boutique-stats.component';

import { ProduitFormComponent } from './features/produits/components/produit-form.component';
import { ProduitDetailComponent } from './features/produits/components/produit-detail.component';
import { PromotionListComponent } from './features/promotions/components/promotion-list.component';
import { ApplyPromotionDialogComponent } from './features/promotions/components/apply-promotion-dialog.component';

import { CommandeListComponent } from './features/commandes/components/commande-list.component';
import { CommandeFormComponent } from './features/commandes/components/commande-form.component';
import { CommandeDetailComponent } from './features/commandes/components/commande-detail.component';

import { LivraisonListComponent } from './features/livraisons/components/livraison-list.component';
import { LivraisonFormComponent } from './features/livraisons/components/livraison-form.component';
import { LivraisonDetailComponent } from './features/livraisons/components/livraison-detail.component';
import { RemboursementDialogComponent } from './features/livraisons/components/remboursement-dialog.component';

// Client Layout & Pages
import { ClientLayoutComponent } from './shared/layout/client/client-layout.component';
import { ClientLandingComponent } from './client/pages/landing/landing.component';
import { ClientBoutiqueListComponent } from './client/pages/boutiques/client-boutique-list.component';
import { ClientBoutiqueDetailComponent } from './client/pages/boutiques/client-boutique-detail.component';
import { ClientProduitListComponent } from './client/pages/produits/client-produit-list.component';
import { ClientProduitDetailComponent } from './client/pages/produits/client-produit-detail.component';
import { ClientCommandeListComponent } from './client/pages/commandes/client-commande-list.component';
import { ClientCommandeDetailComponent } from './client/pages/commandes/client-commande-detail.component';
import { ClientLivraisonListComponent } from './client/pages/livraisons/client-livraison-list.component';
import { ClientLivraisonDetailComponent } from './client/pages/livraisons/client-livraison-detail.component';

// Admin Layout
import { AdminLayoutComponent } from './shared/layout/admin/admin-layout.component';

// Dashboard Alerts
import { DashboardAlertsComponent } from './features/dashboard-alerts/dashboard-alerts.component';

@NgModule({
  declarations: [
    App,
    NavbarComponent,
    SidebarComponent,
    DataTableComponent,
    ConfirmDialogComponent,
    StatusColorPipe,
    // Admin Components
    BoutiqueListComponent,
    BoutiqueFormComponent,
    BoutiqueDetailComponent,
    BoutiqueStatsComponent,
    ProduitFormComponent,
    ProduitDetailComponent,
    PromotionListComponent,
    ApplyPromotionDialogComponent,
    CommandeListComponent,
    CommandeFormComponent,
    CommandeDetailComponent,
    LivraisonListComponent,
    LivraisonFormComponent,
    LivraisonDetailComponent,
    RemboursementDialogComponent,
    // Client Components
    ClientBoutiqueListComponent,
    ClientBoutiqueDetailComponent,
    ClientProduitListComponent,
    ClientCommandeListComponent,
    ClientCommandeDetailComponent,
    ClientLivraisonListComponent,
    ClientLivraisonDetailComponent,
    // Admin Layout
    AdminLayoutComponent,
    // Dashboard Alerts
    DashboardAlertsComponent,
    // Dashboard
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatMenuModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatChipsModule,
    // Standalone Components
    ClientLayoutComponent,
    ClientLandingComponent,
    ClientProduitDetailComponent,
    BerryClientLayoutComponent,
    BerryAdminLayoutComponent,
    BerryCardComponent,
    BerryTableComponent,
    BerryBreadcrumbComponent,
    BerryFooterComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
