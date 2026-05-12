package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Clause;
import com.taib.pi_ms5.entity.Contrat;
import com.taib.pi_ms5.entity.Contrat.StatutContrat;
import com.taib.pi_ms5.entity.Signature;
import com.taib.pi_ms5.entity.Signature.RoleSignataire;
import com.taib.pi_ms5.repository.ClauseRepository;
import com.taib.pi_ms5.repository.ContratRepository;
import com.taib.pi_ms5.repository.SignatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContratService {

    private final ContratRepository contratRepository;
    private final ClauseRepository clauseRepository;
    private final SignatureRepository signatureRepository;

    // ═══════════════════════════════════════════
    // CRUD DE BASE
    // ═══════════════════════════════════════════

    public List<Contrat> getAllContrats() {
        return contratRepository
                .findAllByOrderByDateGenerationDesc();
    }

    public Contrat getContratById(Long id) {
        return contratRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Contrat non trouvé avec l'ID: " + id
                ));
    }

    public List<Contrat> getMesContrats(Long userId) {
        return contratRepository.findAllByUserId(userId);
    }

    public List<Contrat> getContratsByStatut(
            StatutContrat statut) {
        return contratRepository.findByStatut(statut);
    }

    // ═══════════════════════════════════════════
    // CRÉER UN CONTRAT
    // ═══════════════════════════════════════════

    public Contrat creerContrat(Contrat contrat) {
        contrat.setStatut(StatutContrat.BROUILLON);
        contrat.setDateGeneration(LocalDateTime.now());

        // Sauvegarder le contrat
        Contrat contratSauvegarde =
                contratRepository.save(contrat);

        // Générer les clauses par défaut
        genererClausesParDefaut(contratSauvegarde);

        return contratSauvegarde;
    }

    // Générer contrat automatiquement depuis candidature
    public Contrat genererContratAutomatique(
            Long candidatureId,
            Long offreId,
            Long clientId,
            Long prestataireId,
            Double montant,
            String titreOffre) {

        Contrat contrat = new Contrat();
        contrat.setTitre(
                "Contrat — " + titreOffre
        );
        contrat.setDescription(
                "Contrat généré automatiquement suite à "
                        + "l'acceptation de la candidature."
        );
        contrat.setMontant(montant);
        contrat.setClientId(clientId);
        contrat.setPrestataireId(prestataireId);
        contrat.setCandidatureId(candidatureId);
        contrat.setOffreId(offreId);
        contrat.setModalitePaiement(
                "50% à la signature, 50% à la livraison"
        );
        contrat.setDateDebut(LocalDateTime.now());
        contrat.setDateFin(
                LocalDateTime.now().plusMonths(3)
        );
        contrat.setStatut(StatutContrat.BROUILLON);
        contrat.setDateGeneration(LocalDateTime.now());

        Contrat contratSauvegarde =
                contratRepository.save(contrat);

        genererClausesParDefaut(contratSauvegarde);

        return contratSauvegarde;
    }

    // Générer les clauses standard automatiquement
    private void genererClausesParDefaut(Contrat contrat) {
        List<Clause> clauses = new ArrayList<>();

        clauses.add(creerClause(contrat,
                "Objet du contrat",
                "Le prestataire s'engage à réaliser les "
                        + "travaux décrits dans l'offre publiée "
                        + "sur la plateforme PI MS5.",
                1, Clause.TypeClause.OBJET));

        clauses.add(creerClause(contrat,
                "Délais de livraison",
                "La livraison finale est prévue à la date "
                        + "convenue entre les deux parties. Des "
                        + "livrables intermédiaires peuvent être "
                        + "demandés par le client.",
                2, Clause.TypeClause.DELAI));

        clauses.add(creerClause(contrat,
                "Modalités de paiement",
                "Le paiement sera effectué selon les "
                        + "modalités convenues : 50% à la signature "
                        + "du contrat, 50% à la livraison finale.",
                3, Clause.TypeClause.PAIEMENT));

        clauses.add(creerClause(contrat,
                "Confidentialité",
                "Le prestataire s'engage à maintenir "
                        + "strictement confidentielle toute "
                        + "information relative au projet du client.",
                4, Clause.TypeClause.CONFIDENTIALITE));

        clauses.add(creerClause(contrat,
                "Propriété intellectuelle",
                "L'ensemble des livrables produits dans "
                        + "le cadre de ce contrat appartient "
                        + "entièrement au client après paiement "
                        + "intégral.",
                5,
                Clause.TypeClause.PROPRIETE_INTELLECTUELLE
        ));

        clauses.add(creerClause(contrat,
                "Résiliation",
                "En cas de résiliation anticipée, le client "
                        + "s'engage à payer les travaux réalisés "
                        + "jusqu'à la date de résiliation.",
                6, Clause.TypeClause.RESILIATION));

        clauseRepository.saveAll(clauses);
    }

    private Clause creerClause(
            Contrat contrat,
            String titre,
            String contenu,
            int ordre,
            Clause.TypeClause type) {

        Clause clause = new Clause();
        clause.setContrat(contrat);
        clause.setTitre(titre);
        clause.setContenu(contenu);
        clause.setOrdreAffichage(ordre);
        clause.setObligatoire(true);
        clause.setTypeClause(type);
        return clause;
    }

    // ═══════════════════════════════════════════
    // MODIFIER UN CONTRAT
    // ═══════════════════════════════════════════

    public Contrat updateContrat(
            Long id,
            Contrat details) {

        Contrat contrat = getContratById(id);

        if (contrat.getStatut() != StatutContrat.BROUILLON) {
            throw new RuntimeException(
                    "Seuls les contrats en brouillon "
                            + "peuvent être modifiés"
            );
        }

        contrat.setTitre(details.getTitre());
        contrat.setDescription(details.getDescription());
        contrat.setMontant(details.getMontant());
        contrat.setModalitePaiement(
                details.getModalitePaiement()
        );
        contrat.setDateDebut(details.getDateDebut());
        contrat.setDateFin(details.getDateFin());

        return contratRepository.save(contrat);
    }

    // ═══════════════════════════════════════════
    // SIGNATURE ÉLECTRONIQUE
    // ═══════════════════════════════════════════

    public Signature signerContrat(
            Long contratId,
            Long signataireId,
            RoleSignataire role,
            String codeOtp) {

        Contrat contrat = getContratById(contratId);

        // Vérifier que le contrat peut être signé
        if (contrat.getStatut() == StatutContrat.ACTIF) {
            throw new RuntimeException(
                    "Ce contrat est déjà signé par les "
                            + "deux parties"
            );
        }

        // Vérifier que le signataire n'a pas déjà signé
        signatureRepository
                .findByContratIdAndSignataireId(
                        contratId, signataireId
                )
                .ifPresent(s -> {
                    throw new RuntimeException(
                            "Vous avez déjà signé ce contrat"
                    );
                });

        // Créer la signature
        Signature signature = new Signature();
        signature.setContrat(contrat);
        signature.setSignataireId(signataireId);
        signature.setRoleSignataire(role);
        signature.setDateSignature(LocalDateTime.now());
        signature.setCodeOtp(codeOtp);
        signature.setOtpVerifie(true);
        signature.setValide(true);

        Signature signatureSauvegardee =
                signatureRepository.save(signature);

        // Vérifier si les deux parties ont signé
        mettreAJourStatutContrat(contratId);

        return signatureSauvegardee;
    }

    // Mettre à jour le statut selon les signatures
    private void mettreAJourStatutContrat(Long contratId) {
        Contrat contrat = getContratById(contratId);

        Long nbSignatures = signatureRepository
                .countByContratIdAndValide(contratId, true);

        if (nbSignatures == 0) {
            contrat.setStatut(StatutContrat.BROUILLON);
        } else if (nbSignatures == 1) {
            contrat.setStatut(StatutContrat.EN_ATTENTE);
        } else if (nbSignatures >= 2) {
            contrat.setStatut(StatutContrat.ACTIF);
        }

        contratRepository.save(contrat);
    }

    // ═══════════════════════════════════════════
    // ACTIONS ADMIN
    // ═══════════════════════════════════════════

    public Contrat resilierContrat(Long id) {
        Contrat contrat = getContratById(id);
        contrat.setStatut(StatutContrat.RESILIE);
        return contratRepository.save(contrat);
    }

    public Contrat terminerContrat(Long id) {
        Contrat contrat = getContratById(id);
        if (contrat.getStatut() != StatutContrat.ACTIF) {
            throw new RuntimeException(
                    "Seuls les contrats actifs peuvent "
                            + "être terminés"
            );
        }
        contrat.setStatut(StatutContrat.TERMINE);
        return contratRepository.save(contrat);
    }
}