package com.golfe1.gpi.controllers;

import com.golfe1.gpi.entities.LogSysteme;
import com.golfe1.gpi.entities.enums.NiveauLog;
import com.golfe1.gpi.services.LogSystemeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/outils/logs")
@PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
public class LogSystemeController {

    private final LogSystemeService logSystemeService;

    public LogSystemeController(LogSystemeService logSystemeService) {
        this.logSystemeService = logSystemeService;
    }

    @GetMapping
    public ResponseEntity<Page<LogSysteme>> lister(
            @RequestParam(required = false) NiveauLog niveau,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int taille) {
        return ResponseEntity.ok(logSystemeService.lister(niveau, PageRequest.of(page, taille)));
    }
}