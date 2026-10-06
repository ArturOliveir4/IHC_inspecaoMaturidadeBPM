package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.Diagnostico;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Long> {
    Optional<Diagnostico> findByUsuarioId(Long usuarioId);
}