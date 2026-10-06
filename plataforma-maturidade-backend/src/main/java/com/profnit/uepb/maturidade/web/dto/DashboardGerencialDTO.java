package com.profnit.uepb.maturidade.web.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Payload consolidado do Dashboard Gerencial — US19.
 *
 * CA1: percentual geral de maturidade da avaliação mais recente, gráfico radar dos
 *      dez princípios e KPIs AS-IS/TO-BE consolidados dos processos cadastrados.
 * CA2: estrutura enxuta (um único GET) para permitir renderização em até 2s.
 */
public class DashboardGerencialDTO {

    private boolean possuiAvaliacaoConcluida;
    private Long avaliacaoMaisRecenteId;
    private LocalDateTime dataAvaliacaoMaisRecente;
    private String nomeAvaliadorMaisRecente;
    private Double percentualMaturidadeGeral;
    private Map<Integer, Double> percentuaisPorPrincipio;
    private long totalAvaliacoesConcluidas;

    private KpiConsolidadoDTO kpisAsIs;
    private KpiConsolidadoDTO kpisToBe;

    private LocalDateTime geradoEm;

    public DashboardGerencialDTO() {
    }

    public boolean isPossuiAvaliacaoConcluida() { return possuiAvaliacaoConcluida; }
    public void setPossuiAvaliacaoConcluida(boolean possuiAvaliacaoConcluida) { this.possuiAvaliacaoConcluida = possuiAvaliacaoConcluida; }

    public Long getAvaliacaoMaisRecenteId() { return avaliacaoMaisRecenteId; }
    public void setAvaliacaoMaisRecenteId(Long avaliacaoMaisRecenteId) { this.avaliacaoMaisRecenteId = avaliacaoMaisRecenteId; }

    public LocalDateTime getDataAvaliacaoMaisRecente() { return dataAvaliacaoMaisRecente; }
    public void setDataAvaliacaoMaisRecente(LocalDateTime dataAvaliacaoMaisRecente) { this.dataAvaliacaoMaisRecente = dataAvaliacaoMaisRecente; }

    public String getNomeAvaliadorMaisRecente() { return nomeAvaliadorMaisRecente; }
    public void setNomeAvaliadorMaisRecente(String nomeAvaliadorMaisRecente) { this.nomeAvaliadorMaisRecente = nomeAvaliadorMaisRecente; }

    public Double getPercentualMaturidadeGeral() { return percentualMaturidadeGeral; }
    public void setPercentualMaturidadeGeral(Double percentualMaturidadeGeral) { this.percentualMaturidadeGeral = percentualMaturidadeGeral; }

    public Map<Integer, Double> getPercentuaisPorPrincipio() { return percentuaisPorPrincipio; }
    public void setPercentuaisPorPrincipio(Map<Integer, Double> percentuaisPorPrincipio) { this.percentuaisPorPrincipio = percentuaisPorPrincipio; }

    public long getTotalAvaliacoesConcluidas() { return totalAvaliacoesConcluidas; }
    public void setTotalAvaliacoesConcluidas(long totalAvaliacoesConcluidas) { this.totalAvaliacoesConcluidas = totalAvaliacoesConcluidas; }

    public KpiConsolidadoDTO getKpisAsIs() { return kpisAsIs; }
    public void setKpisAsIs(KpiConsolidadoDTO kpisAsIs) { this.kpisAsIs = kpisAsIs; }

    public KpiConsolidadoDTO getKpisToBe() { return kpisToBe; }
    public void setKpisToBe(KpiConsolidadoDTO kpisToBe) { this.kpisToBe = kpisToBe; }

    public LocalDateTime getGeradoEm() { return geradoEm; }
    public void setGeradoEm(LocalDateTime geradoEm) { this.geradoEm = geradoEm; }
}
