package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import com.profnit.uepb.maturidade.domain.IndicadorKpiToBe;
import com.profnit.uepb.maturidade.repository.IndicadorKpiAsIsRepository;
import com.profnit.uepb.maturidade.repository.KpiToBeRepository;
import com.profnit.uepb.maturidade.web.dto.ComparativoKpiDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ComparativoKpiService {

    private final IndicadorKpiAsIsRepository asIsRepository;
    private final KpiToBeRepository toBeRepository;

    public ComparativoKpiService(IndicadorKpiAsIsRepository asIsRepository, KpiToBeRepository toBeRepository) {
        this.asIsRepository = asIsRepository;
        this.toBeRepository = toBeRepository;
    }

    @Transactional(readOnly = true)
    public List<ComparativoKpiDTO> calcularComparativo(Long processoId, Long cicloAvaliacaoId) {
        IndicadorKpiAsIs asIs = asIsRepository.findByProcessoIdAndCicloAvaliacaoId(processoId, cicloAvaliacaoId).orElse(null);
        IndicadorKpiToBe toBe = toBeRepository.findByProcessoIdAndCicloAvaliacaoId(processoId, cicloAvaliacaoId).orElse(null);

        List<ComparativoKpiDTO> comparativos = new ArrayList<>();

        comparativos.add(calcularDelta(
                "Tempo Médio de Ciclo",
                asIs != null ? asIs.getTmc() : null,
                toBe != null ? toBe.getTmc() : null,
                asIs != null ? asIs.getUnidadeTmc() : (toBe != null ? toBe.getUnidadeTmc() : "DIAS"),
                true
        ));

        comparativos.add(calcularDelta(
                "Taxa de Retrabalho",
                asIs != null ? asIs.getTr() : null,
                toBe != null ? toBe.getTr() : null,
                "%",
                true
        ));

        comparativos.add(calcularDelta(
                "Nível de Satisfação",
                asIs != null ? asIs.getNs() : null,
                toBe != null && toBe.getNs() != null ? BigDecimal.valueOf(toBe.getNs()) : null,
                "Pontos",
                false
        ));

        return comparativos;
    }

    private ComparativoKpiDTO calcularDelta(String nome, BigDecimal asIs, BigDecimal toBe, String unidade, boolean isReducao) {
        if (asIs == null && toBe == null) {
            return new ComparativoKpiDTO(nome, null, null, unidade, null, "Dados ausentes");
        }
        if (toBe == null) {
            return new ComparativoKpiDTO(nome, asIs, null, unidade, null, "Cenário TO-BE não cadastrado");
        }
        if (asIs == null) {
            return new ComparativoKpiDTO(nome, null, toBe, unidade, null, "Cenário AS-IS não cadastrado");
        }
        if (asIs.compareTo(BigDecimal.ZERO) == 0) {
            return new ComparativoKpiDTO(nome, asIs, toBe, unidade, null, "Base AS-IS zero (divisão não aplicável)");
        }

        BigDecimal delta;
        if (isReducao) {
            delta = asIs.subtract(toBe).divide(asIs, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        } else {
            delta = toBe.subtract(asIs).divide(asIs, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }

        return new ComparativoKpiDTO(nome, asIs, toBe, unidade, delta.setScale(2, RoundingMode.HALF_UP), null);
    }
}