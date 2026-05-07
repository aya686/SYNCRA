package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.DemandePartenariat;
import com.taib.pi_ms5.entity.DemandePartenariat.StatutDemande;
import com.taib.pi_ms5.service.DemandePartenariatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/demandes-partenariat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DemandePartenariatController {

    private final DemandePartenariatService
            demandeService;

    // ═══════════════════════════════════════════
    // GET
    // ═══════════════════════════════════════════

    // GET /api/demandes-partenariat
    @GetMapping
    public ResponseEntity<List<DemandePartenariat>>
    getAll() {
        return ResponseEntity.ok(
                demandeService.getAllDemandes()
        );
    }

    // GET /api/demandes-partenariat/1
    @GetMapping("/{id}")
    public ResponseEntity<DemandePartenariat> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                demandeService.getDemandeById(id)
        );
    }

    // GET /api/demandes-partenariat/statut/EN_ATTENTE
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<DemandePartenariat>>
    getByStatut(
            @PathVariable StatutDemande statut) {
        return ResponseEntity.ok(
                demandeService.getByStatut(statut)
        );
    }

    // GET /api/demandes-partenariat/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DemandePartenariat>>
    getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(
                demandeService.getByUserId(userId)
        );
    }

    // GET /api/demandes-partenariat/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
                new java.util.HashMap<String, Long>() {{
                    put("enAttente",
                            demandeService.countEnAttente());
                    put("approuvees",
                            demandeService.countApprouvees());
                    put("refusees",
                            demandeService.countRefusees());
                }}
        );
    }

    // ═══════════════════════════════════════════
    // POST / PUT / PATCH / DELETE
    // ═══════════════════════════════════════════

    // POST /api/demandes-partenariat
    @PostMapping
    public ResponseEntity<DemandePartenariat> creer(
            @Valid @RequestBody
            DemandePartenariat demande) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(demandeService.creerDemande(demande));
    }

    // PUT /api/demandes-partenariat/1
    @PutMapping("/{id}")
    public ResponseEntity<DemandePartenariat> update(
            @PathVariable Long id,
            @RequestBody DemandePartenariat details) {
        return ResponseEntity.ok(
                demandeService.updateDemande(id, details)
        );
    }

    // PATCH /api/demandes-partenariat/1/approuver
    @PatchMapping("/{id}/approuver")
    public ResponseEntity<DemandePartenariat> approuver(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                demandeService.approuverDemande(id)
        );
    }

    // PATCH /api/demandes-partenariat/1/refuser
    @PatchMapping("/{id}/refuser")
    public ResponseEntity<DemandePartenariat> refuser(
            @PathVariable Long id,
            @RequestParam String motif) {
        return ResponseEntity.ok(
                demandeService.refuserDemande(id, motif)
        );
    }

    // DELETE /api/demandes-partenariat/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        demandeService.deleteDemande(id);
        return ResponseEntity.noContent().build();
    }
}