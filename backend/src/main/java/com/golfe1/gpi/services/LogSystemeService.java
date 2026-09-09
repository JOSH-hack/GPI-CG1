package com.golfe1.gpi.services;

import com.golfe1.gpi.entities.LogSysteme;
import com.golfe1.gpi.entities.enums.NiveauLog;
import com.golfe1.gpi.repositories.LogSystemeRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class LogSystemeService {

    private final LogSystemeRepository logSystemeRepository;

    public LogSystemeService(LogSystemeRepository logSystemeRepository) {
        this.logSystemeRepository = logSystemeRepository;
    }

    public void enregistrer(NiveauLog niveau, String message, String utilisateur) {
        LogSysteme log = new LogSysteme();
        log.setNiveau(niveau);
        log.setMessage(message);
        log.setUtilisateur(utilisateur);
        logSystemeRepository.save(log);
    }

    public Page<LogSysteme> lister(NiveauLog niveau, Pageable pageable) {
        if (niveau == null) {
            return logSystemeRepository.findAllByOrderByDateLogDesc(pageable);
        }
        return logSystemeRepository.findByNiveauOrderByDateLogDesc(niveau, pageable);
    }
}