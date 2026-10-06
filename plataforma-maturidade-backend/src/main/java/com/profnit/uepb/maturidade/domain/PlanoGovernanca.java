package com.profnit.uepb.maturidade.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "planos_governanca", uniqueConstraints = {
    @UniqueConstraint(name = "uk_plano_governanca_processo_versao", columnNames = {"processo_id", "versao"})
})
public class PlanoGovernanca {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "processo_id", nullable = false)
    private Processo processo;

    @Column(name = "dono_processo", nullable = false, length = 160)
    private String donoProcesso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrumento_monitoramento_id")
    private InstrumentoMonitoramento instrumentoMonitoramento;

    // Snapshot textual para preservar exatamente o nome exibido em cada versão histórica.
    @Column(name = "instrumento_monitoramento", nullable = false, length = 250)
    private String instrumentoMonitoramentoNome;

    @Enumerated(EnumType.STRING)
    @Column(name = "periodicidade_revisao", nullable = false, length = 20)
    private PeriodicidadeRevisao periodicidadeRevisao;

    @Column(name = "gatilhos_novo_ciclo", nullable = false, length = 1000)
    private String gatilhosNovoCiclo;

    @Column(nullable = false)
    private Integer versao;

    @Column(nullable = false)
    private Boolean vigente = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false, updatable = false, length = 160)
    private String criadoPor;

    public PlanoGovernanca() {}

    @PrePersist
    private void prePersist() {
        criadoEm = LocalDateTime.now();
        if (vigente == null) vigente = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Processo getProcesso() { return processo; }
    public void setProcesso(Processo processo) { this.processo = processo; }
    public String getDonoProcesso() { return donoProcesso; }
    public void setDonoProcesso(String donoProcesso) { this.donoProcesso = donoProcesso; }
    public InstrumentoMonitoramento getInstrumentoMonitoramento() { return instrumentoMonitoramento; }
    public void setInstrumentoMonitoramento(InstrumentoMonitoramento instrumentoMonitoramento) { this.instrumentoMonitoramento = instrumentoMonitoramento; }
    public String getInstrumentoMonitoramentoNome() { return instrumentoMonitoramentoNome; }
    public void setInstrumentoMonitoramentoNome(String instrumentoMonitoramentoNome) { this.instrumentoMonitoramentoNome = instrumentoMonitoramentoNome; }
    public PeriodicidadeRevisao getPeriodicidadeRevisao() { return periodicidadeRevisao; }
    public void setPeriodicidadeRevisao(PeriodicidadeRevisao periodicidadeRevisao) { this.periodicidadeRevisao = periodicidadeRevisao; }
    public String getGatilhosNovoCiclo() { return gatilhosNovoCiclo; }
    public void setGatilhosNovoCiclo(String gatilhosNovoCiclo) { this.gatilhosNovoCiclo = gatilhosNovoCiclo; }
    public Integer getVersao() { return versao; }
    public void setVersao(Integer versao) { this.versao = versao; }
    public Boolean getVigente() { return vigente; }
    public void setVigente(Boolean vigente) { this.vigente = vigente; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public String getCriadoPor() { return criadoPor; }
    public void setCriadoPor(String criadoPor) { this.criadoPor = criadoPor; }
}
