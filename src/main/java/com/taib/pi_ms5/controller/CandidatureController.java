package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Candidature;
import com.taib.pi_ms5.service.CandidatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CandidatureController {

    private final CandidatureService candidatureService;

    // GET /api/candidatures → toutes (admin)
    @GetMapping
    public ResponseEntity<List<Candidature>> getAllCandidatures() {
        return ResponseEntity.ok(
                candidatureService.getAllCandidatures()
        );
    }

    // GET /api/candidatures/1 → une candidature
    @GetMapping("/{id}")
    public ResponseEntity<Candidature> getCandidatureById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                candidatureService.getCandidatureById(id)
        );
    }

    // GET /api/candidatures/candidat/5 → mes candidatures
    @GetMapping("/candidat/{candidatId}")
    public ResponseEntity<List<Candidature>> getMesCandidatures(
            @PathVariable Long candidatId) {
        return ResponseEntity.ok(
                candidatureService.getMesCandidatures(candidatId)
        );
    }

    // GET /api/candidatures/offre/1 → candidatures d'une offre
    @GetMapping("/offre/{offreId}")
    public ResponseEntity<List<Candidature>> getCandidaturesByOffre(
            @PathVariable Long offreId) {
        return ResponseEntity.ok(
                candidatureService.getCandidaturesByOffre(offreId)
        );
    }

    // GET /api/candidatures/offre/1/count → compter
    @GetMapping("/offre/{offreId}/count")
    public ResponseEntity<Long> countByOffre(
            @PathVariable Long offreId) {
        return ResponseEntity.ok(
                candidatureService.countCandidaturesByOffre(offreId)
        );
    }

    // POST /api/candidatures/offre/1 → postuler
    @PostMapping("/offre/{offreId}")
    public ResponseEntity<Candidature> soumettreCandidature(
            @PathVariable Long offreId,
            @Valid @RequestBody Candidature candidature) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(candidatureService
                        .soumettreCandidature(offreId, candidature));
    }

    // PATCH /api/candidatures/1/accepter → accepter
    @PatchMapping("/{id}/accepter")
    public ResponseEntity<Candidature> accepter(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                candidatureService.accepterCandidature(id)
        );
    }

    // PATCH /api/candidatures/1/refuser → refuser
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<Candidature> refuser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                candidatureService.refuserCandidature(id)
        );
    }

    // PATCH /api/candidatures/1/shortlist → shortlist
    @PatchMapping("/{id}/shortlist")
    public ResponseEntity<Candidature> shortlist(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                candidatureService.mettreEnShortlist(id)
        );
    }

    // PATCH /api/candidatures/1/reanalyser → relancer l'IA
    @PatchMapping("/{id}/reanalyser")
    public ResponseEntity<Candidature> reanalyser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                candidatureService.reanalyserAvecIa(id)
        );
    }




}