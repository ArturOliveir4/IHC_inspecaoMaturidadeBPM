package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.Avaliacao;
import com.profnit.uepb.maturidade.domain.RespostaQuestao;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AvaliacaoResponseDTO {

    private Long id;
    private String emailAvaliador;
    private StatusAvaliacao status;
    private Integer etapaAtual;
    private LocalDateTime criadoEm;
    private LocalDateTime atualizadoEm;
    private Map<String, Integer> respostas;

    public AvaliacaoResponseDTO() {}

    public static AvaliacaoResponseDTO from(Avaliacao avaliacao, List<RespostaQuestao> respostasEntidade) {
        AvaliacaoResponseDTO dto = new AvaliacaoResponseDTO();
        dto.id = avaliacao.getId();
        dto.emailAvaliador = avaliacao.getEmailAvaliador();
        dto.status = avaliacao.getStatus();
        dto.etapaAtual = avaliacao.getEtapaAtual();
        dto.criadoEm = avaliacao.getCriadoEm();
        dto.atualizadoEm = avaliacao.getAtualizadoEm();

        dto.respostas = respostasEntidade.stream()
            .collect(Collectors.toMap(
                r -> String.format("P%d_Q%d", r.getNumeroPrincipio(), r.getNumeroQuestao()),
                RespostaQuestao::getNota
            ));

        return dto;
    }

    public Long getId() { return id; }
    public String getEmailAvaliador() { return emailAvaliador; }
    public StatusAvaliacao getStatus() { return status; }
    public Integer getEtapaAtual() { return etapaAtual; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public Map<String, Integer> getRespostas() { return respostas; }
}