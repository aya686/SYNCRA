package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.service.IaOffreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ia")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class IaController {

    private final IaOffreService iaOffreService;

    // POST /api/ia/predict-budget
    @PostMapping("/predict-budget")
    public ResponseEntity<Map<String, Object>>
            predictBudget(
                @RequestParam String categorie,
                @RequestParam int dureeJours,
                @RequestParam int nbCriteres,
                @RequestParam(defaultValue = "50")
                    int scorePublieur,
                @RequestParam(defaultValue = "1")
                    int nbPostes) {

        return ResponseEntity.ok(
            iaOffreService.predireBudget(
                categorie, dureeJours,
                nbCriteres, scorePublieur, nbPostes
            )
        );
    }

    // POST /api/ia/detect-fraud
    @PostMapping("/detect-fraud")
    public ResponseEntity<Map<String, Object>>
            detectFraud(
                @RequestParam String categorie,
                @RequestParam int dureeJours,
                @RequestParam int nbCriteres,
                @RequestParam int scorePublieur,
                @RequestParam int nbPostes,
                @RequestParam double budget) {

        return ResponseEntity.ok(
            iaOffreService.detecterFraude(
                categorie, dureeJours, nbCriteres,
                scorePublieur, nbPostes, budget
            )
        );
    }

    // POST /api/ia/analyze-offre
    @PostMapping("/analyze-offre")
    public ResponseEntity<Map<String, Object>>
            analyzeOffre(
                @RequestParam String categorie,
                @RequestParam int dureeJours,
                @RequestParam int nbCriteres,
                @RequestParam int scorePublieur,
                @RequestParam int nbPostes,
                @RequestParam double budget) {

        return ResponseEntity.ok(
            iaOffreService.analyserOffre(
                categorie, dureeJours, nbCriteres,
                scorePublieur, nbPostes, budget
            )
        );
    }
}
