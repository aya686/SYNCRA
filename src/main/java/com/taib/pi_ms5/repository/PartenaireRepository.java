package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Partenaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PartenaireRepository
        extends JpaRepository<Partenaire, Long> {

    List<Partenaire> findByActif(Boolean actif);
    List<Partenaire> findByTypePartenaire(
            Partenaire.TypePartenaire type
    );
}