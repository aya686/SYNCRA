package com.taib.pi_ms5.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "criteres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Critere {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom du critère est obligatoire")
    @Column(nullable = false, length = 200)
    private String nom;              // ex: "Expérience React"

    @Column(columnDefinition = "TEXT")
    private String description;      // explication du critère

    // Poids entre 0 et 100 (en pourcentage)
    @Min(value = 0, message = "Le poids doit être entre 0 et 100")
    @Max(value = 100, message = "Le poids doit être entre 0 et 100")
    @Column(nullable = false)
    private Integer poids = 10;      // importance du critère

    @Column(nullable = false)
    private Boolean obligatoire = false;   // critère obligatoire ou non

    // Type de critère
    @Enumerated(EnumType.STRING)
    @Column(name = "type_critere")
    private TypeCritere typeCritere = TypeCritere.COMPETENCE;

    // Lien vers l'offre
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id", nullable = false)
    @JsonBackReference   // ← côté enfant
    private Offre offre;

    public enum TypeCritere {
        COMPETENCE,      // compétence technique
        EXPERIENCE,      // années d'expérience
        DIPLOME,         // diplôme requis
        LANGUE,          // langue parlée
        DISPONIBILITE,   // disponibilité
        AUTRE
    }
}