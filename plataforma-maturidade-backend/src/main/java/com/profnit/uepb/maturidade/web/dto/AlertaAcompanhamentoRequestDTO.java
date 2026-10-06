package com.profnit.uepb.maturidade.web.dto;

import java.time.LocalDate;

public class AlertaAcompanhamentoRequestDTO {

    private String titulo;
    private String periodicidade; // MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL
    private LocalDate dataReferencia;
    private String gatilho;
    private Boolean ativo;

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getPeriodicidade() { return periodicidade; }
    public void setPeriodicidade(String periodicidade) { this.periodicidade = periodicidade; }

    public LocalDate getDataReferencia() { return dataReferencia; }
    public void setDataReferencia(LocalDate dataReferencia) { this.dataReferencia = dataReferencia; }

    public String getGatilho() { return gatilho; }
    public void setGatilho(String gatilho) { this.gatilho = gatilho; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
}
