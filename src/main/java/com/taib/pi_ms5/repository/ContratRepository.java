package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Contrat;
import com.taib.pi_ms5.entity.Contrat.StatutContrat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContratRepository
        extends JpaRepository<Contrat, Long> {

    // Contrats d'un client
    List<Contrat> findByClientId(Long clientId);

    // Contrats d'un prestataire
    List<Contrat> findByPrestataireId(Long prestataireId);

    // Tous les contrats d'un utilisateur
    // (client OU prestataire)
    @Query("SELECT c FROM Contrat c WHERE " +
            "c.clientId = :userId OR " +
            "c.prestataireId = :userId")
    List<Contrat> findAllByUserId(
            @Param("userId") Long userId
    );

    // Contrats par statut
    List<Contrat> findByStatut(StatutContrat statut);

    // Contrats en litige
    List<Contrat> findByStatutOrderByDateGenerationDesc(
            StatutContrat statut
    );

    // Contrat lié à une candidature
    List<Contrat> findByCandidatureId(Long candidatureId);

    // Contrat lié à une offre
    List<Contrat> findByOffreId(Long offreId);

    // Tous triés par date
    List<Contrat> findAllByOrderByDateGenerationDesc();
}