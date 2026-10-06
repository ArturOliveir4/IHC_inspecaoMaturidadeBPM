package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.AuthService;
import com.profnit.uepb.maturidade.web.dto.CadastroUsuarioRequestDTO;
import com.profnit.uepb.maturidade.web.dto.LoginRequestDTO;
import com.profnit.uepb.maturidade.web.dto.LoginResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        try {
            LoginResponseDTO response = authService.autenticar(loginRequestDTO);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            // Retorna erro HTTP 401 com mensagem genérica conforme especificado
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "Erro interno ao processar a requisição."));
        }
    }

    @PostMapping("/cadastro")
    public ResponseEntity<Map<String, String>> cadastrar(@RequestBody CadastroUsuarioRequestDTO request) {
        authService.cadastrarUsuario(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Collections.singletonMap("message", "Usuário cadastrado com sucesso."));
    }
}