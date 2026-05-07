package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Investisseur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvestisseurRepository
        extends JpaRepository<Investisseur, Long> {

    Optional<Investisseur> findByUserId(Long userId);
    Optional<Investisseur> findByEmail(String email);
    List<Investisseur> findByProfilVerifie(
            Boolean profilVerifie
    );
    List<Investisseur> findByTypeInvestisseur(
            Investisseur.TypeInvestisseur type
    );
}