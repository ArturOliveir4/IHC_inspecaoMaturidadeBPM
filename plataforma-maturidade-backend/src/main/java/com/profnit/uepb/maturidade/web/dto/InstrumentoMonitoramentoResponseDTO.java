package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.InstrumentoMonitoramento;

public record InstrumentoMonitoramentoResponseDTO(
    Long id,
    Long processoId,
    String processoNome,
    String nome,
    String descricao,
    Boolean ativo
) {
    public static InstrumentoMonitoramentoResponseDTO from(InstrumentoMonitoramento instrumento) {
        return new InstrumentoMonitoramentoResponseDTO(
            instrumento.getId(),
            instrumento.getProcesso().getId(),
            instrumento.getProcesso().getNome(),
            instrumento.getNome(),
            instrumento.getDescricao(),
            instrumento.getAtivo()
        );
    }
}
