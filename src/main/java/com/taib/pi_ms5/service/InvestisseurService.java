package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Investisseur;
import com.taib.pi_ms5.repository.InvestisseurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvestisseurService {

    private final InvestisseurRepository
            investisseurRepository;

    public List<Investisseur> getAllInvestisseurs() {
        return investisseurRepository.findAll();
    }

    public Investisseur getInvestisseurById(Long id) {
        return investisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Investisseur non trouvé avec l'ID: " + id
                ));
    }

    public Investisseur getByUserId(Long userId) {
        return investisseurRepository
                .findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Aucun investisseur pour userId: " + userId
                ));
    }

    public Investisseur creerProfil(
            Investisseur investisseur) {

        investisseurRepository
                .findByUserId(investisseur.getUserId())
                .ifPresent(i -> {
                    throw new RuntimeException(
                            "Un profil investisseur existe déjà "
                                    + "pour cet utilisateur"
                    );
                });

        investisseur.setProfilVerifie(false);
        investisseur.setDateCreation(LocalDateTime.now());

        // Score de fiabilité initial
        investisseur.setScoreFiabilite(
                calculerScoreFiabilite(investisseur)
        );

        return investisseurRepository.save(investisseur);
    }

    public Investisseur updateProfil(
            Long id,
            Investisseur details) {

        Investisseur investisseur =
                getInvestisseurById(id);

        investisseur.setNom(details.getNom());
        investisseur.setEmail(details.getEmail());
        investisseur.setTelephone(details.getTelephone());
        investisseur.setSecteursInteret(
                details.getSecteursInteret()
        );
        investisseur.setBudgetTotal(
                details.getBudgetTotal()
        );
        investisseur.setRibBancaire(
                details.getRibBancaire()
        );

        return investisseurRepository.save(investisseur);
    }

    public Investisseur verifierProfil(Long id) {
        Investisseur investisseur =
                getInvestisseurById(id);
        investisseur.setProfilVerifie(true);
        return investisseurRepository.save(investisseur);
    }

    private double calculerScoreFiabilite(
            Investisseur inv) {

        double score = 50.0;

        if (inv.getDocumentJustificatif() != null
                && !inv.getDocumentJustificatif()
                .isEmpty()) {
            score += 20;
        }
        if (inv.getRibBancaire() != null
                && !inv.getRibBancaire().isEmpty()) {
            score += 15;
        }
        if (inv.getBudgetTotal() != null
                && inv.getBudgetTotal() > 0) {
            score += 15;
        }

        return Math.min(score, 100.0);
    }
}