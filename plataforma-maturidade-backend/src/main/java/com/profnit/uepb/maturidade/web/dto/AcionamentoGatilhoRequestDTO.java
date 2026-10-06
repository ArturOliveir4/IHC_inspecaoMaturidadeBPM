package com.profnit.uepb.maturidade.web.dto;

import java.time.LocalDate;

public class AcionamentoGatilhoRequestDTO {
    private String gatilho;
    private String justificativa;
    private LocalDate dataAcionamento;

    public String getGatilho() { return gatilho; }
    public void setGatilho(String gatilho) { this.gatilho = gatilho; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public LocalDate getDataAcionamento() { return dataAcionamento; }
    public void setDataAcionamento(LocalDate dataAcionamento) { this.dataAcionamento = dataAcionamento; }
}