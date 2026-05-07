package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.MiseFonds;
import com.taib.pi_ms5.entity.MiseFonds.StatutMiseFonds;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MiseFondsRepository
        extends JpaRepository<MiseFonds, Long> {

    List<MiseFonds> findByInvestisseurId(
            Long investisseurId
    );
    List<MiseFonds> findByProjetId(Long projetId);
    List<MiseFonds> findByStatut(StatutMiseFonds statut);
    List<MiseFonds> findByProjetIdAndStatut(
            Long projetId, StatutMiseFonds statut
    );
    List<MiseFonds> findAllByOrderByDateSoumissionDesc();
}