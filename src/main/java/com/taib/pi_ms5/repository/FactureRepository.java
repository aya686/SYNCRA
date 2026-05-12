package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Facture;
import com.taib.pi_ms5.entity.Facture.StatutFacture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FactureRepository
        extends JpaRepository<Facture, Long> {

    Optional<Facture> findByNumeroFacture(
            String numeroFacture
    );
    List<Facture> findByPaiementId(Long paiementId);
    List<Facture> findByStatut(StatutFacture statut);
    List<Facture> findByEmetteurId(Long emetteurId);
    List<Facture> findByDestinataireId(Long destinataireId);
    List<Facture> findAllByOrderByDateEmissionDesc();
}