package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Candidature;
import com.taib.pi_ms5.entity.Candidature.StatutCandidature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidatureRepository
        extends JpaRepository<Candidature, Long> {

    // Toutes les candidatures d'un candidat
    List<Candidature> findByCandidatId(Long candidatId);

    // Toutes les candidatures pour une offre
    List<Candidature> findByOffreId(Long offreId);

    // Candidatures par statut
    List<Candidature> findByStatut(StatutCandidature statut);

    // Candidatures d'un candidat par statut
    List<Candidature> findByCandidatIdAndStatut(
            Long candidatId, StatutCandidature statut
    );

    // Vérifier si un candidat a déjà postulé à une offre
    Optional<Candidature> findByCandidatIdAndOffreId(
            Long candidatId, Long offreId
    );

    // Compter les candidatures pour une offre
    Long countByOffreId(Long offreId);

    // Candidatures en shortlist pour une offre
    List<Candidature> findByOffreIdAndStatut(
            Long offreId, StatutCandidature statut
    );

    // Toutes les candidatures triées par score IA décroissant
    @Query("SELECT c FROM Candidature c WHERE c.offre.id = :offreId " +
            "ORDER BY c.scoreIa DESC NULLS LAST")
    List<Candidature> findByOffreIdOrderByScoreDesc(
            @Param("offreId") Long offreId
    );
}