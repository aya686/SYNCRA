package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "investisseurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Investisseur {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID de l'utilisateur lié (MS1)
    @Column(name = "user_id",
            nullable = false,
            unique = true)
    private Long userId;

    // Nom complet
    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 200)
    private String nom;

    // Email
    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, length = 200)
    private String email;

    // Téléphone
    @Column(nullable = true, length = 20)
    private String telephone;

    // Type d'investisseur
    @Enumerated(EnumType.STRING)
    @Column(name = "type_investisseur",
            nullable = false)
    private TypeInvestisseur typeInvestisseur
            = TypeInvestisseur.PRIVE;

    // Secteurs d'intérêt
    @Column(name = "secteurs_interet",
            columnDefinition = "TEXT",
            nullable = true)
    private String secteursInteret;

    // Budget total disponible
    @Column(name = "budget_total",
            nullable = true)
    private Double budgetTotal;

    // RIB bancaire
    @Column(name = "rib_bancaire",
            nullable = true,
            length = 50)
    private String ribBancaire;

    // Document justificatif (URL)
    @Column(name = "document_justificatif",
            nullable = true)
    private String documentJustificatif;

    // Profil vérifié par l'admin
    @Column(name = "profil_verifie",
            nullable = false)
    private Boolean profilVerifie = false;

    // Score de fiabilité (calculé par IA)
    @Column(name = "score_fiabilite",
            nullable = true)
    private Double scoreFiabilite;

    // Date de création du profil
    @Column(name = "date_creation",
            nullable = true)
    private LocalDateTime dateCreation
            = LocalDateTime.now();

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    @OneToMany(
            mappedBy = "investisseur",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("investisseur")
    private List<MiseFonds> misesFonds;

    @OneToMany(
            mappedBy = "investisseur",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("investisseur")
    private List<Convention> conventions;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum TypeInvestisseur {
        PRIVE,          // investisseur particulier
        ENTREPRISE,     // société qui investit
        INSTITUTIONNEL, // banque, organisme d'état
        BUSINESS_ANGEL  // business angel
    }
}