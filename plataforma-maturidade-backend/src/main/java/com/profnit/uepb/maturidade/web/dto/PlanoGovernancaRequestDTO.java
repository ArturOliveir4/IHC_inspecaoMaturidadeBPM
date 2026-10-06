package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.PeriodicidadeRevisao;

public record PlanoGovernancaRequestDTO(
    Long processoId,
    String donoProcesso,
    Long instrumentoMonitoramentoId,
    PeriodicidadeRevisao periodicidadeRevisao,
    String gatilhosNovoCiclo
) {}
