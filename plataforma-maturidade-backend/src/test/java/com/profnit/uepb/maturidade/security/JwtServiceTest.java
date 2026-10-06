package com.profnit.uepb.maturidade.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private static final String SECRET = "ChaveDeTesteJWTComTamanhoMaiorQueTrintaEDoisBytes!";

    @Test
    void deveGerarEValidarTokenComPerfilEEmail() {
        JwtService jwtService = new JwtService(SECRET, 60_000);

        String token = jwtService.gerarToken("gestor@uepb.edu.br", "ROLE_GESTOR");

        assertTrue(jwtService.isTokenValido(token));
        assertEquals("gestor@uepb.edu.br", jwtService.extrairEmail(token));
        assertEquals("ROLE_GESTOR", jwtService.extrairPerfil(token));
    }

    @Test
    void deveRejeitarTokenExpirado() throws InterruptedException {
        JwtService jwtService = new JwtService(SECRET, 1);
        String token = jwtService.gerarToken("gestor@uepb.edu.br", "ROLE_GESTOR");

        Thread.sleep(10);

        assertFalse(jwtService.isTokenValido(token));
    }

    @Test
    void deveRejeitarTokenAdulterado() {
        JwtService jwtService = new JwtService(SECRET, 60_000);
        String token = jwtService.gerarToken("gestor@uepb.edu.br", "ROLE_GESTOR");
        String adulterado = token.substring(0, token.length() - 2) + "xx";

        assertFalse(jwtService.isTokenValido(adulterado));
    }

    @Test
    void deveRejeitarConfiguracaoInsegura() {
        assertThrows(IllegalArgumentException.class, () -> new JwtService("curta", 60_000));
        assertThrows(IllegalArgumentException.class, () -> new JwtService(SECRET, 0));
    }
}
