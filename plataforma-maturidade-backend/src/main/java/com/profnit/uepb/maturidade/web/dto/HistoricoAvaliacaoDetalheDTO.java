package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.StatusAvaliacao;

import java.time.LocalDateTime;
import java.util.Map;

public class HistoricoAvaliacaoDetalheDTO {

    private Long id;
    private LocalDateTime data;
    private String nomeAvaliador;
    private String emailAvaliador;
    private StatusAvaliacao status;
    private Double percentualGeral;
    private Map<Integer, Double> percentuaisPorPrincipio;
    private Map<String, Integer> respostas;

    public HistoricoAvaliacaoDetalheDTO() {
    }

    public HistoricoAvaliacaoDetalheDTO(Long id,
                                        LocalDateTime data,
                                        String nomeAvaliador,
                                        String emailAvaliador,
                                        StatusAvaliacao status,
                                        Double percentualGeral,
                                        Map<Integer, Double> percentuaisPorPrincipio,
                                        Map<String, Integer> respostas) {
        this.id = id;
        this.data = data;
        this.nomeAvaliador = nomeAvaliador;
        this.emailAvaliador = emailAvaliador;
        this.status = status;
        this.percentualGeral = percentualGeral;
        this.percentuaisPorPrincipio = percentuaisPorPrincipio;
        this.respostas = respostas;
    }

    public Long getId() { return id; }
    public LocalDateTime getData() { return data; }
    public String getNomeAvaliador() { return nomeAvaliador; }
    public String getEmailAvaliador() { return emailAvaliador; }
    public StatusAvaliacao getStatus() { return status; }
    public Double getPercentualGeral() { return percentualGeral; }
    public Map<Integer, Double> getPercentuaisPorPrincipio() { return percentuaisPorPrincipio; }
    public Map<String, Integer> getRespostas() { return respostas; }
}
