package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Echeance;
import com.taib.pi_ms5.entity.Echeance.StatutEcheance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EcheanceRepository
        extends JpaRepository<Echeance, Long> {

    List<Echeance> findByPaiementId(Long paiementId);
    List<Echeance> findByStatut(StatutEcheance statut);

    // Échéances en retard
    @Query("SELECT e FROM Echeance e WHERE " +
            "e.statut = 'EN_ATTENTE' AND " +
            "e.dateEcheance < :maintenant")
    List<Echeance> findEcheancesEnRetard(
            @org.springframework.data.repository.query
                    .Param("maintenant") LocalDateTime maintenant
    );

    // Échéances à rappeler (dans 3 jours)
    @Query("SELECT e FROM Echeance e WHERE " +
            "e.statut = 'EN_ATTENTE' AND " +
            "e.rappelEnvoye = false AND " +
            "e.dateEcheance BETWEEN :debut AND :fin")
    List<Echeance> findEcheancesARappeler(
            @org.springframework.data.repository.query
                    .Param("debut") LocalDateTime debut,
            @org.springframework.data.repository.query
                    .Param("fin") LocalDateTime fin
    );

    List<Echeance> findByPaiementIdOrderByNumeroEcheanceAsc(
            Long paiementId
    );
}