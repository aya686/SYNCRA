package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Facture;
import com.taib.pi_ms5.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class FactureController {

    private final PaiementService paiementService;

    // GET /api/factures → toutes (admin)
    @GetMapping
    public ResponseEntity<List<Facture>> getAll() {
        return ResponseEntity.ok(
                paiementService.getAllFactures()
        );
    }

    // GET /api/factures/user/1 → mes factures
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Facture>> getMes(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                paiementService.getMesFactures(userId)
        );
    }

    // GET /api/factures/transactions → toutes les transactions
    @GetMapping("/transactions")
    public ResponseEntity<List<com.taib.pi_ms5
            .entity.Transaction>> getAllTransactions() {
        return ResponseEntity.ok(
                paiementService.getAllTransactions()
        );
    }
}