package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.DemandePartenariat;
import com.taib.pi_ms5.entity.PartenariatEntreprise;
import com.taib.pi_ms5.entity.PartenariatEntreprise.StatutPartenariat;
import com.taib.pi_ms5.repository.PartenariatEntrepriseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PartenariatEntrepriseService {

    private final PartenariatEntrepriseRepository
            partenariatRepository;
    private final DemandePartenariatService
            demandeService;

    // ═══════════════════════════════════════════
    // LECTURE
    // ═══════════════════════════════════════════

    // Tous les partenariats
    public List<PartenariatEntreprise> getAllPartenariats() {
        return partenariatRepository
                .findAllByOrderByDateCreationDesc();
    }

    // Un partenariat par ID
    public PartenariatEntreprise getPartenariatById(
            Long id) {
        return partenariatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Partenariat non trouvé avec l'ID: " + id
                ));
    }

    // Partenariats d'un utilisateur
    public List<PartenariatEntreprise> getByUserId(
            Long userId) {
        return partenariatRepository.findByUserId(userId);
    }

    // Partenariats par statut
    public List<PartenariatEntreprise> getByStatut(
            StatutPartenariat statut) {
        return partenariatRepository.findByStatut(statut);
    }

    // IDs des sociétés EN partenariat actif
    public List<Long> getIdsEnPartenariat() {
        return partenariatRepository.findIdsEnPartenariat();
    }

    // Statistiques
    public long countActifs() {
        return partenariatRepository
                .countByStatut(StatutPartenariat.ACTIF);
    }

    // ═══════════════════════════════════════════
    // CRÉER UN PARTENARIAT
    // ═══════════════════════════════════════════

    public PartenariatEntreprise creerPartenariat(
            PartenariatEntreprise partenariat) {

        // Vérifier que les deux partenaires sont différents
        if (partenariat.getPartenaire1Id()
                .equals(partenariat.getPartenaire2Id())) {
            throw new RuntimeException(
                    "Les deux partenaires doivent "
                            + "être différents"
            );
        }

        // Si lié à une demande → vérifier qu'elle
        // est approuvée
        if (partenariat.getDemandePartenariatId()
                != null) {
            DemandePartenariat demande =
                    demandeService.getDemandeById(
                            partenariat.getDemandePartenariatId()
                    );

            if (demande.getStatut()
                    != DemandePartenariat
                    .StatutDemande.APPROUVEE) {
                throw new RuntimeException(
                        "La demande de partenariat doit "
                                + "être approuvée avant de créer "
                                + "un partenariat"
                );
            }
        }

        partenariat.setStatut(StatutPartenariat.ACTIF);
        partenariat.setDateCreation(LocalDateTime.now());
        partenariat.setDateDebut(LocalDateTime.now());

        return partenariatRepository.save(partenariat);
    }

    // ═══════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════

    // Modifier un partenariat
    public PartenariatEntreprise updatePartenariat(
            Long id,
            PartenariatEntreprise details) {

        PartenariatEntreprise partenariat =
                getPartenariatById(id);

        partenariat.setDescriptionPartenariat(
                details.getDescriptionPartenariat()
        );
        partenariat.setConditions(details.getConditions());
        partenariat.setDateFin(details.getDateFin());

        return partenariatRepository.save(partenariat);
    }

    // Terminer un partenariat
    public PartenariatEntreprise terminerPartenariat(
            Long id) {
        PartenariatEntreprise partenariat =
                getPartenariatById(id);

        if (partenariat.getStatut()
                != StatutPartenariat.ACTIF) {
            throw new RuntimeException(
                    "Seuls les partenariats actifs "
                            + "peuvent être terminés"
            );
        }

        partenariat.setStatut(StatutPartenariat.TERMINE);
        partenariat.setDateFin(LocalDateTime.now());

        return partenariatRepository.save(partenariat);
    }

    // Suspendre un partenariat
    public PartenariatEntreprise suspendrePartenariat(
            Long id,
            String motif) {

        PartenariatEntreprise partenariat =
                getPartenariatById(id);

        if (partenariat.getStatut()
                != StatutPartenariat.ACTIF) {
            throw new RuntimeException(
                    "Seuls les partenariats actifs "
                            + "peuvent être suspendus"
            );
        }

        partenariat.setStatut(StatutPartenariat.SUSPENDU);
        partenariat.setMotifSuspension(motif);

        return partenariatRepository.save(partenariat);
    }

    // Réactiver un partenariat suspendu
    public PartenariatEntreprise reactiverPartenariat(
            Long id) {
        PartenariatEntreprise partenariat =
                getPartenariatById(id);

        if (partenariat.getStatut()
                != StatutPartenariat.SUSPENDU) {
            throw new RuntimeException(
                    "Seuls les partenariats suspendus "
                            + "peuvent être réactivés"
            );
        }

        partenariat.setStatut(StatutPartenariat.ACTIF);
        partenariat.setMotifSuspension(null);

        return partenariatRepository.save(partenariat);
    }

    // Supprimer un partenariat
    public void deletePartenariat(Long id) {
        partenariatRepository.delete(
                getPartenariatById(id)
        );
    }
}