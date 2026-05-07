package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.DemandePartenariat;
import com.taib.pi_ms5.entity.DemandePartenariat.StatutDemande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DemandePartenariatRepository
        extends JpaRepository<DemandePartenariat, Long> {

    // Toutes les demandes triées par date
    List<DemandePartenariat>
    findAllByOrderByDateSoumissionDesc();

    // Demandes par statut
    List<DemandePartenariat> findByStatut(
            StatutDemande statut
    );

    // Demandes d'un utilisateur
    List<DemandePartenariat> findByUserId(Long userId);

    // Demande par email
    Optional<DemandePartenariat> findByEmail(String email);

    // Demande par nom de société
    List<DemandePartenariat> findByNomSocieteContainingIgnoreCase(
            String nomSociete
    );

    // Vérifier si userId a déjà une demande en attente
    Optional<DemandePartenariat> findByUserIdAndStatut(
            Long userId, StatutDemande statut
    );

    // Compter par statut
    Long countByStatut(StatutDemande statut);
}