export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;
  children?: NavigationItem[];
  role?: string[];
  isMainParent?: boolean;
}

export const NavigationItems: NavigationItem[] = [
  {
    id: 'berry',
    title: 'BERRY',
    type: 'group',
    icon: 'icon-navigation',
    isMainParent: true,
    children: [
      {
        id: 'investisseur',
        title: 'Investisseur',
        type: 'collapse',
        icon: 'ti ti-user-star',
        role: ['investisseur'],
        children: [
          { id: 'investisseurs-partenaires', title: 'Investisseurs & Partenaires', type: 'item', url: '/investissements/investisseurs-partenaires', classes: 'nav-item', icon: 'ti ti-users', breadcrumbs: false },
          { id: 'dashboard-investisseur', title: 'Mon Dashboard Investisseur', type: 'item', url: '/investissements/dashboard-investisseur', classes: 'nav-item', icon: 'ti ti-chart-pie', breadcrumbs: false },
          { id: 'soumettre-mise-fonds', title: 'Soumettre une Mise de Fonds', type: 'item', url: '/investissements/soumettre-mise-fonds', classes: 'nav-item', icon: 'ti ti-coin', breadcrumbs: false },
          { id: 'negociation', title: 'Négociation', type: 'item', url: '/investissements/negociation', classes: 'nav-item', icon: 'ti ti-message', breadcrumbs: false },
          { id: 'conventions-actives', title: 'Conventions Actives', type: 'item', url: '/investissements/conventions-actives', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false }
        ]
      },
      {
        id: 'startup',
        title: 'Startup',
        type: 'collapse',
        icon: 'ti ti-rocket',
        role: ['startup'],
        children: [
          { id: 'offres-startup', title: 'Offres', type: 'item', url: '/offres', classes: 'nav-item', icon: 'ti ti-briefcase', breadcrumbs: false },
          { id: 'candidatures-startup', title: 'Candidatures', type: 'item', url: '/candidatures', classes: 'nav-item', icon: 'ti ti-file-description', breadcrumbs: false },
          { id: 'contrats-startup', title: 'Contrats', type: 'item', url: '/contrats', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false }
        ]
      },
      {
        id: 'banque',
        title: 'Partenaire Banque',
        type: 'collapse',
        icon: 'ti ti-building-bank',
        role: ['banque'],
        children: [
          { id: 'investisseurs-partenaires-banque', title: 'Investisseurs & Partenaires', type: 'item', url: '/investissements/investisseurs-partenaires', classes: 'nav-item', icon: 'ti ti-users', breadcrumbs: false },
          { id: 'conventions-actives-banque', title: 'Conventions Actives', type: 'item', url: '/investissements/conventions-actives', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false }
        ]
      },
      {
        id: 'admin',
        title: 'Admin',
        type: 'collapse',
        icon: 'ti ti-shield',
        role: ['admin'],
        children: [
          { id: 'offres-admin', title: 'Offres', type: 'item', url: '/offres/admin-dashboard', classes: 'nav-item', icon: 'ti ti-briefcase', breadcrumbs: false },
          { id: 'candidatures-admin', title: 'Candidatures', type: 'item', url: '/candidatures/admin-dashboard', classes: 'nav-item', icon: 'ti ti-file-description', breadcrumbs: false },
          { id: 'contrats-admin', title: 'Contrats', type: 'item', url: '/contrats/admin-contrats', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false },
          { id: 'investissements-admin', title: 'Investissements', type: 'item', url: '/investissements/dashboard-admin-investissements', classes: 'nav-item', icon: 'ti ti-coin', breadcrumbs: false }
        ]
      },
      {
        id: 'monitor',
        title: 'Monitor',
        type: 'collapse',
        icon: 'ti ti-eye',
        role: ['monitor'],
        children: [
          { id: 'offres-monitor', title: 'Offres', type: 'item', url: '/offres', classes: 'nav-item', icon: 'ti ti-briefcase', breadcrumbs: false },
          { id: 'candidatures-monitor', title: 'Candidatures', type: 'item', url: '/candidatures', classes: 'nav-item', icon: 'ti ti-file-description', breadcrumbs: false },
          { id: 'contrats-monitor', title: 'Contrats', type: 'item', url: '/contrats', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false },
          { id: 'investissements-monitor', title: 'Investissements', type: 'item', url: '/investissements/investisseurs-partenaires', classes: 'nav-item', icon: 'ti ti-coin', breadcrumbs: false }
        ]
      }
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      { id: 'default', title: 'Dashboard', type: 'item', classes: 'nav-item', url: '/default', icon: 'ti ti-dashboard', breadcrumbs: false }
    ]
  },
  {
    id: 'page',
    title: 'Pages',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'Authentication',
        title: 'Authentication',
        type: 'collapse',
        icon: 'ti ti-key',
        children: [
          { id: 'login', title: 'Login', type: 'item', url: '/login', target: true, breadcrumbs: false },
          { id: 'register', title: 'Register', type: 'item', url: '/register', target: true, breadcrumbs: false }
        ]
      }
    ]
  },
  {
    id: 'contrats',
    title: 'Contrats',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      { id: 'mes-contrats', title: 'Mes Contrats', type: 'item', url: '/contrats/mes-contrats', classes: 'nav-item', icon: 'ti ti-file-description', breadcrumbs: false },
      { id: 'contrats-freelancer', title: 'Contrats Freelancer', type: 'item', url: '/contrats/contrats-freelancer', classes: 'nav-item', icon: 'ti ti-signature', breadcrumbs: false, role: ['freelancer'] },
      { id: 'admin-contrats', title: 'Admin Contrats', type: 'item', url: '/contrats/admin-contrats', classes: 'nav-item', icon: 'ti ti-file-text', breadcrumbs: false, role: ['admin'] },
      { id: 'creer-contrat', title: 'Créer Contrat', type: 'item', url: '/contrats/creer-contrat', classes: 'nav-item', icon: 'ti ti-file-plus', breadcrumbs: false },
      { id: 'admin-litiges', title: 'Gestion Litiges', type: 'item', url: '/contrats/admin-litiges', classes: 'nav-item', icon: 'ti ti-alert-triangle', breadcrumbs: false, role: ['admin'] }
    ]
  },
  {
    id: 'other',
    title: 'Other',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      { id: 'sample-page', title: 'Sample Page', type: 'item', url: '/sample-page', classes: 'nav-item', icon: 'ti ti-brand-chrome' },
      { id: 'document', title: 'Document', type: 'item', classes: 'nav-item', url: 'https://codedthemes.gitbook.io/berry-angular/', icon: 'ti ti-vocabulary', target: true, external: true }
    ]
  }
];