import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { RadarMaturidade } from '../../components/RadarMaturidade';
import { dashboardService } from '../../services/dashboardService';
import { processoService } from '../../services/processoService';
import { comparativoService } from '../../services/comparativoService';
import { gerarRelatorioMaturidadePdf, nomeArquivoRelatorio } from '../../services/relatorioPdfService';
import { formatarPercentual, formatarData, formatarValorKpi, formatarDelta } from '../../utils/formatters';
import { PRINCIPIOS_LABELS, ORDEM_PRINCIPIOS } from '../../constants/principiosLabels';

export const DashboardGerencial = () => {
  const { user } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // US18 — Gerar Relatório em PDF
  const radarRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [exportErro, setExportErro] = useState('');

  const carregarDashboard = async () => {
    setCarregando(true);
    setErro('');
    try {
      const dados = await dashboardService.obterDashboardGerencial();
      setDashboard(dados);
    } catch {
      setErro('Não foi possível carregar o dashboard gerencial no momento. Tente novamente em instantes.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  // Busca (opcionalmente) o comparativo AS-IS vs TO-BE do primeiro processo
  // cadastrado, para compor o PDF quando existir dados suficientes (CA2).
  // Como é uma informação "quando disponível", qualquer falha aqui não deve
  // impedir a exportação do restante do relatório.
  const buscarComparativoDisponivel = async () => {
    try {
      const processos = await processoService.listarTodos();
      if (!processos || processos.length === 0) return null;

      const processo = processos[0];
      const kpis = await comparativoService.buscarComparativo(processo.id, 1);
      if (!kpis || kpis.length === 0) return null;

      const itensComToBe = kpis.filter((kpi) => kpi.toBe !== null && kpi.toBe !== undefined);
      if (itensComToBe.length === 0) return null;

      return {
        processoNome: processo.nome,
        itens: kpis.map((kpi) => ({
          nome: kpi.nome,
          asIs: kpi.asIs == null ? 'Não cadastrado' : formatarValorKpi(kpi.asIs, kpi.unidade),
          toBe: kpi.toBe == null ? 'Não definido' : formatarValorKpi(kpi.toBe, kpi.unidade),
          delta: kpi.aviso ? kpi.aviso : formatarDelta(kpi.delta),
        })),
      };
    } catch {
      return null;
    }
  };

  const handleExportarPdf = async () => {
    if (!dashboard?.possuiAvaliacaoConcluida || exportando) return;

    setExportando(true);
    setExportErro('');
    try {
      // Mesma ordenação/rótulos exibidos no radar (fonte única de verdade),
      // e mesma função de formatação de percentual usada nos cards da tela —
      // garante que os valores do PDF sejam idênticos aos exibidos (CA2).
      const principios = ORDEM_PRINCIPIOS.map((numero) => ({
        label: PRINCIPIOS_LABELS[numero],
        percentual: formatarPercentual(dashboard.percentuaisPorPrincipio?.[numero]),
      }));

      const radarImagemBase64 = radarRef.current?.toBase64Image
        ? radarRef.current.toBase64Image('image/png', 1.0)
        : null;
      // Dimensões reais do canvas renderizado (agora sempre 1:1, ver
      // RadarMaturidade.jsx), repassadas ao PDF para o encaixe da imagem
      // preservar a proporção exata e nunca achatar/esticar o gráfico.
      const radarImagemLargura = radarRef.current?.canvas?.width || null;
      const radarImagemAltura = radarRef.current?.canvas?.height || null;

      const comparativoKpis = await buscarComparativoDisponivel();

      gerarRelatorioMaturidadePdf({
        dataAvaliacao: dashboard.dataAvaliacaoMaisRecente,
        nomeAvaliador: dashboard.nomeAvaliadorMaisRecente,
        percentualGeral: formatarPercentual(dashboard.percentualMaturidadeGeral),
        principios,
        radarImagemBase64,
        radarImagemLargura,
        radarImagemAltura,
        comparativoKpis,
        nomeArquivo: nomeArquivoRelatorio(),
      });
    } catch {
      setExportErro('Não foi possível gerar o PDF agora. Tente novamente em instantes.');
    } finally {
      setExportando(false);
    }
  };

  if (carregando) {
    return (
      <div className="page">
        <div className="card card-pad empty-state">Carregando dashboard gerencial...</div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="page">
        <div className="alert alert-danger" style={{ marginBottom: 16 }}>{erro}</div>
        <button type="button" className="btn btn-primary" onClick={carregarDashboard}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Painel gerencial</div>
          <h1 className="page-title">Dashboard de maturidade BPM</h1>
          <p className="page-description">
            Visão consolidada da avaliação mais recente, para apoiar decisões rápidas baseadas em dados atualizados.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-primary">Olá, {user?.nome || user?.email?.split('@')[0] || 'gestor'}</span>
          {dashboard.possuiAvaliacaoConcluida && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExportarPdf}
              disabled={exportando}
              title="Exportar relatório em PDF com cabeçalho institucional, radar e resultados"
            >
              {exportando ? 'Gerando PDF...' : '⭳ Exportar relatório PDF'}
            </button>
          )}
        </div>
      </header>

      {exportErro && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{exportErro}</div>}

      <section className="grid grid-3" style={{ marginBottom: 18 }}>
        <div className="card stat-card">
          <div className="stat-label">Maturidade geral (mais recente)</div>
          <div className="stat-value">{formatarPercentual(dashboard.percentualMaturidadeGeral)}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Avaliações concluídas</div>
          <div className="stat-value">{dashboard.totalAvaliacoesConcluidas}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Última avaliação</div>
          <div className="stat-value" style={{ fontSize: 20 }}>{formatarData(dashboard.dataAvaliacaoMaisRecente)}</div>
          <div className="stat-label">{dashboard.nomeAvaliadorMaisRecente || '-'}</div>
        </div>
      </section>

      {!dashboard.possuiAvaliacaoConcluida ? (
        <section className="card card-pad" style={{ marginBottom: 18 }}>
          <h2 className="card-title">Radar de maturidade</h2>
          <p className="card-description">
            Ainda não existe nenhuma avaliação concluída. Assim que uma avaliação for finalizada, o percentual geral
            e o radar dos dez princípios aparecerão aqui automaticamente.
          </p>
          <Link to="/diagnostico" className="btn btn-primary" style={{ marginTop: 14 }}>Iniciar uma avaliação</Link>
        </section>
      ) : (
        <section className="card card-pad" style={{ marginBottom: 18 }}>
          <div className="actions-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <h2 className="card-title">Radar de maturidade — Média Geral da Organização</h2>
              <p className="card-description"> Média consolidada com base nas {dashboard.totalAvaliacoesConcluidas} avaliações concluídas.</p>
            </div>
          </div>
          <RadarMaturidade ref={radarRef} dadosPrincipios={dashboard.percentuaisPorPrincipio || {}} />
        </section>
      )}
    </div>
  );
};