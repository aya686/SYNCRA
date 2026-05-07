package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Signature;
import com.taib.pi_ms5.entity.Signature.RoleSignataire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SignatureRepository
        extends JpaRepository<Signature, Long> {

    // Signatures d'un contrat
    List<Signature> findByContratId(Long contratId);

    // Signature d'un utilisateur pour un contrat
    Optional<Signature> findByContratIdAndSignataireId(
            Long contratId, Long signataireId
    );

    // Vérifier si un rôle a signé
    Optional<Signature> findByContratIdAndRoleSignataire(
            Long contratId, RoleSignataire role
    );

    // Compter les signatures valides d'un contrat
    Long countByContratIdAndValide(
            Long contratId, Boolean valide
    );
}