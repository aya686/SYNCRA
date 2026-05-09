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
import { HomeComponent } from './modules/frontoffice/components/home/home.component';
import { EventsListComponent } from './modules/frontoffice/components/events/events-list.component';
import { FormationsListComponent } from './modules/frontoffice/components/formations/formations-list.component';
import { EventDetailComponent as FrontEventDetailComponent } from './modules/frontoffice/components/event-detail/event-detail.component';
import { FormationDetailComponent } from './modules/frontoffice/components/formation-detail/formation-detail.component';
import { FavoritesListComponent } from './modules/frontoffice/components/favorites-list/favorites-list.component';
import { AnalyticsDashboardComponent } from './modules/reporting/components/analytics-dashboard/analytics-dashboard.component';
import { HeatmapComponent } from './modules/reporting/components/heatmap/heatmap.component';
import { EventGeneratorComponent } from './modules/admin/components/event-generator.component';

const routes: Routes = [
  // ── LANDING ──
  {
    path: '',
    loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent)
  },

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
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardBienetreComponent) },
  { path: 'alertes', loadComponent: () => import('./demo/pages/alertes-burnout/alertes-burnout.component').then((c) => c.AlertesBurnoutComponent) },
  { path: 'seances', loadComponent: () => import('./demo/pages/seances/seances.component').then((c) => c.SeancesComponent) },
  { path: 'mon-programme', loadComponent: () => import('./demo/pages/programme/programme.component').then(c => c.ProgrammeComponent) },
  { path: 'bibliotheque', loadComponent: () => import('./demo/pages/bibliotheque/bibliotheque.component').then(c => c.BibliothequeComponent) },
  { path: 'seuils', loadComponent: () => import('./demo/pages/seuils/seuils.component').then(c => c.SeuilsComponent) },

  // ── EVENTS (PUBLIC) ──
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

  // ── BACK OFFICE BERRY ──
  {
    path: '',
    component: AdminComponent,
    children: [
      { path: 'default', loadComponent: () => import('./demo/dashboard/default/default.component').then((c) => c.DefaultComponent) },
      { path: 'typography', loadComponent: () => import('./demo/elements/typography/typography.component').then((c) => c.TypographyComponent) },
      { path: 'color', loadComponent: () => import('./demo/elements/element-color/element-color.component').then((c) => c.ElementColorComponent) },
      { path: 'sample-page', loadComponent: () => import('./demo/other/sample-page/sample-page.component').then((c) => c.SamplePageComponent) },
      { path: 'ms2/admin/projets', loadComponent: () => import('./ms2/projets/dashboard-projets/dashboard-projets.component').then((c) => c.DashboardProjetsComponent) },
      { path: 'dashboardadmin', loadComponent: () => import('./demo/pages/dashboard/wellness-dashboard.component').then(m => m.WellnessDashboardComponent) },
      { path: 'specialistesadmin', loadComponent: () => import('./demo/pages/dashboard/specialistes.component').then(m => m.SpecialistesComponent) },
      { path: 'seancesadmin', loadComponent: () => import('./demo/pages/dashboard/seances-admin.component').then(m => m.SeancesAdminComponent) },
      { path: 'alertesadmin', loadComponent: () => import('./demo/pages/dashboard/alertes-admin.component').then(m => m.AlertesAdminComponent) },
      { path: 'programmesadmin', loadComponent: () => import('./demo/pages/dashboard/programmes-admin.component').then(m => m.ProgrammesAdminComponent) },
      { path: 'ressourcesadmin', loadComponent: () => import('./demo/pages/dashboard/ressources-admin.component').then(m => m.RessourcesAdminComponent) },
      // Collaboration
      { path: 'offres', loadChildren: () => import('./offres/offres.module').then((m) => m.OffresModule) },
      { path: 'candidatures', loadChildren: () => import('./candidatures/candidatures.module').then((m) => m.CandidaturesModule) },
      { path: 'contrats', loadChildren: () => import('./contrats/contrats.module').then((m) => m.ContratsModule) },
      { path: 'investissements', loadChildren: () => import('./investissements/investissements.module').then((m) => m.InvestissementsModule) },
      { path: 'partenariats', loadChildren: () => import('./partenariats/partenariats.module').then((m) => m.PartenariatsModule) },
      { path: 'paiements', loadChildren: () => import('./paiements/paiements.module').then((m) => m.PaiementsModule) }
    ]
  },

  // ── GUEST (AUTH + MS2 + COLLABORATION) ──
  {
    path: '',
    component: GuestComponent,
    children: [
      { path: 'login', loadComponent: () => import('./demo/pages/authentication/login/login.component').then((c) => c.LoginComponent) },
      { path: 'register', loadComponent: () => import('./demo/pages/authentication/register/register.component').then((c) => c.RegisterComponent) },
      { path: 'landing', loadComponent: () => import('./demo/pages/landing/landing.component').then((c) => c.LandingComponent) },
      { path: 'chat', loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule) },
      // Collaboration roles
      { path: 'freelancer', loadComponent: () => import('./roles/freelancer-home/freelancer-home.component').then((c) => c.FreelancerHomeComponent) },
      { path: 'client', loadComponent: () => import('./roles/client-home/client-home.component').then((c) => c.ClientHomeComponent) },
      { path: 'partenaire', loadComponent: () => import('./roles/partenaire-home/partenaire-home.component').then((c) => c.PartenaireHomeComponent) },
      { path: 'investisseur', loadComponent: () => import('./roles/investisseur-home/investisseur-home.component').then((c) => c.InvestisseurHomeComponent) },
      // MS2
      { path: 'ms2/projets', loadComponent: () => import('./ms2/projets/dashboard-projets/dashboard-projets.component').then((c) => c.DashboardProjetsComponent) },
      { path: 'ms2/projets/nouveau', loadComponent: () => import('./ms2/projets/create-projet/create-projet.component').then((c) => c.CreateProjetComponent) },
      { path: 'ms2/projets/:id/modifier', loadComponent: () => import('./ms2/projets/create-projet/create-projet.component').then((c) => c.CreateProjetComponent) },
      { path: 'ms2/projets/:id', loadComponent: () => import('./ms2/projets/detail-projet/detail-projet.component').then((c) => c.DetailProjetComponent) },
      { path: 'ms2/taches/:projetId/kanban', loadComponent: () => import('./ms2/taches/kanban/kanban.component').then((c) => c.KanbanComponent) },
      { path: 'ms2/taches/:id', loadComponent: () => import('./ms2/taches/detail-tache/detail-tache.component').then((c) => c.DetailTacheComponent) },
      { path: 'ms2/sessions', loadComponent: () => import('./ms2/sessions/session-travail/session-travail.component').then((c) => c.SessionTravailComponent) },
      { path: 'ms2/idees', loadComponent: () => import('./ms2/mes-idees/mes-idees.component').then((c) => c.MesIdeesComponent) },
      { path: 'ms2/alertes', loadComponent: () => import('./ms2/mes-alertes/mes-alertes.component').then((c) => c.MesAlertesComponent) }
    ]
  },

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
      { path: 'machines', loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}