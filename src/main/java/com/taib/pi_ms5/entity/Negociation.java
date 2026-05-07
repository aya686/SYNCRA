package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "negociations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Negociation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Statut de la négociation
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutNegociation statut
            = StatutNegociation.EN_COURS;

    // Termes proposés initialement
    @Column(name = "montant_propose",
            nullable = true)
    private Double montantPropose;

    @Column(name = "pourcentage_propose",
            nullable = true)
    private Double pourcentagePropose;

    @Column(name = "duree_proposee",
            nullable = true)
    private Integer dureeProposeeMois;

    // Termes négociés finaux
    @Column(name = "montant_final",
            nullable = true)
    private Double montantFinal;

    @Column(name = "pourcentage_final",
            nullable = true)
    private Double pourcentageFinal;

    @Column(name = "duree_finale",
            nullable = true)
    private Integer dureeFinaleMois;

    // Clause rachat négociée
    @Column(name = "clause_rachat_negociee",
            nullable = false)
    private Boolean clauseRachatNegociee = false;

    // Dates
    @Column(name = "date_ouverture",
            nullable = true)
    private LocalDateTime dateOuverture
            = LocalDateTime.now();

    @Column(name = "date_cloture",
            nullable = true)
    private LocalDateTime dateCloture;

    // ID investisseur (MS1)
    @Column(name = "investisseur_user_id",
            nullable = false)
    private Long investisseurUserId;

    // ID porteur de projet (MS1)
    @Column(name = "porteur_user_id",
            nullable = false)
    private Long porteurUserId;

    // Lié à une mise de fonds
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mise_fonds_id",
            nullable = false)
    @JsonIgnoreProperties("negociations")
    private MiseFonds miseFonds;

    // Messages de la négociation
    @OneToMany(
            mappedBy = "negociation",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnoreProperties("negociation")
    private List<MessageNegociation> messages;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum StatutNegociation {
        EN_COURS,   // négociation active
        ACCEPTEE,   // accord trouvé
        ECHOUEE,    // pas d'accord
        ANNULEE     // annulée
    }
}