package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "partenariats_entreprise")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartenariatEntreprise {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Lien vers la demande de partenariat approuvée
    @Column(name = "demande_partenariat_id",
            nullable = true)
    private Long demandePartenariatId;

    // ID du premier partenaire (MS1)
    @NotNull(message = "Le partenaire 1 est obligatoire")
    @Column(name = "partenaire1_id",
            nullable = false)
    private Long partenaire1Id;

    // ID du deuxième partenaire (MS1)
    @NotNull(message = "Le partenaire 2 est obligatoire")
    @Column(name = "partenaire2_id",
            nullable = false)
    private Long partenaire2Id;

    // Description du partenariat
    @Column(name = "description_partenariat",
            columnDefinition = "TEXT",
            nullable = true)
    private String descriptionPartenariat;

    // Conditions du partenariat
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String conditions;

    // Date de début
    @Column(name = "date_debut", nullable = true)
    private LocalDateTime dateDebut
            = LocalDateTime.now();

    // Date de fin prévue
    @Column(name = "date_fin", nullable = true)
    private LocalDateTime dateFin;

    // Statut du partenariat
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutPartenariat statut
            = StatutPartenariat.ACTIF;

    // Motif de suspension si suspendu
    @Column(name = "motif_suspension",
            columnDefinition = "TEXT",
            nullable = true)
    private String motifSuspension;

    // Date de création
    @Column(name = "date_creation",
            nullable = true)
    private LocalDateTime dateCreation
            = LocalDateTime.now();

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum StatutPartenariat {
        ACTIF,     // partenariat en cours
        TERMINE,   // partenariat terminé
        SUSPENDU   // partenariat suspendu
    }
}