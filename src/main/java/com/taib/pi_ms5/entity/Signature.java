package com.taib.pi_ms5.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "signatures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Signature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID de l'utilisateur qui signe (MS1)
    @Column(name = "signataire_id", nullable = false)
    private Long signataireId;

    // Nom complet du signataire
    @Column(name = "nom_signataire",
            nullable = true,
            length = 200)
    private String nomSignataire;

    // Date et heure de la signature
    @Column(name = "date_signature", nullable = false)
    private LocalDateTime dateSignature
            = LocalDateTime.now();

    // Code OTP utilisé pour valider la signature
    @Column(name = "code_otp", nullable = true, length = 10)
    private String codeOtp;

    // OTP vérifié ou non
    @Column(name = "otp_verifie", nullable = false)
    private Boolean otpVerifie = false;

    // Adresse IP du signataire
    @Column(name = "adresse_ip", nullable = true, length = 50)
    private String adresseIp;

    // Rôle du signataire dans ce contrat
    @Enumerated(EnumType.STRING)
    @Column(name = "role_signataire", nullable = false)
    private RoleSignataire roleSignataire;

    // Signature valide ou non
    @Column(nullable = false)
    private Boolean valide = false;

    // Image de signature en base64
    @Lob
    @Column(name = "signature_image", nullable = true, columnDefinition = "TEXT")
    private String signatureImage;

    // Lien vers le contrat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contrat_id", nullable = false)
    @JsonIgnoreProperties({
            "clauses", "signatures", "litiges"
    })
    private Contrat contrat;

    // ═══════════════════════════════════════════
    // ENUM
    // ═══════════════════════════════════════════

    public enum RoleSignataire {
        CLIENT,       // Ahmed signe en tant que client
        PRESTATAIRE   // Sarra signe en tant que prestataire
    }
}