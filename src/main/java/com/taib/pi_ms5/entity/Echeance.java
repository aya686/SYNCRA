package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "echeances")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Echeance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Numéro de l'échéance (1, 2, 3...)
    @Column(name = "numero_echeance",
            nullable = false)
    private Integer numeroEcheance;

    // Montant de l'échéance
    @NotNull(message = "Le montant est obligatoire")
    @Column(nullable = false)
    private Double montant;

    // Pourcentage du total
    @Column(name = "pourcentage",
            nullable = true)
    private Double pourcentage;

    // Description de l'échéance
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    // Statut de l'échéance
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutEcheance statut
            = StatutEcheance.EN_ATTENTE;

    // Date prévue de paiement
    @Column(name = "date_echeance",
            nullable = false)
    private LocalDateTime dateEcheance;

    // Date de paiement effectif
    @Column(name = "date_paiement",
            nullable = true)
    private LocalDateTime datePaiement;

    // Rappel envoyé ou non
    @Column(name = "rappel_envoye",
            nullable = false)
    private Boolean rappelEnvoye = false;

    // Date du rappel
    @Column(name = "date_rappel",
            nullable = true)
    private LocalDateTime dateRappel;

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
    // ENUM
    // ═══════════════════════════════════════════

    public enum StatutEcheance {
        EN_ATTENTE,  // pas encore payée
        PAYEE,       // payée
        EN_RETARD,   // date dépassée
        ANNULEE      // annulée
    }
}