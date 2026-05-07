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
@Table(name = "contrats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contrat {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Titre du contrat
    @NotBlank(message = "Le titre est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    // Description générale
    @Column(columnDefinition = "TEXT")
    private String description;

    // Montant total du contrat
    @NotNull(message = "Le montant est obligatoire")
    @Column(nullable = false)
    private Double montant;

    // Modalité de paiement
    @Column(name = "modalite_paiement",
            columnDefinition = "TEXT",
            nullable = true)
    private String modalitePaiement;

    // Date de début
    @Column(name = "date_debut", nullable = true)
    private LocalDateTime dateDebut;

    // Date de fin prévue
    @Column(name = "date_fin", nullable = true)
    private LocalDateTime dateFin;

    // Date de génération du contrat
    @Column(name = "date_generation")
    private LocalDateTime dateGeneration
            = LocalDateTime.now();

    // Statut du contrat
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutContrat statut
            = StatutContrat.BROUILLON;

    // ═══════════════════════════════════════════
    // PARTIES PRENANTES
    // ═══════════════════════════════════════════

    // ID du client (publieur de l'offre — MS1)
    @Column(name = "client_id", nullable = false)
    private Long clientId;

    // ID du prestataire (candidat accepté — MS1)
    @Column(name = "prestataire_id", nullable = false)
    private Long prestataireId;

    // ═══════════════════════════════════════════
    // LIENS AVEC AUTRES MODULES
    // ═══════════════════════════════════════════

    // Lié à une candidature acceptée (Module 2)
    @Column(name = "candidature_id", nullable = true)
    private Long candidatureId;

    // Lié à une offre (Module 1)
    @Column(name = "offre_id", nullable = true)
    private Long offreId;

    // ID du paiement lié (Module 5)
    @Column(name = "paiement_id", nullable = true)
    private Long paiementId;

    // ═══════════════════════════════════════════
    // RELATIONS
    // ═══════════════════════════════════════════

    // Les clauses du contrat
    @OneToMany(
            mappedBy = "contrat",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnoreProperties("contrat")
    private List<Clause> clauses;

    // Les signatures du contrat
    @OneToMany(
            mappedBy = "contrat",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonIgnoreProperties("contrat")
    private List<Signature> signatures;

    // Les litiges du contrat
    @OneToMany(
            mappedBy = "contrat",
            cascade = CascadeType.ALL
    )
    @JsonIgnoreProperties("contrat")
    private List<Litige> litiges;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum StatutContrat {
        BROUILLON,    // généré, pas encore signé
        EN_ATTENTE,   // une partie a signé
        ACTIF,        // les deux ont signé
        TERMINE,      // mission accomplie
        RESILIE,      // résilié avant terme
        LITIGE        // problème signalé
    }
}