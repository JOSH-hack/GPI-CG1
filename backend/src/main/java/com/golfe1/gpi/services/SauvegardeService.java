package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.Sauvegarde;
import com.golfe1.gpi.entities.Utilisateur;
import com.golfe1.gpi.entities.enums.DeclencheurSauvegarde;
import com.golfe1.gpi.entities.enums.NiveauLog;
import com.golfe1.gpi.entities.enums.StatutSauvegarde;
import com.golfe1.gpi.exceptions.BusinessRuleException;
import com.golfe1.gpi.exceptions.ResourceNotFoundException;
import com.golfe1.gpi.repositories.SauvegardeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class SauvegardeService {

    private final SauvegardeRepository sauvegardeRepository;
    private final LogSystemeService logSystemeService;
    private final EntityManager entityManager;

    @Value("${app.backup.dir}")
    private String backupDir;

    @Value("${app.backup.pg-dump-path:pg_dump}")
    private String pgDumpPath;

    @Value("${app.backup.psql-path:psql}")
    private String psqlPath;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUser;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    public SauvegardeService(SauvegardeRepository sauvegardeRepository,
            LogSystemeService logSystemeService,
            EntityManager entityManager) {
        this.sauvegardeRepository = sauvegardeRepository;
        this.logSystemeService = logSystemeService;
        this.entityManager = entityManager;
    }

    // --- Connexion : parse "jdbc:postgresql://host:port/dbname" ---
    private String hote() {
        return infosConnexion()[0];
    }

    private String port() {
        return infosConnexion()[1];
    }

    private String nomBase() {
        return infosConnexion()[2];
    }

    private String[] infosConnexion() {
        URI uri = URI.create(datasourceUrl.replace("jdbc:postgresql://", "postgresql://"));
        String host = uri.getHost();
        int port = uri.getPort() == -1 ? 5432 : uri.getPort();
        String db = uri.getPath().substring(1);
        return new String[] { host, String.valueOf(port), db };
    }

    public long tailleTotaleBaseOctets() {
        Object resultat = entityManager.createNativeQuery("SELECT pg_database_size(current_database())")
                .getSingleResult();
        return ((Number) resultat).longValue();
    }

    @Transactional
    public Sauvegarde effectuerSauvegarde(DeclencheurSauvegarde declencheur, Utilisateur operateur) {
        try {
            Files.createDirectories(Paths.get(backupDir));
        } catch (IOException e) {
            throw new BusinessRuleException("Impossible de créer le dossier de sauvegarde : " + e.getMessage());
        }

        String horodatage = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String nomFichier = "gpi-backup-" + horodatage + ".sql";
        Path cheminCible = Paths.get(backupDir, nomFichier);

        Sauvegarde sauvegarde = new Sauvegarde();
        sauvegarde.setCheminFichier(cheminCible.toString());
        sauvegarde.setDeclencheur(declencheur);
        sauvegarde.setOperateur(operateur);
        sauvegarde.setStatut(StatutSauvegarde.EN_COURS);
        sauvegarde = sauvegardeRepository.save(sauvegarde);

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    pgDumpPath, "-h", hote(), "-p", port(), "-U", datasourceUser,
                    "-F", "p", "-f", cheminCible.toString(), nomBase());
            pb.environment().put("PGPASSWORD", datasourcePassword);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            boolean termine = process.waitFor(5, TimeUnit.MINUTES);

            if (!termine || process.exitValue() != 0) {
                sauvegarde.setStatut(StatutSauvegarde.ECHOUEE);
                sauvegarde.setMessageErreur("pg_dump a échoué ou a expiré");
                logSystemeService.enregistrer(NiveauLog.ERREUR, "Échec de la sauvegarde de la base",
                        operateur != null ? operateur.getEmail() : "Système");
            } else {
                sauvegarde.setTailleOctets(Files.size(cheminCible));
                sauvegarde.setStatut(StatutSauvegarde.REUSSIE);
                logSystemeService.enregistrer(NiveauLog.INFO, "Sauvegarde de la base réalisée avec succès",
                        operateur != null ? operateur.getEmail() : "Système");
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            sauvegarde.setStatut(StatutSauvegarde.ECHOUEE);
            sauvegarde.setMessageErreur(e.getMessage());
            logSystemeService.enregistrer(NiveauLog.ERREUR, "Erreur lors de la sauvegarde : " + e.getMessage(),
                    operateur != null ? operateur.getEmail() : "Système");
        }

        return sauvegardeRepository.save(sauvegarde);
    }

    // Sauvegarde automatique quotidienne (cf app.backup.cron, defaut 02:00)
    @Scheduled(cron = "${app.backup.cron:0 0 2 * * *}")
    public void sauvegardeAutomatique() {
        effectuerSauvegarde(DeclencheurSauvegarde.AUTOMATIQUE, null);
    }

    public List<Sauvegarde> listerSauvegardes() {
        return sauvegardeRepository.findAllByOrderByDateSauvegardeDesc();
    }

    public Sauvegarde derniere() {
        return sauvegardeRepository.findTopByOrderByDateSauvegardeDesc().orElse(null);
    }

    public Path cheminTelechargement(Long idSauvegarde) {
        Sauvegarde sauvegarde = sauvegardeRepository.findById(idSauvegarde)
                .orElseThrow(() -> new ResourceNotFoundException("Sauvegarde", idSauvegarde));
        return Paths.get(sauvegarde.getCheminFichier());
    }

    // ATTENTION : operation destructive et irreversible - remplace entierement
    // les donnees actuelles. Reservee a ADMIN_SYSTEME au niveau du controller.
    @Transactional
    public void restaurerSauvegarde(Long idSauvegarde, Utilisateur operateur) {
        Sauvegarde sauvegarde = sauvegardeRepository.findById(idSauvegarde)
                .orElseThrow(() -> new ResourceNotFoundException("Sauvegarde", idSauvegarde));

        if (sauvegarde.getStatut() != StatutSauvegarde.REUSSIE) {
            throw new BusinessRuleException("Seule une sauvegarde réussie peut être restaurée");
        }

        Path chemin = Paths.get(sauvegarde.getCheminFichier());
        if (!Files.exists(chemin)) {
            throw new BusinessRuleException("Le fichier de sauvegarde est introuvable sur le disque");
        }

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    psqlPath, "-h", hote(), "-p", port(), "-U", datasourceUser,
                    "-f", chemin.toString(), nomBase());
            pb.environment().put("PGPASSWORD", datasourcePassword);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            boolean termine = process.waitFor(10, TimeUnit.MINUTES);

            if (!termine || process.exitValue() != 0) {
                logSystemeService.enregistrer(NiveauLog.ERREUR,
                        "Échec de la restauration de la sauvegarde #" + idSauvegarde,
                        operateur.getEmail());
                throw new BusinessRuleException("La restauration a échoué");
            }

            logSystemeService.enregistrer(NiveauLog.AVERTISSEMENT,
                    "Base de données restaurée depuis la sauvegarde #" + idSauvegarde, operateur.getEmail());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessRuleException("Erreur lors de la restauration : " + e.getMessage());
        }
    }
}