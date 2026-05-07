package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Contrat;
import com.taib.pi_ms5.entity.Contrat.StatutContrat;
import com.taib.pi_ms5.entity.Signature;
import com.taib.pi_ms5.entity.Signature.RoleSignataire;
import com.taib.pi_ms5.service.ContratService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/contrats")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ContratController {

    private final ContratService contratService;

    // GET /api/contrats → tous (admin)
    @GetMapping
    public ResponseEntity<List<Contrat>> getAll() {
        return ResponseEntity.ok(
                contratService.getAllContrats()
        );
    }

    // GET /api/contrats/1 → un contrat
    @GetMapping("/{id}")
    public ResponseEntity<Contrat> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                contratService.getContratById(id)
        );
    }

    // GET /api/contrats/user/1 → mes contrats
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Contrat>> getMesContrats(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
                contratService.getMesContrats(userId)
        );
    }

    // GET /api/contrats/statut/ACTIF
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Contrat>> getByStatut(
            @PathVariable StatutContrat statut) {
        return ResponseEntity.ok(
                contratService.getContratsByStatut(statut)
        );
    }

    // POST /api/contrats → créer manuellement
    @PostMapping
    public ResponseEntity<Contrat> creer(
            @Valid @RequestBody Contrat contrat) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contratService.creerContrat(contrat));
    }

    // POST /api/contrats/generer → générer auto
    @PostMapping("/generer")
    public ResponseEntity<Contrat> genererAuto(
            @RequestParam Long candidatureId,
            @RequestParam Long offreId,
            @RequestParam Long clientId,
            @RequestParam Long prestataireId,
            @RequestParam Double montant,
            @RequestParam String titreOffre) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contratService.genererContratAutomatique(
                        candidatureId, offreId,
                        clientId, prestataireId,
                        montant, titreOffre
                ));
    }

    // PUT /api/contrats/1 → modifier
    @PutMapping("/{id}")
    public ResponseEntity<Contrat> update(
            @PathVariable Long id,
            @RequestBody Contrat details) {
        return ResponseEntity.ok(
                contratService.updateContrat(id, details)
        );
    }

    // PATCH /api/contrats/1/signer → signer
    @PatchMapping("/{id}/signer")
    public ResponseEntity<Signature> signer(
            @PathVariable Long id,
            @RequestParam Long signataireId,
            @RequestParam RoleSignataire role,
            @RequestParam String codeOtp) {
        return ResponseEntity.ok(
                contratService.signerContrat(
                        id, signataireId, role, codeOtp
                )
        );
    }

    // PATCH /api/contrats/1/terminer → terminer
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<Contrat> terminer(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                contratService.terminerContrat(id)
        );
    }

    // PATCH /api/contrats/1/resilier → résilier
    @PatchMapping("/{id}/resilier")
    public ResponseEntity<Contrat> resilier(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                contratService.resilierContrat(id)
        );
    }
}