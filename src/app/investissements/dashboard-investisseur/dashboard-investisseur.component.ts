import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InvestisseurService } from '../../services/investisseur.service';
import { MiseFondsService } from '../../services/mise-fonds.service';
import { ConventionService } from '../../services/convention.service';
import { ChatbotService } from '../../services/chatbot.service';
import { OpenRouterService } from '../../services/openrouter.service';
import { Investisseur, MiseFonds, Convention, StatutMiseFonds, StatutConvention, TypeInvestisseur } from '../../models/investissement.model';

@Component({
  selector: 'app-dashboard-investisseur',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard-investisseur.component.html',
  styleUrl: './dashboard-investisseur.component.scss'
})
export class DashboardInvestisseurComponent implements OnInit {
  currentUserId: number = 1; // À remplacer par l'ID de l'utilisateur connecté
  investisseur: Investisseur | null = null;
  misesFonds: MiseFonds[] = [];
  conventions: Convention[] = [];
  loading = true;
  error: string | null = null;

  // Statistics
  stats = {
    totalInvesti: 150000,
    projetsEnCours: 3,
    roiMoyen: 14,
    conventionsActives: 2
  };

  // Portfolio evolution data (mock)
  portfolioEvolution = [
    { month: 'Jan', value: 90000 },
    { month: 'Fev', value: 120000 },
    { month: 'Mar', value: 150000 },
    { month: 'Avr', value: 180000 }
  ];

  // Chatbot properties
  chatMessages: { role: 'user' | 'assistant'; content: string }[] = [];
  chatInput = '';
  chatLoading = false;
  chatError: string | null = null;
  chatOpen = true;

  // Analyse IA des investissements
  analysesInvestissement: { [key: number]: { pourcentage: number; cause: string; loading: boolean } } = {};

  constructor(
    private investisseurService: InvestisseurService,
    private miseFondsService: MiseFondsService,
    private conventionService: ConventionService,
    private chatbotService: ChatbotService,
    private openRouterService: OpenRouterService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    // Load investor profile
    this.investisseurService.getInvestisseurByUserId(this.currentUserId).subscribe({
      next: (data) => {
        this.investisseur = data;
        if (data.id) {
          this.loadMisesFonds(data.id);
          this.loadConventions(data.id);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil investisseur:', err);
        this.loading = false;
        this.error = 'Le backend n\'est pas disponible. Veuillez démarrer le serveur Spring Boot sur le port 8085.';
      }
    });
  }

  loadMisesFonds(investisseurId: number): void {
    this.miseFondsService.getMisesFondsByInvestisseur(investisseurId).subscribe({
      next: (data) => {
        this.misesFonds = data;
        this.loading = false;

        // Analyser uniquement les mises de fonds en attente qui n'ont pas encore d'analyse
        data.forEach(mise => {
          if (mise.statut === StatutMiseFonds.EN_ATTENTE && mise.id) {
            // Vérifier si l'analyse existe déjà dans la base de données
            if (mise.pourcentageAcceptation !== null && mise.pourcentageAcceptation !== undefined && mise.causeAcceptation) {
              // Utiliser les données existantes
              this.analysesInvestissement[mise.id] = {
                pourcentage: mise.pourcentageAcceptation,
                cause: mise.causeAcceptation,
                loading: false
              };
            } else {
              // Si les données sont null, utiliser une valeur par défaut pour éviter la ré-analyse
              // L'utilisateur peut cliquer sur un bouton pour relancer l'analyse si nécessaire
              this.analysesInvestissement[mise.id] = {
                pourcentage: 50,
                cause: 'Analyse non effectuée',
                loading: false
              };
            }
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des mises de fonds:', err);
        this.loading = false;
      }
    });
  }

  analyserMiseFonds(mise: MiseFonds): void {
    if (!mise.id) return;

    // Marquer comme en cours de chargement
    this.analysesInvestissement[mise.id] = { pourcentage: 0, cause: '', loading: true };
    this.cdr.detectChanges();

    this.openRouterService.analyserInvestissement({
      montant: mise.montant,
      projetId: mise.projetId || 0,
      dateSoumission: mise.dateSoumission || '',
      investisseurId: this.investisseur?.id || 0
    }).subscribe({
      next: (result) => {
        // Sauvegarder dans la base de données
        this.miseFondsService.mettreAJourAnalyseIA(mise.id!, result.pourcentage, result.cause).subscribe({
          next: () => {
            this.analysesInvestissement[mise.id!] = {
              pourcentage: result.pourcentage,
              cause: result.cause,
              loading: false
            };
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Erreur lors de la sauvegarde de l\'analyse:', err);
            // Afficher quand même le résultat même si la sauvegarde échoue
            this.analysesInvestissement[mise.id!] = {
              pourcentage: result.pourcentage,
              cause: result.cause,
              loading: false
            };
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors de l\'analyse IA:', err);
        this.analysesInvestissement[mise.id!] = {
          pourcentage: 50,
          cause: 'Analyse non disponible',
          loading: false
        };
        this.cdr.detectChanges();
      }
    });
  }

  loadConventions(investisseurId: number): void {
    this.conventionService.getConventionsByInvestisseur(investisseurId).subscribe({
      next: (data) => {
        this.conventions = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des conventions:', err);
      }
    });
  }

  getStatutMiseFondsLabel(statut: StatutMiseFonds): string {
    const labels: Record<StatutMiseFonds, string> = {
      EN_ATTENTE: '⏳ En attente',
      EN_REVISION: '🔄 En révision',
      VALIDEE: '✅ Validée',
      REFUSEE: '❌ Refusée',
      ANNULEE: '🚫 Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutConventionLabel(statut: StatutConvention): string {
    const labels: Record<StatutConvention, string> = {
      EN_COURS_SIGNATURE: '🔄 En cours de signature',
      ACTIVE: '✅ Active',
      EXPIREE: '⏰ Expirée',
      RESILIEE: '🚫 Résiliée',
      SUSPENDUE: '⏸️ Suspendue'
    };
    return labels[statut] || statut;
  }

  formatMontant(montant: number): string {
    if (!montant) return '-';
    return new Intl.NumberFormat('fr-TN', { 
      style: 'currency', 
      currency: 'TND',
      maximumFractionDigits: 0 
    }).format(montant);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getMisesFondsEnAttente(): MiseFonds[] {
    return this.misesFonds.filter(mf => mf.statut === StatutMiseFonds.EN_ATTENTE);
  }

  getConventionsActives(): Convention[] {
    return this.conventions.filter(c => c.statut === StatutConvention.ACTIVE);
  }

  annulerMiseFonds(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette mise de fonds ?')) {
      this.miseFondsService.annulerMiseFonds(id).subscribe({
        next: () => {
          this.loadMisesFonds(this.investisseur?.id || 0);
        },
        error: (err) => {
          console.error('Erreur lors de l\'annulation:', err);
          this.error = 'Erreur lors de l\'annulation';
        }
      });
    }
  }

  // Chatbot methods
  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
  }

  sendMessage(): void {
    if (!this.chatInput.trim() || this.chatLoading) {
      return;
    }

    const userMessage = this.chatInput.trim();
    this.chatMessages.push({ role: 'user', content: userMessage });
    this.chatInput = '';
    this.chatLoading = true;
    this.chatError = null;

    // Prepare context about investor's investments
    const context = this.prepareInvestmentContext();

    this.chatbotService.sendMessage(userMessage, context).subscribe({
      next: (response) => {
        console.log('✅ Chatbot: Réponse reçue:', response);

        if (response.error) {
          // Service returned an error response
          this.chatMessages.push({ role: 'assistant', content: `⚠️ ${response.message}` });
          this.chatError = response.message;
        } else {
          // Successful response
          const aiMessage = response.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
          this.chatMessages.push({ role: 'assistant', content: aiMessage });
        }
        this.chatLoading = false;
      },
      error: (err) => {
        console.error('❌ Erreur lors de l\'envoi du message:', err);
        this.chatError = 'Erreur de communication avec le chatbot. Veuillez réessayer.';
        this.chatMessages.push({ role: 'assistant', content: '⚠️ Erreur de communication avec le chatbot. Veuillez réessayer.' });
        this.chatLoading = false;
      }
    });
  }

  prepareInvestmentContext(): string {
    const contextParts = [];

    if (this.investisseur) {
      contextParts.push(`Investisseur: ${this.investisseur.nom}, Type: ${this.investisseur.typeInvestisseur}`);
    }

    // Résumé des mises de fonds (limité aux 5 dernières)
    if (this.misesFonds.length > 0) {
      const recentMisesFonds = this.misesFonds.slice(-5);
      contextParts.push(`Mises de fonds: ${this.misesFonds.length} total, ${recentMisesFonds.length} récentes`);
      recentMisesFonds.forEach(mf => {
        contextParts.push(`- Projet ${mf.projetId}: ${mf.montant}€ (${mf.statut})`);
      });
    }

    // Résumé des conventions (limité aux 3 dernières)
    if (this.conventions.length > 0) {
      const recentConventions = this.conventions.slice(-3);
      contextParts.push(`Conventions: ${this.conventions.length} total, ${recentConventions.length} actives`);
      recentConventions.forEach(conv => {
        contextParts.push(`- Convention ${conv.id}: ${conv.montant}€ (${conv.statut})`);
      });
    }

    if (this.stats) {
      contextParts.push(`Total investi: ${this.stats.totalInvesti}€, Projets: ${this.stats.projetsEnCours}, ROI: ${this.stats.roiMoyen}%`);
    }

    return contextParts.join('\n');
  }

  clearChat(): void {
    this.chatMessages = [];
    this.chatError = null;
  }
}
