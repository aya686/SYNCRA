package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "commissions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Taux de commission en %
    @NotNull(message = "Le taux est obligatoire")
    @Column(name = "taux",
            nullable = false)
    private Double taux;

    // Montant de base sur lequel la commission est calculée
    @Column(name = "montant_base",
            nullable = false)
    private Double montantBase;

    // Montant de la commission calculé
    @Column(name = "montant_commission",
            nullable = false)
    private Double montantCommission;

    // Statut de la commission
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutCommission statut
            = StatutCommission.EN_ATTENTE;

    // Type de commission
    @Enumerated(EnumType.STRING)
    @Column(name = "type_commission",
            nullable = false)
    private TypeCommission typeCommission
            = TypeCommission.PLATEFORME;

    // Description
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    // Date de calcul
    @Column(name = "date_calcul",
            nullable = true)
    private LocalDateTime dateCalcul
            = LocalDateTime.now();

    // Date de prélèvement
    @Column(name = "date_prelevement",
            nullable = true)
    private LocalDateTime datePrelevement;

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

    public enum StatutCommission {
        EN_ATTENTE,   // pas encore prélevée
        PRELEVEE,     // prélevée
        REMBOURSEE    // remboursée
    }

    public enum TypeCommission {
        PLATEFORME,   // commission de la plateforme
        PARTENAIRE,   // commission partenaire
        AUTRE
    }
}