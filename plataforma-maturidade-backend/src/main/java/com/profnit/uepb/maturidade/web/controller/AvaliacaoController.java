// src/main/java/com/profnit/uepb/maturidade/web/controller/AvaliacaoController.java
package com.profnit.uepb.maturidade.web.controller;

import com.profnit.uepb.maturidade.service.AvaliacaoService;
import com.profnit.uepb.maturidade.web.dto.AvaliacaoResponseDTO;
import com.profnit.uepb.maturidade.web.dto.AtualizarEtapaRequestDTO;
import com.profnit.uepb.maturidade.web.dto.SalvarRespostaRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para a US04 — Salvar Respostas Parciais.
 *
 * Responsabilidade exclusiva: mapear requisições HTTP → Service → ResponseEntity.
 * Zero lógica de negócio aqui.
 *
 * Autenticação:
 *  O e-mail do avaliador é extraído diretamente do token JWT via
 *  Authentication.getName(), sem parâmetros expostos na URL.
 *  Isso impede que um usuário acesse avaliações de terceiros (SEG-01).
 *
 * Perfis autorizados:
 *  AVALIADOR, GESTOR, ADMIN — conforme US02 (RBAC).
 *  O ROLE_ prefix é adicionado pelo JwtAuthenticationFilter existente.
 */
@RestController
@RequestMapping("/api/diagnostico")
public class AvaliacaoController {

    private final AvaliacaoService avaliacaoService;

    public AvaliacaoController(AvaliacaoService avaliacaoService) {
        this.avaliacaoService = avaliacaoService;
    }

    /**
     * GET /api/diagnostico/avaliacao-ativa
     *
     * Cria uma nova avaliação ou retoma a que está em andamento.
     * Idempotente: chamar N vezes retorna sempre o mesmo estado ativo (CA2, CA3).
     *
     * HTTP 200 OK — com o estado atual (novo ou retomado).
     */
    @GetMapping("/avaliacao-ativa")
    @PreAuthorize("hasAnyRole('AVALIADOR', 'GESTOR', 'ADMIN', 'MEMBER')")
    public ResponseEntity<AvaliacaoResponseDTO> iniciarOuRetomar(Authentication authentication) {
        String emailAvaliador = authentication.getName();
        AvaliacaoResponseDTO response = avaliacaoService.iniciarOuRetomar(emailAvaliador);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/diagnostico/avaliacao/{id}/resposta
     *
     * Persiste automaticamente uma resposta individual (CA1).
     * Chamado pelo frontend a cada alteração de radio button (debounced 300ms).
     * Implementa upsert: INSERT na primeira resposta, UPDATE nas seguintes.
     *
     * HTTP 200 OK — com o estado atualizado da avaliação.
     */
    @PutMapping("/avaliacao/{id}/resposta")
    @PreAuthorize("hasAnyRole('AVALIADOR', 'GESTOR', 'ADMIN', 'MEMBER')")
    public ResponseEntity<AvaliacaoResponseDTO> salvarResposta(
            @PathVariable Long id,
            @RequestBody SalvarRespostaRequestDTO request,
            Authentication authentication
    ) {
        String emailAvaliador = authentication.getName();
        AvaliacaoResponseDTO response = avaliacaoService.salvarResposta(id, request, emailAvaliador);
        return ResponseEntity.ok(response);
    }


    @PutMapping("/avaliacao/{id}/etapa")
    @PreAuthorize("hasAnyRole('AVALIADOR', 'GESTOR', 'ADMIN', 'MEMBER')")
    public ResponseEntity<AvaliacaoResponseDTO> atualizarEtapa(@PathVariable Long id, @RequestBody AtualizarEtapaRequestDTO request, Authentication authentication) {
        return ResponseEntity.ok(avaliacaoService.atualizarEtapa(id, request, authentication.getName()));
    }

    /**
     * POST /api/diagnostico/avaliacao/{id}/finalizar
     *
     * Marca a avaliação como CONCLUIDA após o avaliador submeter o formulário.
     * Pré-condição: todas as 20 questões respondidas (validada no Service).
     * SEG-03: registra o evento no log de auditoria.
     *
     * HTTP 200 OK — avaliação concluída com snapshot final.
     * HTTP 422 Unprocessable Entity — questões pendentes.
     * HTTP 409 Conflict — já estava concluída.
     */
    @PostMapping("/avaliacao/{id}/finalizar")
    @PreAuthorize("hasAnyRole('AVALIADOR', 'GESTOR', 'ADMIN', 'MEMBER')")
    public ResponseEntity<AvaliacaoResponseDTO> finalizar(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String emailAvaliador = authentication.getName();
        AvaliacaoResponseDTO response = avaliacaoService.finalizar(id, emailAvaliador);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/diagnostico/avaliacao/{id}
     *
     * Retorna o snapshot completo da avaliação para restauração do formulário (CA2).
     * Utilizado pelo frontend no onMount da página de diagnóstico.
     *
     * HTTP 200 OK — snapshot do estado atual.
     * HTTP 403 Forbidden — avaliação pertence a outro usuário.
     * HTTP 404 Not Found — ID inexistente.
     */
    @GetMapping("/avaliacao/{id}")
    @PreAuthorize("hasAnyRole('AVALIADOR', 'GESTOR', 'ADMIN', 'MEMBER')")
    public ResponseEntity<AvaliacaoResponseDTO> buscarEstado(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String emailAvaliador = authentication.getName();
        AvaliacaoResponseDTO response = avaliacaoService.buscarEstado(id, emailAvaliador);
        return ResponseEntity.ok(response);
    }
}
