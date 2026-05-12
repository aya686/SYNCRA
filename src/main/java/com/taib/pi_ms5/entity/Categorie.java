package com.taib.pi_ms5.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity                          // Dit à Spring : "c'est une table BDD"
@Table(name = "categories")      // Nom de la table dans MySQL
@Data                            // Lombok : génère getters/setters automatiquement
@NoArgsConstructor               // Lombok : génère constructeur vide
@AllArgsConstructor              // Lombok : génère constructeur avec tous les champs
public class Categorie {

    @Id                                           // Clé primaire
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String nom;                           // ex: "Développement Web"

    @Column(length = 500)
    private String description;                   // description de la catégorie

    @Column(name = "icone_url")
    private String iconeUrl;                      // URL de l'icône

    @Column(nullable = false)
    private Boolean active = true;               // catégorie active ou non

    // Une catégorie a plusieurs offres
    // mappedBy = le nom du champ dans Offre qui pointe vers Categorie
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL)
    @JsonIgnore   // ← AJOUTER pour éviter la boucle Categorie → Offre → Categorie
    private List<Offre> offres;

}