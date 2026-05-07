// src/main/java/com/taib/pi_ms5/controller/CategorieController.java

package com.taib.pi_ms5.controller;

import com.taib.pi_ms5.entity.Categorie;
import com.taib.pi_ms5.service.CategorieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class CategorieController {

    private final CategorieService categorieService;

    // GET /api/categories → toutes les catégories actives
    @GetMapping
    public ResponseEntity<List<Categorie>> getAllCategories() {
        return ResponseEntity.ok(categorieService.getAllCategories());
    }

    // GET /api/categories/1 → une catégorie par ID
    @GetMapping("/{id}")
    public ResponseEntity<Categorie> getCategorieById(@PathVariable Long id) {
        return ResponseEntity.ok(categorieService.getCategorieById(id));
    }

    // POST /api/categories → créer une catégorie
    @PostMapping
    public ResponseEntity<Categorie> createCategorie(
            @Valid @RequestBody Categorie categorie) {
        Categorie nouvelle = categorieService.createCategorie(categorie);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouvelle);
    }

    // PUT /api/categories/1 → modifier une catégorie
    @PutMapping("/{id}")
    public ResponseEntity<Categorie> updateCategorie(
            @PathVariable Long id,
            @Valid @RequestBody Categorie categorieDetails) {
        return ResponseEntity.ok(
                categorieService.updateCategorie(id, categorieDetails)
        );
    }

    // DELETE /api/categories/1 → désactiver une catégorie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        categorieService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }
}