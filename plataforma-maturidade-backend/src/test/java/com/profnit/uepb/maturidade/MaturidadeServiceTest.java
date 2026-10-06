package com.profnit.uepb.maturidade;

import com.profnit.uepb.maturidade.service.MaturidadeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import java.util.List;

class MaturidadeServiceTest {

    private MaturidadeService maturidadeService;

    @BeforeEach
    void setUp() {
        this.maturidadeService = new MaturidadeService(null);
    }

    // Valida as notas mínimas da escala (1 e 1) resultando em 0%.
    @Test
    void testCalcularPercentual_NotasMinimas() {
        double resultado = maturidadeService.calcularPercentualMaturidade(List.of(1, 1));
        assertEquals(0.0, resultado, 0.01);
    }

    // Valida as notas máximas da escala (5 e 5) resultando em 100%.
    @Test
    void testCalcularPercentual_NotasMaximas() {
        double resultado = maturidadeService.calcularPercentualMaturidade(List.of(5, 5));
        assertEquals(100.0, resultado, 0.01);
    }

    // Valida notas médias espelhadas (3 e 3) resultando em exatos 50%.
    @Test
    void testCalcularPercentual_NotasMedias() {
        double resultado = maturidadeService.calcularPercentualMaturidade(List.of(3, 3));
        assertEquals(50.0, resultado, 0.01);
    }

    // Valida notas distintas (2 e 4) com média 3 resultando em 50%.
    @Test
    void testCalcularPercentual_NotasMistasCinquentaPorcento() {
        double resultado = maturidadeService.calcularPercentualMaturidade(List.of(2, 4));
        assertEquals(50.0, resultado, 0.01);
    }

    // Valida notas distintas (1 e 2) com média decimal (1.5) resultando em 12.5%.
    @Test
    void testCalcularPercentual_NotasMistasBaixas() {
        double resultado = maturidadeService.calcularPercentualMaturidade(List.of(1, 2));
        assertEquals(12.5, resultado, 0.01);
    }
}