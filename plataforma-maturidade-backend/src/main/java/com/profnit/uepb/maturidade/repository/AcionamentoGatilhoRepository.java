package com.profnit.uepb.maturidade.repository;

import com.profnit.uepb.maturidade.domain.AcionamentoGatilho;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AcionamentoGatilhoRepository extends JpaRepository<AcionamentoGatilho, Long> {
}