package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Litige;
import com.taib.pi_ms5.entity.Litige.StatutLitige;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LitigeRepository
        extends JpaRepository<Litige, Long> {

    // Litiges d'un contrat
    List<Litige> findByContratId(Long contratId);

    // Litiges par statut
    List<Litige> findByStatut(StatutLitige statut);

    // Litiges ouverts par un utilisateur
    List<Litige> findByDeclarantId(Long declarantId);

    // Litiges assignés à un admin
    List<Litige> findByAdminId(Long adminId);

    // Tous triés par date
    List<Litige> findAllByOrderByDateOuvertureDesc();

    // Litiges urgents (ouverts)
    List<Litige> findByStatutOrderByDateOuvertureAsc(
            StatutLitige statut
    );
}