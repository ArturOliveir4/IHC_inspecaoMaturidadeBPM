import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { processoService } from '../../services/processoService';
import { comparativoService } from '../../services/comparativoService';
import { gerarRelatorioMaturidadePdf, nomeArquivoRelatorio } from '../../services/relatorioPdfService';
import { formatarValorKpi, formatarDelta } from '../../utils/formatters';

export const ComparativoKPIs = () => {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  const [processoId, setProcessoId] = useState('');
  const [cicloAvaliacaoId, setCicloAvaliacaoId] = useState('1');
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [exportando, setExportando] = useState(false); // US18 — Exportar PDF

  useEffect(() => {
    const carregarProcessos = async () => {
      try {
        const dados = await processoService.listarTodos();
        setProcessos(dados);
        if (dados.length > 0) {
          setProcessoId(String(dados[0].id));
        }
      } catch (err) {
        setErro('Não foi possível carregar a lista de processos.');
      }
    };
    carregarProcessos();
  }, []);

  useEffect(() => {
    const carregarComparativo = async () => {
      if (!processoId || !cicloAvaliacaoId) return;
      try {
        setLoading(true);
        setErro(null);
        const dados = await comparativoService.buscarComparativo(Number(processoId), Number(cicloAvaliacaoId));
        setKpis(dados);
      } catch (err) {
        setErro('Erro ao carregar os dados comparativos pelo Motor de Cálculo.');
        setKpis([]);
      } finally {
        setLoading(false);
      }
    };
    carregarComparativo();
  }, [processoId, cicloAvaliacaoId]);

  // Reaproveita a mesma função de formatação usada no Relatório PDF (US18),
  // garantindo que os valores exportados sejam idênticos aos exibidos aqui (CA2).
  const formatarValor = formatarValorKpi;

  const processoSelecionado = processos.find((p) => String(p.id) === String(processoId));

  const handleExportarPdf = () => {
    if (exportando || kpis.length === 0) return;
    setExportando(true);
    try {
      gerarRelatorioMaturidadePdf({
        dataAvaliacao: null,
        nomeAvaliador: null,
        percentualGeral: null,
        principios: [],
        radarImagemBase64: null,
        comparativoKpis: {
          processoNome: processoSelecionado?.nome,
          // Espelha exatamente a lógica de exibição da tabela em tela (linhas
          // abaixo, no <tbody>) para não haver qualquer divergência entre o
          // que é mostrado na interface e o que é exportado no PDF (CA2).
          itens: kpis.map((kpi) => ({
            nome: kpi.nome,
            asIs: kpi.asIs == null ? 'Não cadastrado' : formatarValor(kpi.asIs, kpi.unidade),
            toBe: kpi.toBe == null && !kpi.aviso?.includes('AS-IS ausentes')
              ? 'Não definido'
              : formatarValor(kpi.toBe, kpi.unidade),
            delta: kpi.aviso ? kpi.aviso : (kpi.delta !== null ? formatarDelta(kpi.delta) : '-'),
          })),
        },
        nomeArquivo: nomeArquivoRelatorio('comparativo-kpis'),
      });
    } finally {
      setExportando(false);
    }
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.container}>
        <button onClick={() => navigate('/dashboard')} style={styles.botaoVoltar}>
          ← Voltar ao Dashboard
        </button>

        <div className="card card-pad">
          <div className="actions-row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 className="card-title" style={{ fontSize: '24px' }}>Comparativo de KPIs (AS-IS vs TO-BE)</h1>
              <p className="card-description">
                Cálculo automático do delta percentual pelo motor do backend (US14).
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExportarPdf}
              disabled={exportando || kpis.length === 0}
              title="Exportar esta tabela comparativa em PDF"
            >
              {exportando ? 'Gerando PDF...' : '⭳ Exportar PDF'}
            </button>
          </div>

          {erro && <div className="alert alert-danger" style={{ marginTop: '16px' }}>{erro}</div>}

          <div className="form-grid" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <div className="field">
              <label className="label">Processo</label>
              <select
                className="select"
                value={processoId}
                onChange={(e) => setProcessoId(e.target.value)}
              >
                <option value="" disabled>Selecione um processo</option>
                {processos.map((proc) => (
                  <option key={proc.id} value={proc.id}>{proc.nome}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Ciclo de Avaliação</label>
              <input
                className="input"
                type="number"
                min="1"
                value={cicloAvaliacaoId}
                onChange={(e) => setCicloAvaliacaoId(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <p>Processando cálculos do backend...</p>
          ) : (
            <table style={styles.tabela}>
              <thead>
                <tr>
                  <th style={styles.th}>Indicador (KPI)</th>
                  <th style={styles.th}>Cenário Atual (AS-IS)</th>
                  <th style={styles.th}>Cenário Projetado (TO-BE)</th>
                  <th style={styles.th}>Delta (%)</th>
                </tr>
              </thead>
              <tbody>
                {kpis.map((kpi, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.td}><strong>{kpi.nome}</strong></td>
                    <td style={styles.td}>
                      {kpi.asIs == null ? <span style={{ color: '#6b7280' }}>Não cadastrado</span> : formatarValor(kpi.asIs, kpi.unidade)}
                    </td>
                    <td style={styles.td}>
                      {kpi.toBe == null && !kpi.aviso?.includes("AS-IS ausentes") ? (
                        <div style={styles.alertaToBe}>
                          <span style={styles.badgeErro}>Não definido</span><br />
                          <span style={styles.linkAcao} onClick={() => navigate('/to-be')}>
                            Configurar cenário TO-BE ➔
                          </span>
                        </div>
                      ) : (
                        formatarValor(kpi.toBe, kpi.unidade)
                      )}
                    </td>
                    <td style={styles.td}>
                      {kpi.aviso ? (
                        <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 'bold' }}>{kpi.aviso}</span>
                      ) : kpi.delta !== null ? (
                        <span style={{
                          ...styles.badgeDelta,
                          backgroundColor: kpi.delta >= 0 ? '#dcfce7' : '#fee2e2',
                          color: kpi.delta >= 0 ? '#15803d' : '#b91c1c'
                        }}>
                          {kpi.delta > 0 ? '+' : ''}{kpi.delta}%
                        </span>
                      ) : (
                        <span style={{ color: '#6b7280' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pagina: { minHeight: '100vh', backgroundColor: 'var(--bg)', padding: '40px 20px', fontFamily: 'var(--font)' },
  container: { maxWidth: '1000px', margin: '0 auto' },
  botaoVoltar: { marginBottom: '20px', padding: '10px 16px', cursor: 'pointer', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: '#fff', fontWeight: 'bold' },
  tabela: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  th: { backgroundColor: 'var(--surface-soft)', color: 'var(--muted-strong)', padding: '15px', textAlign: 'left', borderBottom: '2px solid var(--border)' },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '15px', color: 'var(--text)', verticalAlign: 'middle' },
  alertaToBe: { padding: '10px', backgroundColor: 'var(--warning-soft)', borderLeft: '4px solid var(--warning)', borderRadius: '4px' },
  badgeErro: { color: 'var(--warning)', fontWeight: 'bold', fontSize: '14px' },
  linkAcao: { fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', marginTop: '5px', display: 'inline-block' },
  badgeDelta: { padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }
};