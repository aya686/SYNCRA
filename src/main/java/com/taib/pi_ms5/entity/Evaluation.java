package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Note donnée par le publieur (1 à 5)
    @Column(nullable = false)
    private Integer note;

    // Commentaire du publieur
    @Column(columnDefinition = "TEXT")
    private String commentaire;

    // Feedback envoyé au candidat si refus
    @Column(name = "feedback_candidat", columnDefinition = "TEXT")
    private String feedbackCandidat;

    // Score calculé par l'IA
    @Column(name = "score_ia")
    private Double scoreIa;

    // Points forts détectés par l'IA
    @Column(name = "points_forts", columnDefinition = "TEXT")
    private String pointsForts;

    // Points faibles détectés par l'IA
    @Column(name = "points_faibles", columnDefinition = "TEXT")
    private String pointsFaibles;

    // Date de l'évaluation
    @Column(name = "date_evaluation")
    private LocalDateTime dateEvaluation = LocalDateTime.now();

    // ID de l'évaluateur (publieur de l'offre, vient de MS1)
    @Column(name = "evaluateur_id")
    private Long evaluateurId;

    // Lien vers la candidature évaluée
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidature_id", nullable = false)
    @JsonIgnoreProperties({"evaluation", "offre"})
    private Candidature candidature;
}