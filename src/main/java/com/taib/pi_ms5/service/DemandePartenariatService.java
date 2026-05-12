package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.DemandePartenariat;
import com.taib.pi_ms5.entity.DemandePartenariat.StatutDemande;
import com.taib.pi_ms5.repository.DemandePartenariatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DemandePartenariatService {

    private final DemandePartenariatRepository
            demandePartenariatRepository;

    // ═══════════════════════════════════════════
    // LECTURE
    // ═══════════════════════════════════════════

    // Toutes les demandes (admin)
    public List<DemandePartenariat> getAllDemandes() {
        return demandePartenariatRepository
                .findAllByOrderByDateSoumissionDesc();
    }

    // Une demande par ID
    public DemandePartenariat getDemandeById(Long id) {
        return demandePartenariatRepository
                .findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Demande non trouvée avec l'ID: " + id
                ));
    }

    // Demandes par statut
    public List<DemandePartenariat> getByStatut(
            StatutDemande statut) {
        return demandePartenariatRepository
                .findByStatut(statut);
    }

    // Demandes d'un utilisateur
    public List<DemandePartenariat> getByUserId(
            Long userId) {
        return demandePartenariatRepository
                .findByUserId(userId);
    }

    // Statistiques pour l'admin
    public long countEnAttente() {
        return demandePartenariatRepository
                .countByStatut(StatutDemande.EN_ATTENTE);
    }

    public long countApprouvees() {
        return demandePartenariatRepository
                .countByStatut(StatutDemande.APPROUVEE);
    }

    public long countRefusees() {
        return demandePartenariatRepository
                .countByStatut(StatutDemande.REFUSEE);
    }

    // ═══════════════════════════════════════════
    // CRÉER UNE DEMANDE
    // ═══════════════════════════════════════════

    public DemandePartenariat creerDemande(
            DemandePartenariat demande) {

        // Vérification supprimée - les utilisateurs peuvent maintenant
        // soumettre plusieurs demandes de partenariat
        // demandePartenariatRepository
        //         .findByUserIdAndStatut(
        //                 demande.getUserId(),
        //                 StatutDemande.EN_ATTENTE
        //         )
        //         .ifPresent(d -> {
        //             throw new RuntimeException(
        //                     "Vous avez déjà une demande "
        //                             + "en attente de traitement"
        //             );
        //         });

        demande.setStatut(StatutDemande.EN_ATTENTE);
        demande.setDateSoumission(LocalDateTime.now());

        return demandePartenariatRepository.save(demande);
    }

    // ═══════════════════════════════════════════
    // ACTIONS ADMIN
    // ═══════════════════════════════════════════

    // Approuver une demande
    public DemandePartenariat approuverDemande(Long id) {
        DemandePartenariat demande = getDemandeById(id);

        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE) {
            throw new RuntimeException(
                    "Seules les demandes en attente "
                            + "peuvent être approuvées"
            );
        }

        demande.setStatut(StatutDemande.APPROUVEE);
        demande.setDateTraitement(LocalDateTime.now());

        return demandePartenariatRepository.save(demande);
    }

    // Refuser une demande
    public DemandePartenariat refuserDemande(
            Long id,
            String motif) {

        DemandePartenariat demande = getDemandeById(id);

        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE) {
            throw new RuntimeException(
                    "Seules les demandes en attente "
                            + "peuvent être refusées"
            );
        }

        demande.setStatut(StatutDemande.REFUSEE);
        demande.setMotifRefus(motif);
        demande.setDateTraitement(LocalDateTime.now());

        return demandePartenariatRepository.save(demande);
    }

    // Modifier une demande
    public DemandePartenariat updateDemande(
            Long id,
            DemandePartenariat details) {

        DemandePartenariat demande = getDemandeById(id);

        if (demande.getStatut()
                != StatutDemande.EN_ATTENTE) {
            throw new RuntimeException(
                    "Seules les demandes en attente "
                            + "peuvent être modifiées"
            );
        }

        demande.setNom(details.getNom());
        demande.setPrenom(details.getPrenom());
        demande.setNomSociete(details.getNomSociete());
        demande.setDescription(details.getDescription());
        demande.setEmail(details.getEmail());
        demande.setTelephone(details.getTelephone());
        demande.setImageUrl(details.getImageUrl());
        demande.setDateCreationSociete(
                details.getDateCreationSociete()
        );

        return demandePartenariatRepository.save(demande);
    }

    // Supprimer une demande
    public void deleteDemande(Long id) {
        DemandePartenariat demande = getDemandeById(id);
        demandePartenariatRepository.delete(demande);
    }
}