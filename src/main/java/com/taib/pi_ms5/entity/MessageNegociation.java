package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages_negociation")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageNegociation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Contenu du message
    @NotBlank(message = "Le message ne peut pas être vide")
    @Column(nullable = false,
            columnDefinition = "TEXT")
    private String contenu;

    // ID de l'expéditeur (MS1)
    @Column(name = "expediteur_id",
            nullable = false)
    private Long expediteurId;

    // Nom affiché de l'expéditeur
    @Column(name = "nom_expediteur",
            nullable = true,
            length = 200)
    private String nomExpediteur;

    // Rôle de l'expéditeur
    @Enumerated(EnumType.STRING)
    @Column(name = "role_expediteur",
            nullable = false)
    private RoleExpediteur roleExpediteur;

    // Message lu ou non
    @Column(name = "lu", nullable = false)
    private Boolean lu = false;

    // Date d'envoi
    @Column(name = "date_envoi",
            nullable = false)
    private LocalDateTime dateEnvoi
            = LocalDateTime.now();

    // Lien vers la négociation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "negociation_id",
            nullable = false)
    @JsonIgnoreProperties("messages")
    private Negociation negociation;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum RoleExpediteur {
        INVESTISSEUR,
        PORTEUR_PROJET,
        ADMIN
    }
}