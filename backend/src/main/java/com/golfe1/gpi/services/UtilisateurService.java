/*

Nom du fichier   : UtilisateurService.java
Objectif         : Logique métier des utilisateurs - création, modification,
                    activation/désactivation, changement de mot de passe (hashé),
                    gestion des rôles
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.RoleUtilisateur;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public Utilisateur changerRole(Long idUtilisateur, RoleUtilisateur nouveauRole) {
        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);
        utilisateur.setRole(nouveauRole);
        return utilisateurRepository.save(utilisateur);
    }
    
    @Transactional
    public Utilisateur creerUtilisateur(String nom, String prenom, String email,
            String motDePasse, RoleUtilisateur role) {
        if (utilisateurRepository.existsByEmail(email)) {
            throw new BusinessRuleException("Un utilisateur avec cet email existe déjà : " + email);
        }
        if (motDePasse == null || motDePasse.length() < 6) {
            throw new BusinessRuleException("Le mot de passe doit contenir au moins 6 caractères");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setEmail(email);
        utilisateur.setMotDePasse(passwordEncoder.encode(motDePasse));
        utilisateur.setRole(role);
        utilisateur.setActif(true);
        utilisateur.setDateCreation(LocalDateTime.now());

        String code = genererCode();
        utilisateur.setEmailVerifie(false);
        utilisateur.setCodeVerification(code);
        utilisateur.setDateExpirationCode(LocalDateTime.now().plusMinutes(15));

        Utilisateur utilisateurCree = utilisateurRepository.save(utilisateur);
        emailService.envoyerCodeVerification(utilisateurCree.getEmail(), code);

        return utilisateurCree;
    }

    @Transactional
    public Utilisateur modifierUtilisateur(Long idUtilisateur, String nom, String prenom, String email) {
        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);

        if (!utilisateur.getEmail().equals(email) && utilisateurRepository.existsByEmail(email)) {
            throw new BusinessRuleException("Un utilisateur avec cet email existe déjà : " + email);
        }

        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setEmail(email);

        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public Utilisateur changerMotDePasse(Long idUtilisateur, String ancienMotDePasse, String nouveauMotDePasse) {
        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new BusinessRuleException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }

        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);

        if (!passwordEncoder.matches(ancienMotDePasse, utilisateur.getMotDePasse())) {
            throw new BusinessRuleException("L'ancien mot de passe est incorrect");
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public Utilisateur reinitialiserMotDePasse(Long idUtilisateur, String nouveauMotDePasse) {
        if (nouveauMotDePasse == null || nouveauMotDePasse.length() < 6) {
            throw new BusinessRuleException("Le nouveau mot de passe doit contenir au moins 6 caractères");
        }

        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public Utilisateur activer(Long idUtilisateur) {
        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);
        utilisateur.setActif(true);
        return utilisateurRepository.save(utilisateur);
    }

    @Transactional
    public Utilisateur desactiver(Long idUtilisateur) {
        Utilisateur utilisateur = getUtilisateurOuException(idUtilisateur);
        utilisateur.setActif(false);
        return utilisateurRepository.save(utilisateur);
    }

    public List<Utilisateur> listerTous() {
        return utilisateurRepository.findAll();
    }

    public List<Utilisateur> listerActifs() {
        return utilisateurRepository.findByActifTrue();
    }

    public List<Utilisateur> listerParRole(RoleUtilisateur role) {
        return utilisateurRepository.findByRole(role);
    }

    public Utilisateur getParId(Long idUtilisateur) {
        return getUtilisateurOuException(idUtilisateur);
    }

    public Utilisateur getParEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", "email", email));
    }

    @Transactional
public Utilisateur verifierEmail(String email, String code) {
    Utilisateur utilisateur = getParEmail(email);

    if (Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
        throw new BusinessRuleException("Cet email est déjà vérifié");
    }
    if (utilisateur.getCodeVerification() == null || !utilisateur.getCodeVerification().equals(code)) {
        throw new BusinessRuleException("Code de vérification incorrect");
    }
    if (LocalDateTime.now().isAfter(utilisateur.getDateExpirationCode())) {
        throw new BusinessRuleException("Ce code a expiré, demandez-en un nouveau");
    }

    utilisateur.setEmailVerifie(true);
    utilisateur.setCodeVerification(null);
    utilisateur.setDateExpirationCode(null);

    return utilisateurRepository.save(utilisateur);
}

@Transactional
public void renvoyerCodeVerification(String email) {
    Utilisateur utilisateur = getParEmail(email);

    if (Boolean.TRUE.equals(utilisateur.getEmailVerifie())) {
        throw new BusinessRuleException("Cet email est déjà vérifié");
    }

    String code = genererCode();
    utilisateur.setCodeVerification(code);
    utilisateur.setDateExpirationCode(LocalDateTime.now().plusMinutes(15));
    utilisateurRepository.save(utilisateur);

    emailService.envoyerCodeVerification(email, code);
}

private String genererCode() {
    SecureRandom random = new SecureRandom();
    int code = 100000 + random.nextInt(900000);
    return String.valueOf(code);
}

    private Utilisateur getUtilisateurOuException(Long idUtilisateur) {
        return utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", idUtilisateur));
    }
}