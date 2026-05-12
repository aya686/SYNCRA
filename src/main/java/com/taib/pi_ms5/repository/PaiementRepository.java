package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Paiement;
import com.taib.pi_ms5.entity.Paiement.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaiementRepository
        extends JpaRepository<Paiement, Long> {

    Optional<Paiement> findByReference(String reference);
    List<Paiement> findByPayeurId(Long payeurId);
    List<Paiement> findByBeneficiaireId(Long beneficiaireId);
    List<Paiement> findByStatut(StatutPaiement statut);
    List<Paiement> findByContratId(Long contratId);

    @Query("SELECT p FROM Paiement p WHERE " +
            "p.payeurId = :userId OR " +
            "p.beneficiaireId = :userId")
    List<Paiement> findAllByUserId(
            @Param("userId") Long userId
    );

    List<Paiement> findAllByOrderByDateCreationDesc();

    @Query("SELECT SUM(p.montantTotal) FROM Paiement p " +
            "WHERE p.statut = 'PAYE'")
    Double getTotalPaye();

    @Query("SELECT SUM(c.montantCommission) " +
            "FROM Commission c " +
            "WHERE c.statut = 'PRELEVEE'")
    Double getTotalCommissions();
}