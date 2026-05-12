package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Investisseur;
import com.taib.pi_ms5.service.InvestisseurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/investisseurs")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class InvestisseurController {

    private final InvestisseurService investisseurService;

    @GetMapping
    public ResponseEntity<List<Investisseur>> getAll() {
        return ResponseEntity.ok(
                investisseurService.getAllInvestisseurs()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investisseur> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                investisseurService.getInvestisseurById(id)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Investisseur> getByUserId(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                investisseurService.getByUserId(userId)
        );
    }

    @PostMapping
    public ResponseEntity<Investisseur> creer(
            @RequestBody Investisseur investisseur) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(investisseurService
                        .creerProfil(investisseur));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investisseur> update(
            @PathVariable Long id,
            @RequestBody Investisseur details) {
        return ResponseEntity.ok(
                investisseurService.updateProfil(id, details)
        );
    }

    @PatchMapping("/{id}/verifier")
    public ResponseEntity<Investisseur> verifier(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                investisseurService.verifierProfil(id)
        );
    }
}