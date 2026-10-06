package com.profnit.uepb.maturidade.web.dto;

import java.math.BigDecimal;

public class ComparativoKpiDTO {
    private String nome;
    private BigDecimal asIs;
    private BigDecimal toBe;
    private String unidade;
    private BigDecimal delta;
    private String aviso;

    public ComparativoKpiDTO() {}

    public ComparativoKpiDTO(String nome, BigDecimal asIs, BigDecimal toBe, String unidade, BigDecimal delta, String aviso) {
        this.nome = nome;
        this.asIs = asIs;
        this.toBe = toBe;
        this.unidade = unidade;
        this.delta = delta;
        this.aviso = aviso;
    }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public BigDecimal getAsIs() { return asIs; }
    public void setAsIs(BigDecimal asIs) { this.asIs = asIs; }
    public BigDecimal getToBe() { return toBe; }
    public void setToBe(BigDecimal toBe) { this.toBe = toBe; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public BigDecimal getDelta() { return delta; }
    public void setDelta(BigDecimal delta) { this.delta = delta; }
    public String getAviso() { return aviso; }
    public void setAviso(String aviso) { this.aviso = aviso; }
}