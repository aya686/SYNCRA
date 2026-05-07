package com.taib.pi_ms5.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class IaOffreService {

    private final RestTemplate restTemplate;

    // URL du microservice Python
    private final String IA_URL = "http://localhost:5000";

    // ═══════════════════════════════════════
    // PRÉDIRE LE BUDGET
    // ═══════════════════════════════════════

    public Map<String, Object> predireBudget(
            String categorie,
            int dureeJours,
            int nbCriteres,
            int scorePublieur,
            int nbPostes) {

        try {
            // Créer le body de la requête
            Map<String, Object> body = new HashMap<>();
            body.put("categorie",      categorie);
            body.put("dureeJours",     dureeJours);
            body.put("nbCriteres",     nbCriteres);
            body.put("scorePublieur",  scorePublieur);
            body.put("nbPostes",       nbPostes);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                MediaType.APPLICATION_JSON
            );

            HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

            // Appeler le microservice Python
            ResponseEntity<Map> response =
                restTemplate.postForEntity(
                    IA_URL + "/predict/budget",
                    request,
                    Map.class
                );

            return response.getBody();

        } catch (Exception e) {
            // Si le service IA est indisponible
            Map<String, Object> fallback =
                new HashMap<>();
            fallback.put("success", false);
            fallback.put("error",
                "Service IA indisponible: "
                + e.getMessage()
            );
            return fallback;
        }
    }

    // ═══════════════════════════════════════
    // DÉTECTER LA FRAUDE
    // ═══════════════════════════════════════

    public Map<String, Object> detecterFraude(
            String categorie,
            int dureeJours,
            int nbCriteres,
            int scorePublieur,
            int nbPostes,
            double budget) {

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("categorie",      categorie);
            body.put("dureeJours",     dureeJours);
            body.put("nbCriteres",     nbCriteres);
            body.put("scorePublieur",  scorePublieur);
            body.put("nbPostes",       nbPostes);
            body.put("budget",         budget);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                MediaType.APPLICATION_JSON
            );

            HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                restTemplate.postForEntity(
                    IA_URL + "/detect/fraud",
                    request,
                    Map.class
                );

            return response.getBody();

        } catch (Exception e) {
            Map<String, Object> fallback =
                new HashMap<>();
            fallback.put("success", false);
            fallback.put("estSuspecte", false);
            fallback.put("error",
                "Service IA indisponible"
            );
            return fallback;
        }
    }

    // ═══════════════════════════════════════
    // ANALYSE COMPLÈTE
    // ═══════════════════════════════════════

    public Map<String, Object> analyserOffre(
            String categorie,
            int dureeJours,
            int nbCriteres,
            int scorePublieur,
            int nbPostes,
            double budget) {

        try {
            Map<String, Object> body = new HashMap<>();
            body.put("categorie",      categorie);
            body.put("dureeJours",     dureeJours);
            body.put("nbCriteres",     nbCriteres);
            body.put("scorePublieur",  scorePublieur);
            body.put("nbPostes",       nbPostes);
            body.put("budget",         budget);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(
                MediaType.APPLICATION_JSON
            );

            HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                restTemplate.postForEntity(
                    IA_URL + "/analyze/offre",
                    request,
                    Map.class
                );

            return response.getBody();

        } catch (Exception e) {
            Map<String, Object> fallback =
                new HashMap<>();
            fallback.put("success", false);
            fallback.put("alerte", false);
            return fallback;
        }
    }
}
