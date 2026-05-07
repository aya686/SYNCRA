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
@Table(name = "conventions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Convention {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Référence unique de la convention
    @Column(name = "reference",
            unique = true,
            nullable = false,
            length = 50)
    private String reference;

    // Titre de la convention
    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    // Description
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    // Montant de l'investissement
    @NotNull(message = "Le montant est obligatoire")
    @Column(nullable = false)
    private Double montant;

    // Pourcentage de participation
    @Column(name = "pourcentage_participation",
            nullable = false)
    private Double pourcentageParticipation;

    // Durée en mois
    @Column(name = "duree_mois", nullable = true)
    private Integer dureeMois;

    // Clause de rachat possible
    @Column(name = "clause_rachat",
            nullable = false)
    private Boolean clauseRachat = false;

    // Détail de la clause de rachat
    @Column(name = "detail_clause_rachat",
            columnDefinition = "TEXT",
            nullable = true)
    private String detailClauseRachat;

    // Statut de la convention
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutConvention statut
            = StatutConvention.EN_COURS_SIGNATURE;

    // Type de convention
    @Enumerated(EnumType.STRING)
    @Column(name = "type_convention",
            nullable = false)
    private TypeConvention typeConvention
            = TypeConvention.INVESTISSEMENT_PRIVE;

    // ═══════════════════════════════════════════
    // DATES
    // ═══════════════════════════════════════════

    @Column(name = "date_signature",
            nullable = true)
    private LocalDateTime dateSignature;

    @Column(name = "date_debut",
            nullable = true)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin",
            nullable = true)
    private LocalDateTime dateFin;

    @Column(name = "date_creation",
            nullable = true)
    private LocalDateTime dateCreation
            = LocalDateTime.now();

    // ═══════════════════════════════════════════
    // PARTIES PRENANTES
    // ═══════════════════════════════════════════

    // ID du projet financé (MS2)
    @Column(name = "projet_id", nullable = false)
    private Long projetId;

    // ID du porteur de projet (MS1)
    @Column(name = "porteur_id", nullable = false)
    private Long porteurId;

    // Investisseur signataire
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "investisseur_id",
            nullable = true)
    @JsonIgnoreProperties({
            "misesFonds", "conventions"
    })
    private Investisseur investisseur;

    // Partenaire institutionnel signataire
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partenaire_id",
            nullable = true)
    @JsonIgnoreProperties("conventions")
    private Partenaire partenaire;

    // Mise de fonds liée
    @Column(name = "mise_fonds_id",
            nullable = true)
    private Long miseFondsId;

    // Signé par investisseur
    @Column(name = "signe_investisseur",
            nullable = false)
    private Boolean signeInvestisseur = false;

    // Signé par porteur de projet
    @Column(name = "signe_porteur",
            nullable = false)
    private Boolean signePorteur = false;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutConvention {
        EN_COURS_SIGNATURE, // pas encore signée
        ACTIVE,             // signée par les deux
        EXPIREE,            // date fin dépassée
        RESILIEE,           // résiliée avant terme
        SUSPENDUE           // suspendue par admin
    }

    public enum TypeConvention {
        INVESTISSEMENT_PRIVE,       // investisseur privé
        PARTENARIAT_INSTITUTIONNEL, // banque/organisme
        ACCORD_CADRE                // accord général
    }
}