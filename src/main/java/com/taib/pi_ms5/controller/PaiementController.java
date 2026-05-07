package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.*;
import com.taib.pi_ms5.entity.Paiement.StatutPaiement;
import com.taib.pi_ms5.entity.Transaction.TypeTransaction;
import com.taib.pi_ms5.service.PaiementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PaiementController {

    private final PaiementService paiementService;

    // GET /api/paiements → tous (admin)
    @GetMapping
    public ResponseEntity<List<Paiement>> getAll() {
        return ResponseEntity.ok(
                paiementService.getAllPaiements()
        );
    }

    // GET /api/paiements/1 → un paiement
    @GetMapping("/{id}")
    public ResponseEntity<Paiement> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.getPaiementById(id)
        );
    }

    // GET /api/paiements/user/1 → mes paiements
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Paiement>> getMes(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                paiementService.getMesPaiements(userId)
        );
    }

    // GET /api/paiements/statut/PAYE
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Paiement>> getByStatut(
            @PathVariable StatutPaiement statut) {
        return ResponseEntity.ok(
                paiementService.getByStatut(statut)
        );
    }

    // GET /api/paiements/stats → statistiques admin
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPaye",
                paiementService.getTotalPaye());
        stats.put("totalCommissions",
                paiementService.getTotalCommissions());
        return ResponseEntity.ok(stats);
    }

    // POST /api/paiements → créer
    @PostMapping
    public ResponseEntity<Paiement> creer(
            @RequestBody Paiement paiement) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paiementService.creerPaiement(paiement));
    }

    // POST /api/paiements/depuis-contrat
    @PostMapping("/depuis-contrat")
    public ResponseEntity<Paiement> creerDepuisContrat(
            @RequestParam Long contratId,
            @RequestParam Long payeurId,
            @RequestParam Long beneficiaireId,
            @RequestParam Double montant) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paiementService.creerPaiementDepuisContrat(
                        contratId, payeurId,
                        beneficiaireId, montant
                ));
    }

    // POST /api/paiements/1/initier
    @PostMapping("/{id}/initier")
    public ResponseEntity<Transaction> initier(
            @PathVariable Long id,
            @RequestParam Double montant,
            @RequestParam TypeTransaction type,
            @RequestParam Long expediteurId) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(paiementService.initierPaiement(
                        id, montant, type, expediteurId
                ));
    }

    // PATCH /api/paiements/transactions/1/valider
    @PatchMapping("/transactions/{id}/valider")
    public ResponseEntity<Transaction> valider(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.validerTransaction(id)
        );
    }

    // PATCH /api/paiements/transactions/1/rembourser
    @PatchMapping("/transactions/{id}/rembourser")
    public ResponseEntity<Transaction> rembourser(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.rembourserTransaction(id)
        );
    }

    // PATCH /api/paiements/1/bloquer
    @PatchMapping("/{id}/bloquer")
    public ResponseEntity<Paiement> bloquer(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.bloquerPaiement(id)
        );
    }

    // PATCH /api/paiements/1/debloquer
    @PatchMapping("/{id}/debloquer")
    public ResponseEntity<Paiement> debloquer(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.debloquerPaiement(id)
        );
    }

    // PATCH /api/paiements/commissions/1/prelever
    @PatchMapping("/commissions/{id}/prelever")
    public ResponseEntity<Commission> prelever(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                paiementService.prelevuerCommission(id)
        );
    }
}