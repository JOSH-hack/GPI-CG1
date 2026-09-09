package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.DeclencheurSauvegarde;
import com.golfe1.gpi.entities.enums.StatutSauvegarde;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sauvegarde")
public class Sauvegarde {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSauvegarde;

    @Column(name = "date_sauvegarde", nullable = false)
    private LocalDateTime dateSauvegarde = LocalDateTime.now();

    @Column(name = "chemin_fichier", nullable = false, length = 500)
    private String cheminFichier;

    @Column(name = "taille_octets")
    private Long tailleOctets;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatutSauvegarde statut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeclencheurSauvegarde declencheur;

    @ManyToOne
    @JoinColumn(name = "id_operateur")
    private Utilisateur operateur;

    @Column(name = "message_erreur", length = 1000)
    private String messageErreur;

    public Long getIdSauvegarde() {
        return idSauvegarde;
    }

    public void setIdSauvegarde(Long idSauvegarde) {
        this.idSauvegarde = idSauvegarde;
    }

    public LocalDateTime getDateSauvegarde() {
        return dateSauvegarde;
    }

    public void setDateSauvegarde(LocalDateTime dateSauvegarde) {
        this.dateSauvegarde = dateSauvegarde;
    }

    public String getCheminFichier() {
        return cheminFichier;
    }

    public void setCheminFichier(String cheminFichier) {
        this.cheminFichier = cheminFichier;
    }

    public Long getTailleOctets() {
        return tailleOctets;
    }

    public void setTailleOctets(Long tailleOctets) {
        this.tailleOctets = tailleOctets;
    }

    public StatutSauvegarde getStatut() {
        return statut;
    }

    public void setStatut(StatutSauvegarde statut) {
        this.statut = statut;
    }

    public DeclencheurSauvegarde getDeclencheur() {
        return declencheur;
    }

    public void setDeclencheur(DeclencheurSauvegarde declencheur) {
        this.declencheur = declencheur;
    }

    public Utilisateur getOperateur() {
        return operateur;
    }

    public void setOperateur(Utilisateur operateur) {
        this.operateur = operateur;
    }

    public String getMessageErreur() {
        return messageErreur;
    }

    public void setMessageErreur(String messageErreur) {
        this.messageErreur = messageErreur;
    }
}