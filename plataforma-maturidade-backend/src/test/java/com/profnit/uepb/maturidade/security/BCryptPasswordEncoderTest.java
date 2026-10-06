package com.profnit.uepb.maturidade.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BCryptPasswordEncoderTest {

    @Test
    void senhaPersistidaDeveSerHashBCryptENaoTextoPuro() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String senha = "SenhaForte123!";

        String hash = encoder.encode(senha);

        assertNotEquals(senha, hash);
        assertTrue(hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$"));
        assertTrue(encoder.matches(senha, hash));
        assertFalse(encoder.matches("senha-incorreta", hash));
    }
}
