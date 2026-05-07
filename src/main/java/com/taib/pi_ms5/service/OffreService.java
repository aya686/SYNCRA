package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.entity.Offre.StatutOffre;
import com.taib.pi_ms5.repository.OffreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OffreService {

    private final OffreRepository offreRepository;
    private final CategorieService categorieService;

    // ✅ NOUVEAU — toutes les offres sans filtre (pour GET /api/offres)
    public List<Offre> getAllOffres() {
        return offreRepository.findAll();
    }

    // ✅ NOUVEAU — toutes les offres pour admin triées par date
    public List<Offre> getAllOffresAdmin() {
        return offreRepository.findAllByOrderByDatePublicationDesc();
    }

    // Offres ACTIVE seulement (pour marketplace)
    public List<Offre> getOffresActives() {
        return offreRepository.findOffresActives(
                StatutOffre.ACTIVE,
                LocalDateTime.now()
        );
    }

    // Récupérer une offre par ID
    public Offre getOffreById(Long id) {
        return offreRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Offre non trouvée avec l'ID: " + id)
                );
    }

    // Offres d'un publieur
    public List<Offre> getOffresByPublieur(Long publieurId) {
        return offreRepository.findByPublieurId(publieurId);
    }

    // Offres par catégorie
    public List<Offre> getOffresByCategorie(Long categorieId) {
        return offreRepository.findByCategorieId(categorieId);
    }

    // Recherche par titre
    public List<Offre> rechercherOffres(String titre) {
        return offreRepository.findByTitreContainingIgnoreCase(titre);
    }

    // Créer une offre
    public Offre createOffre(Offre offre) {
        if (offre.getDeadline().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("La deadline doit être dans le futur");
        }
        if (offre.getBudgetMax() != null
                && offre.getBudgetMax() < offre.getBudgetMin()) {
            throw new RuntimeException(
                    "Le budget maximum doit être supérieur au minimum"
            );
        }

        // Détection de fraude simple (sans IA) - ignorer la valeur envoyée par le frontend
        offre.setEstSuspecte(detecterFraudeSimple(offre));

        offre.setStatut(StatutOffre.BROUILLON);
        offre.setDatePublication(LocalDateTime.now());
        return offreRepository.save(offre);
    }

    // Détection de fraude simple basée sur des règles
    private boolean detecterFraudeSimple(Offre offre) {
        // Pour les tests : marquer toutes les offres comme suspectes
        return true;
    }

    // Modifier une offre
    public Offre updateOffre(Long id, Offre offreDetails) {
        Offre offre = getOffreById(id);
        offre.setTitre(offreDetails.getTitre());
        offre.setDescription(offreDetails.getDescription());
        offre.setBudgetMin(offreDetails.getBudgetMin());
        offre.setBudgetMax(offreDetails.getBudgetMax());
        offre.setDeadline(offreDetails.getDeadline());
        return offreRepository.save(offre);
    }

    // Publier une offre
    public Offre publierOffre(Long id) {
        Offre offre = getOffreById(id);
        if (offre.getCriteres() == null || offre.getCriteres().isEmpty()) {
            throw new RuntimeException(
                    "L'offre doit avoir au moins un critère avant publication"
            );
        }
        offre.setStatut(StatutOffre.ACTIVE);
        return offreRepository.save(offre);
    }

    // Clôturer une offre
    public Offre cloturerOffre(Long id) {
        Offre offre = getOffreById(id);
        offre.setStatut(StatutOffre.CLOTUREE);
        return offreRepository.save(offre);
    }

    // Changer le statut d'une offre
    public Offre changerStatut(Long id, StatutOffre nouveauStatut) {
        Offre offre = getOffreById(id);
        offre.setStatut(nouveauStatut);
        return offreRepository.save(offre);
    }

    // Suspendre une offre (admin)
    public Offre suspendreOffre(Long id) {
        Offre offre = getOffreById(id);
        offre.setStatut(StatutOffre.SUSPENDUE);
        return offreRepository.save(offre);
    }

    // Supprimer une offre
    public void deleteOffre(Long id) {
        Offre offre = getOffreById(id);
        offreRepository.delete(offre);
    }
}