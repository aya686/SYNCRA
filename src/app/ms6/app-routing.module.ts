import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Berry Layouts (New Design)
import { BerryClientLayoutComponent } from './layouts/berry-client/berry-client-layout.component';
import { BerryAdminLayoutComponent } from './layouts/berry-admin/berry-admin-layout.component';

// Landing Page (SYNCRA Design - standalone)
import { ClientLandingComponent } from './client/pages/landing/landing.component';

// Client Pages (will be redesigned with Berry)
import { ClientBoutiqueListComponent } from './client/pages/boutiques/client-boutique-list.component';
import { ClientBoutiqueDetailComponent } from './client/pages/boutiques/client-boutique-detail.component';
import { ClientProduitListComponent } from './client/pages/produits/client-produit-list.component';
import { ClientProduitDetailComponent } from './client/pages/produits/client-produit-detail.component';
import { ClientCommandeListComponent } from './client/pages/commandes/client-commande-list.component';
import { ClientCommandeDetailComponent } from './client/pages/commandes/client-commande-detail.component';
import { ClientLivraisonListComponent } from './client/pages/livraisons/client-livraison-list.component';
import { ClientLivraisonDetailComponent } from './client/pages/livraisons/client-livraison-detail.component';

// Dashboard
import { DashboardComponent } from './layout/dashboard/dashboard.component';

// Admin Components (existing)
import { BoutiqueListComponent } from './features/boutiques/components/boutique-list.component';
import { BoutiqueFormComponent } from './features/boutiques/components/boutique-form.component';
import { BoutiqueDetailComponent } from './features/boutiques/components/boutique-detail.component';
import { BoutiqueStatsComponent } from './features/boutiques/components/boutique-stats.component';

import { ProduitListComponent } from './features/produits/components/produit-list.component';
import { ProduitFormComponent } from './features/produits/components/produit-form.component';
import { ProduitDetailComponent } from './features/produits/components/produit-detail.component';
import { PromotionListComponent } from './features/promotions/components/promotion-list.component';

// Berry Page Components

import { CommandeListComponent } from './features/commandes/components/commande-list.component';
import { CommandeFormComponent } from './features/commandes/components/commande-form.component';
import { CommandeDetailComponent } from './features/commandes/components/commande-detail.component';

import { LivraisonListComponent } from './features/livraisons/components/livraison-list.component';
import { LivraisonFormComponent } from './features/livraisons/components/livraison-form.component';
import { LivraisonDetailComponent } from './features/livraisons/components/livraison-detail.component';

// Dashboard Alerts
import { DashboardAlertsComponent } from './features/dashboard-alerts/dashboard-alerts.component';

// Route Optimisation
import { RouteListComponent } from './components/route-list/route-list.component';

// Pricing Dynamique (Nouveau composant moderne)
import { PricingModernComponent } from './features/pricing/components/pricing-modern/pricing-modern.component';

const routes: Routes = [
  // Landing page (public, no layout)
  { path: 'landing', component: ClientLandingComponent },
  
  // Landing page (SYNCRA Design - full page, no sidebar)
  { path: '', component: ClientLandingComponent },
  
  // Client routes with Berry Layout
  {
    path: '',
    component: BerryClientLayoutComponent,
    children: [
      // Boutiques - Client View
      { path: 'boutiques', component: ClientBoutiqueListComponent },
      { path: 'boutiques/:id', component: ClientBoutiqueDetailComponent },
      
      // Produits - Client View
      { path: 'produits', component: ClientProduitListComponent },
      { path: 'produits/:id', component: ClientProduitDetailComponent },
      
      // Commandes - Client View
      { path: 'commandes', component: ClientCommandeListComponent },
      { path: 'commandes/new', component: CommandeFormComponent },
      { path: 'commandes/:id', component: ClientCommandeDetailComponent },
      
      // Livraisons - Client View
      { path: 'livraisons', component: ClientLivraisonListComponent },
      { path: 'livraisons/:id', component: ClientLivraisonDetailComponent },
      
      // Chatbot NLP - Client View
      { path: 'chatbot', loadChildren: () => import('./features/chatbot/chatbot.module').then(m => m.ChatbotModule) },
    ]
  },
  
  // Admin routes with Berry Layout (full management interface)
  {
    path: 'admin',
    component: BerryAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      
      // Admin - Boutiques (full CRUD + stats)
      { path: 'boutiques', component: BoutiqueListComponent },
      { path: 'boutiques/new', component: BoutiqueFormComponent },
      { path: 'boutiques/edit/:id', component: BoutiqueFormComponent },
      { path: 'boutiques/stats/:id', component: BoutiqueStatsComponent },
      { path: 'boutiques/:id', component: BoutiqueDetailComponent },
      
      // Admin - Produits (Berry Design)
      { path: 'produits', component: ProduitListComponent },
      { path: 'produits/new', component: ProduitFormComponent },
      { path: 'produits/edit/:id', component: ProduitFormComponent },
      { path: 'produits/:id', component: ProduitDetailComponent },
      { path: 'promotions', component: PromotionListComponent },
      
      // Admin - Commandes (full management)
      { path: 'commandes', component: CommandeListComponent },
      { path: 'commandes/new', component: CommandeFormComponent },
      { path: 'commandes/:id', component: CommandeDetailComponent },
      
      // Admin - Livraisons (full management)
      { path: 'livraisons', component: LivraisonListComponent },
      { path: 'livraisons/new', component: LivraisonFormComponent },
      { path: 'livraisons/edit/:id', component: LivraisonFormComponent },
      { path: 'livraisons/:id', component: LivraisonDetailComponent },
      
      // Admin - Dashboard Alertes de Stock
      { path: 'stock-alerts', component: DashboardAlertsComponent },

      // Admin - Optimisation des Routes
      { path: 'routes-optimisation', component: RouteListComponent },
      
      // Admin - Pricing Dynamique
      { path: 'pricing-dynamique', component: PricingModernComponent },
      
      // Admin - Machine Learning (3 pages séparées)
      { path: 'ml', loadChildren: () => import('./features/ml/ml.module').then(m => m.MlModule) },
      
      // Admin - Chatbot NLP
      { path: 'chatbot', loadChildren: () => import('./features/chatbot/chatbot.module').then(m => m.ChatbotModule) },
    ]
  },
  
  // Legacy redirects for backwards compatibility
  { path: 'dashboard', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  
  // Wildcard redirect to landing
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
