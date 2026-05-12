package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "factures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Numéro de facture unique
    @Column(name = "numero_facture",
            unique = true,
            nullable = false,
            length = 50)
    private String numeroFacture;

    // Titre de la facture
    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    // Montant HT (hors taxes)
    @Column(name = "montant_ht",
            nullable = false)
    private Double montantHt;

    // Taux TVA
    @Column(name = "taux_tva",
            nullable = false)
    private Double tauxTva = 19.0;

    // Montant TVA
    @Column(name = "montant_tva",
            nullable = false)
    private Double montantTva;

    // Montant TTC (toutes taxes comprises)
    @Column(name = "montant_ttc",
            nullable = false)
    private Double montantTtc;

    // Statut de la facture
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutFacture statut
            = StatutFacture.EMISE;

    // Type de facture
    @Enumerated(EnumType.STRING)
    @Column(name = "type_facture",
            nullable = false)
    private TypeFacture typeFacture
            = TypeFacture.FACTURE;

    // Informations émetteur
    @Column(name = "emetteur_id",
            nullable = false)
    private Long emetteurId;

    @Column(name = "nom_emetteur",
            nullable = true,
            length = 200)
    private String nomEmetteur;

    // Informations destinataire
    @Column(name = "destinataire_id",
            nullable = false)
    private Long destinataireId;

    @Column(name = "nom_destinataire",
            nullable = true,
            length = 200)
    private String nomDestinataire;

    // Notes supplémentaires
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String notes;

    // URL du PDF généré
    @Column(name = "pdf_url",
            nullable = true)
    private String pdfUrl;

    // Dates
    @Column(name = "date_emission",
            nullable = false)
    private LocalDateTime dateEmission
            = LocalDateTime.now();

    @Column(name = "date_echeance",
            nullable = true)
    private LocalDateTime dateEcheance;

    @Column(name = "date_paiement",
            nullable = true)
    private LocalDateTime datePaiement;

    // Lien vers le paiement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_id",
            nullable = false)
    @JsonIgnoreProperties({
            "transactions", "factures",
            "echeances", "commissions"
    })
    private Paiement paiement;

    // Lignes de la facture
    @OneToMany(
            mappedBy = "facture",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnoreProperties("facture")
    private List<LigneFacture> lignes;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutFacture {
        EMISE,       // facture créée
        ENVOYEE,     // envoyée au client
        PAYEE,       // paiement reçu
        EN_RETARD,   // date échéance dépassée
        ANNULEE      // annulée
    }

    public enum TypeFacture {
        FACTURE,         // facture normale
        AVOIR,           // note de crédit
        PROFORMA,        // facture proforma
        RECU             // reçu de paiement
    }
}