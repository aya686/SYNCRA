package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Categorie;
import com.taib.pi_ms5.repository.CategorieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service                    // Dit à Spring : "c'est un service"
@RequiredArgsConstructor    // Lombok : injecte automatiquement les dépendances
public class CategorieService {

    // Spring injecte automatiquement le repository grâce à @RequiredArgsConstructor
    private final CategorieRepository categorieRepository;

    // Récupérer toutes les catégories actives
    public List<Categorie> getAllCategories() {
        return categorieRepository.findByActive(true);
    }

    // Récupérer une catégorie par ID
    public Categorie getCategorieById(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie non trouvée avec l'ID: " + id));
    }

    // Créer une nouvelle catégorie
    public Categorie createCategorie(Categorie categorie) {
        // Vérification : le nom doit être unique
        if (categorieRepository.findByNom(categorie.getNom()).isPresent()) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà");
        }
        return categorieRepository.save(categorie);
    }

    // Modifier une catégorie
    public Categorie updateCategorie(Long id, Categorie categorieDetails) {
        Categorie categorie = getCategorieById(id);
        categorie.setNom(categorieDetails.getNom());
        categorie.setDescription(categorieDetails.getDescription());
        categorie.setIconeUrl(categorieDetails.getIconeUrl());
        return categorieRepository.save(categorie);
    }

    // Supprimer (désactiver) une catégorie
    public void deleteCategorie(Long id) {
        Categorie categorie = getCategorieById(id);
        categorie.setActive(false);   // on désactive, on ne supprime pas vraiment
        categorieRepository.save(categorie);
    }
}