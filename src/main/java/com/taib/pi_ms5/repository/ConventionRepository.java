package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Convention;
import com.taib.pi_ms5.entity.Convention.StatutConvention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConventionRepository
        extends JpaRepository<Convention, Long> {

    Optional<Convention> findByReference(String reference);
    List<Convention> findByInvestisseurId(
            Long investisseurId
    );
    List<Convention> findByProjetId(Long projetId);
    List<Convention> findByStatut(StatutConvention statut);
    List<Convention> findByPartenaireId(Long partenaireId);
    List<Convention> findAllByOrderByDateCreationDesc();
}