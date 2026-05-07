package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.*;
import com.taib.pi_ms5.entity.Paiement.*;
import com.taib.pi_ms5.entity.Transaction.*;
import com.taib.pi_ms5.entity.Facture.*;
import com.taib.pi_ms5.entity.Echeance.*;
import com.taib.pi_ms5.entity.Commission.*;
import com.taib.pi_ms5.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final TransactionRepository transactionRepository;
    private final FactureRepository factureRepository;
    private final EcheanceRepository echeanceRepository;
    private final CommissionRepository commissionRepository;
    private final LigneFactureRepository ligneFactureRepository;

    // ═══════════════════════════════════════════
    // LECTURE
    // ═══════════════════════════════════════════

    public List<Paiement> getAllPaiements() {
        return paiementRepository
                .findAllByOrderByDateCreationDesc();
    }

    public Paiement getPaiementById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Paiement non trouvé avec l'ID: " + id
                ));
    }

    public List<Paiement> getMesPaiements(Long userId) {
        return paiementRepository.findAllByUserId(userId);
    }

    public List<Paiement> getByStatut(
            StatutPaiement statut) {
        return paiementRepository.findByStatut(statut);
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository
                .findAllByOrderByDateTransactionDesc();
    }

    public List<Facture> getAllFactures() {
        return factureRepository
                .findAllByOrderByDateEmissionDesc();
    }

    public List<Facture> getMesFactures(Long userId) {
        List<Facture> factures = new ArrayList<>();
        factures.addAll(
                factureRepository.findByEmetteurId(userId)
        );
        factures.addAll(
                factureRepository.findByDestinataireId(userId)
        );
        return factures;
    }

    // Stats admin
    public Double getTotalPaye() {
        Double total = paiementRepository.getTotalPaye();
        return total != null ? total : 0.0;
    }

    public Double getTotalCommissions() {
        Double total = paiementRepository
                .getTotalCommissions();
        return total != null ? total : 0.0;
    }

    // ═══════════════════════════════════════════
    // CRÉER UN PAIEMENT
    // ═══════════════════════════════════════════

    public Paiement creerPaiement(Paiement paiement) {

        // Générer référence unique
        paiement.setReference(
                "PAY-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        // Calculer TVA
        double montantTva = paiement.getMontantTotal()
                * paiement.getTauxTva() / 100;
        paiement.setMontantTva(montantTva);

        // Calculer commission
        double montantCommission =
                paiement.getMontantTotal()
                        * paiement.getTauxCommission() / 100;
        paiement.setMontantCommission(montantCommission);

        paiement.setMontantPaye(0.0);
        paiement.setMontantRestant(
                paiement.getMontantTotal()
        );
        paiement.setStatut(StatutPaiement.EN_ATTENTE);
        paiement.setDateCreation(LocalDateTime.now());

        Paiement paiementSauvegarde =
                paiementRepository.save(paiement);

        // Générer échéances automatiquement (50/50)
        genererEcheancesParDefaut(paiementSauvegarde);

        // Créer la commission
        creerCommission(paiementSauvegarde);

        // Générer la facture initiale
        genererFacture(paiementSauvegarde,
                "Facture initiale — "
                        + paiementSauvegarde.getReference()
        );

        return paiementSauvegarde;
    }

    // Créer paiement automatique depuis contrat
    public Paiement creerPaiementDepuisContrat(
            Long contratId,
            Long payeurId,
            Long beneficiaireId,
            Double montant) {

        Paiement paiement = new Paiement();
        paiement.setContratId(contratId);
        paiement.setPayeurId(payeurId);
        paiement.setBeneficiaireId(beneficiaireId);
        paiement.setMontantTotal(montant);
        // ✅ APRÈS — nom correct
        paiement.setModePaiement(
                ModePaiement.VIREMENT_BANCAIRE

        );
        paiement.setDateEcheance(
                LocalDateTime.now().plusDays(30)
        );

        return creerPaiement(paiement);
    }

    // ═══════════════════════════════════════════
    // INITIER UN PAIEMENT (Transaction)
    // ═══════════════════════════════════════════

    public Transaction initierPaiement(
            Long paiementId,
            Double montant,
            TypeTransaction type,
            Long expediteurId) {

        Paiement paiement = getPaiementById(paiementId);

        if (paiement.getStatut()
                == StatutPaiement.PAYE) {
            throw new RuntimeException(
                    "Ce paiement est déjà entièrement réglé"
            );
        }

        if (paiement.getStatut()
                == StatutPaiement.BLOQUE) {
            throw new RuntimeException(
                    "Ce paiement est bloqué par l'admin"
            );
        }

        if (montant > paiement.getMontantRestant()) {
            throw new RuntimeException(
                    "Le montant dépasse le reste à payer: "
                            + paiement.getMontantRestant() + " TND"
            );
        }

        // Créer la transaction
        Transaction transaction = new Transaction();
        transaction.setReference(
                "TRX-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );
        transaction.setMontant(montant);
        transaction.setTypeTransaction(type);
        transaction.setStatut(
                StatutTransaction.EN_COURS
        );
        transaction.setExpediteurId(expediteurId);
        transaction.setDestinataireId(
                paiement.getBeneficiaireId()
        );
        transaction.setPaiement(paiement);
        transaction.setDateTransaction(
                LocalDateTime.now()
        );

        return transactionRepository.save(transaction);
    }

    // ═══════════════════════════════════════════
    // VALIDER UNE TRANSACTION
    // ═══════════════════════════════════════════

    public Transaction validerTransaction(Long id) {

        Transaction transaction =
                transactionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction non trouvée: " + id
                                )
                        );

        transaction.setStatut(StatutTransaction.VALIDEE);
        transaction.setDateValidation(
                LocalDateTime.now()
        );

        transactionRepository.save(transaction);

        // Mettre à jour le paiement
        Paiement paiement = transaction.getPaiement();
        double nouveauMontantPaye =
                paiement.getMontantPaye()
                        + transaction.getMontant();

        paiement.setMontantPaye(nouveauMontantPaye);
        paiement.setMontantRestant(
                paiement.getMontantTotal() - nouveauMontantPaye
        );

        // Mettre à jour le statut du paiement
        if (paiement.getMontantRestant() <= 0) {
            paiement.setStatut(StatutPaiement.PAYE);
            paiement.setDatePaiementComplet(
                    LocalDateTime.now()
            );
            // Générer reçu final
            genererFacture(paiement,
                    "Reçu final — "
                            + paiement.getReference()
            );
        } else {
            paiement.setStatut(
                    StatutPaiement.PARTIELLEMENT_PAYE
            );
        }

        paiementRepository.save(paiement);

        // Mettre à jour l'échéance correspondante
        mettreAJourEcheance(
                paiement.getId(),
                transaction.getMontant()
        );

        return transaction;
    }

    // ═══════════════════════════════════════════
    // GÉNÉRER ÉCHÉANCES PAR DÉFAUT (50% / 50%)
    // ═══════════════════════════════════════════

    private void genererEcheancesParDefaut(
            Paiement paiement) {

        double montant50 =
                paiement.getMontantTotal() / 2;

        // Échéance 1 : 50% immédiatement
        Echeance echeance1 = new Echeance();
        echeance1.setPaiement(paiement);
        echeance1.setNumeroEcheance(1);
        echeance1.setMontant(montant50);
        echeance1.setPourcentage(50.0);
        echeance1.setDescription(
                "Acompte 50% à la signature"
        );
        echeance1.setStatut(StatutEcheance.EN_ATTENTE);
        echeance1.setDateEcheance(
                LocalDateTime.now().plusDays(7)
        );

        // Échéance 2 : 50% à la livraison
        Echeance echeance2 = new Echeance();
        echeance2.setPaiement(paiement);
        echeance2.setNumeroEcheance(2);
        echeance2.setMontant(montant50);
        echeance2.setPourcentage(50.0);
        echeance2.setDescription(
                "Solde 50% à la livraison"
        );
        echeance2.setStatut(StatutEcheance.EN_ATTENTE);
        echeance2.setDateEcheance(
                LocalDateTime.now().plusMonths(3)
        );

        echeanceRepository.save(echeance1);
        echeanceRepository.save(echeance2);
    }

    private void mettreAJourEcheance(
            Long paiementId,
            Double montantPaye) {

        List<Echeance> echeances = echeanceRepository
                .findByPaiementIdOrderByNumeroEcheanceAsc(
                        paiementId
                );

        for (Echeance e : echeances) {
            if (e.getStatut()
                    == StatutEcheance.EN_ATTENTE
                    && Math.abs(e.getMontant() - montantPaye)
                    < 0.01) {
                e.setStatut(StatutEcheance.PAYEE);
                e.setDatePaiement(LocalDateTime.now());
                echeanceRepository.save(e);
                break;
            }
        }
    }

    // ═══════════════════════════════════════════
    // GÉNÉRER UNE FACTURE
    // ═══════════════════════════════════════════

    private Facture genererFacture(
            Paiement paiement,
            String titre) {

        Facture facture = new Facture();
        facture.setNumeroFacture(
                "FAC-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );
        facture.setTitre(titre);
        facture.setPaiement(paiement);
        facture.setEmetteurId(
                paiement.getBeneficiaireId()
        );
        facture.setDestinataireId(paiement.getPayeurId());
        facture.setTauxTva(paiement.getTauxTva());

        double montantHt = paiement.getMontantTotal();
        double montantTva = montantHt
                * paiement.getTauxTva() / 100;
        double montantTtc = montantHt + montantTva;

        facture.setMontantHt(montantHt);
        facture.setMontantTva(montantTva);
        facture.setMontantTtc(montantTtc);
        facture.setStatut(StatutFacture.EMISE);
        facture.setTypeFacture(TypeFacture.FACTURE);
        facture.setDateEmission(LocalDateTime.now());
        facture.setDateEcheance(
                paiement.getDateEcheance()
        );

        Facture factureSauvegardee =
                factureRepository.save(facture);

        // Ajouter une ligne de facture
        LigneFacture ligne = new LigneFacture();
        ligne.setFacture(factureSauvegardee);
        ligne.setDescription(titre);
        ligne.setQuantite(1.0);
        ligne.setUnite("forfait");
        ligne.setPrixUnitaireHt(montantHt);
        ligne.setTauxRemise(0.0);
        ligne.setMontantHt(montantHt);
        ligne.setTauxTva(paiement.getTauxTva());
        ligne.setMontantTva(montantTva);
        ligne.setMontantTtc(montantTtc);
        ligne.setOrdre(1);

        ligneFactureRepository.save(ligne);

        return factureSauvegardee;
    }

    // ═══════════════════════════════════════════
    // CRÉER UNE COMMISSION
    // ═══════════════════════════════════════════

    private Commission creerCommission(
            Paiement paiement) {

        Commission commission = new Commission();
        commission.setPaiement(paiement);
        commission.setTaux(paiement.getTauxCommission());
        commission.setMontantBase(
                paiement.getMontantTotal()
        );
        commission.setMontantCommission(
                paiement.getMontantCommission()
        );
        commission.setTypeCommission(
                Commission.TypeCommission.PLATEFORME
        );
        commission.setStatut(
                Commission.StatutCommission.EN_ATTENTE
        );
        commission.setDescription(
                "Commission plateforme "
                        + paiement.getTauxCommission()
                        + "% sur " + paiement.getMontantTotal()
                        + " TND"
        );
        commission.setDateCalcul(LocalDateTime.now());

        return commissionRepository.save(commission);
    }

    // ═══════════════════════════════════════════
    // ACTIONS ADMIN
    // ═══════════════════════════════════════════

    public Paiement bloquerPaiement(Long id) {
        Paiement paiement = getPaiementById(id);
        paiement.setStatut(StatutPaiement.BLOQUE);
        return paiementRepository.save(paiement);
    }

    public Paiement debloquerPaiement(Long id) {
        Paiement paiement = getPaiementById(id);
        paiement.setStatut(StatutPaiement.EN_ATTENTE);
        return paiementRepository.save(paiement);
    }

    public Transaction rembourserTransaction(Long id) {
        Transaction transaction =
                transactionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction non trouvée: " + id
                                )
                        );

        transaction.setStatut(
                StatutTransaction.REMBOURSEE
        );
        transactionRepository.save(transaction);

        // Mettre à jour le paiement
        Paiement paiement = transaction.getPaiement();
        double montantPaye =
                paiement.getMontantPaye()
                        - transaction.getMontant();

        paiement.setMontantPaye(
                Math.max(montantPaye, 0.0)
        );
        paiement.setMontantRestant(
                paiement.getMontantTotal()
                        - paiement.getMontantPaye()
        );
        paiement.setStatut(StatutPaiement.REMBOURSE);

        paiementRepository.save(paiement);

        return transaction;
    }

    // Prélever la commission
    public Commission prelevuerCommission(
            Long commissionId) {

        Commission commission =
                commissionRepository.findById(commissionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Commission non trouvée: "
                                                + commissionId
                                )
                        );

        commission.setStatut(
                Commission.StatutCommission.PRELEVEE
        );
        commission.setDatePrelevement(
                LocalDateTime.now()
        );

        return commissionRepository.save(commission);
    }
}