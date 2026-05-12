package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Contrat;
import com.taib.pi_ms5.entity.Contrat.StatutContrat;
import com.taib.pi_ms5.entity.Litige;
import com.taib.pi_ms5.entity.Litige.StatutLitige;
import com.taib.pi_ms5.entity.Litige.DecisionAdmin;
import com.taib.pi_ms5.repository.ContratRepository;
import com.taib.pi_ms5.repository.LitigeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LitigeService {

    private final LitigeRepository litigeRepository;
    private final ContratRepository contratRepository;

    // Tous les litiges (admin)
    public List<Litige> getAllLitiges() {
        return litigeRepository
                .findAllByOrderByDateOuvertureDesc();
    }

    // Litiges par statut
    public List<Litige> getLitigesByStatut(
            StatutLitige statut) {
        return litigeRepository.findByStatut(statut);
    }

    // Litiges d'un contrat
    public List<Litige> getLitigesByContrat(
            Long contratId) {
        return litigeRepository.findByContratId(contratId);
    }

    // Un litige par ID
    public Litige getLitigeById(Long id) {
        return litigeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Litige non trouvé avec l'ID: " + id
                ));
    }

    // Ouvrir un litige
    public Litige ouvrirLitige(
            Long contratId,
            Litige litige) {

        Contrat contrat = contratRepository
                .findById(contratId)
                .orElseThrow(() -> new RuntimeException(
                        "Contrat non trouvé"
                ));

        // Vérifier que le contrat est actif
        if (contrat.getStatut() != StatutContrat.ACTIF
                && contrat.getStatut() != StatutContrat.TERMINE) {
            throw new RuntimeException(
                    "Vous ne pouvez ouvrir un litige que "
                            + "sur un contrat actif ou terminé"
            );
        }

        litige.setContrat(contrat);
        litige.setStatut(StatutLitige.OUVERT);
        litige.setDateOuverture(LocalDateTime.now());

        // Mettre le contrat en statut LITIGE
        contrat.setStatut(StatutContrat.LITIGE);
        contratRepository.save(contrat);

        return litigeRepository.save(litige);
    }

    // Prendre en charge un litige (admin)
    public Litige prendreEnCharge(
            Long id,
            Long adminId) {

        Litige litige = getLitigeById(id);
        litige.setStatut(StatutLitige.EN_COURS);
        litige.setAdminId(adminId);
        return litigeRepository.save(litige);
    }

    // Résoudre un litige (admin)
    public Litige resoudreLitige(
            Long id,
            DecisionAdmin decision,
            String commentaire) {

        Litige litige = getLitigeById(id);
        litige.setStatut(StatutLitige.RESOLU);
        litige.setDecisionAdmin(decision);
        litige.setCommentaireResolution(commentaire);
        litige.setDateResolution(LocalDateTime.now());

        // Remettre le contrat en ACTIF après résolution
        Contrat contrat = litige.getContrat();
        contrat.setStatut(StatutContrat.ACTIF);
        contratRepository.save(contrat);

        return litigeRepository.save(litige);
    }

    // Fermer un litige sans suite
    public Litige fermerLitige(Long id) {
        Litige litige = getLitigeById(id);
        litige.setStatut(StatutLitige.FERME);
        litige.setDateResolution(LocalDateTime.now());
        return litigeRepository.save(litige);
    }
}