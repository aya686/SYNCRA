package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Clause;
import com.taib.pi_ms5.service.ClauseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clauses")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ClauseController {

    private final ClauseService clauseService;

    // GET /api/clauses/contrat/1 → clauses d'un contrat
    @GetMapping("/contrat/{contratId}")
    public ResponseEntity<List<Clause>> getByContrat(
            @PathVariable Long contratId) {
        return ResponseEntity.ok(
                clauseService.getClausesByContrat(contratId)
        );
    }

    // GET /api/clauses/1 → une clause
    @GetMapping("/{id}")
    public ResponseEntity<Clause> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                clauseService.getClauseById(id)
        );
    }

    // POST /api/clauses/contrat/1 → ajouter
    @PostMapping("/contrat/{contratId}")
    public ResponseEntity<Clause> ajouter(
            @PathVariable Long contratId,
            @RequestBody Clause clause) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(clauseService.ajouterClause(
                        contratId, clause
                ));
    }

    // PUT /api/clauses/1 → modifier
    @PutMapping("/{id}")
    public ResponseEntity<Clause> update(
            @PathVariable Long id,
            @RequestBody Clause details) {
        return ResponseEntity.ok(
                clauseService.updateClause(id, details)
        );
    }

    // DELETE /api/clauses/1 → supprimer
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id) {
        clauseService.deleteClause(id);
        return ResponseEntity.noContent().build();
    }
}