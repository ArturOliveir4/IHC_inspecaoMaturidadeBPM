package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.InstrumentoMonitoramento;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstrumentoMonitoramentoRepository extends JpaRepository<InstrumentoMonitoramento, Long> {
    void deleteByProcessoId(Long processoId);
    List<InstrumentoMonitoramento> findByProcessoIdAndAtivoTrueOrderByNomeAsc(Long processoId);
}
