package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.AppelOffre;
import com.taib.pi_ms5.entity.AppelOffre.StatutAppelOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppelOffreRepository extends JpaRepository<AppelOffre, Long> {

    Optional<AppelOffre> findByOffreId(Long offreId);

    List<AppelOffre> findByStatut(StatutAppelOffre statut);

    List<AppelOffre> findByTitreContainingIgnoreCase(String titre);
}