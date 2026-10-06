package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.domain.Usuario;
import com.profnit.uepb.maturidade.repository.UsuarioRepository;
import com.profnit.uepb.maturidade.service.AuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    // Injeção do repositório e do serviço de auditoria
    public UsuarioController(UsuarioRepository usuarioRepository, AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    // Retorna a lista de usuários REAIS do banco de dados (Requer privilégios de ADMIN).
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        return ResponseEntity.ok(usuarios);
    }

    // Remove um usuário do banco de dados (Requer privilégios de ADMIN).
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}") // Atualizado para o verbo DELETE (padrão REST)
    public ResponseEntity<?> removerUsuario(@PathVariable Long id, Authentication auth) {
        
        return usuarioRepository.findById(id).map(usuario -> {
            
            // 1. Remove fisicamente o usuário do banco
            usuarioRepository.delete(usuario);
            
            // 2. Captura o usuário logado que está realizando a ação
            String usuarioLogado = (auth != null && auth.isAuthenticated()) ? auth.getName() : "ADMIN";

            // 3. Registra a ação sensível na trilha de auditoria
            auditoriaService.registrar(
                usuarioLogado,
                "USUARIO_REMOVIDO: O usuário " + usuario.getEmail() + " (ID " + id + ") foi removido do sistema."
            );

            return ResponseEntity.ok().body("Usuário removido com sucesso.");
            
        }).orElseGet(() -> ResponseEntity.notFound().build()); // Retorna 404 se o ID não existir
    }
}