package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Candidature;
import com.taib.pi_ms5.entity.Candidature.*;
import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.repository.CandidatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidatureService {

    private final CandidatureRepository candidatureRepository;
    private final OffreService offreService;

    // ═══════════════════════════════════════════
    // CRUD DE BASE
    // ═══════════════════════════════════════════

    public List<Candidature> getAllCandidatures() {
        return candidatureRepository.findAll();
    }

    public List<Candidature> getMesCandidatures(Long candidatId) {
        return candidatureRepository.findByCandidatId(candidatId);
    }

    public List<Candidature> getCandidaturesByOffre(Long offreId) {
        return candidatureRepository
                .findByOffreIdOrderByScoreDesc(offreId);
    }

    public Candidature getCandidatureById(Long id) {
        return candidatureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Candidature non trouvée avec l'ID: " + id
                ));
    }

    // ✅ AJOUT — méthode save manquante
    public Candidature saveCandidature(Candidature candidature) {
        return candidatureRepository.save(candidature);
    }

    public Long countCandidaturesByOffre(Long offreId) {
        return candidatureRepository.countByOffreId(offreId);
    }

    // ═══════════════════════════════════════════
    // SOUMETTRE UNE CANDIDATURE
    // ═══════════════════════════════════════════

    public Candidature soumettreCandidature(
            Long offreId,
            Candidature candidature) {

        // Vérifier que l'offre est active
        Offre offre = offreService.getOffreById(offreId);
        if (offre.getStatut() != Offre.StatutOffre.ACTIVE) {
            throw new RuntimeException(
                    "Cette offre n'est plus disponible"
            );
        }

        // Vérifier qu'il n'a pas déjà postulé
        candidatureRepository
                .findByCandidatIdAndOffreId(
                        candidature.getCandidatId(), offreId
                )
                .ifPresent(c -> {
                    throw new RuntimeException(
                            "Vous avez déjà postulé à cette offre"
                    );
                });

        candidature.setOffre(offre);
        candidature.setStatut(StatutCandidature.EN_ATTENTE);
        candidature.setDateSoumission(LocalDateTime.now());

        // Analyse IA complète
        analyserAvecIa(candidature, offre);

        return candidatureRepository.save(candidature);
    }

    // ═══════════════════════════════════════════
    // ANALYSE IA COMPLÈTE
    // ═══════════════════════════════════════════

    private void analyserAvecIa(
            Candidature candidature,
            Offre offre) {

        String lettre = candidature.getLettreMotivation();

        // 1. Score lettre
        double scoreLettre = calculerScoreLettre(lettre);
        candidature.setScoreLettre(scoreLettre);

        // 2. Score portfolio
        double scorePortfolio = calculerScorePortfolio(
                candidature.getPortfolioUrl()
        );
        candidature.setScorePortfolio(scorePortfolio);

        // 3. Score tarif
        double scoreTarif = calculerScoreTarif(
                candidature.getTarifPropose(),
                offre.getBudgetMin(),
                offre.getBudgetMax()
        );
        candidature.setScoreTarif(scoreTarif);

        // 4. Score global
        double scoreGlobal = (scoreLettre   * 0.5)
                + (scorePortfolio * 0.3)
                + (scoreTarif     * 0.2);

        // ✅ Score IA en Integer
        candidature.setScoreIa(
                (int) Math.round(scoreGlobal)
        );

        // 5. Niveau compatibilité
        candidature.setNiveauCompatibilite(
                calculerNiveauCompatibilite(scoreGlobal)
        );

        // 6. Recommandation
        candidature.setRecommandationIa(
                calculerRecommandation(scoreGlobal)
        );

        // 7. Ton lettre
        candidature.setTonLettre(
                analyserTonLettre(lettre)
        );

        // 8. Mots clés
        candidature.setMotsClesDetectes(
                detecterMotsCles(lettre)
        );

        // 9. Points forts
        candidature.setPointsFortsIa(
                genererPointsForts(
                        candidature, scoreLettre,
                        scorePortfolio, scoreTarif
                )
        );

        // 10. Points faibles
        candidature.setPointsFaiblesIa(
                genererPointsFaibles(
                        candidature, scoreLettre,
                        scorePortfolio, scoreTarif
                )
        );

        // 11. Résumé
        candidature.setResumeIa(
                genererResume(candidature, scoreGlobal)
        );

        // 12. Analyse lettre
        candidature.setAnalyseLettre(
                genererAnalyseLettre(lettre)
        );

        // 13. Fraude
        detecterFraude(candidature, lettre);

        // 14. Rapport IA complet
        candidature.setAiReport(
                genererAiReport(candidature)
        );

        // 15. Résumé CV si pas fourni
        if (candidature.getCvResume() == null
                || candidature.getCvResume().isEmpty()) {
            candidature.setCvResume(
                    genererCvResume(candidature)
            );
        }

        // 16. Date analyse
        candidature.setDateAnalyseIa(LocalDateTime.now());
    }

    // ═══════════════════════════════════════════
    // MÉTHODES DE CALCUL IA
    // ═══════════════════════════════════════════

    private double calculerScoreLettre(String lettre) {
        if (lettre == null || lettre.isEmpty()) return 0.0;

        double score = 0.0;
        int longueur = lettre.length();

        if (longueur > 800)      score += 40;
        else if (longueur > 500) score += 30;
        else if (longueur > 200) score += 15;
        else                     score += 5;

        String[] motsPro = {
                "expérience", "compétence", "projet",
                "développé", "maîtrise", "réalisé",
                "équipe", "livré", "résultat", "client"
        };
        for (String mot : motsPro) {
            if (lettre.toLowerCase().contains(mot)) {
                score += 5;
            }
        }

        if (lettre.matches(".*\\d+.*")) score += 10;

        return Math.min(score, 100.0);
    }

    private double calculerScorePortfolio(String portfolioUrl) {
        if (portfolioUrl == null || portfolioUrl.isEmpty()) {
            return 0.0;
        }
        double score = 50.0;
        if (portfolioUrl.contains("github.com"))  score += 20;
        else if (portfolioUrl.startsWith("https")) score += 30;
        return Math.min(score, 100.0);
    }

    private double calculerScoreTarif(
            Double tarif,
            Double budgetMin,
            Double budgetMax) {

        if (tarif == null) return 0.0;

        if (budgetMax != null
                && tarif >= budgetMin
                && tarif <= budgetMax) {
            return 100.0;
        }
        if (tarif < budgetMin) return 80.0;
        if (budgetMax != null
                && tarif <= budgetMax * 1.2) {
            return 60.0;
        }
        return 20.0;
    }

    private NiveauCompatibilite calculerNiveauCompatibilite(
            double score) {
        if (score >= 76) return NiveauCompatibilite.EXCELLENT;
        if (score >= 51) return NiveauCompatibilite.FORT;
        if (score >= 26) return NiveauCompatibilite.MOYEN;
        return NiveauCompatibilite.FAIBLE;
    }

    private RecommandationIa calculerRecommandation(
            double score) {
        if (score > 75)  return RecommandationIa.ACCEPTER;
        if (score >= 50) return RecommandationIa.SHORTLIST;
        return RecommandationIa.REFUSER;
    }

    private TonLettre analyserTonLettre(String lettre) {
        if (lettre == null) return TonLettre.INSUFFISANT;

        String l = lettre.toLowerCase();

        long motsPro = List.of(
                "professionnel", "expérience", "compétence",
                "maîtrise", "réalisé", "livré"
        ).stream().filter(l::contains).count();

        long motsEnthousiaste = List.of(
                "passionné", "motivé", "enthousiaste",
                "adore", "passion", "rêve"
        ).stream().filter(l::contains).count();

        if (lettre.length() < 100) return TonLettre.INSUFFISANT;
        if (motsPro >= 3)          return TonLettre.PROFESSIONNEL;
        if (motsEnthousiaste >= 2) return TonLettre.ENTHOUSIASTE;
        return TonLettre.NEUTRE;
    }

    private String detecterMotsCles(String lettre) {
        if (lettre == null) return "";

        String[] techKeywords = {
                "React", "Angular", "Vue", "JavaScript",
                "TypeScript", "Java", "Spring", "Node.js",
                "Python", "Django", "MySQL", "MongoDB",
                "Docker", "AWS", "Git", "Agile", "Scrum",
                "Flutter", "Kotlin", "Swift", "PHP", "Laravel"
        };

        List<String> detected = new ArrayList<>();
        for (String kw : techKeywords) {
            if (lettre.toLowerCase()
                    .contains(kw.toLowerCase())) {
                detected.add(kw);
            }
        }
        return String.join(", ", detected);
    }

    private String genererPointsForts(
            Candidature c,
            double scoreLettre,
            double scorePortfolio,
            double scoreTarif) {

        List<String> points = new ArrayList<>();

        if (scoreLettre >= 70)
            points.add("Lettre de motivation détaillée");
        if (scorePortfolio >= 50)
            points.add("Portfolio présent et accessible");
        if (c.getPortfolioUrl() != null
                && c.getPortfolioUrl().contains("github"))
            points.add("Profil GitHub disponible");
        if (scoreTarif >= 80)
            points.add("Tarif dans la fourchette du budget");
        if (c.getLettreMotivation().length() > 500)
            points.add("Lettre complète et bien développée");
        if (points.isEmpty())
            points.add("Candidature soumise dans les délais");

        return String.join(" | ", points);
    }

    private String genererPointsFaibles(
            Candidature c,
            double scoreLettre,
            double scorePortfolio,
            double scoreTarif) {

        List<String> points = new ArrayList<>();

        if (scoreLettre < 40)
            points.add("Lettre trop courte ou peu détaillée");
        if (scorePortfolio == 0)
            points.add("Aucun portfolio fourni");
        if (scoreTarif < 40)
            points.add("Tarif au-dessus du budget de l'offre");
        if (c.getLettreMotivation().length() < 150)
            points.add("Description de l'expérience insuffisante");
        if (points.isEmpty())
            points.add("Aucun point faible majeur détecté");

        return String.join(" | ", points);
    }

    private String genererResume(
            Candidature c,
            double scoreGlobal) {

        String niveau = scoreGlobal >= 75 ? "excellent"
                : scoreGlobal >= 50 ? "bon"
                : "moyen";

        String portfolio = (c.getPortfolioUrl() != null
                && !c.getPortfolioUrl().isEmpty())
                ? "dispose d'un portfolio"
                : "n'a pas fourni de portfolio";

        return String.format(
                "Candidat avec un profil %s (score: %d/100). "
                        + "A proposé un tarif de %.0f TND et %s. "
                        + "Recommandation IA: %s.",
                niveau,
                (int) Math.round(scoreGlobal),
                c.getTarifPropose(),
                portfolio,
                calculerRecommandation(scoreGlobal).name()
        );
    }

    private String genererAnalyseLettre(String lettre) {
        if (lettre == null || lettre.length() < 50) {
            return "Lettre trop courte pour être analysée.";
        }

        int longueur = lettre.length();
        String taille = longueur > 800 ? "très complète"
                : longueur > 400 ? "correcte"
                : "courte";

        boolean hasMotsCles = lettre.toLowerCase()
                .matches(".*\\b(react|java|angular|python)\\b.*");

        return String.format(
                "Lettre de %d caractères, longueur %s. "
                        + "%s de compétences techniques. "
                        + "Structure globalement %s.",
                longueur, taille,
                hasMotsCles
                        ? "Mentionne des compétences techniques"
                        : "Ne mentionne pas",
                longueur > 300 ? "cohérente" : "à améliorer"
        );
    }

    private void detecterFraude(
            Candidature candidature,
            String lettre) {

        List<String> lettresGeneriques = List.of(
                "je suis très motivé pour rejoindre votre équipe",
                "je pense être le candidat idéal",
                "veuillez trouver ci-joint mon cv",
                "dans l'attente de votre réponse"
        );

        boolean fraude = false;
        String detail = "";

        if (lettre.length() < 50) {
            fraude = true;
            detail = "Lettre trop courte (moins de 50 caractères)";
        }

        for (String generique : lettresGeneriques) {
            if (lettre.toLowerCase().contains(generique)) {
                fraude = true;
                detail = "Lettre générique détectée : copié-collé probable";
                break;
            }
        }

        candidature.setFraudeDetectee(fraude);
        if (fraude) candidature.setDetailFraude(detail);
    }

    private String genererAiReport(Candidature c) {
        return String.format(
                "=== RAPPORT IA ===%n"
                        + "Score global    : %d / 100%n"
                        + "Score lettre    : %.1f / 100%n"
                        + "Score portfolio : %.1f / 100%n"
                        + "Score tarif     : %.1f / 100%n"
                        + "Compatibilité   : %s%n"
                        + "Recommandation  : %s%n"
                        + "Ton lettre      : %s%n"
                        + "Mots clés       : %s%n"
                        + "Fraude          : %s%n%n"
                        + "=== POINTS FORTS ===%n%s%n%n"
                        + "=== POINTS FAIBLES ===%n%s%n%n"
                        + "=== RÉSUMÉ ===%n%s%n",
                c.getScoreIa()         != null ? c.getScoreIa() : 0,
                c.getScoreLettre()     != null ? c.getScoreLettre() : 0.0,
                c.getScorePortfolio()  != null ? c.getScorePortfolio() : 0.0,
                c.getScoreTarif()      != null ? c.getScoreTarif() : 0.0,
                c.getNiveauCompatibilite() != null
                        ? c.getNiveauCompatibilite().name() : "N/A",
                c.getRecommandationIa() != null
                        ? c.getRecommandationIa().name() : "N/A",
                c.getTonLettre() != null
                        ? c.getTonLettre().name() : "N/A",
                c.getMotsClesDetectes() != null
                        ? c.getMotsClesDetectes() : "Aucun",
                Boolean.TRUE.equals(c.getFraudeDetectee())
                        ? "OUI ⚠️" : "NON ✅",
                c.getPointsFortsIa()   != null ? c.getPointsFortsIa() : "N/A",
                c.getPointsFaiblesIa() != null ? c.getPointsFaiblesIa() : "N/A",
                c.getResumeIa()        != null ? c.getResumeIa() : "N/A"
        );
    }

    private String genererCvResume(Candidature c) {
        String portfolio = (c.getPortfolioUrl() != null
                && !c.getPortfolioUrl().isEmpty())
                ? "Portfolio : " + c.getPortfolioUrl()
                : "Pas de portfolio fourni";

        String motsCles = (c.getMotsClesDetectes() != null
                && !c.getMotsClesDetectes().isEmpty())
                ? "Compétences : " + c.getMotsClesDetectes()
                : "Aucune compétence technique détectée";

        return String.format(
                "Candidat ID: %d | Tarif: %.0f TND | %s | %s",
                c.getCandidatId(),
                c.getTarifPropose(),
                portfolio,
                motsCles
        );
    }

    // ═══════════════════════════════════════════
    // ACTIONS SUR LES CANDIDATURES
    // ═══════════════════════════════════════════

    public Candidature accepterCandidature(Long id) {
        Candidature c = getCandidatureById(id);
        c.setStatut(StatutCandidature.ACCEPTEE);
        return candidatureRepository.save(c);
    }

    public Candidature refuserCandidature(Long id) {
        Candidature c = getCandidatureById(id);
        c.setStatut(StatutCandidature.REFUSEE);
        return candidatureRepository.save(c);
    }

    public Candidature mettreEnShortlist(Long id) {
        Candidature c = getCandidatureById(id);
        c.setStatut(StatutCandidature.SHORTLIST);
        return candidatureRepository.save(c);
    }

    public Candidature reanalyserAvecIa(Long id) {
        Candidature c = getCandidatureById(id);
        analyserAvecIa(c, c.getOffre());
        return candidatureRepository.save(c);
    }
}