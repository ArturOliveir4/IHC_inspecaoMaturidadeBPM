package com.profnit.uepb.maturidade.web.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AlertaAcompanhamentoResponseDTO {

    private Long id;
    private Long processoId;
    private String processoNome;
    private String titulo;
    private String periodicidade;
    private LocalDate dataReferencia;
    private LocalDate proximaOcorrencia;
    private String gatilho;
    private Boolean ativo;
    private LocalDateTime criadoEm;
    private String criadoPor;
    private LocalDateTime atualizadoEm;
    private String atualizadoPor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProcessoId() { return processoId; }
    public void setProcessoId(Long processoId) { this.processoId = processoId; }

    public String getProcessoNome() { return processoNome; }
    public void setProcessoNome(String processoNome) { this.processoNome = processoNome; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getPeriodicidade() { return periodicidade; }
    public void setPeriodicidade(String periodicidade) { this.periodicidade = periodicidade; }

    public LocalDate getDataReferencia() { return dataReferencia; }
    public void setDataReferencia(LocalDate dataReferencia) { this.dataReferencia = dataReferencia; }

    public LocalDate getProximaOcorrencia() { return proximaOcorrencia; }
    public void setProximaOcorrencia(LocalDate proximaOcorrencia) { this.proximaOcorrencia = proximaOcorrencia; }

    public String getGatilho() { return gatilho; }
    public void setGatilho(String gatilho) { this.gatilho = gatilho; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}
