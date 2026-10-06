import React, { useState } from 'react';
import { RadarMaturidade } from '../../components/RadarMaturidade';
import { MOCK_DETALHES_AVALIACAO, MOCK_HISTORICO } from '../../mocks/mockData';

export const HistoricoAvaliacoes = () => {
  const [avaliacoes] = useState(MOCK_HISTORICO);
  const [detalhe, setDetalhe] = useState(MOCK_DETALHES_AVALIACAO[1042]);

  const selecionarAvaliacao = (id) => {
    setDetalhe(MOCK_DETALHES_AVALIACAO[id] || MOCK_DETALHES_AVALIACAO[1042]);
  };

  const formatarData = (valor) => {
    if (!valor) return '-';
    return new Date(valor).toLocaleString('pt-BR');
  };

  const formatarPercentual = (valor) => {
    if (valor === null || valor === undefined) return '-';
    return `${Number(valor).toFixed(1)}%`;
  };

  const statusBadge = (status) => {
    const concluida = status === 'CONCLUIDA';
    return <span className={`badge ${concluida ? 'badge-success' : 'badge-warning'}`}>{concluida ? 'Concluída' : 'Em andamento'}</span>;
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <div className="eyebrow">Gestão de avaliações</div>
          <h1 className="page-title">Histórico de avaliações</h1>
          <p className="page-description">
            Visão demonstrativa com avaliações já preenchidas para apresentação do fluxo de acompanhamento da maturidade BPM.
          </p>
        </div>
        <span className="badge badge-primary">Dados demonstrativos</span>
      </header>

      <section className="grid grid-3" style={{ marginBottom: 16 }}>
        <div className="card stat-card">
          <div className="stat-label">Avaliações</div>
          <div className="stat-value">{avaliacoes.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Concluídas</div>
          <div className="stat-value">{avaliacoes.filter((item) => item.status === 'CONCLUIDA').length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Média geral</div>
          <div className="stat-value">
            {formatarPercentual(avaliacoes.reduce((acc, item) => acc + Number(item.percentualGeral || 0), 0) / avaliacoes.length)}
          </div>
        </div>
      </section>

      <section className="card card-pad">
        <div style={{ marginBottom: 16 }}>
          <h2 className="card-title">Registros encontrados</h2>
          <p className="card-description">Ordenados da avaliação mais recente para a mais antiga.</p>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Avaliador</th>
                <th>Status</th>
                <th>Percentual geral</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {avaliacoes.map((avaliacao) => (
                <tr key={avaliacao.id}>
                  <td>{formatarData(avaliacao.data)}</td>
                  <td>{avaliacao.nomeAvaliador || avaliacao.emailAvaliador || '-'}</td>
                  <td>{statusBadge(avaliacao.status)}</td>
                  <td><strong>{formatarPercentual(avaliacao.percentualGeral)}</strong></td>
                  <td>
                    <button type="button" onClick={() => selecionarAvaliacao(avaliacao.id)} className="btn btn-secondary">
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <article className="card card-pad">
          <span className="badge badge-primary">Avaliação #{detalhe.id}</span>
          <h2 className="card-title" style={{ marginTop: 14 }}>Detalhe da avaliação</h2>
          <p className="card-description">Avaliador: {detalhe.nomeAvaliador || detalhe.emailAvaliador || '-'}</p>
          <div className="grid grid-2" style={{ marginTop: 18 }}>
            <div className="card stat-card" style={{ background: 'var(--surface-soft)' }}>
              <div className="stat-label">Data</div>
              <strong>{formatarData(detalhe.data)}</strong>
            </div>
            <div className="card stat-card" style={{ background: 'var(--surface-soft)' }}>
              <div className="stat-label">Percentual</div>
              <strong>{formatarPercentual(detalhe.percentualGeral)}</strong>
            </div>
          </div>

          <h3 className="card-title" style={{ marginTop: 22 }}>Respostas registradas</h3>
          <div className="grid" style={{ marginTop: 12 }}>
            {(detalhe.respostas || []).map((resposta, index) => (
              <div key={`${resposta.principio}-${index}`} className="card" style={{ padding: 14, background: 'var(--surface-soft)' }}>
                <strong>{resposta.principio}</strong>
                <p className="card-description">{resposta.questao}</p>
                <span className="badge badge-success" style={{ marginTop: 10 }}>Nota {resposta.nota}/5</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card card-pad">
          <h2 className="card-title">Radar de maturidade</h2>
          <p className="card-description">Visão por princípio BPM.</p>
          <div style={{ marginTop: 18 }}>
            <RadarMaturidade dadosPrincipios={detalhe.percentuaisPorPrincipio || {}} />
          </div>
        </article>
      </section>
    </div>
  );
};
