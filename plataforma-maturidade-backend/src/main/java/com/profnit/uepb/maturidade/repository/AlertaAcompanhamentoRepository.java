package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.AlertaAcompanhamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertaAcompanhamentoRepository extends JpaRepository<AlertaAcompanhamento, Long> {
    void deleteByProcessoId(Long processoId);

    List<AlertaAcompanhamento> findByProcessoIdOrderByDataReferenciaAsc(Long processoId);

    Optional<AlertaAcompanhamento> findByIdAndProcessoId(Long id, Long processoId);

    // Usado pela futura tela de calendário (US17) para listar todos os alertas ativos.
    List<AlertaAcompanhamento> findByAtivoTrueOrderByDataReferenciaAsc();
}
