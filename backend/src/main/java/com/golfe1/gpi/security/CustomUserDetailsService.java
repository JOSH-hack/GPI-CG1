/*

Nom du fichier   : CustomUserDetailsService.java
Objectif         : Charger l'utilisateur par email pour Spring Security
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.security;

import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.repositories.UtilisateurRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    public CustomUserDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé : " + email));

        return new User(
                utilisateur.getEmail(),
                utilisateur.getMotDePasse(),
                utilisateur.getActif(),
                true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + utilisateur.getRole().name())));
    }
}