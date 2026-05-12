package com.taib.pi_ms5.service;

import com.taib.pi_ms5.entity.Clause;
import com.taib.pi_ms5.entity.Contrat;
import com.taib.pi_ms5.repository.ClauseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClauseService {

    private final ClauseRepository clauseRepository;
    private final ContratService contratService;

    // Clauses d'un contrat
    public List<Clause> getClausesByContrat(
            Long contratId) {
        return clauseRepository
                .findByContratIdOrderByOrdreAffichageAsc(
                        contratId
                );
    }

    // Une clause par ID
    public Clause getClauseById(Long id) {
        return clauseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(
                        "Clause non trouvée avec l'ID: " + id
                ));
    }

    // Ajouter une clause
    public Clause ajouterClause(
            Long contratId,
            Clause clause) {

        Contrat contrat =
                contratService.getContratById(contratId);
        clause.setContrat(contrat);
        return clauseRepository.save(clause);
    }

    // Modifier une clause
    public Clause updateClause(
            Long id,
            Clause details) {

        Clause clause = getClauseById(id);
        clause.setTitre(details.getTitre());
        clause.setContenu(details.getContenu());
        clause.setOrdreAffichage(
                details.getOrdreAffichage()
        );
        clause.setObligatoire(details.getObligatoire());
        clause.setTypeClause(details.getTypeClause());
        return clauseRepository.save(clause);
    }

    // Supprimer une clause
    public void deleteClause(Long id) {
        clauseRepository.delete(getClauseById(id));
    }
}