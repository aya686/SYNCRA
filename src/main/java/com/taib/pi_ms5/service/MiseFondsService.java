package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Investisseur;
import com.taib.pi_ms5.entity.MiseFonds;
import com.taib.pi_ms5.entity.MiseFonds.*;
import com.taib.pi_ms5.repository.MiseFondsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MiseFondsService {

    private final MiseFondsRepository miseFondsRepository;
    private final InvestisseurService investisseurService;

    public List<MiseFonds> getAllMisesFonds() {
        return miseFondsRepository
                .findAllByOrderByDateSoumissionDesc();
    }

    public MiseFonds getMiseFondsById(Long id) {
        return miseFondsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Mise de fonds non trouvée: " + id
                ));
    }

    public List<MiseFonds> getByInvestisseur(
            Long investisseurId) {
        return miseFondsRepository
                .findByInvestisseurId(investisseurId);
    }

    public List<MiseFonds> getByProjet(Long projetId) {
        return miseFondsRepository
                .findByProjetId(projetId);
    }

    public List<MiseFonds> getByStatut(
            StatutMiseFonds statut) {
        return miseFondsRepository.findByStatut(statut);
    }

    public MiseFonds soumettreMiseFonds(
            Long investisseurId,
            MiseFonds miseFonds) {

        Investisseur investisseur =
                investisseurService
                        .getInvestisseurById(investisseurId);

        if (!investisseur.getProfilVerifie()) {
            throw new RuntimeException(
                    "Votre profil doit être vérifié "
                            + "avant de soumettre une mise de fonds"
            );
        }

        miseFonds.setInvestisseur(investisseur);
        miseFonds.setStatut(StatutMiseFonds.EN_ATTENTE);
        miseFonds.setDateSoumission(LocalDateTime.now());

        // Analyse IA
        analyserMiseFondsIA(miseFonds);

        return miseFondsRepository.save(miseFonds);
    }

    private void analyserMiseFondsIA(MiseFonds mf) {

        double score = 60.0;

        if (mf.getPreuveFonds() != null
                && !mf.getPreuveFonds().isEmpty()) {
            score += 20;
        }
        if (mf.getPourcentageParticipation() <= 20) {
            score += 10;
        }
        if (mf.getDureeMois() != null
                && mf.getDureeMois() >= 12) {
            score += 10;
        }

        mf.setScoreViabilite(Math.min(score, 100.0));

        double roi = 8.0
                + (mf.getPourcentageParticipation() * 0.5);
        mf.setRoiEstime(Math.min(roi, 25.0));

        if (score >= 80) {
            mf.setNiveauRisque(NiveauRisque.FAIBLE);
            mf.setRecommandationIa(
                    "Investissement conseillé. "
                            + "Profil solide et dossier complet."
            );
        } else if (score >= 60) {
            mf.setNiveauRisque(NiveauRisque.MOYEN);
            mf.setRecommandationIa(
                    "Investissement acceptable. "
                            + "Vérifier les garanties."
            );
        } else {
            mf.setNiveauRisque(NiveauRisque.ELEVE);
            mf.setRecommandationIa(
                    "Investissement risqué. "
                            + "Dossier incomplet."
            );
        }
    }

    public MiseFonds validerMiseFonds(Long id) {
        MiseFonds mf = getMiseFondsById(id);
        mf.setStatut(StatutMiseFonds.VALIDEE);
        mf.setDateTraitement(LocalDateTime.now());
        return miseFondsRepository.save(mf);
    }

    public MiseFonds refuserMiseFonds(
            Long id, String motif) {
        MiseFonds mf = getMiseFondsById(id);
        mf.setStatut(StatutMiseFonds.REFUSEE);
        mf.setMotifRefus(motif);
        mf.setDateTraitement(LocalDateTime.now());
        return miseFondsRepository.save(mf);
    }

    public MiseFonds annulerMiseFonds(Long id) {
        MiseFonds mf = getMiseFondsById(id);
        if (mf.getStatut() != StatutMiseFonds.EN_ATTENTE) {
            throw new RuntimeException(
                    "Seules les mises de fonds en attente "
                            + "peuvent être annulées"
            );
        }
        mf.setStatut(StatutMiseFonds.ANNULEE);
        return miseFondsRepository.save(mf);
    }

    // Mettre à jour les attributs IA (pourcentage d'acceptation et cause)
    public MiseFonds mettreAJourAnalyseIA(
            Long id,
            Integer pourcentageAcceptation,
            String causeAcceptation) {
        MiseFonds mf = getMiseFondsById(id);
        mf.setPourcentageAcceptation(pourcentageAcceptation);
        mf.setCauseAcceptation(causeAcceptation);
        return miseFondsRepository.save(mf);
    }
}