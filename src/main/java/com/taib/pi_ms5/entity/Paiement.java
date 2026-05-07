package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "paiements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence unique du paiement
    @Column(name = "reference",
            unique = true,
            nullable = false,
            length = 50)
    private String reference;

    // Montant total à payer
    @NotNull(message = "Le montant est obligatoire")
    @Column(name = "montant_total",
            nullable = false)
    private Double montantTotal;

    // Montant déjà payé
    @Column(name = "montant_paye",
            nullable = false)
    private Double montantPaye = 0.0;

    // Montant restant
    @Column(name = "montant_restant",
            nullable = false)
    private Double montantRestant;

    // Devise
    @Column(nullable = false, length = 10)
    private String devise = "TND";

    // Taux de TVA appliqué
    @Column(name = "taux_tva",
            nullable = false)
    private Double tauxTva = 19.0;

    // Montant TVA calculé
    @Column(name = "montant_tva",
            nullable = true)
    private Double montantTva;

    // Taux de commission plateforme
    @Column(name = "taux_commission",
            nullable = false)
    private Double tauxCommission = 5.0;

    // Montant commission calculé
    @Column(name = "montant_commission",
            nullable = true)
    private Double montantCommission;

    // Statut du paiement
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPaiement statut
            = StatutPaiement.EN_ATTENTE;

    // Mode de paiement
    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement",
            nullable = true)
    private ModePaiement modePaiement;

    // ═══════════════════════════════════════════
    // PARTIES PRENANTES
    // ═══════════════════════════════════════════

    // Payeur (client — Ahmed)
    @Column(name = "payeur_id",
            nullable = false)
    private Long payeurId;

    // Bénéficiaire (prestataire — Sarra)
    @Column(name = "beneficiaire_id",
            nullable = false)
    private Long beneficiaireId;

    // ═══════════════════════════════════════════
    // LIENS AVEC AUTRES MODULES
    // ═══════════════════════════════════════════

    // Lié au contrat (Module 3)
    @Column(name = "contrat_id",
            nullable = true)
    private Long contratId;

    // Lié à une mise de fonds (Module 4)
    @Column(name = "mise_fonds_id",
            nullable = true)
    private Long miseFondsId;

    // ═══════════════════════════════════════════
    // DATES
    // ═══════════════════════════════════════════

    @Column(name = "date_creation",
            nullable = true)
    private LocalDateTime dateCreation
            = LocalDateTime.now();

    @Column(name = "date_echeance",
            nullable = true)
    private LocalDateTime dateEcheance;

    @Column(name = "date_paiement_complet",
            nullable = true)
    private LocalDateTime datePaiementComplet;

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    @OneToMany(
            mappedBy = "paiement",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("paiement")
    private List<Transaction> transactions;

    @OneToMany(
            mappedBy = "paiement",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("paiement")
    private List<Facture> factures;

    @OneToMany(
            mappedBy = "paiement",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("paiement")
    private List<Echeance> echeances;

    @OneToMany(
            mappedBy = "paiement",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("paiement")
    private List<Commission> commissions;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutPaiement {
        EN_ATTENTE,       // paiement créé
        PARTIELLEMENT_PAYE, // une partie payée
        PAYE,             // tout payé
        EN_RETARD,        // dépasse la deadline
        REMBOURSE,        // remboursé
        ANNULE,           // annulé
        BLOQUE            // bloqué par admin
    }

    public enum ModePaiement {
        VIREMENT_BANCAIRE,
        CHEQUE,
        ESPECES,
        CARTE_BANCAIRE,
        FLOUCI,           // paiement mobile tunisien
        D17               // paiement mobile tunisien
    }
}