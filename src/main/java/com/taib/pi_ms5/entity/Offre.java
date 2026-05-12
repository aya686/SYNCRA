package com.taib.pi_ms5.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "offres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Offre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    @NotBlank(message = "La description est obligatoire")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Le budget minimum est obligatoire")
    @DecimalMin(value = "0.0", message = "Le budget doit être positif")
    @Column(name = "budget_min", nullable = false)
    private Double budgetMin;

    @Column(name = "budget_max")
    private Double budgetMax;

    @NotNull(message = "La deadline est obligatoire")
    @Column(nullable = false)
    private LocalDateTime deadline;

    @Column(name = "date_publication")
    private LocalDateTime datePublication = LocalDateTime.now();

    // Enum pour le statut de l'offre
    @Enumerated(EnumType.STRING)   // Stocké comme texte dans BDD : "ACTIVE", "CLOTUREE"...
    @Column(nullable = false)
    private StatutOffre statut = StatutOffre.BROUILLON;

    @Column(name = "nombre_postes")
    private Integer nombrePostes = 1;   // Combien de personnes recherchées

    // Lien vers la catégorie
    // @ManyToOne = plusieurs offres → une catégorie
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categorie_id", nullable = false)
    private Categorie categorie;

    // L'appel d'offres lié (relation 1-1)
    @OneToOne(mappedBy = "offre", cascade = CascadeType.ALL)
    @JsonManagedReference   // ← côté parent
    private AppelOffre appelOffre;

    // Les critères de cette offre
    @OneToMany(mappedBy = "offre", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference   // ← côté parent
    private List<Critere> criteres;

    // ID de l'utilisateur publieur (vient de MS1)
    @Column(name = "publieur_id", nullable = false)
    private Long publieurId;

    // ID du projet lié (vient de MS2, optionnel)
    @Column(name = "projet_id")
    private Long projetId;

    // Indicateur si l'offre est suspecte selon l'IA
    @Column(name = "est_suspecte")
    private Boolean estSuspecte = false;

    // Enum des statuts possibles d'une offre
    public enum StatutOffre {
        BROUILLON,    // pas encore publiée
        ACTIVE,       // visible et ouverte
        CLOTUREE,     // plus de candidatures
        ARCHIVEE,     // archivée
        SUSPENDUE     // suspendue par admin
    }
}