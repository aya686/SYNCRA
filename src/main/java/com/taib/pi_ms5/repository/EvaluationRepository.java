package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository
        extends JpaRepository<Evaluation, Long> {

    Optional<Evaluation> findByCandidatureId(Long candidatureId);

    List<Evaluation> findByEvaluateurId(Long evaluateurId);
}