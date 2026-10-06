package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.domain.Diagnostico;
import com.profnit.uepb.maturidade.repository.DiagnosticoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosticos")
public class DiagnosticoController {

    private final DiagnosticoRepository diagnosticoRepository;

    public DiagnosticoController(DiagnosticoRepository diagnosticoRepository) {
        this.diagnosticoRepository = diagnosticoRepository;
    }

    // Retorna os dados calculados do diagnóstico para o Gráfico Radar (US06).
    @PreAuthorize("hasAnyRole('GESTOR', 'ADMIN', 'AVALIADOR', 'MEMBER')")
    @GetMapping("/{id}")
    public ResponseEntity<Diagnostico> buscarDiagnostico(@PathVariable Long id) {
        // Agora busca pelo ID da avaliação que está salvo na coluna usuarioId
        return diagnosticoRepository.findByUsuarioId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}