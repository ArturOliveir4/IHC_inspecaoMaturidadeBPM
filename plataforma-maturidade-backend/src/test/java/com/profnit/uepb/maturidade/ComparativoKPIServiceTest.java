package com.profnit.uepb.maturidade;

import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import com.profnit.uepb.maturidade.domain.IndicadorKpiToBe;
import com.profnit.uepb.maturidade.repository.IndicadorKpiAsIsRepository;
import com.profnit.uepb.maturidade.repository.KpiToBeRepository;
import com.profnit.uepb.maturidade.service.ComparativoKpiService;
import com.profnit.uepb.maturidade.web.dto.ComparativoKpiDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ComparativoKpiServiceTest {

    private IndicadorKpiAsIsRepository asIsRepo;
    private KpiToBeRepository toBeRepo;
    private ComparativoKpiService service;

    @BeforeEach
    void setUp() {
        asIsRepo = Mockito.mock(IndicadorKpiAsIsRepository.class);
        toBeRepo = Mockito.mock(KpiToBeRepository.class);
        service = new ComparativoKpiService(asIsRepo, toBeRepo);
    }

    @Test
    void testCalcularComparativo_MelhoriaReducao() {
        IndicadorKpiAsIs asIs = new IndicadorKpiAsIs(); 
        asIs.setTmc(new BigDecimal("100")); 
        asIs.setTr(new BigDecimal("20")); 
        asIs.setNs(new BigDecimal("3"));

        IndicadorKpiToBe toBe = new IndicadorKpiToBe(); 
        toBe.setTmc(new BigDecimal("80")); 
        toBe.setTr(new BigDecimal("10")); 
        toBe.setNs(4); // Integer

        Mockito.when(asIsRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(asIs));
        Mockito.when(toBeRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(toBe));
        
        List<ComparativoKpiDTO> result = service.calcularComparativo(1L, 1L);
        assertEquals(new BigDecimal("20.00"), result.get(0).getDelta());
        assertEquals(new BigDecimal("50.00"), result.get(1).getDelta());
        assertEquals(new BigDecimal("33.33"), result.get(2).getDelta());
    }

    @Test
    void testCalcularComparativo_PioraAumento() {
        IndicadorKpiAsIs asIs = new IndicadorKpiAsIs(); 
        asIs.setTmc(new BigDecimal("100")); 
        asIs.setTr(new BigDecimal("20")); 
        asIs.setNs(new BigDecimal("4"));

        IndicadorKpiToBe toBe = new IndicadorKpiToBe(); 
        toBe.setTmc(new BigDecimal("120")); 
        toBe.setTr(new BigDecimal("30")); 
        toBe.setNs(3); // Integer

        Mockito.when(asIsRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(asIs));
        Mockito.when(toBeRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(toBe));
        
        List<ComparativoKpiDTO> result = service.calcularComparativo(1L, 1L);
        assertEquals(new BigDecimal("-20.00"), result.get(0).getDelta());
        assertEquals(new BigDecimal("-50.00"), result.get(1).getDelta());
        assertEquals(new BigDecimal("-25.00"), result.get(2).getDelta());
    }

    @Test
    void testCalcularComparativo_DivisaoPorZero() {
        IndicadorKpiAsIs asIs = new IndicadorKpiAsIs(); 
        asIs.setTmc(BigDecimal.ZERO); 
        asIs.setTr(BigDecimal.ZERO); 
        asIs.setNs(BigDecimal.ZERO);

        IndicadorKpiToBe toBe = new IndicadorKpiToBe(); 
        toBe.setTmc(new BigDecimal("80")); 
        toBe.setTr(new BigDecimal("10")); 
        toBe.setNs(4); // Integer

        Mockito.when(asIsRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(asIs));
        Mockito.when(toBeRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(toBe));
        
        List<ComparativoKpiDTO> result = service.calcularComparativo(1L, 1L);
        assertEquals("Base AS-IS zero (divisão não aplicável)", result.get(0).getAviso());
        assertNull(result.get(0).getDelta());
    }

    @Test
    void testCalcularComparativo_ToBeNaoCadastrado() {
        IndicadorKpiAsIs asIs = new IndicadorKpiAsIs(); 
        asIs.setTmc(new BigDecimal("100")); 
        asIs.setTr(new BigDecimal("20")); 
        asIs.setNs(new BigDecimal("3"));

        Mockito.when(asIsRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(asIs));
        Mockito.when(toBeRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.empty());
        
        List<ComparativoKpiDTO> result = service.calcularComparativo(1L, 1L);
        assertEquals("Cenário TO-BE não cadastrado", result.get(0).getAviso());
    }

    @Test
    void testCalcularComparativo_AsIsNaoCadastrado() {
        IndicadorKpiToBe toBe = new IndicadorKpiToBe(); 
        toBe.setTmc(new BigDecimal("80")); 
        toBe.setTr(new BigDecimal("10")); 
        toBe.setNs(4); // Integer

        Mockito.when(asIsRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.empty());
        Mockito.when(toBeRepo.findByProcessoIdAndCicloAvaliacaoId(1L, 1L)).thenReturn(Optional.of(toBe));
        
        List<ComparativoKpiDTO> result = service.calcularComparativo(1L, 1L);
        assertEquals("Cenário AS-IS não cadastrado", result.get(0).getAviso());
    }
}