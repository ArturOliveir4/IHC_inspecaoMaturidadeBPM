package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.Avaliacao;
import com.profnit.uepb.maturidade.domain.AuditoriaLog;
import com.profnit.uepb.maturidade.domain.RespostaQuestao;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;
import com.profnit.uepb.maturidade.repository.AuditoriaLogRepository;
import com.profnit.uepb.maturidade.repository.AvaliacaoRepository;
import com.profnit.uepb.maturidade.repository.RespostaQuestaoRepository;
import com.profnit.uepb.maturidade.web.dto.AvaliacaoResponseDTO;
import com.profnit.uepb.maturidade.web.dto.AtualizarEtapaRequestDTO;
import com.profnit.uepb.maturidade.web.dto.SalvarRespostaRequestDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Camada de serviço exclusiva para a US04 — Salvar Respostas Parciais.
 *
 * Responsabilidades:
 *  - iniciarOuRetomar: cria nova avaliação OU retoma a em andamento (CA2, CA3).
 *  - salvarResposta:   upsert atômico de uma resposta individual (CA1).
 *  - finalizar:        marca como CONCLUIDA, integra com Motor Matemático e registra auditoria SEG-03.
 *  - buscarEstado:     retorna snapshot completo do formulário para restauração (CA2).
 *
 * REGRA: nenhuma lógica de negócio é executada no Controller — apenas delegação.
 *
 * O avaliador é identificado exclusivamente pelo e-mail do JWT — sem dependência
 * de UsuarioRepository, evitando acoplamento desnecessário nesta US.
 */
@Service
public class AvaliacaoService {

    // Total de princípios BPM × questões por princípio = 20 respostas esperadas (US03)
    private static final int TOTAL_PRINCIPIOS = 10;
    private static final int QUESTOES_POR_PRINCIPIO = 2;
    private static final long TOTAL_RESPOSTAS_ESPERADAS = (long) TOTAL_PRINCIPIOS * QUESTOES_POR_PRINCIPIO;

    private final AvaliacaoRepository avaliacaoRepository;
    private final RespostaQuestaoRepository respostaRepository;
    private final AuditoriaLogRepository auditoriaLogRepository;
    private final MaturidadeService maturidadeService;

    public AvaliacaoService(
            AvaliacaoRepository avaliacaoRepository,
            RespostaQuestaoRepository respostaRepository,
            AuditoriaLogRepository auditoriaLogRepository,
            MaturidadeService maturidadeService
    ) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.respostaRepository = respostaRepository;
        this.auditoriaLogRepository = auditoriaLogRepository;
        this.maturidadeService = maturidadeService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. INICIAR OU RETOMAR AVALIAÇÃO (CA2, CA3)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Ponto de entrada da US04 para o frontend.
     *
     * Lógica de decisão (CA3 — sem duplicatas inconsistentes):
     *  a) Se existe avaliação EM_ANDAMENTO → retoma, retornando o estado salvo.
     *  b) Se não existe → cria nova avaliação com etapaAtual = 1 (1-based).
     *
     * O avaliador é identificado pelo e-mail extraído do token JWT.
     */
    @Transactional(rollbackFor = Exception.class)
    public AvaliacaoResponseDTO iniciarOuRetomar(String emailAvaliador) {
        // Busca a avaliação do usuário, não importa se está EM_ANDAMENTO ou CONCLUIDA
        Optional<Avaliacao> avaliacaoExistente = avaliacaoRepository
            .findFirstByEmailAvaliadorOrderByIdDesc(emailAvaliador);

        if (avaliacaoExistente.isPresent()) {
            // Retorna a sessão existente com todas as respostas salvas
            Avaliacao avaliacao = avaliacaoExistente.get();
            List<RespostaQuestao> respostas = respostaRepository
                .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacao.getId());
            return AvaliacaoResponseDTO.from(avaliacao, respostas);
        }

        // Se realmente não tem NENHUMA avaliação no banco, cria a primeira
        Avaliacao novaAvaliacao = new Avaliacao();
        novaAvaliacao.setEmailAvaliador(emailAvaliador);
        novaAvaliacao.setStatus(StatusAvaliacao.EM_ANDAMENTO);
        novaAvaliacao.setEtapaAtual(1);
        avaliacaoRepository.save(novaAvaliacao);

        auditoriaLogRepository.save(new AuditoriaLog(
            emailAvaliador,
            String.format("Nova avaliação iniciada. [avaliacaoId=%d]", novaAvaliacao.getId())
        ));

        return AvaliacaoResponseDTO.from(novaAvaliacao, List.of());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. SALVAR RESPOSTA INDIVIDUAL — UPSERT (CA1)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Persiste automaticamente uma resposta individual, sem ação manual do usuário.
     *
     * Estratégia de upsert:
     *  - Busca a resposta existente pela tripla (avaliacaoId, numeroPrincipio, numeroQuestao).
     *  - Se existe: atualiza a nota via query JPQL direto (sem carregar a entidade).
     *  - Se não existe: cria novo registro.
     *
     * Também atualiza a etapaAtual na Avaliacao para manter o progresso sincronizado.
     * Validações de faixa garantidas aqui (nota 1–5, principio 1–10, questao 1–2).
     *
     * @param avaliacaoId    ID da avaliação em andamento
     * @param request        DTO com numeroPrincipio, numeroQuestao, nota, etapaAtual (1-based)
     * @param emailAvaliador e-mail extraído do JWT para verificação de posse
     */
    @Transactional(rollbackFor = Exception.class)
    public AvaliacaoResponseDTO salvarResposta(
            Long avaliacaoId,
            SalvarRespostaRequestDTO request,
            String emailAvaliador
    ) {
        Avaliacao avaliacao = buscarAvaliacaoPorId(avaliacaoId, emailAvaliador);
        validarCamposResposta(request);

        Optional<RespostaQuestao> respostaExistente = respostaRepository
            .findByAvaliacaoIdAndNumeroPrincipioAndNumeroQuestao(
                avaliacaoId, request.getNumeroPrincipio(), request.getNumeroQuestao()
            );

        if (respostaExistente.isPresent()) {
            // UPDATE: atualiza apenas a nota da linha existente
            respostaRepository.atualizarNota(
                avaliacaoId, request.getNumeroPrincipio(), request.getNumeroQuestao(), request.getNota()
            );
        } else {
            // INSERT: primeira vez que esta questão é respondida
            RespostaQuestao novaResposta = new RespostaQuestao(
                avaliacao, request.getNumeroPrincipio(), request.getNumeroQuestao(), request.getNota()
            );
            respostaRepository.save(novaResposta);
        }

        // Atualiza o progresso de etapa para CA2 (restaurar passo correto).
        // etapaAtual é 1-based: só avança se o novo valor for maior que o atual.
        if (request.getEtapaAtual() != null
                && request.getEtapaAtual() >= avaliacao.getEtapaAtual()) {
            avaliacao.setEtapaAtual(request.getEtapaAtual());
            avaliacaoRepository.save(avaliacao);
        }

        List<RespostaQuestao> todasRespostas = respostaRepository
            .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacaoId);
        return AvaliacaoResponseDTO.from(avaliacao, todasRespostas);
    }


    @Transactional(rollbackFor = Exception.class)
    public AvaliacaoResponseDTO atualizarEtapa(Long avaliacaoId, AtualizarEtapaRequestDTO request, String emailAvaliador) {
        Avaliacao avaliacao = buscarAvaliacaoAtiva(avaliacaoId, emailAvaliador);
        if (request.getEtapaAtual() == null || request.getEtapaAtual() < 1 || request.getEtapaAtual() > TOTAL_PRINCIPIOS) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "etapaAtual deve estar entre 1 e " + TOTAL_PRINCIPIOS + ".");
        }
        avaliacao.setEtapaAtual(request.getEtapaAtual());
        avaliacaoRepository.save(avaliacao);
        List<RespostaQuestao> respostas = respostaRepository.findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacaoId);
        return AvaliacaoResponseDTO.from(avaliacao, respostas);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. FINALIZAR AVALIAÇÃO E GERAR DIAGNÓSTICO (CA3 — status CONCLUIDA + SEG-03)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Marca a avaliação como CONCLUIDA após o avaliador enviar o formulário.
     * Integrado ao MaturidadeService para consolidar o Diagnostico e o Gráfico Radar.
     *
     * Pré-condição: todas as 20 respostas devem estar presentes.
     * Caso contrário, lança 422 Unprocessable Entity com mensagem orientativa.
     *
     * SEG-03: registra o evento de conclusão no log de auditoria.
     */
    @Transactional(rollbackFor = Exception.class)
    public AvaliacaoResponseDTO finalizar(Long avaliacaoId, String emailAvaliador) {
        Avaliacao avaliacao = buscarAvaliacaoPorId(avaliacaoId, emailAvaliador);

        long totalRespostasRegistradas = respostaRepository.countByAvaliacaoId(avaliacaoId);
        if (totalRespostasRegistradas < TOTAL_RESPOSTAS_ESPERADAS) {
            throw new ResponseStatusException(
                HttpStatus.UNPROCESSABLE_ENTITY,
                String.format(
                    "A avaliação não pode ser concluída. %d de %d questões respondidas.",
                    totalRespostasRegistradas,
                    TOTAL_RESPOSTAS_ESPERADAS
                )
            );
        }

        // Trava a avaliação no banco
        avaliacao.setStatus(StatusAvaliacao.CONCLUIDA);
        avaliacao.setEtapaAtual(TOTAL_PRINCIPIOS); // 1-based: último princípio = 10
        avaliacaoRepository.save(avaliacao);

        // Busca todas as respostas persistidas para repassar ao motor matemático
        List<RespostaQuestao> todasRespostas = respostaRepository
            .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacaoId);

        // Mapeia de (Princípio, Questão) para ID sequencial (1 a 20) esperado pelo MaturidadeService
        Map<Integer, Integer> mapaRespostas = new HashMap<>();
        for (RespostaQuestao rq : todasRespostas) {
            int questaoSequencial = (rq.getNumeroPrincipio() * 2) - 2 + rq.getNumeroQuestao();
            mapaRespostas.put(questaoSequencial, rq.getNota());
        }

        // Calcula os percentuais e salva a entidade Diagnostico atrelada ao avaliacaoId
        maturidadeService.processarESalvarDiagnostico(avaliacaoId, mapaRespostas);

        // SEG-03: Log de auditoria para conclusão de avaliação
        auditoriaLogRepository.save(new AuditoriaLog(
            emailAvaliador,
            String.format(
                "Avaliação de maturidade BPM concluída e diagnóstico gerado com sucesso. [avaliacaoId=%d]",
                avaliacaoId
            )
        ));

        return AvaliacaoResponseDTO.from(avaliacao, todasRespostas);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. BUSCAR ESTADO COMPLETO (CA2 — restauração do formulário)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Retorna o snapshot completo da avaliação para restauração do formulário.
     * Utilizado pelo frontend ao montar a página (onMount) após recarga de página.
     */
    @Transactional(readOnly = true)
    public AvaliacaoResponseDTO buscarEstado(Long avaliacaoId, String emailAvaliador) {
        Avaliacao avaliacao = buscarAvaliacaoPorId(avaliacaoId, emailAvaliador);
        List<RespostaQuestao> respostas = respostaRepository
            .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacaoId);
        return AvaliacaoResponseDTO.from(avaliacao, respostas);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MÉTODOS AUXILIARES PRIVADOS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Busca avaliação por ID e valida que pertence ao avaliador logado.
     * Só retorna avaliações EM_ANDAMENTO (operações de escrita).
     */
    private Avaliacao buscarAvaliacaoAtiva(Long avaliacaoId, String emailAvaliador) {
        Avaliacao avaliacao = buscarAvaliacaoPorId(avaliacaoId, emailAvaliador);
        if (avaliacao.getStatus() != StatusAvaliacao.EM_ANDAMENTO) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Esta avaliação já foi concluída e não pode ser modificada."
            );
        }
        return avaliacao;
    }

    /**
     * Busca avaliação por ID e valida que pertence ao avaliador logado.
     * Sem restrição de status (leitura e finalização).
     */
    private Avaliacao buscarAvaliacaoPorId(Long avaliacaoId, String emailAvaliador) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Avaliação não encontrada: id=" + avaliacaoId
            ));

        // Garante que o avaliador logado só acessa suas próprias avaliações (SEG-01)
        if (!avaliacao.getEmailAvaliador().equals(emailAvaliador)) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "Você não tem permissão para acessar esta avaliação."
            );
        }

        return avaliacao;
    }

    /**
     * Validação de faixa de valores dos campos de resposta.
     * Centralizada no Service conforme arquitetura N-Tier.
     */
    private void validarCamposResposta(SalvarRespostaRequestDTO request) {
        if (request.getNumeroPrincipio() == null
                || request.getNumeroPrincipio() < 1
                || request.getNumeroPrincipio() > TOTAL_PRINCIPIOS) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "numeroPrincipio deve estar entre 1 e " + TOTAL_PRINCIPIOS + "."
            );
        }
        if (request.getNumeroQuestao() == null
                || request.getNumeroQuestao() < 1
                || request.getNumeroQuestao() > QUESTOES_POR_PRINCIPIO) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "numeroQuestao deve ser 1 ou 2."
            );
        }
        if (request.getNota() == null || request.getNota() < 1 || request.getNota() > 5) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A nota deve ser um inteiro entre 1 e 5 (escala Likert)."
            );
        }
    }
}