package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "mises_fonds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MiseFonds {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Montant proposé
    @NotNull(message = "Le montant est obligatoire")
    @Column(nullable = false)
    private Double montant;

    // Pourcentage de participation souhaité
    @NotNull(message = "Le pourcentage est obligatoire")
    @Column(name = "pourcentage_participation",
            nullable = false)
    private Double pourcentageParticipation;

    // Durée souhaitée en mois
    @Column(name = "duree_mois", nullable = true)
    private Integer dureeMois;

    // Type d'investissement
    @Enumerated(EnumType.STRING)
    @Column(name = "type_investissement",
            nullable = false)
    private TypeInvestissement typeInvestissement
            = TypeInvestissement.PRISE_PARTICIPATION;

    // Statut de la mise de fonds
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutMiseFonds statut
            = StatutMiseFonds.EN_ATTENTE;

    // Preuve de fonds (URL document)
    @Column(name = "preuve_fonds",
            nullable = true)
    private String preuveFonds;

    // RIB bancaire
    @Column(name = "rib_bancaire",
            nullable = true,
            length = 50)
    private String ribBancaire;

    // Motif de refus si refusé
    @Column(name = "motif_refus",
            columnDefinition = "TEXT",
            nullable = true)
    private String motifRefus;

    // ═══════════════════════════════════════════
    // ATTRIBUTS IA
    // ═══════════════════════════════════════════

    // Score de viabilité calculé par l'IA
    @Column(name = "score_viabilite",
            nullable = true)
    private Double scoreViabilite;

    // ROI estimé par l'IA
    @Column(name = "roi_estime",
            nullable = true)
    private Double roiEstime;

    // Niveau de risque
    @Enumerated(EnumType.STRING)
    @Column(name = "niveau_risque",
            nullable = true)
    private NiveauRisque niveauRisque;

    // Recommandation IA
    @Column(name = "recommandation_ia",
            columnDefinition = "TEXT",
            nullable = true)
    private String recommandationIa;

    // Pourcentage d'acceptation calculé par l'IA (0-100)
    @Column(name = "pourcentage_acceptation",
            nullable = true)
    private Integer pourcentageAcceptation;

    // Cause de la décision d'acceptation/refus
    @Column(name = "cause_acceptation",
            columnDefinition = "TEXT",
            nullable = true)
    private String causeAcceptation;

    // ═══════════════════════════════════════════
    // DATES
    // ═══════════════════════════════════════════

    @Column(name = "date_soumission",
            nullable = true)
    private LocalDateTime dateSoumission
            = LocalDateTime.now();

    @Column(name = "date_traitement",
            nullable = true)
    private LocalDateTime dateTraitement;

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    // Lié à un investisseur
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investisseur_id",
            nullable = false)
    @JsonIgnoreProperties({
            "misesFonds", "conventions"
    })
    private Investisseur investisseur;

    // Lié à un projet (MS2)
    @Column(name = "projet_id", nullable = false)
    private Long projetId;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutMiseFonds {
        EN_ATTENTE,   // soumise, pas encore traitée
        EN_REVISION,  // admin examine le dossier
        VALIDEE,      // approuvée par l'admin
        REFUSEE,      // rejetée
        ANNULEE       // annulée par l'investisseur
    }

    public enum TypeInvestissement {
        PRISE_PARTICIPATION, // prendre des parts
        PRET,                // prêt à rembourser
        DON                  // don sans retour
    }

    public enum NiveauRisque {
        FAIBLE,
        MOYEN,
        ELEVE,
        TRES_ELEVE
    }
}