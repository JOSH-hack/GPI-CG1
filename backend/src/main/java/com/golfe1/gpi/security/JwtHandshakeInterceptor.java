/*

Nom du fichier   : JwtHandshakeInterceptor.java
Objectif         : Authentifie la connexion WebSocket au moment de la poignee de main
                    HTTP/SockJS (ou le cookie httpOnly est automatiquement envoye par
                    le navigateur), plutot qu'au niveau de la frame STOMP CONNECT
                    (ou le JS n'a plus acces au token pour le poser manuellement)
Propriétaire     : Josué BEDEL
Date de création : 31/08/2026

*/

package com.golfe1.gpi.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {

        if (request instanceof ServletServerHttpRequest servletRequest) {
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            Cookie[] cookies = httpRequest.getCookies();

            if (cookies != null) {
                for (Cookie cookie : cookies) {
                    if (JwtFilter.COOKIE_NAME.equals(cookie.getName())) {
                        String token = cookie.getValue();
                        String email = jwtUtil.extractEmail(token);
                        if (email != null && jwtUtil.validateToken(token, email)) {
                            attributes.put("email", email);
                            return true;
                        }
                    }
                }
            }
        }
        // Pas de cookie valide -> refuse la poignee de main
        return false;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response,
            @NonNull WebSocketHandler wsHandler, Exception exception) {
        // Rien a faire ici
    }
}