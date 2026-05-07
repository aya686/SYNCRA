package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "litiges")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Litige {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Motif du litige
    @NotBlank(message = "Le motif est obligatoire")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String motif;

    // Description détaillée
    @Column(columnDefinition = "TEXT", nullable = true)
    private String description;

    // Statut du litige
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLitige statut = StatutLitige.OUVERT;

    // Type de litige
    @Enumerated(EnumType.STRING)
    @Column(name = "type_litige", nullable = true)
    private TypeLitige typeLitige;

    // ID de celui qui a ouvert le litige (MS1)
    @Column(name = "declarant_id", nullable = false)
    private Long declarantId;

    // ID de l'admin qui traite le litige (MS1)
    @Column(name = "admin_id", nullable = true)
    private Long adminId;

    // Décision de l'admin
    @Enumerated(EnumType.STRING)
    @Column(name = "decision_admin", nullable = true)
    private DecisionAdmin decisionAdmin;

    // Commentaire de résolution par l'admin
    @Column(name = "commentaire_resolution",
            columnDefinition = "TEXT",
            nullable = true)
    private String commentaireResolution;

    // Date d'ouverture du litige
    @Column(name = "date_ouverture", nullable = false)
    private LocalDateTime dateOuverture
            = LocalDateTime.now();

    // Date de résolution
    @Column(name = "date_resolution", nullable = true)
    private LocalDateTime dateResolution;

    // Pièces jointes (URLs séparées par virgule)
    @Column(name = "pieces_jointes",
            columnDefinition = "TEXT",
            nullable = true)
    private String piecesJointes;

    // Lien vers le contrat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", nullable = false)
    @JsonIgnoreProperties({
            "clauses", "signatures", "litiges"
    })
    private Contrat contrat;

    // ═══════════════════════════════════════════
    // ENUMS
    // ═══════════════════════════════════════════

    public enum StatutLitige {
        OUVERT,     // vient d'être signalé
        EN_COURS,   // admin a pris en charge
        RESOLU,     // résolu par l'admin
        FERME       // fermé sans suite
    }

    public enum TypeLitige {
        LIVRAISON_RETARD,    // livraison en retard
        QUALITE_TRAVAIL,     // qualité insuffisante
        PAIEMENT_REFUSE,     // client refuse de payer
        NON_CONFORMITE,      // travail non conforme
        RUPTURE_CONTRAT,     // rupture unilatérale
        AUTRE                // autre
    }

    public enum DecisionAdmin {
        EN_FAVEUR_CLIENT,       // décision pour le client
        EN_FAVEUR_PRESTATAIRE,  // décision pour le prestataire
        COMPROMIS               // solution entre les deux
    }
}