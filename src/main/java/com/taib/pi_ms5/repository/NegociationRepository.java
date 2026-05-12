package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Negociation;
import com.taib.pi_ms5.entity.Negociation.StatutNegociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface NegociationRepository
        extends JpaRepository<Negociation, Long> {

    List<Negociation> findByMiseFondsId(Long miseFondsId);
    Optional<Negociation> findByMiseFondsIdAndStatut(
            Long miseFondsId, StatutNegociation statut
    );
    List<Negociation> findByInvestisseurUserId(
            Long userId
    );
    List<Negociation> findByPorteurUserId(Long userId);
}