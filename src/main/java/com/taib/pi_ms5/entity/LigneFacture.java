package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "lignes_facture")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Description de la ligne
    @NotBlank(message = "La description est obligatoire")
    @Column(nullable = false,
            columnDefinition = "TEXT")
    private String description;

    // Quantité
    @NotNull(message = "La quantité est obligatoire")
    @Column(nullable = false)
    private Double quantite = 1.0;

    // Unité (heure, jour, forfait...)
    @Column(nullable = true, length = 50)
    private String unite = "forfait";

    // Prix unitaire HT
    @NotNull(message = "Le prix unitaire est obligatoire")
    @Column(name = "prix_unitaire_ht",
            nullable = false)
    private Double prixUnitaireHt;

    // Taux de remise en %
    @Column(name = "taux_remise",
            nullable = false)
    private Double tauxRemise = 0.0;

    // Montant total de la ligne HT
    @Column(name = "montant_ht",
            nullable = false)
    private Double montantHt;

    // Taux TVA de la ligne
    @Column(name = "taux_tva",
            nullable = false)
    private Double tauxTva = 19.0;

    // Montant TVA de la ligne
    @Column(name = "montant_tva",
            nullable = false)
    private Double montantTva;

    // Montant TTC de la ligne
    @Column(name = "montant_ttc",
            nullable = false)
    private Double montantTtc;

    // Ordre d'affichage
    @Column(name = "ordre",
            nullable = true)
    private Integer ordre;

    // Lien vers la facture
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "facture_id",
            nullable = false)
    @JsonIgnoreProperties({"lignes", "paiement"})
    private Facture facture;
}