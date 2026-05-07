package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidatures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidature {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE — OBLIGATOIRES
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "La lettre de motivation est obligatoire")
    @Column(name = "lettre_motivation",
            nullable = false,
            columnDefinition = "TEXT")
    private String lettreMotivation;

    @Column(name = "portfolio_url",
            nullable = true)          // ← optionnel
    private String portfolioUrl;

    @NotNull(message = "Le tarif proposé est obligatoire")
    @Column(name = "tarif_propose",
            nullable = false)
    private Double tarifPropose;

    @Column(name = "date_soumission",
            nullable = true)          // ← optionnel
    private LocalDateTime dateSoumission = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCandidature statut = StatutCandidature.EN_ATTENTE;

    @Column(name = "candidat_id",
            nullable = false)
    private Long candidatId;

    // ═══════════════════════════════════════════
    // ATTRIBUTS IA — TOUS OPTIONNELS (nullable)
    // ═══════════════════════════════════════════

    // Score global calculé par l'IA (0 à 100)
    @Column(name = "score_ia",
            nullable = true)          // ← optionnel
    private Integer scoreIa;

    // Résumé du CV fourni par le candidat
    @Column(name = "cv_resume",
            length = 1000,
            nullable = true)          // ← optionnel
    private String cvResume;

    // Rapport complet généré par l'IA
    @Column(name = "ai_report",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String aiReport;

    // Niveau de compatibilité avec l'offre
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_compatibilite",
            nullable = true)          // ← optionnel
    private NiveauCompatibilite niveauCompatibilite;

    // Résumé automatique du profil candidat
    @Column(name = "resume_ia",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String resumeIa;

    // Points forts détectés par l'IA
    @Column(name = "points_forts_ia",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String pointsFortsIa;

    // Points faibles détectés par l'IA
    @Column(name = "points_faibles_ia",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String pointsFaiblesIa;

    // Mots clés détectés dans la lettre
    @Column(name = "mots_cles_detectes",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String motsClesDetectes;

    // Recommandation finale de l'IA
    @Enumerated(EnumType.STRING)
    @Column(name = "recommandation_ia",
            nullable = true)          // ← optionnel
    private RecommandationIa recommandationIa;

    // Ton de la lettre de motivation
    @Enumerated(EnumType.STRING)
    @Column(name = "ton_lettre",
            nullable = true)          // ← optionnel
    private TonLettre tonLettre;

    // Analyse détaillée de la lettre
    @Column(name = "analyse_lettre",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String analyseLettre;

    // Score spécifique pour la lettre (0-100)
    @Column(name = "score_lettre",
            nullable = true)          // ← optionnel
    private Double scoreLettre;

    // Score spécifique pour le portfolio (0-100)
    @Column(name = "score_portfolio",
            nullable = true)          // ← optionnel
    private Double scorePortfolio;

    // Score spécifique pour le tarif (0-100)
    @Column(name = "score_tarif",
            nullable = true)          // ← optionnel
    private Double scoreTarif;

    // Fraude détectée ou non
    @Column(name = "fraude_detectee",
            nullable = true)          // ← optionnel
    private Boolean fraudeDetectee = false;

    // Détail de la fraude si détectée
    @Column(name = "detail_fraude",
            columnDefinition = "TEXT",
            nullable = true)          // ← optionnel
    private String detailFraude;

    // Date et heure de l'analyse IA
    @Column(name = "date_analyse_ia",
            nullable = true)          // ← optionnel
    private LocalDateTime dateAnalyseIa;

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id", nullable = false)
    @JsonIgnoreProperties({
            "candidatures", "criteres", "appelOffre"
    })
    private Offre offre;

    @OneToOne(mappedBy = "candidature",
            cascade = CascadeType.ALL)
    private Evaluation evaluation;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutCandidature {
        EN_ATTENTE,
        EN_REVISION,
        SHORTLIST,
        ACCEPTEE,
        REFUSEE
    }

    public enum NiveauCompatibilite {
        FAIBLE,       // score 0-25
        MOYEN,        // score 26-50
        FORT,         // score 51-75
        EXCELLENT     // score 76-100
    }

    public enum RecommandationIa {
        ACCEPTER,     // score > 75
        SHORTLIST,    // score entre 50 et 75
        REFUSER       // score < 50
    }

    public enum TonLettre {
        PROFESSIONNEL,
        ENTHOUSIASTE,
        NEUTRE,
        INSUFFISANT
    }
}