package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.PartenariatEntreprise;
import com.taib.pi_ms5.entity.PartenariatEntreprise
        .StatutPartenariat;
import com.taib.pi_ms5.service.PartenariatEntrepriseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/partenariats-entreprise")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PartenariatEntrepriseController {

    private final PartenariatEntrepriseService
            partenariatService;

    // ═══════════════════════════════════════════
    // GET
    // ═══════════════════════════════════════════

    // GET /api/partenariats-entreprise
    @GetMapping
    public ResponseEntity<List<PartenariatEntreprise>>
    getAll() {
        return ResponseEntity.ok(
                partenariatService.getAllPartenariats()
        );
    }

    // GET /api/partenariats-entreprise/1
    @GetMapping("/{id}")
    public ResponseEntity<PartenariatEntreprise> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                partenariatService.getPartenariatById(id)
        );
    }

    // GET /api/partenariats-entreprise/user/1
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PartenariatEntreprise>>
    getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(
                partenariatService.getByUserId(userId)
        );
    }

    // GET /api/partenariats-entreprise/statut/ACTIF
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<PartenariatEntreprise>>
    getByStatut(
            @PathVariable StatutPartenariat statut) {
        return ResponseEntity.ok(
                partenariatService.getByStatut(statut)
        );
    }

    // GET /api/partenariats-entreprise/hors-partenariat
    // → Retourne les IDs des sociétés EN partenariat
    @GetMapping("/hors-partenariat")
    public ResponseEntity<List<Long>>
    getIdsEnPartenariat() {
        return ResponseEntity.ok(
                partenariatService.getIdsEnPartenariat()
        );
    }

    // GET /api/partenariats-entreprise/stats
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
                new java.util.HashMap<String, Long>() {{
                    put("actifs",
                            partenariatService.countActifs());
                }}
        );
    }

    // ═══════════════════════════════════════════
    // POST / PUT / PATCH / DELETE
    // ═══════════════════════════════════════════

    // POST /api/partenariats-entreprise
    @PostMapping
    public ResponseEntity<PartenariatEntreprise> creer(
            @RequestBody
            PartenariatEntreprise partenariat) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(partenariatService
                        .creerPartenariat(partenariat));
    }

    // PUT /api/partenariats-entreprise/1
    @PutMapping("/{id}")
    public ResponseEntity<PartenariatEntreprise> update(
            @PathVariable Long id,
            @RequestBody
            PartenariatEntreprise details) {
        return ResponseEntity.ok(
                partenariatService
                        .updatePartenariat(id, details)
        );
    }

    // PATCH /api/partenariats-entreprise/1/terminer
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<PartenariatEntreprise> terminer(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                partenariatService.terminerPartenariat(id)
        );
    }

    // PATCH /api/partenariats-entreprise/1/suspendre
    @PatchMapping("/{id}/suspendre")
    public ResponseEntity<PartenariatEntreprise> suspendre(
            @PathVariable Long id,
            @RequestParam String motif) {
        return ResponseEntity.ok(
                partenariatService
                        .suspendrePartenariat(id, motif)
        );
    }

    // PATCH /api/partenariats-entreprise/1/reactiver
    @PatchMapping("/{id}/reactiver")
    public ResponseEntity<PartenariatEntreprise> reactiver(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                partenariatService.reactiverPartenariat(id)
        );
    }

    // DELETE /api/partenariats-entreprise/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        partenariatService.deletePartenariat(id);
        return ResponseEntity.noContent().build();
    }
}