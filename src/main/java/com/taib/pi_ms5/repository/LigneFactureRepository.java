package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.LigneFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LigneFactureRepository
        extends JpaRepository<LigneFacture, Long> {

    List<LigneFacture> findByFactureIdOrderByOrdreAsc(
            Long factureId
    );

    void deleteByFactureId(Long factureId);
}