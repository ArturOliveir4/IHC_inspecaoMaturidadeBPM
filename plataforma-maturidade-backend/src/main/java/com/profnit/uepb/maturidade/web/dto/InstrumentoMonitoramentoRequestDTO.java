package com.profnit.uepb.maturidade.web.dto;

public record InstrumentoMonitoramentoRequestDTO(
    Long processoId,
    String nome,
    String descricao
) {}
