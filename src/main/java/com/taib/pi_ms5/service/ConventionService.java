package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Convention;
import com.taib.pi_ms5.entity.Convention.*;
import com.taib.pi_ms5.repository.ConventionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConventionService {

    private final ConventionRepository conventionRepository;

    public List<Convention> getAllConventions() {
        return conventionRepository
                .findAllByOrderByDateCreationDesc();
    }

    public Convention getConventionById(Long id) {
        return conventionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Convention non trouvée: " + id
                ));
    }

    public List<Convention> getByInvestisseur(
            Long investisseurId) {
        return conventionRepository
                .findByInvestisseurId(investisseurId);
    }

    public List<Convention> getByProjet(Long projetId) {
        return conventionRepository
                .findByProjetId(projetId);
    }

    public List<Convention> getByStatut(
            StatutConvention statut) {
        return conventionRepository.findByStatut(statut);
    }

    public Convention creerConvention(
            Convention convention) {

        // Générer une référence unique
        convention.setReference(
                "CONV-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        convention.setStatut(
                StatutConvention.EN_COURS_SIGNATURE
        );
        convention.setDateCreation(LocalDateTime.now());
        convention.setSigneInvestisseur(false);
        convention.setSignePorteur(false);

        return conventionRepository.save(convention);
    }

    public Convention signerConvention(
            Long id,
            String role) {

        Convention convention = getConventionById(id);

        if (role.equals("INVESTISSEUR")) {
            convention.setSigneInvestisseur(true);
        } else if (role.equals("PORTEUR")) {
            convention.setSignePorteur(true);
        } else {
            throw new RuntimeException(
                    "Rôle invalide: INVESTISSEUR ou PORTEUR"
            );
        }

        // Activer si les deux ont signé
        if (convention.getSigneInvestisseur()
                && convention.getSignePorteur()) {
            convention.setStatut(StatutConvention.ACTIVE);
            convention.setDateSignature(
                    LocalDateTime.now()
            );
            convention.setDateDebut(LocalDateTime.now());
            if (convention.getDureeMois() != null) {
                convention.setDateFin(
                        LocalDateTime.now().plusMonths(
                                convention.getDureeMois()
                        )
                );
            }
        } else {
            convention.setStatut(
                    StatutConvention.EN_COURS_SIGNATURE
            );
        }

        return conventionRepository.save(convention);
    }

    public Convention resilierConvention(Long id) {
        Convention convention = getConventionById(id);
        convention.setStatut(StatutConvention.RESILIEE);
        return conventionRepository.save(convention);
    }
}