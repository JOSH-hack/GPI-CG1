package com.golfe1.gpi.controllers;

import com.golfe1.gpi.dto.mapper.MessageMapper;
import com.golfe1.gpi.dto.request.MessageRequest;
import com.golfe1.gpi.dto.response.MessageResponse;
import com.golfe1.gpi.entities.Message;
import com.golfe1.gpi.security.JwtUtil;
import com.golfe1.gpi.services.MessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final MessageMapper messageMapper;
    private final JwtUtil jwtUtil;

    public MessageController(MessageService messageService, MessageMapper messageMapper, JwtUtil jwtUtil) {
        this.messageService = messageService;
        this.messageMapper = messageMapper;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('AGENT')")
    public ResponseEntity<MessageResponse> envoyer(@Valid @RequestBody MessageRequest request,
            HttpServletRequest httpRequest) {
        Long idExpediteur = extraireIdUtilisateur(httpRequest);
        Message message = messageService.envoyerMessage(
                request.getIdIntervention(),
                idExpediteur,
                request.getContenu());
        return ResponseEntity.status(HttpStatus.CREATED).body(messageMapper.toResponse(message));
    }

    @GetMapping("/intervention/{idIntervention}")
    @PreAuthorize("hasRole('TECHNICIEN') or hasRole('AGENT') or hasRole('ADMIN_INFO') or hasRole('RESPONSABLE_DSI')")
    public ResponseEntity<List<MessageResponse>> listerParIntervention(@PathVariable Long idIntervention) {
        List<Message> messages = messageService.listerParIntervention(idIntervention);
        return ResponseEntity.ok(messages.stream().map(messageMapper::toResponse).toList());
    }

    private Long extraireIdUtilisateur(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        String token = authHeader.substring(7);
        return jwtUtil.extractUserId(token);
    }
}