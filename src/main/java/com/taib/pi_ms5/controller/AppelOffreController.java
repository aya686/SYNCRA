package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.AppelOffre;
import com.taib.pi_ms5.entity.AppelOffre.StatutAppelOffre;
import com.taib.pi_ms5.service.AppelOffreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/appels-offres")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class AppelOffreController {

    private final AppelOffreService appelOffreService;

    // GET /api/appels-offres → tous les appels d'offres
    @GetMapping
    public ResponseEntity<List<AppelOffre>> getAllAppelsOffres() {
        return ResponseEntity.ok(appelOffreService.getAllAppelsOffres());
    }

    // GET /api/appels-offres/1 → un appel d'offres par ID
    @GetMapping("/{id}")
    public ResponseEntity<AppelOffre> getAppelOffreById(@PathVariable Long id) {
        return ResponseEntity.ok(appelOffreService.getAppelOffreById(id));
    }

    // GET /api/appels-offres/offre/1 → appel d'offres lié à une offre
    @GetMapping("/offre/{offreId}")
    public ResponseEntity<AppelOffre> getAppelOffreByOffre(
            @PathVariable Long offreId) {
        return ResponseEntity.ok(
                appelOffreService.getAppelOffreByOffre(offreId)
        );
    }

    // GET /api/appels-offres/statut/OUVERT → filtrer par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<AppelOffre>> getByStatut(
            @PathVariable StatutAppelOffre statut) {
        return ResponseEntity.ok(
                appelOffreService.getAppelsOffresByStatut(statut)
        );
    }

    // POST /api/appels-offres/offre/1 → créer un appel d'offres pour une offre
    @PostMapping("/offre/{offreId}")
    public ResponseEntity<AppelOffre> createAppelOffre(
            @PathVariable Long offreId,
            @Valid @RequestBody AppelOffre appelOffre) {
        AppelOffre nouveau = appelOffreService.createAppelOffre(
                offreId, appelOffre
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveau);
    }

    // PUT /api/appels-offres/1 → modifier un appel d'offres
    @PutMapping("/{id}")
    public ResponseEntity<AppelOffre> updateAppelOffre(
            @PathVariable Long id,
            @Valid @RequestBody AppelOffre details) {
        return ResponseEntity.ok(
                appelOffreService.updateAppelOffre(id, details)
        );
    }

    // PATCH /api/appels-offres/1/cloturer → clôturer
    @PatchMapping("/{id}/cloturer")
    public ResponseEntity<AppelOffre> cloturerAppelOffre(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                appelOffreService.cloturerAppelOffre(id)
        );
    }

    // PATCH /api/appels-offres/1/annuler → annuler
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<AppelOffre> annulerAppelOffre(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                appelOffreService.annulerAppelOffre(id)
        );
    }
}