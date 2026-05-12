package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "demandes_partenariat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemandePartenariat {

    // ═══════════════════════════════════════════
    // ATTRIBUTS DE BASE
    // ═══════════════════════════════════════════

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Column(nullable = false, length = 100)
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "Le nom de la société est obligatoire")
    @Column(name = "nom_societe",
            nullable = false,
            length = 200)
    private String nomSociete;

    @Column(columnDefinition = "TEXT",
            nullable = true)
    private String description;

    @Column(name = "date_creation_societe",
            nullable = true)
    private LocalDateTime dateCreationSociete;

    @Column(name = "image_url",
            columnDefinition = "TEXT",
            nullable = true)
    private String imageUrl;

    @NotBlank(message = "L'email est obligatoire")
    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = true, length = 20)
    private String telephone;

    // ID de l'utilisateur qui soumet (MS1)
    @Column(name = "user_id",
            nullable = false)
    private Long userId;

    // Statut de la demande
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut
            = StatutDemande.EN_ATTENTE;

    // Motif de refus si refusée
    @Column(name = "motif_refus",
            columnDefinition = "TEXT",
            nullable = true)
    private String motifRefus;

    // Date de soumission
    @Column(name = "date_soumission",
            nullable = true)
    private LocalDateTime dateSoumission
            = LocalDateTime.now();

    // Date de traitement par l'admin
    @Column(name = "date_traitement",
            nullable = true)
    private LocalDateTime dateTraitement;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum StatutDemande {
        EN_ATTENTE,  // soumise, pas encore traitée
        APPROUVEE,   // approuvée par l'admin
        REFUSEE      // refusée par l'admin
    }
}