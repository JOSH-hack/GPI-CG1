package com.golfe1.gpi.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idUtilisateur;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RoleUtilisateur role;

    @Column(nullable = false)
    private Boolean actif = true;

    @Column(nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    // Getters & Setters
    
}

public enum RoleUtilisateur {
    ADMIN_INFO,
    TECHNICIEN,
    RESPONSABLE_DSI,
    ADMIN_SYSTEME,
    AGENT
}
