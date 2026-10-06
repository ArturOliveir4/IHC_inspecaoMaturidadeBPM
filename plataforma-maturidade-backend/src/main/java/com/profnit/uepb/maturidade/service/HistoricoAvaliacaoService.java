package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.Avaliacao;
import com.profnit.uepb.maturidade.domain.RespostaQuestao;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;
import com.profnit.uepb.maturidade.repository.AvaliacaoRepository;
import com.profnit.uepb.maturidade.repository.RespostaQuestaoRepository;
import com.profnit.uepb.maturidade.web.dto.HistoricoAvaliacaoDetalheDTO;
import com.profnit.uepb.maturidade.web.dto.HistoricoAvaliacaoResumoDTO;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HistoricoAvaliacaoService {

    private static final int TOTAL_PRINCIPIOS = 10;

    private final AvaliacaoRepository avaliacaoRepository;
    private final RespostaQuestaoRepository respostaQuestaoRepository;

    public HistoricoAvaliacaoService(AvaliacaoRepository avaliacaoRepository,
                                     RespostaQuestaoRepository respostaQuestaoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.respostaQuestaoRepository = respostaQuestaoRepository;
    }

    @Transactional(readOnly = true)
    public List<HistoricoAvaliacaoResumoDTO> listarConcluidas() {
        return avaliacaoRepository.findByStatusOrderByAtualizadoEmDesc(StatusAvaliacao.CONCLUIDA)
            .stream()
            .map(this::toResumo)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<HistoricoAvaliacaoResumoDTO> listarTodasParaGestor() {
        return avaliacaoRepository.findAllByOrderByAtualizadoEmDesc()
            .stream()
            .map(this::toResumo)
            .toList();
    }

    /**
     * Retorna o detalhe da avaliação CONCLUIDA mais recente (maior atualizadoEm),
     * usado pelo Dashboard Gerencial (US19 / CA1) para exibir o percentual geral
     * e o radar dos dez princípios sempre atualizados.
     *
     * Optional.empty() quando ainda não existe nenhuma avaliação concluída.
     */
    @Transactional(readOnly = true)
    public Optional<HistoricoAvaliacaoDetalheDTO> obterMaisRecenteConcluida() {
        return avaliacaoRepository.findByStatusOrderByAtualizadoEmDesc(StatusAvaliacao.CONCLUIDA)
            .stream()
            .findFirst()
            .map(avaliacao -> detalhar(avaliacao.getId()));
    }

    @Transactional(readOnly = true)
    public HistoricoAvaliacaoDetalheDTO detalhar(Long avaliacaoId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Avaliação não encontrada."));

        List<RespostaQuestao> respostas = respostaQuestaoRepository
            .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacao.getId());

        Map<Integer, Double> percentuaisPorPrincipio = calcularPercentuaisPorPrincipio(respostas);
        Map<String, Integer> respostasMap = respostas.stream()
            .collect(Collectors.toMap(
                r -> String.format("P%d_Q%d", r.getNumeroPrincipio(), r.getNumeroQuestao()),
                RespostaQuestao::getNota,
                (valorAtual, valorNovo) -> valorNovo,
                LinkedHashMap::new
            ));

        return new HistoricoAvaliacaoDetalheDTO(
            avaliacao.getId(),
            avaliacao.getAtualizadoEm(),
            nomeExibicao(avaliacao.getEmailAvaliador()),
            avaliacao.getEmailAvaliador(),
            avaliacao.getStatus(),
            calcularPercentualGeral(respostas),
            percentuaisPorPrincipio,
            respostasMap
        );
    }

    private HistoricoAvaliacaoResumoDTO toResumo(Avaliacao avaliacao) {
        List<RespostaQuestao> respostas = respostaQuestaoRepository
            .findByAvaliacaoIdOrderByNumeroPrincipioAscNumeroQuestaoAsc(avaliacao.getId());

        return new HistoricoAvaliacaoResumoDTO(
            avaliacao.getId(),
            avaliacao.getAtualizadoEm(),
            nomeExibicao(avaliacao.getEmailAvaliador()),
            avaliacao.getEmailAvaliador(),
            avaliacao.getStatus(),
            calcularPercentualGeral(respostas)
        );
    }

    private Map<Integer, Double> calcularPercentuaisPorPrincipio(List<RespostaQuestao> respostas) {
        Map<Integer, Double> resultado = new LinkedHashMap<>();
        for (int principio = 1; principio <= TOTAL_PRINCIPIOS; principio++) {
            final int principioAtual = principio;
            List<Integer> notas = respostas.stream()
                .filter(r -> r.getNumeroPrincipio() == principioAtual)
                .map(RespostaQuestao::getNota)
                .toList();
            resultado.put(principioAtual, calcularPercentual(notas));
        }
        return resultado;
    }

    private Double calcularPercentualGeral(List<RespostaQuestao> respostas) {
        List<Integer> notas = respostas.stream().map(RespostaQuestao::getNota).toList();
        return calcularPercentual(notas);
    }

    private Double calcularPercentual(List<Integer> notas) {
        if (notas == null || notas.isEmpty()) {
            return 0.0;
        }

        double media = notas.stream().mapToInt(Integer::intValue).average().orElse(1.0);
        double percentual = ((media - 1.0) / 4.0) * 100.0;
        return BigDecimal.valueOf(percentual)
            .setScale(2, RoundingMode.HALF_UP)
            .doubleValue();
    }

    private String nomeExibicao(String email) {
        if (email == null || email.isBlank()) {
            return "Avaliador não identificado";
        }
        return email.contains("@") ? email.substring(0, email.indexOf('@')) : email;
    }
}
