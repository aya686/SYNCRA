package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.MessageNegociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageNegociationRepository
        extends JpaRepository<MessageNegociation, Long> {

    List<MessageNegociation> findByNegociationIdOrderByDateEnvoiAsc(
            Long negociationId
    );
    Long countByNegociationIdAndLu(
            Long negociationId, Boolean lu
    );
}