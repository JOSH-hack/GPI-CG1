package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.AgentMapper;
import com.golfe1.gpi.dto.request.AgentRequest;
import com.golfe1.gpi.dto.response.AgentResponse;
import com.golfe1.gpi.entities.Agent;
import com.golfe1.gpi.services.AgentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentService agentService;
    private final AgentMapper agentMapper;

    public AgentController(AgentService agentService, AgentMapper agentMapper) {
        this.agentService = agentService;
        this.agentMapper = agentMapper;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<AgentResponse> creer(@Valid @RequestBody AgentRequest request) {
        Agent agent = agentService.creerAgent(
                request.getNom(),
                request.getPrenom(),
                request.getFonction(),
                request.getTelephone(),
                request.getEmail(),
                request.getIdUtilisateur());
        return ResponseEntity.status(HttpStatus.CREATED).body(agentMapper.toResponse(agent));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<AgentResponse> modifier(@PathVariable Long id, @Valid @RequestBody AgentRequest request) {
        Agent agent = agentService.modifierAgent(
                id,
                request.getNom(),
                request.getPrenom(),
                request.getFonction(),
                request.getTelephone());
        return ResponseEntity.ok(agentMapper.toResponse(agent));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<AgentResponse>> listerTous() {
        List<Agent> agents = agentService.listerTous();
        return ResponseEntity.ok(agents.stream().map(agentMapper::toResponse).toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<AgentResponse> getParId(@PathVariable Long id) {
        Agent agent = agentService.getParId(id);
        return ResponseEntity.ok(agentMapper.toResponse(agent));
    }

    @GetMapping("/utilisateur/{idUtilisateur}")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME')")
    public ResponseEntity<AgentResponse> getParUtilisateur(@PathVariable Long idUtilisateur) {
        Agent agent = agentService.getParUtilisateur(idUtilisateur);
        return ResponseEntity.ok(agentMapper.toResponse(agent));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasRole('ADMIN_INFO') or hasRole('ADMIN_SYSTEME') or hasRole('TECHNICIEN')")
    public ResponseEntity<List<AgentResponse>> rechercherParNom(@RequestParam String nom) {
        List<Agent> agents = agentService.rechercherParNom(nom);
        return ResponseEntity.ok(agents.stream().map(agentMapper::toResponse).toList());
    }
}