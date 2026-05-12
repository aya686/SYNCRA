// src/main/java/com/taib/pi_ms5/controller/CritereController.java

package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Critere;
import com.taib.pi_ms5.service.CritereService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/criteres")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CritereController {

    private final CritereService critereService;

    // GET /api/criteres/offre/1 → tous les critères d'une offre
    @GetMapping("/offre/{offreId}")
    public ResponseEntity<List<Critere>> getCriteresByOffre(
            @PathVariable Long offreId) {
        return ResponseEntity.ok(critereService.getCriteresByOffre(offreId));
    }

    // GET /api/criteres/offre/1/obligatoires → critères obligatoires d'une offre
    @GetMapping("/offre/{offreId}/obligatoires")
    public ResponseEntity<List<Critere>> getCriteresObligatoires(
            @PathVariable Long offreId) {
        return ResponseEntity.ok(
                critereService.getCriteresObligatoires(offreId)
        );
    }

    // GET /api/criteres/1 → un critère par ID
    @GetMapping("/{id}")
    public ResponseEntity<Critere> getCritereById(@PathVariable Long id) {
        return ResponseEntity.ok(critereService.getCritereById(id));
    }

    // POST /api/criteres/offre/1 → ajouter un critère à une offre
    @PostMapping("/offre/{offreId}")
    public ResponseEntity<Critere> addCritere(
            @PathVariable Long offreId,
            @Valid @RequestBody Critere critere) {
        Critere nouveau = critereService.addCritere(offreId, critere);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveau);
    }

    // PUT /api/criteres/1 → modifier un critère
    @PutMapping("/{id}")
    public ResponseEntity<Critere> updateCritere(
            @PathVariable Long id,
            @Valid @RequestBody Critere critereDetails) {
        return ResponseEntity.ok(
                critereService.updateCritere(id, critereDetails)
        );
    }

    // DELETE /api/criteres/1 → supprimer un critère
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCritere(@PathVariable Long id) {
        critereService.deleteCritere(id);
        return ResponseEntity.noContent().build();
    }
}