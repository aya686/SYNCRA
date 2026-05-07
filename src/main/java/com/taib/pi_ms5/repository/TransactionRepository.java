package com.taib.pi_ms5.repository;

import com.taib.pi_ms5.entity.Transaction;
import com.taib.pi_ms5.entity.Transaction.StatutTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    Optional<Transaction> findByReference(String reference);
    List<Transaction> findByPaiementId(Long paiementId);
    List<Transaction> findByStatut(StatutTransaction statut);
    List<Transaction> findByExpediteurId(Long expediteurId);
    List<Transaction> findByDestinataireId(Long destinataireId);
    List<Transaction> findAllByOrderByDateTransactionDesc();
    Long countByStatut(StatutTransaction statut);
}