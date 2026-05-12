package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.PartenariatEntreprise;
import com.taib.pi_ms5.entity.PartenariatEntreprise.StatutPartenariat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartenariatEntrepriseRepository
        extends JpaRepository<PartenariatEntreprise, Long> {

    // Tous triés par date
    List<PartenariatEntreprise>
    findAllByOrderByDateCreationDesc();

    // Par statut
    List<PartenariatEntreprise> findByStatut(
            StatutPartenariat statut
    );

    // Partenariats d'un partenaire
    // (qu'il soit partenaire1 OU partenaire2)
    @Query("SELECT p FROM PartenariatEntreprise p " +
            "WHERE p.partenaire1Id = :userId " +
            "OR p.partenaire2Id = :userId")
    List<PartenariatEntreprise> findByUserId(
            @Param("userId") Long userId
    );

    // Lister les IDs de sociétés EN partenariat ACTIF
    @Query("SELECT DISTINCT p.partenaire1Id " +
            "FROM PartenariatEntreprise p " +
            "WHERE p.statut = 'ACTIF' " +
            "UNION ALL " +
            "SELECT DISTINCT p.partenaire2Id " +
            "FROM PartenariatEntreprise p " +
            "WHERE p.statut = 'ACTIF'")
    List<Long> findIdsEnPartenariat();

    // Partenariats liés à une demande
    List<PartenariatEntreprise> findByDemandePartenariatId(
            Long demandePartenariatId
    );

    // Compter les partenariats actifs
    Long countByStatut(StatutPartenariat statut);
}