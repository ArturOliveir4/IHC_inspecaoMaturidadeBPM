package com.profnit.uepb.maturidade.service;

import org.junit.jupiter.api.Test;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Teste de regressão do DA05 (CONF-02).
 *
 * Garante que todas as operações críticas de escrita continuam delimitadas por
 * transações Spring e configuradas para rollback também em exceções verificadas.
 * Falhas de persistência e conexão normalmente são RuntimeException, mas o
 * rollbackFor explícito protege igualmente contra exceções verificadas futuras.
 */
class IntegridadeTransacionalDa05Test {

    @Test
    void operacoesCriticasDevemPossuirRollbackParaQualquerExcecao() {
        verificar(AvaliacaoService.class,
            "iniciarOuRetomar", "salvarResposta", "atualizarEtapa", "finalizar");
        verificar(KpiAsIsService.class, "cadastrar", "editar");
        verificar(KpiToBeService.class, "cadastrar", "editar");
    }

    private void verificar(Class<?> serviceClass, String... nomesDosMetodos) {
        Set<String> esperados = Set.of(nomesDosMetodos);
        Set<Method> metodos = Arrays.stream(serviceClass.getDeclaredMethods())
            .filter(m -> esperados.contains(m.getName()))
            .collect(Collectors.toSet());

        assertTrue(
            metodos.stream().map(Method::getName).collect(Collectors.toSet()).containsAll(esperados),
            "Nem todos os métodos críticos foram encontrados em " + serviceClass.getSimpleName()
        );

        for (Method metodo : metodos) {
            Transactional transactional = metodo.getAnnotation(Transactional.class);
            assertNotNull(
                transactional,
                serviceClass.getSimpleName() + "." + metodo.getName() + " deve possuir @Transactional"
            );
            assertArrayEquals(
                new Class<?>[]{Exception.class},
                transactional.rollbackFor(),
                serviceClass.getSimpleName() + "." + metodo.getName()
                    + " deve executar rollback para qualquer exceção"
            );
        }
    }
}
