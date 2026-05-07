package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence unique de la transaction
    @Column(name = "reference",
            unique = true,
            nullable = false,
            length = 50)
    private String reference;

    // Montant de la transaction
    @NotNull(message = "Le montant est obligatoire")
    @Column(nullable = false)
    private Double montant;

    // Type de transaction
    @Enumerated(EnumType.STRING)
    @Column(name = "type_transaction",
            nullable = false)
    private TypeTransaction typeTransaction;

    // Statut de la transaction
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutTransaction statut
            = StatutTransaction.EN_COURS;

    // Description
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    // ID expéditeur (qui envoie l'argent)
    @Column(name = "expediteur_id",
            nullable = false)
    private Long expediteurId;

    // ID destinataire (qui reçoit l'argent)
    @Column(name = "destinataire_id",
            nullable = false)
    private Long destinataireId;

    // Motif d'échec si échouée
    @Column(name = "motif_echec",
            columnDefinition = "TEXT",
            nullable = true)
    private String motifEchec;

    // Numéro de transaction externe (banque)
    @Column(name = "numero_externe",
            nullable = true,
            length = 100)
    private String numeroExterne;

    // Dates
    @Column(name = "date_transaction",
            nullable = false)
    private LocalDateTime dateTransaction
            = LocalDateTime.now();

    @Column(name = "date_validation",
            nullable = true)
    private LocalDateTime dateValidation;

    // Lien vers le paiement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paiement_id",
            nullable = false)
    @JsonIgnoreProperties({
            "transactions", "factures",
            "echeances", "commissions"
    })
    private Paiement paiement;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum TypeTransaction {
        PAIEMENT_INITIAL,    // premier versement
        PAIEMENT_SOLDE,      // dernier versement
        REMBOURSEMENT,       // remboursement
        COMMISSION,          // commission plateforme
        ACOMPTE              // acompte intermédiaire
    }

    public enum StatutTransaction {
        EN_COURS,    // en traitement
        VALIDEE,     // confirmée
        ECHOUEE,     // échouée
        ANNULEE,     // annulée
        REMBOURSEE   // remboursée
    }
}