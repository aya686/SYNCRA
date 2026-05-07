package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.entity.Offre.StatutOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OffreRepository extends JpaRepository<Offre, Long> {

    // Trouver par statut
    List<Offre> findByStatut(StatutOffre statut);

    // Trouver par publieur
    List<Offre> findByPublieurId(Long publieurId);

    // Trouver par catégorie
    List<Offre> findByCategorieId(Long categorieId);

    // Recherche par titre (pour la barre de recherche)
    List<Offre> findByTitreContainingIgnoreCase(String titre);

    // Offres dans une fourchette de budget
    List<Offre> findByBudgetMinGreaterThanEqualAndBudgetMaxLessThanEqual(
            Double budgetMin, Double budgetMax
    );

    // Offres dont la deadline n'est pas encore passée
    List<Offre> findByDeadlineAfter(LocalDateTime date);
    List<Offre> findAllByOrderByDatePublicationDesc();
    // Requête personnalisée JPQL (comme SQL mais orienté objet)
    @Query("SELECT o FROM Offre o WHERE o.statut = :statut AND o.deadline > :now ORDER BY o.datePublication DESC")
    List<Offre> findOffresActives(
            @Param("statut") StatutOffre statut,
            @Param("now") LocalDateTime now
    );

    // Compter les offres par publieur
    Long countByPublieurId(Long publieurId);
}