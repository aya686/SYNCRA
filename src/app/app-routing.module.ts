import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { DossierSanteComponent } from './demo/pages/dossier-sante/dossier-sante.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { LoginComponent } from './modules/auth/pages/login/login.component';
import { AuthGuard, AdminGuard } from './modules/shared/guards/auth.guard';
import { SimulationDashboardComponent } from './modules/frontoffice/components/simulation-dashboard/simulation-dashboard.component';
import { ExportDataComponent } from './modules/reporting/components/export-data/export-data.component';
import { InscriptionFormationComponent } from './modules/frontoffice/components/inscription-formation/inscription-formation.component';
import { InscriptionFormComponent } from './modules/frontoffice/components/inscription/inscription-form.component';
import { EventFormComponent } from './modules/events/components/event-form/event-form.component';
import { EventListComponent } from './modules/events/components/event-list/event-list.component';
import { FormateurListComponent } from './modules/formateurs/formateur-list/formateur-list.component';
import { FormateurFormComponent } from './modules/formateurs/formateur-form/formateur-form.component';
import { EventDetailComponent } from './modules/events/components/event-detail/event-detail.component';
import { EventsListComponent } from './modules/frontoffice/components/events/events-list.component';
import { FormationsListComponent } from './modules/frontoffice/components/formations/formations-list.component';
import { FavoritesListComponent } from './modules/frontoffice/components/favorites-list/favorites-list.component';
import { AnalyticsDashboardComponent } from './modules/reporting/components/analytics-dashboard/analytics-dashboard.component';
import { HeatmapComponent } from './modules/reporting/components/heatmap/heatmap.component';
import { EventGeneratorComponent } from './modules/admin/components/event-generator.component';

// ── GES USERS ──
import { UserListComponent } from './templatetest/src/app/gesusers/components/user-list/user-list.component';
import { RegisterComponent as GesRegisterComponent } from './templatetest/src/app/gesusers/components/register/register.component';
import { RegisterDetailsComponent } from './templatetest/src/app/gesusers/components/register/details/register-details.component';
import { ProfileComponent } from './templatetest/src/app/gesusers/components/profile/profile.component';
import { LoginComponent as GesLoginComponent } from './templatetest/src/app/gesusers/components/login/login.component';
import { AdminDashboardComponent as GesAdminDashboardComponent } from './templatetest/src/app/gesusers/components/admin-dashboard/admin-dashboard.component';
import { AdminLayoutComponent as GesAdminLayoutComponent } from './templatetest/src/app/gesusers/components/admin-layout/admin-layout.component';

// MS6 Client Components
import { ClientBoutiqueListComponent } from './ms6/client/pages/boutiques/client-boutique-list.component';
import { ClientBoutiqueDetailComponent } from './ms6/client/pages/boutiques/client-boutique-detail.component';
import { ClientProduitListComponent } from './ms6/client/pages/produits/client-produit-list.component';
import { ClientProduitDetailComponent } from './ms6/client/pages/produits/client-produit-detail.component';
import { ClientCommandeListComponent } from './ms6/client/pages/commandes/client-commande-list.component';
import { ClientCommandeDetailComponent } from './ms6/client/pages/commandes/client-commande-detail.component';
import { ClientLivraisonListComponent } from './ms6/client/pages/livraisons/client-livraison-list.component';
import { ClientLivraisonDetailComponent } from './ms6/client/pages/livraisons/client-livraison-detail.component';

// MS6 Admin Components
import { BoutiqueListComponent } from './ms6/features/boutiques/components/boutique-list.component';
import { ProduitListComponent } from './ms6/features/produits/components/produit-list.component';
import { CommandeListComponent } from './ms6/features/commandes/components/commande-list.component';
import { LivraisonListComponent } from './ms6/features/livraisons/components/livraison-list.component';
import { DashboardAlertsComponent } from './ms6/features/dashboard-alerts/dashboard-alerts.component';
import { PricingModernComponent } from './ms6/features/pricing/components/pricing-modern/pricing-modern.component';
import { PromotionListComponent } from './ms6/features/promotions/components/promotion-list.component';

const routes: Routes = [

  // ── LOGIN CUSTOM ──
  { path: 'login', component: LoginComponent },
  { path: 'admin-shop', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },

  // ── EVENTS ADMIN ──
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'events', pathMatch: 'full' },
      { path: 'events', component: EventListComponent },
      { path: 'events/new', component: EventFormComponent },
      { path: 'events/:id/edit', component: EventFormComponent },
      { path: 'events/:id', component: EventDetailComponent },
      { path: 'simulation', component: SimulationDashboardComponent },
      { path: 'formations', loadChildren: () => import('./modules/formations/formations.module').then(m => m.FormationsModule) },
      { path: 'formateurs', component: FormateurListComponent },
      { path: 'formateurs/new', component: FormateurFormComponent },
      { path: 'formateurs/:id/edit', component: FormateurFormComponent },
      { path: 'reporting/analytics', component: AnalyticsDashboardComponent },
      { path: 'reporting/heatmap', component: HeatmapComponent },
      { path: 'reporting/export', component: ExportDataComponent },
      { path: 'event-generator', component: EventGeneratorComponent },
      { path: 'admin-module', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) },
      
      // MS6 Admin routes
      { path: 'boutiques', component: BoutiqueListComponent },
      { path: 'produits', component: ProduitListComponent },
      { path: 'commandes', component: CommandeListComponent },
      { path: 'livraisons', component: LivraisonListComponent },
      { path: 'stock-alerts', component: DashboardAlertsComponent },
      { path: 'pricing-dynamique', component: PricingModernComponent },
      { path: 'promotions', component: PromotionListComponent }
    ]
  },

  // ── GES USERS ADMIN ← layout gestusers ──
  {
    path: 'gesusers',
    component: GesAdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: GesAdminDashboardComponent },
      { path: 'list', component: UserListComponent },
      { path: 'profile/:id', component: ProfileComponent },
    ]
  },

  // ── LANDING ──
  { path: '', pathMatch: 'full', redirectTo: 'default' },

  // ── E-COMMERCE ──
  { path: 'machines', loadChildren: () => import('./modules/resources/resources.module').then(m => m.ResourcesModule) },
  { path: 'services', loadChildren: () => import('./modules/services/services.module').then(m => m.ServicesModule) },
  { path: 'requests', loadChildren: () => import('./modules/requests/requests.module').then(m => m.RequestsModule) },
  { path: 'cart', loadChildren: () => import('./modules/cart/cart.module').then(m => m.CartModule) },
  { path: 'marketplace', loadChildren: () => import('./modules/marketplace/marketplace.module').then(m => m.MarketplaceModule) },
  { path: 'orders', loadChildren: () => import('./modules/orders/orders.module').then(m => m.OrdersModule) },
  { path: 'loyalty', loadChildren: () => import('./modules/loyalty/loyalty.module').then(m => m.LoyaltyModule) },

  // ── BIEN-ETRE ──
  { path: 'dossier-sante', component: DossierSanteComponent },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(c => c.DashboardBienetreComponent) },
  { path: 'alertes', loadComponent: () => import('./demo/pages/alertes-burnout/alertes-burnout.component').then(c => c.AlertesBurnoutComponent) },
  { path: 'seances', loadComponent: () => import('./demo/pages/seances/seances.component').then(c => c.SeancesComponent) },
  { path: 'mon-programme', loadComponent: () => import('./demo/pages/programme/programme.component').then(c => c.ProgrammeComponent) },
  { path: 'bibliotheque', loadComponent: () => import('./demo/pages/bibliotheque/bibliotheque.component').then(c => c.BibliothequeComponent) },
  { path: 'seuils', loadComponent: () => import('./demo/pages/seuils/seuils.component').then(c => c.SeuilsComponent) },

  // ── BACK OFFICE BERRY ──
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'default', loadComponent: () => import('./demo/dashboard/default/default.component').then(c => c.DefaultComponent) },
      { path: 'typography', loadComponent: () => import('./demo/elements/typography/typography.component').then(c => c.TypographyComponent) },
      { path: 'color', loadComponent: () => import('./demo/elements/element-color/element-color.component').then(c => c.ElementColorComponent) },
      { path: 'sample-page', loadComponent: () => import('./demo/other/sample-page/sample-page.component').then(c => c.SamplePageComponent) },
      { path: 'ms2/admin/projets', loadComponent: () => import('./ms2/projets/dashboard-projets/dashboard-projets.component').then(c => c.DashboardProjetsComponent) },
      { path: 'dashboardadmin', loadComponent: () => import('./demo/pages/dashboard/wellness-dashboard.component').then(m => m.WellnessDashboardComponent) },
      { path: 'specialistesadmin', loadComponent: () => import('./demo/pages/dashboard/specialistes.component').then(m => m.SpecialistesComponent) },
      { path: 'seancesadmin', loadComponent: () => import('./demo/pages/dashboard/seances-admin.component').then(m => m.SeancesAdminComponent) },
      { path: 'alertesadmin', loadComponent: () => import('./demo/pages/dashboard/alertes-admin.component').then(m => m.AlertesAdminComponent) },
      { path: 'programmesadmin', loadComponent: () => import('./demo/pages/dashboard/programmes-admin.component').then(m => m.ProgrammesAdminComponent) },
      { path: 'ressourcesadmin', loadComponent: () => import('./demo/pages/dashboard/ressources-admin.component').then(m => m.RessourcesAdminComponent) },
      { path: 'offres', loadChildren: () => import('./offres/offres.module').then(m => m.OffresModule) },
      { path: 'candidatures', loadChildren: () => import('./candidatures/candidatures.module').then(m => m.CandidaturesModule) },
      { path: 'contrats', loadChildren: () => import('./contrats/contrats.module').then(m => m.ContratsModule) },
      { path: 'investissements', loadChildren: () => import('./investissements/investissements.module').then(m => m.InvestissementsModule) },
      { path: 'partenariats', loadChildren: () => import('./partenariats/partenariats.module').then(m => m.PartenariatsModule) },
      { path: 'paiements', loadChildren: () => import('./paiements/paiements.module').then(m => m.PaiementsModule) },
    ]
  },

  // ── GUEST ──
  {
    path: '',
    component: GuestComponent,
    children: [
      { path: 'register', loadComponent: () => import('./demo/pages/authentication/register/register.component').then(c => c.RegisterComponent) },
      { path: 'landing', loadComponent: () => import('./demo/pages/landing/landing.component').then(c => c.LandingComponent) },
      { path: 'chat', loadChildren: () => import('./chat/chat.module').then(m => m.ChatModule) },
      { path: 'freelancer', loadComponent: () => import('./roles/freelancer-home/freelancer-home.component').then(c => c.FreelancerHomeComponent) },
      { path: 'client', loadComponent: () => import('./roles/client-home/client-home.component').then(c => c.ClientHomeComponent) },
      { path: 'partenaire', loadComponent: () => import('./roles/partenaire-home/partenaire-home.component').then(c => c.PartenaireHomeComponent) },
      { path: 'investisseur', loadComponent: () => import('./roles/investisseur-home/investisseur-home.component').then(c => c.InvestisseurHomeComponent) },
      { path: 'ms2/projets', loadComponent: () => import('./ms2/projets/dashboard-projets/dashboard-projets.component').then(c => c.DashboardProjetsComponent) },
      { path: 'ms2/projets/nouveau', loadComponent: () => import('./ms2/projets/create-projet/create-projet.component').then(c => c.CreateProjetComponent) },
      { path: 'ms2/projets/:id/modifier', loadComponent: () => import('./ms2/projets/create-projet/create-projet.component').then(c => c.CreateProjetComponent) },
      { path: 'ms2/projets/:id', loadComponent: () => import('./ms2/projets/detail-projet/detail-projet.component').then(c => c.DetailProjetComponent) },
      { path: 'ms2/taches/:projetId/kanban', loadComponent: () => import('./ms2/taches/kanban/kanban.component').then(c => c.KanbanComponent) },
      { path: 'ms2/taches/:id', loadComponent: () => import('./ms2/taches/detail-tache/detail-tache.component').then(c => c.DetailTacheComponent) },
      { path: 'ms2/sessions', loadComponent: () => import('./ms2/sessions/session-travail/session-travail.component').then(c => c.SessionTravailComponent) },
      { path: 'ms2/idees', loadComponent: () => import('./ms2/mes-idees/mes-idees.component').then(c => c.MesIdeesComponent) },
      { path: 'ms2/alertes', loadComponent: () => import('./ms2/mes-alertes/mes-alertes.component').then(c => c.MesAlertesComponent) },

      // ── GES USERS (Guest layout) ──
      { path: 'users/login', component: GesLoginComponent },
      { path: 'users/register', component: GesRegisterComponent },
      { path: 'users/register/details', component: RegisterDetailsComponent },
    ]
  },

  // ── PUBLIC EVENTS ──
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'events', component: EventsListComponent },
      { path: 'formations', component: FormationsListComponent },
      { path: 'favoris', component: FavoritesListComponent },
      { path: 'inscription/event/:id', component: InscriptionFormComponent },
      { path: 'inscription/formation/:formationId', component: InscriptionFormationComponent },
      { path: '', loadChildren: () => import('./modules/frontoffice/frontoffice.module').then(m => m.FrontOfficeModule) }
    ]
  },

  // ── MS6 CLIENT ROUTES (sans layout spécifique) ──
  { path: 'boutiques', component: ClientBoutiqueListComponent },
  { path: 'boutiques/:id', component: ClientBoutiqueDetailComponent },
  { path: 'produits', component: ClientProduitListComponent },
  { path: 'produits/:id', component: ClientProduitDetailComponent },
  { path: 'commandes', component: ClientCommandeListComponent },
  { path: 'commandes/:id', component: ClientCommandeDetailComponent },
  { path: 'livraisons', component: ClientLivraisonListComponent },
  { path: 'livraisons/:id', component: ClientLivraisonDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}