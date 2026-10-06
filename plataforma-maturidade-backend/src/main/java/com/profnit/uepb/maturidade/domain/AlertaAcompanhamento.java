package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Alerta de acompanhamento periódico vinculado a um processo (US16).
 *
 * Representa um lembrete de calendário de governança (revisão programada ou
 * ação pendente), configurado manualmente pelo gestor.
 *
 * Regra CA3: mecanismo funciona exclusivamente como calendário de datas fixas
 * manuais — não há leitura automática de dados externos nem envio de e-mail.
 * A "data de referência" apenas alimenta o cálculo da próxima ocorrência
 * exibida em tela (US17); nenhum job/scheduler é disparado a partir dela.
 */
@Entity
@Table(name = "alertas_acompanhamento")
public class AlertaAcompanhamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(nullable = false, length = 160)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PeriodicidadeAlerta periodicidade;

    @Column(name = "data_referencia", nullable = false)
    private LocalDate dataReferencia;

    @Column(nullable = false, length = 500)
    private String gatilho;

    @Column(nullable = false)
    private Boolean ativo = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false, updatable = false)
    private String criadoPor;

    @Column
    private LocalDateTime atualizadoEm;

    @Column
    private String atualizadoPor;

    public AlertaAcompanhamento() {}

    @PrePersist
    private void prePersist() {
        this.criadoEm = LocalDateTime.now();
        if (this.ativo == null) {
            this.ativo = true;
        }
    }

    @PreUpdate
    private void preUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public PeriodicidadeAlerta getPeriodicidade() { return periodicidade; }
    public void setPeriodicidade(PeriodicidadeAlerta periodicidade) { this.periodicidade = periodicidade; }

    public LocalDate getDataReferencia() { return dataReferencia; }
    public void setDataReferencia(LocalDate dataReferencia) { this.dataReferencia = dataReferencia; }

    public String getGatilho() { return gatilho; }
    public void setGatilho(String gatilho) { this.gatilho = gatilho; }

    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public String getAtualizadoPor() { return atualizadoPor; }
    public void setAtualizadoPor(String atualizadoPor) { this.atualizadoPor = atualizadoPor; }
}
