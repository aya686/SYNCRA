package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Convention;
import com.taib.pi_ms5.entity.Convention.StatutConvention;
import com.taib.pi_ms5.service.ConventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/conventions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ConventionController {

    private final ConventionService conventionService;

    @GetMapping
    public ResponseEntity<List<Convention>> getAll() {
        return ResponseEntity.ok(
                conventionService.getAllConventions()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Convention> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                conventionService.getConventionById(id)
        );
    }

    @GetMapping("/investisseur/{id}")
    public ResponseEntity<List<Convention>> getByInvestisseur(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                conventionService.getByInvestisseur(id)
        );
    }

    @GetMapping("/projet/{id}")
    public ResponseEntity<List<Convention>> getByProjet(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                conventionService.getByProjet(id)
        );
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Convention>> getByStatut(
            @PathVariable StatutConvention statut) {
        return ResponseEntity.ok(
                conventionService.getByStatut(statut)
        );
    }

    @PostMapping
    public ResponseEntity<Convention> creer(
            @RequestBody Convention convention) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(conventionService
                        .creerConvention(convention));
    }

    @PatchMapping("/{id}/signer")
    public ResponseEntity<Convention> signer(
            @PathVariable Long id,
            @RequestParam String role) {
        return ResponseEntity.ok(
                conventionService.signerConvention(id, role)
        );
    }

    @PatchMapping("/{id}/resilier")
    public ResponseEntity<Convention> resilier(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                conventionService.resilierConvention(id)
        );
    }
}