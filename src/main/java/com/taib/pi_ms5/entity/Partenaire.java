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
@Table(name = "partenaires")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Partenaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom du partenaire
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 200)
    private String nom;

    // Description
    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    // Type de partenaire
    @Enumerated(EnumType.STRING)
    @Column(name = "type_partenaire",
            nullable = false)
    private TypePartenaire typePartenaire;

    // Email de contact
    @Column(nullable = true, length = 200)
    private String email;

    // Téléphone
    @Column(nullable = true, length = 20)
    private String telephone;

    // Site web
    @Column(name = "site_web",
            nullable = true,
            length = 200)
    private String siteWeb;

    // Logo URL
    @Column(name = "logo_url",
            nullable = true)
    private String logoUrl;

    // Périmètre d'intervention
    @Column(name = "perimetre",
            columnDefinition = "TEXT",
            nullable = true)
    private String perimetre;

    // Montant total engagé
    @Column(name = "montant_total_engage",
            nullable = true)
    private Double montantTotalEngage;

    // Nombre de projets couverts
    @Column(name = "nombre_projets_couverts",
            nullable = true)
    private Integer nombreProjetsCouvers;

    // Actif ou non
    @Column(nullable = false)
    private Boolean actif = true;

    // Date de début du partenariat
    @Column(name = "date_debut",
            nullable = true)
    private LocalDateTime dateDebut;

    // Date de création
    @Column(name = "date_creation",
            nullable = true)
    private LocalDateTime dateCreation
            = LocalDateTime.now();

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    @OneToMany(
            mappedBy = "partenaire",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("partenaire")
    private List<Convention> conventions;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum TypePartenaire {
        BANQUE,           // banque commerciale
        ORGANISME_ETAT,   // organisme gouvernemental
        FONDS_INVESTISSEMENT, // fonds d'investissement
        INCUBATEUR,       // incubateur startup
        AUTRE
    }
}