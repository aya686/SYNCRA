package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.MiseFonds;
import com.taib.pi_ms5.entity.MiseFonds.StatutMiseFonds;
import com.taib.pi_ms5.service.MiseFondsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mises-fonds")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MiseFondsController {

    private final MiseFondsService miseFondsService;

    @GetMapping
    public ResponseEntity<List<MiseFonds>> getAll() {
        return ResponseEntity.ok(
                miseFondsService.getAllMisesFonds()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<MiseFonds> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                miseFondsService.getMiseFondsById(id)
        );
    }

    @GetMapping("/investisseur/{id}")
    public ResponseEntity<List<MiseFonds>> getByInvestisseur(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                miseFondsService.getByInvestisseur(id)
        );
    }

    @GetMapping("/projet/{id}")
    public ResponseEntity<List<MiseFonds>> getByProjet(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                miseFondsService.getByProjet(id)
        );
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<MiseFonds>> getByStatut(
            @PathVariable StatutMiseFonds statut) {
        return ResponseEntity.ok(
                miseFondsService.getByStatut(statut)
        );
    }

    @PostMapping("/investisseur/{investisseurId}")
    public ResponseEntity<MiseFonds> soumettre(
            @PathVariable Long investisseurId,
            @RequestBody MiseFonds miseFonds) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(miseFondsService.soumettreMiseFonds(
                        investisseurId, miseFonds
                ));
    }

    @PatchMapping("/{id}/valider")
    public ResponseEntity<MiseFonds> valider(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                miseFondsService.validerMiseFonds(id)
        );
    }

    @PatchMapping("/{id}/refuser")
    public ResponseEntity<MiseFonds> refuser(
            @PathVariable Long id,
            @RequestParam String motif) {
        return ResponseEntity.ok(
                miseFondsService.refuserMiseFonds(id, motif)
        );
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<MiseFonds> annuler(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                miseFondsService.annulerMiseFonds(id)
        );
    }

    @PatchMapping("/{id}/analyse-ia")
    public ResponseEntity<MiseFonds> mettreAJourAnalyseIA(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Integer pourcentage = (Integer) body.get("pourcentageAcceptation");
        String cause = (String) body.get("causeAcceptation");
        return ResponseEntity.ok(
                miseFondsService.mettreAJourAnalyseIA(id, pourcentage, cause)
        );
    }
}