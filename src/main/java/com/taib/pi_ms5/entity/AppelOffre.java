package com.taib.pi_ms5.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "appels_offres")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppelOffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "date_ouverture")
    private LocalDateTime dateOuverture;

    @Column(name = "date_cloture", nullable = false)
    private LocalDateTime dateCloture;

    @Column(name = "budget_total")
    private Double budgetTotal;

    // Conditions de participation (texte libre)
    @Column(name = "conditions_participation", columnDefinition = "TEXT")
    private String conditionsParticipation;

    // Documents requis (stockés en JSON ou texte séparé par virgule)
    @Column(name = "documents_requis", columnDefinition = "TEXT")
    private String documentsRequis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAppelOffre statut = StatutAppelOffre.OUVERT;

    // Relation 1-1 avec Offre
    // L'AppelOffre POSSÈDE la clé étrangère vers Offre
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offre_id", nullable = false)
    @JsonBackReference   // ← côté enfant
    private Offre offre;

    public enum StatutAppelOffre {
        OUVERT,
        CLOTURE,
        ANNULE,
        ATTRIBUE
    }
}