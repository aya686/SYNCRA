package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Critere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CritereRepository extends JpaRepository<Critere, Long> {

    List<Critere> findByOffreId(Long offreId);

    List<Critere> findByObligatoire(Boolean obligatoire);

    List<Critere> findByOffreIdAndObligatoire(Long offreId, Boolean obligatoire);
}