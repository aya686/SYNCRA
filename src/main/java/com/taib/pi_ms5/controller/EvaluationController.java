package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Evaluation;
import com.taib.pi_ms5.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class EvaluationController {

    private final EvaluationService evaluationService;

    // POST /api/evaluations/candidature/1 → évaluer
    @PostMapping("/candidature/{candidatureId}")
    public ResponseEntity<Evaluation> evaluer(
            @PathVariable Long candidatureId,
            @RequestBody Evaluation evaluation) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(evaluationService
                        .evaluerCandidature(candidatureId, evaluation));
    }

    // GET /api/evaluations/candidature/1 → évaluation d'une candidature
    @GetMapping("/candidature/{candidatureId}")
    public ResponseEntity<Evaluation> getByCandiature(
            @PathVariable Long candidatureId) {
        return ResponseEntity.ok(
                evaluationService
                        .getEvaluationByCandidature(candidatureId)
        );
    }

    // PUT /api/evaluations/1 → modifier évaluation
    @PutMapping("/{id}")
    public ResponseEntity<Evaluation> update(
            @PathVariable Long id,
            @RequestBody Evaluation details) {
        return ResponseEntity.ok(
                evaluationService.updateEvaluation(id, details)
        );
    }
}