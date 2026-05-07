package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "clauses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Titre de la clause
    @NotBlank(message = "Le titre de la clause est obligatoire")
    @Column(nullable = false, length = 200)
    private String titre;

    // Contenu de la clause
    @NotBlank(message = "Le contenu est obligatoire")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenu;

    // Ordre d'affichage de la clause
    @Column(name = "ordre_affichage",
            nullable = true)
    private Integer ordreAffichage;

    // Clause obligatoire ou optionnelle
    @Column(nullable = false)
    private Boolean obligatoire = true;

    // Type de clause
    @Enumerated(EnumType.STRING)
    @Column(name = "type_clause", nullable = true)
    private TypeClause typeClause;

    // Lien vers le contrat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", nullable = false)
    @JsonIgnoreProperties({
            "clauses", "signatures", "litiges"
    })
    private Contrat contrat;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum TypeClause {
        OBJET,                  // objet du contrat
        DELAI,                  // délais de livraison
        PAIEMENT,               // modalités de paiement
        CONFIDENTIALITE,        // confidentialité
        PROPRIETE_INTELLECTUELLE, // propriété du code
        RESILIATION,            // conditions de résiliation
        GARANTIE,               // garanties
        AUTRE                   // autre
    }
}