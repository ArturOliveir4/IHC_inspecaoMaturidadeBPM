package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.Diagnostico;
import com.profnit.uepb.maturidade.repository.DiagnosticoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class MaturidadeService {

    private final DiagnosticoRepository diagnosticoRepository;

    public MaturidadeService(DiagnosticoRepository diagnosticoRepository) {
        this.diagnosticoRepository = diagnosticoRepository;
    }

    // Aplica a fórmula matemática normalizando a escala de 1-5 para 0-100%.
    public double calcularPercentualMaturidade(List<Integer> notas) {
        double media = notas.stream().mapToInt(Integer::intValue).average().orElse(1.0);
        return ((media - 1.0) / 4.0) * 100.0;
    }

    // Agrupa as respostas, calcula os 10 princípios e persiste/atualiza o diagnóstico completo.
    @Transactional
    public Diagnostico processarESalvarDiagnostico(Long usuarioId, Map<Integer, Integer> respostas) {
        
        // BUSCA SE JÁ EXISTE UM DIAGNÓSTICO PARA ESTA AVALIAÇÃO/USUÁRIO
        Diagnostico diagnostico = diagnosticoRepository.findByUsuarioId(usuarioId)
                .orElseGet(() -> {
                    // Se não existir (primeira vez), cria um novo
                    Diagnostico novo = new Diagnostico();
                    novo.setUsuarioId(usuarioId);
                    return novo;
                });

        // Atualiza/sobrescreve as respostas originais com os novos valores
        diagnostico.setRespostasOriginais(respostas);

        // Recalcula e atualiza os percentuais no mapa
        for (int principio = 1; principio <= 10; principio++) {
            int questao1 = (principio * 2) - 1;
            int questao2 = principio * 2;
            
            List<Integer> notasDoPrincipio = List.of(
                respostas.getOrDefault(questao1, 1),
                respostas.getOrDefault(questao2, 1)
            );

            double percentual = calcularPercentualMaturidade(notasDoPrincipio);
            diagnostico.getResultadosPorPrincipio().put(principio, percentual);
        }

        // Como o 'diagnostico' traz o ID existente, o JPA fará um UPDATE atômico!
        return diagnosticoRepository.save(diagnostico);
    }
}