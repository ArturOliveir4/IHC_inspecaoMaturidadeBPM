package com.profnit.uepb.maturidade.domain;

/**
 * Periodicidade de recorrência de um alerta de acompanhamento (US16 / CA1).
 */
public enum PeriodicidadeAlerta {
    MENSAL(1),
    TRIMESTRAL(3),
    SEMESTRAL(6),
    ANUAL(12);

    private final int intervaloMeses;

    PeriodicidadeAlerta(int intervaloMeses) {
        this.intervaloMeses = intervaloMeses;
    }

    public int getIntervaloMeses() {
        return intervaloMeses;
    }
}
