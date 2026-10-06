package com.profnit.uepb.maturidade.web.dto;

import com.profnit.uepb.maturidade.domain.PeriodicidadeRevisao;
import com.profnit.uepb.maturidade.domain.PlanoGovernanca;
import java.time.LocalDateTime;

public record PlanoGovernancaResponseDTO(
    Long id,
    Long processoId,
    String processoNome,
    String donoProcesso,
    Long instrumentoMonitoramentoId,
    String instrumentoMonitoramento,
    PeriodicidadeRevisao periodicidadeRevisao,
    String gatilhosNovoCiclo,
    Integer versao,
    Boolean vigente,
    LocalDateTime criadoEm,
    String criadoPor
) {
    public static PlanoGovernancaResponseDTO from(PlanoGovernanca plano) {
        return new PlanoGovernancaResponseDTO(
            plano.getId(),
            plano.getProcesso().getId(),
            plano.getProcesso().getNome(),
            plano.getDonoProcesso(),
            plano.getInstrumentoMonitoramento() == null ? null : plano.getInstrumentoMonitoramento().getId(),
            plano.getInstrumentoMonitoramentoNome(),
            plano.getPeriodicidadeRevisao(),
            plano.getGatilhosNovoCiclo(),
            plano.getVersao(),
            plano.getVigente(),
            plano.getCriadoEm(),
            plano.getCriadoPor()
        );
    }
}
