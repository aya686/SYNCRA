package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Critere;
import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.repository.CritereRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CritereService {

    private final CritereRepository critereRepository;
    private final OffreService offreService;

    // Récupérer tous les critères d'une offre
    public List<Critere> getCriteresByOffre(Long offreId) {
        // Vérifier que l'offre existe d'abord
        offreService.getOffreById(offreId);
        return critereRepository.findByOffreId(offreId);
    }

    // Récupérer un critère par ID
    public Critere getCritereById(Long id) {
        return critereRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Critère non trouvé avec l'ID: " + id));
    }

    // Ajouter un critère à une offre
    public Critere addCritere(Long offreId, Critere critere) {
        Offre offre = offreService.getOffreById(offreId);

        // Règle : le total des poids ne doit pas dépasser 100
        List<Critere> criteresExistants = critereRepository.findByOffreId(offreId);
        int totalPoids = criteresExistants.stream()
                .mapToInt(Critere::getPoids)
                .sum();

        if (totalPoids + critere.getPoids() > 100) {
            throw new RuntimeException(
                    "Le total des poids dépasse 100%. "
                            + "Poids disponible restant: " + (100 - totalPoids) + "%"
            );
        }

        critere.setOffre(offre);
        return critereRepository.save(critere);
    }

    // Modifier un critère
    public Critere updateCritere(Long id, Critere critereDetails) {
        Critere critere = getCritereById(id);

        // Recalculer le total sans ce critère
        List<Critere> autresCriteres = critereRepository.findByOffreId(
                critere.getOffre().getId()
        );
        int totalSansCeluiCi = autresCriteres.stream()
                .filter(c -> !c.getId().equals(id))
                .mapToInt(Critere::getPoids)
                .sum();

        if (totalSansCeluiCi + critereDetails.getPoids() > 100) {
            throw new RuntimeException(
                    "Le total des poids dépasse 100% après modification."
            );
        }

        critere.setNom(critereDetails.getNom());
        critere.setDescription(critereDetails.getDescription());
        critere.setPoids(critereDetails.getPoids());
        critere.setObligatoire(critereDetails.getObligatoire());
        critere.setTypeCritere(critereDetails.getTypeCritere());

        return critereRepository.save(critere);
    }

    // Supprimer un critère
    public void deleteCritere(Long id) {
        Critere critere = getCritereById(id);
        critereRepository.delete(critere);
    }

    // Récupérer uniquement les critères obligatoires d'une offre
    public List<Critere> getCriteresObligatoires(Long offreId) {
        return critereRepository.findByOffreIdAndObligatoire(offreId, true);
    }
}