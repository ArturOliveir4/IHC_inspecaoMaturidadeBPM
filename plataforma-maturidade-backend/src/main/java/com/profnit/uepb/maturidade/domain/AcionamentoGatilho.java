package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "acionamentos_gatilhos")
public class AcionamentoGatilho {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(nullable = false)
    private String gatilho;

    @Column(nullable = false, length = 1000)
    private String justificativa;

    @Column(nullable = false)
    private LocalDate dataAcionamento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false, updatable = false)
    private String criadoPor;

    @PrePersist
    private void prePersist() { this.criadoEm = LocalDateTime.now(); }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }
    public String getGatilho() { return gatilho; }
    public void setGatilho(String gatilho) { this.gatilho = gatilho; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public LocalDate getDataAcionamento() { return dataAcionamento; }
    public void setDataAcionamento(LocalDate dataAcionamento) { this.dataAcionamento = dataAcionamento; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
}