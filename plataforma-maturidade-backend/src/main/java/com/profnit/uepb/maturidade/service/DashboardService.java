package com.profnit.uepb.maturidade.service;

import com.profnit.uepb.maturidade.domain.Diagnostico;
import com.profnit.uepb.maturidade.domain.IndicadorKpiAsIs;
import com.profnit.uepb.maturidade.domain.StatusAvaliacao;
import com.profnit.uepb.maturidade.repository.AvaliacaoRepository;
import com.profnit.uepb.maturidade.repository.DiagnosticoRepository;
import com.profnit.uepb.maturidade.repository.IndicadorKpiAsIsRepository;
import com.profnit.uepb.maturidade.repository.ProcessoRepository;
import com.profnit.uepb.maturidade.web.dto.DashboardGerencialDTO;
import com.profnit.uepb.maturidade.web.dto.KpiConsolidadoDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class DashboardService {

    private static final int ESCALA_DECIMAIS = 1;

    private final AvaliacaoRepository avaliacaoRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final IndicadorKpiAsIsRepository indicadorKpiAsIsRepository;
    private final ProcessoRepository processoRepository;

    public DashboardService(AvaliacaoRepository avaliacaoRepository,
                            DiagnosticoRepository diagnosticoRepository,
                            IndicadorKpiAsIsRepository indicadorKpiAsIsRepository,
                            ProcessoRepository processoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.diagnosticoRepository = diagnosticoRepository;
        this.indicadorKpiAsIsRepository = indicadorKpiAsIsRepository;
        this.processoRepository = processoRepository;
    }

    @Transactional(readOnly = true)
    public DashboardGerencialDTO gerarDashboardGerencial() {
        DashboardGerencialDTO dashboard = new DashboardGerencialDTO();

        // 🎯 Calcula a média geral de todos os usuários/avaliações concluídas
        preencherMaturidadeMediaGeral(dashboard);
        
        dashboard.setKpisAsIs(consolidarKpisAsIs());
        dashboard.setKpisToBe(KpiConsolidadoDTO.indisponivel(
            "Indicadores TO-BE ainda não possuem tela de cadastro. Este bloco será preenchido "
                + "automaticamente assim que a funcionalidade for disponibilizada.",
            processoRepository.count()
        ));
        dashboard.setGeradoEm(LocalDateTime.now());

        return dashboard;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cálculo da Média Global de Maturidade (Todos os Usuários)
    // ─────────────────────────────────────────────────────────────────────────
    private void preencherMaturidadeMediaGeral(DashboardGerencialDTO dashboard) {
        // 1. Busca todas as avaliações com status CONCLUIDA
        var avaliacoesConcluidas = avaliacaoRepository.findAll().stream()
                .filter(a -> a.getStatus() == StatusAvaliacao.CONCLUIDA)
                .toList();

        long totalConcluidas = avaliacoesConcluidas.size();
        dashboard.setTotalAvaliacoesConcluidas(totalConcluidas);

        if (totalConcluidas == 0) {
            dashboard.setPossuiAvaliacaoConcluida(false);
            dashboard.setPercentualMaturidadeGeral(null);
            dashboard.setPercentuaisPorPrincipio(Map.of());
            return;
        }

        dashboard.setPossuiAvaliacaoConcluida(true);

        // Pega a data e o responsável da última avaliação para o card informativo
        var maisRecente = avaliacoesConcluidas.get(avaliacoesConcluidas.size() - 1);
        dashboard.setAvaliacaoMaisRecenteId(maisRecente.getId());
        dashboard.setDataAvaliacaoMaisRecente(maisRecente.getCriadoEm());
        dashboard.setNomeAvaliadorMaisRecente(maisRecente.getEmailAvaliador());

        // 2. Mapeia os diagnósticos de todas as avaliações concluídas
        Map<Integer, List<Double>> notasAcumuladasPorPrincipio = new HashMap<>();
        for (int p = 1; p <= 10; p++) {
            notasAcumuladasPorPrincipio.put(p, new ArrayList<>());
        }

        for (var avaliacao : avaliacoesConcluidas) {
            Optional<Diagnostico> diagOpt = diagnosticoRepository.findByUsuarioId(avaliacao.getId());
            if (diagOpt.isPresent()) {
                Map<Integer, Double> resultados = diagOpt.get().getResultadosPorPrincipio();
                resultados.forEach((principio, percentual) -> {
                    if (notasAcumuladasPorPrincipio.containsKey(principio)) {
                        notasAcumuladasPorPrincipio.get(principio).add(percentual);
                    }
                });
            }
        }

        // 3. Consolida a média de cada princípio (P1 a P10)
        Map<Integer, Double> mediasGlobaisPorPrincipio = new LinkedHashMap<>();
        double somaDeTodasAsMedias = 0.0;

        for (int principio = 1; principio <= 10; principio++) {
            List<Double> notas = notasAcumuladasPorPrincipio.get(principio);
            if (!notas.isEmpty()) {
                double mediaPrincipio = notas.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
                // Arredonda para 1 casa decimal
                mediaPrincipio = BigDecimal.valueOf(mediaPrincipio)
                        .setScale(ESCALA_DECIMAIS, RoundingMode.HALF_UP)
                        .doubleValue();
                
                mediasGlobaisPorPrincipio.put(principio, mediaPrincipio);
                somaDeTodasAsMedias += mediaPrincipio;
            } else {
                mediasGlobaisPorPrincipio.put(principio, 0.0);
            }
        }

        // 4. Calcula a Maturidade Geral da Organização (Média das médias dos 10 princípios)
        double percentualGeralOrganizacao = somaDeTodasAsMedias / 10.0;
        percentualGeralOrganizacao = BigDecimal.valueOf(percentualGeralOrganizacao)
                .setScale(ESCALA_DECIMAIS, RoundingMode.HALF_UP)
                .doubleValue();

        dashboard.setPercentualMaturidadeGeral(percentualGeralOrganizacao);
        dashboard.setPercentuaisPorPrincipio(mediasGlobaisPorPrincipio);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // KPIs AS-IS consolidados (Permanecem iguais)
    // ─────────────────────────────────────────────────────────────────────────
    private KpiConsolidadoDTO consolidarKpisAsIs() {
        long totalProcessos = processoRepository.count();
        List<IndicadorKpiAsIs> ultimosIndicadores = indicadorKpiAsIsRepository.findUltimoIndicadorDeCadaProcesso();

        if (ultimosIndicadores.isEmpty()) {
            return KpiConsolidadoDTO.indisponivel(
                "Nenhum processo possui KPIs AS-IS cadastrados até o momento.",
                totalProcessos
            );
        }

        BigDecimal somaTmcEmDias = BigDecimal.ZERO;
        BigDecimal somaTr = BigDecimal.ZERO;
        BigDecimal somaNs = BigDecimal.ZERO;

        for (IndicadorKpiAsIs indicador : ultimosIndicadores) {
            somaTmcEmDias = somaTmcEmDias.add(normalizarTmcParaDias(indicador));
            somaTr = somaTr.add(indicador.getTr());
            somaNs = somaNs.add(indicador.getNs());
        }

        BigDecimal quantidade = BigDecimal.valueOf(ultimosIndicadores.size());
        BigDecimal tmcMedio = somaTmcEmDias.divide(quantidade, ESCALA_DECIMAIS, RoundingMode.HALF_UP);
        BigDecimal trMedio = somaTr.divide(quantidade, ESCALA_DECIMAIS, RoundingMode.HALF_UP);
        BigDecimal nsMedio = somaNs.divide(quantidade, ESCALA_DECIMAIS, RoundingMode.HALF_UP);

        return KpiConsolidadoDTO.disponivel(
            tmcMedio, "DIAS", trMedio, nsMedio,
            ultimosIndicadores.size(), totalProcessos
        );
    }

    private BigDecimal normalizarTmcParaDias(IndicadorKpiAsIs indicador) {
        if ("HORAS".equalsIgnoreCase(indicador.getUnidadeTmc())) {
            return indicador.getTmc().divide(BigDecimal.valueOf(24), 4, RoundingMode.HALF_UP);
        }
        return indicador.getTmc();
    }
}