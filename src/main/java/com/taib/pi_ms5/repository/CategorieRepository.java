package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
// JpaRepository<Categorie, Long> = entité Categorie, clé primaire de type Long
public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    // Spring génère automatiquement le SQL pour ces méthodes :

    // SELECT * FROM categories WHERE nom = ?
    Optional<Categorie> findByNom(String nom);

    // SELECT * FROM categories WHERE active = ?
    List<Categorie> findByActive(Boolean active);

    // SELECT * FROM categories WHERE nom LIKE %?%
    List<Categorie> findByNomContainingIgnoreCase(String nom);
}