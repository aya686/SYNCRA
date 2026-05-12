package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Clause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClauseRepository
        extends JpaRepository<Clause, Long> {

    // Clauses d'un contrat triées par ordre
    List<Clause> findByContratIdOrderByOrdreAffichageAsc(
            Long contratId
    );

    // Clauses obligatoires d'un contrat
    List<Clause> findByContratIdAndObligatoire(
            Long contratId, Boolean obligatoire
    );

    // Supprimer toutes les clauses d'un contrat
    void deleteByContratId(Long contratId);
}