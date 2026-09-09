package com.golfe1.gpi.entities;

import com.golfe1.gpi.entities.enums.NiveauLog;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "log_systeme")
public class LogSysteme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idLog;

    @Column(name = "date_log", nullable = false)
    private LocalDateTime dateLog = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private NiveauLog niveau;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length = 150)
    private String utilisateur;

    public Long getIdLog() {
        return idLog;
    }

    public void setIdLog(Long idLog) {
        this.idLog = idLog;
    }

    public LocalDateTime getDateLog() {
        return dateLog;
    }

    public void setDateLog(LocalDateTime dateLog) {
        this.dateLog = dateLog;
    }

    public NiveauLog getNiveau() {
        return niveau;
    }

    public void setNiveau(NiveauLog niveau) {
        this.niveau = niveau;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(String utilisateur) {
        this.utilisateur = utilisateur;
    }
}