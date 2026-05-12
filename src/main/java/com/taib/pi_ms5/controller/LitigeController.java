package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Litige;
import com.taib.pi_ms5.entity.Litige.StatutLitige;
import com.taib.pi_ms5.entity.Litige.DecisionAdmin;
import com.taib.pi_ms5.service.LitigeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/litiges")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LitigeController {

    private final LitigeService litigeService;

    // GET /api/litiges → tous (admin)
    @GetMapping
    public ResponseEntity<List<Litige>> getAll() {
        return ResponseEntity.ok(
                litigeService.getAllLitiges()
        );
    }

    // GET /api/litiges/1 → un litige
    @GetMapping("/{id}")
    public ResponseEntity<Litige> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                litigeService.getLitigeById(id)
        );
    }

    // GET /api/litiges/contrat/1 → litiges d'un contrat
    @GetMapping("/contrat/{contratId}")
    public ResponseEntity<List<Litige>> getByContrat(
            @PathVariable Long contratId) {
        return ResponseEntity.ok(
                litigeService.getLitigesByContrat(contratId)
        );
    }

    // GET /api/litiges/statut/OUVERT
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Litige>> getByStatut(
            @PathVariable StatutLitige statut) {
        return ResponseEntity.ok(
                litigeService.getLitigesByStatut(statut)
        );
    }

    // POST /api/litiges/contrat/1 → ouvrir un litige
    @PostMapping("/contrat/{contratId}")
    public ResponseEntity<Litige> ouvrir(
            @PathVariable Long contratId,
            @RequestBody Litige litige) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(litigeService.ouvrirLitige(
                        contratId, litige
                ));
    }

    // PATCH /api/litiges/1/prendre-en-charge
    @PatchMapping("/{id}/prendre-en-charge")
    public ResponseEntity<Litige> prendreEnCharge(
            @PathVariable Long id,
            @RequestParam Long adminId) {
        return ResponseEntity.ok(
                litigeService.prendreEnCharge(id, adminId)
        );
    }

    // PATCH /api/litiges/1/resoudre → résoudre
    @PatchMapping("/{id}/resoudre")
    public ResponseEntity<Litige> resoudre(
            @PathVariable Long id,
            @RequestParam DecisionAdmin decision,
            @RequestParam String commentaire) {
        return ResponseEntity.ok(
                litigeService.resoudreLitige(
                        id, decision, commentaire
                )
        );
    }

    // PATCH /api/litiges/1/fermer → fermer
    @PatchMapping("/{id}/fermer")
    public ResponseEntity<Litige> fermer(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                litigeService.fermerLitige(id)
        );
    }
}