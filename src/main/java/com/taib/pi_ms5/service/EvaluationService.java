package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Candidature;
import com.taib.pi_ms5.entity.Candidature.StatutCandidature;
import com.taib.pi_ms5.entity.Evaluation;
import com.taib.pi_ms5.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final CandidatureService candidatureService;

    // Créer une évaluation pour une candidature
    public Evaluation evaluerCandidature(
            Long candidatureId,
            Evaluation evaluation) {


        Candidature candidature =
                candidatureService.getCandidatureById(candidatureId);

        // Vérifier qu'il n'y a pas déjà une évaluation
        evaluationRepository
                .findByCandidatureId(candidatureId)
                .ifPresent(e -> {
                    throw new RuntimeException(
                            "Cette candidature a déjà été évaluée"
                    );
                });

        evaluation.setCandidature(candidature);
        evaluation.setDateEvaluation(LocalDateTime.now());

        // ✅ CORRIGÉ — Integer → Double
        if (candidature.getScoreIa() != null) {
            evaluation.setScoreIa(
                    candidature.getScoreIa().doubleValue()
            );
        } else {
            evaluation.setScoreIa(0.0);
        }


        // ✅ CORRIGÉ — sauvegarder le statut en base
        candidature.setStatut(StatutCandidature.EN_REVISION);
        candidatureService.saveCandidature(candidature);

        return evaluationRepository.save(evaluation);
    }

    // Récupérer l'évaluation d'une candidature
    public Evaluation getEvaluationByCandidature(
            Long candidatureId) {
        return evaluationRepository
                .findByCandidatureId(candidatureId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aucune évaluation pour cette candidature"
                        )
                );
    }

    // Modifier une évaluation
    public Evaluation updateEvaluation(
            Long id,
            Evaluation details) {

        Evaluation evaluation = evaluationRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Évaluation non trouvée")
                );

        evaluation.setNote(details.getNote());
        evaluation.setCommentaire(details.getCommentaire());
        evaluation.setFeedbackCandidat(
                details.getFeedbackCandidat()
        );
        evaluation.setPointsForts(details.getPointsForts());
        evaluation.setPointsFaibles(details.getPointsFaibles());

        return evaluationRepository.save(evaluation);
    }

    // Toutes les évaluations d'un évaluateur
    public List<Evaluation> getEvaluationsByEvaluateur(
            Long evaluateurId) {
        return evaluationRepository
                .findByEvaluateurId(evaluateurId);
    }
}