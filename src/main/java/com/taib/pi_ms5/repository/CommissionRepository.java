package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Commission;
import com.taib.pi_ms5.entity.Commission.StatutCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommissionRepository
        extends JpaRepository<Commission, Long> {

    List<Commission> findByPaiementId(Long paiementId);
    List<Commission> findByStatut(StatutCommission statut);

    @Query("SELECT SUM(c.montantCommission) " +
            "FROM Commission c " +
            "WHERE c.statut = 'PRELEVEE'")
    Double getTotalCommissionsPrelevees();
}