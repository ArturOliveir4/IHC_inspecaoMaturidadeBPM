package com.profnit.uepb.maturidade.web.dto;

import java.math.BigDecimal;

/**
 * Consolidação de indicadores de KPI (Tempo Médio de Ciclo, Taxa de Retrabalho e
 * Nível de Satisfação) entre todos os processos cadastrados, usada pelo
 * Dashboard Gerencial (US19 / CA1).
 *
 * Quando "disponivel" é false (cenário atual do TO-BE, ainda sem tela de cadastro
 * própria), os campos numéricos vêm nulos e "mensagem" explica o motivo — a UI
 * exibe um estado vazio amigável em vez de quebrar ou mostrar zero enganosamente.
 */
public class KpiConsolidadoDTO {

    private boolean disponivel;
    private String mensagem;
    private BigDecimal tmcMedio;
    private String unidadeTmc;
    private BigDecimal trMedio;
    private BigDecimal nsMedio;
    private long totalProcessosComKpi;
    private long totalProcessosCadastrados;

    public static KpiConsolidadoDTO indisponivel(String mensagem, long totalProcessosCadastrados) {
        KpiConsolidadoDTO dto = new KpiConsolidadoDTO();
        dto.disponivel = false;
        dto.mensagem = mensagem;
        dto.totalProcessosComKpi = 0;
        dto.totalProcessosCadastrados = totalProcessosCadastrados;
        return dto;
    }

    public static KpiConsolidadoDTO disponivel(BigDecimal tmcMedio, String unidadeTmc, BigDecimal trMedio,
                                                BigDecimal nsMedio, long totalProcessosComKpi,
                                                long totalProcessosCadastrados) {
        KpiConsolidadoDTO dto = new KpiConsolidadoDTO();
        dto.disponivel = true;
        dto.tmcMedio = tmcMedio;
        dto.unidadeTmc = unidadeTmc;
        dto.trMedio = trMedio;
        dto.nsMedio = nsMedio;
        dto.totalProcessosComKpi = totalProcessosComKpi;
        dto.totalProcessosCadastrados = totalProcessosCadastrados;
        return dto;
    }

    public boolean isDisponivel() { return disponivel; }
    public String getMensagem() { return mensagem; }
    public BigDecimal getTmcMedio() { return tmcMedio; }
    public String getUnidadeTmc() { return unidadeTmc; }
    public BigDecimal getTrMedio() { return trMedio; }
    public BigDecimal getNsMedio() { return nsMedio; }
    public long getTotalProcessosComKpi() { return totalProcessosComKpi; }
    public long getTotalProcessosCadastrados() { return totalProcessosCadastrados; }
}
