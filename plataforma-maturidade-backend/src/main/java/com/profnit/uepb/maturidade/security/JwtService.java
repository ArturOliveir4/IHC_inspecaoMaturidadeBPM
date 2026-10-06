package com.profnit.uepb.maturidade.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final long expirationTimeMs;
    private final Key signingKey;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-ms:86400000}") long expirationTimeMs
    ) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("security.jwt.secret deve possuir ao menos 32 bytes para HS256.");
        }
        if (expirationTimeMs <= 0) {
            throw new IllegalArgumentException("security.jwt.expiration-ms deve ser maior que zero.");
        }

        this.expirationTimeMs = expirationTimeMs;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerarToken(String email, String perfil) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("perfil", perfil);

        long agora = System.currentTimeMillis();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(agora))
                .setExpiration(new Date(agora + expirationTimeMs))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValido(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration() != null && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public String extrairEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extrairPerfil(String token) {
        return parseClaims(token).get("perfil", String.class);
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
