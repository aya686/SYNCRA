package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.AppelOffre;
import com.taib.pi_ms5.entity.AppelOffre.StatutAppelOffre;
import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.entity.Offre.StatutOffre;
import com.taib.pi_ms5.repository.AppelOffreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppelOffreService {

    private final AppelOffreRepository appelOffreRepository;
    private final OffreService offreService;

    // Récupérer tous les appels d'offres
    public List<AppelOffre> getAllAppelsOffres() {
        return appelOffreRepository.findAll();
    }

    // Récupérer un appel d'offres par ID
    public AppelOffre getAppelOffreById(Long id) {
        return appelOffreRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Appel d'offres non trouvé avec l'ID: " + id)
                );
    }

    // Récupérer l'appel d'offres lié à une offre
    public AppelOffre getAppelOffreByOffre(Long offreId) {
        return appelOffreRepository.findByOffreId(offreId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aucun appel d'offres trouvé pour l'offre ID: " + offreId
                        )
                );
    }

    // Créer un appel d'offres lié à une offre
    public AppelOffre createAppelOffre(Long offreId, AppelOffre appelOffre) {
        Offre offre = offreService.getOffreById(offreId);

        // Vérifier qu'il n'existe pas déjà un appel d'offres pour cette offre
        if (appelOffreRepository.findByOffreId(offreId).isPresent()) {
            throw new RuntimeException(
                    "Un appel d'offres existe déjà pour l'offre ID: " + offreId
            );
        }

        // Vérifier les dates
        if (appelOffre.getDateCloture().isBefore(LocalDateTime.now())) {
            throw new RuntimeException(
                    "La date de clôture doit être dans le futur"
            );
        }

        if (appelOffre.getDateOuverture() != null
                && appelOffre.getDateOuverture().isAfter(appelOffre.getDateCloture())) {
            throw new RuntimeException(
                    "La date d'ouverture doit être avant la date de clôture"
            );
        }

        appelOffre.setOffre(offre);
        appelOffre.setStatut(StatutAppelOffre.OUVERT);

        return appelOffreRepository.save(appelOffre);
    }

    // Modifier un appel d'offres
    public AppelOffre updateAppelOffre(Long id, AppelOffre details) {
        AppelOffre appelOffre = getAppelOffreById(id);

        // On ne peut modifier que les appels d'offres ouverts
        if (appelOffre.getStatut() != StatutAppelOffre.OUVERT) {
            throw new RuntimeException(
                    "Seuls les appels d'offres ouverts peuvent être modifiés"
            );
        }

        appelOffre.setTitre(details.getTitre());
        appelOffre.setDescription(details.getDescription());
        appelOffre.setDateCloture(details.getDateCloture());
        appelOffre.setBudgetTotal(details.getBudgetTotal());
        appelOffre.setConditionsParticipation(details.getConditionsParticipation());
        appelOffre.setDocumentsRequis(details.getDocumentsRequis());

        return appelOffreRepository.save(appelOffre);
    }

    // Clôturer un appel d'offres
    public AppelOffre cloturerAppelOffre(Long id) {
        AppelOffre appelOffre = getAppelOffreById(id);
        appelOffre.setStatut(StatutAppelOffre.CLOTURE);

        // Clôturer aussi l'offre liée
        offreService.cloturerOffre(appelOffre.getOffre().getId());

        return appelOffreRepository.save(appelOffre);
    }

    // Annuler un appel d'offres
    public AppelOffre annulerAppelOffre(Long id) {
        AppelOffre appelOffre = getAppelOffreById(id);

        if (appelOffre.getStatut() == StatutAppelOffre.ATTRIBUE) {
            throw new RuntimeException(
                    "Un appel d'offres déjà attribué ne peut pas être annulé"
            );
        }

        appelOffre.setStatut(StatutAppelOffre.ANNULE);
        return appelOffreRepository.save(appelOffre);
    }

    // Récupérer les appels d'offres par statut
    public List<AppelOffre> getAppelsOffresByStatut(StatutAppelOffre statut) {
        return appelOffreRepository.findByStatut(statut);
    }
}