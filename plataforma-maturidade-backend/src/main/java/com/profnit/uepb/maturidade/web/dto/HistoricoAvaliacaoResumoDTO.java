package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.StatusAvaliacao;

import java.time.LocalDateTime;

public class HistoricoAvaliacaoResumoDTO {

    private Long id;
    private LocalDateTime data;
    private String nomeAvaliador;
    private String emailAvaliador;
    private StatusAvaliacao status;
    private Double percentualGeral;

    public HistoricoAvaliacaoResumoDTO() {
    }

    public HistoricoAvaliacaoResumoDTO(Long id, LocalDateTime data, String nomeAvaliador,
                                       String emailAvaliador, StatusAvaliacao status,
                                       Double percentualGeral) {
        this.id = id;
        this.data = data;
        this.nomeAvaliador = nomeAvaliador;
        this.emailAvaliador = emailAvaliador;
        this.status = status;
        this.percentualGeral = percentualGeral;
    }

    public Long getId() { return id; }
    public LocalDateTime getData() { return data; }
    public String getNomeAvaliador() { return nomeAvaliador; }
    public String getEmailAvaliador() { return emailAvaliador; }
    public StatusAvaliacao getStatus() { return status; }
    public Double getPercentualGeral() { return percentualGeral; }
}
