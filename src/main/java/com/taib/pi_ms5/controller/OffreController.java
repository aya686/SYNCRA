package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Offre;
import com.taib.pi_ms5.service.OffreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/offres")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class OffreController {

    private final OffreService offreService;

    // ✅ GET /api/offres → TOUTES les offres (plus de filtre ACTIVE)
    @GetMapping
    public ResponseEntity<List<Offre>> getAllOffres() {
        return ResponseEntity.ok(offreService.getAllOffres());
    }

    // GET /api/offres/actives → offres ACTIVE seulement (marketplace)
    @GetMapping("/actives")
    public ResponseEntity<List<Offre>> getOffresActives() {
        return ResponseEntity.ok(offreService.getOffresActives());
    }

    // GET /api/offres/admin/all → toutes les offres pour admin
    @GetMapping("/admin/all")
    public ResponseEntity<List<Offre>> getAllOffresAdmin() {
        return ResponseEntity.ok(offreService.getAllOffresAdmin());
    }

    // GET /api/offres/1 → détail d'une offre
    @GetMapping("/{id}")
    public ResponseEntity<Offre> getOffreById(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.getOffreById(id));
    }

    // GET /api/offres/publieur/1 → offres d'un publieur
    @GetMapping("/publieur/{publieurId}")
    public ResponseEntity<List<Offre>> getOffresByPublieur(
            @PathVariable Long publieurId) {
        return ResponseEntity.ok(
                offreService.getOffresByPublieur(publieurId)
        );
    }

    // GET /api/offres/categorie/1 → offres par catégorie
    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<Offre>> getOffresByCategorie(
            @PathVariable Long categorieId) {
        return ResponseEntity.ok(
                offreService.getOffresByCategorie(categorieId)
        );
    }

    // GET /api/offres/recherche?titre=java → recherche
    @GetMapping("/recherche")
    public ResponseEntity<List<Offre>> rechercherOffres(
            @RequestParam String titre) {
        return ResponseEntity.ok(offreService.rechercherOffres(titre));
    }

    // POST /api/offres → créer une offre
    @PostMapping
    public ResponseEntity<Offre> createOffre(
            @Valid @RequestBody Offre offre) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(offreService.createOffre(offre));
    }

    // PUT /api/offres/1 → modifier une offre
    @PutMapping("/{id}")
    public ResponseEntity<Offre> updateOffre(
            @PathVariable Long id,
            @Valid @RequestBody Offre offreDetails) {
        return ResponseEntity.ok(
                offreService.updateOffre(id, offreDetails)
        );
    }

    // PATCH /api/offres/1/publier → publier
    @PatchMapping("/{id}/publier")
    public ResponseEntity<Offre> publierOffre(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.publierOffre(id));
    }

    // PATCH /api/offres/1/cloturer → clôturer
    @PatchMapping("/{id}/cloturer")
    public ResponseEntity<Offre> cloturerOffre(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.cloturerOffre(id));
    }

    // PATCH /api/offres/1/statut → changer le statut
    @PatchMapping("/{id}/statut")
    public ResponseEntity<Offre> changerStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String statutStr = body.get("statut");
        if (statutStr == null) {
            throw new RuntimeException("Le statut est requis");
        }
        // Convertir en majuscules pour gérer les valeurs avec une casse incorrecte
        Offre.StatutOffre statut = Offre.StatutOffre.valueOf(statutStr.toUpperCase());
        return ResponseEntity.ok(offreService.changerStatut(id, statut));
    }

    // PATCH /api/offres/1/suspendre → suspendre (admin)
    @PatchMapping("/{id}/suspendre")
    public ResponseEntity<Offre> suspendreOffre(@PathVariable Long id) {
        return ResponseEntity.ok(offreService.suspendreOffre(id));
    }

    // DELETE /api/offres/1 → supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOffre(@PathVariable Long id) {
        offreService.deleteOffre(id);
        return ResponseEntity.noContent().build();
    }
}